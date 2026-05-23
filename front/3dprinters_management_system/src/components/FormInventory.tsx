"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronUp, ChevronDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "./ui/separator";
import { useProfiles } from "@/context/ProfilesContext";
import { useNavigate } from "react-router-dom";
import {
  canReduceStock,
  generateId,
  getProfileCostPerKgReduction,
  parseDate,
  transformInventoryToAdjustments,
} from "@/lib/utils";
import { Adjustment, InventoryItemBeforeJoining } from "@/lib/types";
import axios from "axios";

export const formSchema = z.discriminatedUnion("updateType", [
  z.object({
    updateType: z.literal("ORDER"),
    profileId: z.string().min(1, "Please select a filament profile"),
    quantity: z.number().positive("Quantity must be greater than 0"),
    totalCost: z.number().positive("Total price must be greater than 0"),
    date: z.date(),
  }),

  z.object({
    updateType: z.literal("REDUCTION"),
    profileId: z.string().min(1, "Please select a filament profile"),
    quantity: z.number().positive("Quantity must be greater than 0"),
    date: z.date(),
  }),
]);

type FormInventoryProps = {
  inventoryItem: InventoryItemBeforeJoining;
};
function FormInventory({ inventoryItem }: FormInventoryProps) {
  const {
    profiles,
    inventory,
    refreshInventory,
    refreshProfiles,
    markSetupDone,
  } = useProfiles();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: inventoryItem
      ? {
          updateType: inventoryItem.updateType,
          profileId: profiles.find((p) => p.id === inventoryItem.profileId)?.id,
          quantity: inventoryItem.quantity,
          totalCost: inventoryItem.totalCost,
          date: parseDate(inventoryItem.date),
        }
      : {
          updateType: "ORDER",
          profileId: "",
          quantity: 0,
          totalCost: 0,
          date: new Date(),
        },
  });
  const updateType = form.watch("updateType");

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (data.updateType === "REDUCTION") {
      const allowed = canReduceStock(data.profileId, data.quantity, inventory);

      if (!allowed) {
        alert("Not enough stock for this reduction.");
        return;
      }
    }

    const cost_per_kg =
      data.updateType === "ORDER" && data.totalCost
        ? data.totalCost / data.quantity
        : 0;

    const finalData = {
      orderNumber: inventoryItem?.orderNumber || generateId(data.updateType),
      ...data,
      date: format(data.date, "dd/MM/yyyy"),
      cost_per_kg,
    };

    //  total for reduction
    const name = inventoryItem?.profileId
      ? profiles.find((p) => p.id === inventoryItem.profileId)?.name
      : "";
    const invData = transformInventoryToAdjustments(inventory, profiles);
    const cost = getProfileCostPerKgReduction(name, invData);
    const qty = Number(data.quantity);

    const apiData = {
      profile: {
        connect: {
          id: data.profileId, // 🔥 map from your form
        },
      },
      orderNumber: finalData.orderNumber,
      updateType: data.updateType,
      quantity: data.quantity,
      totalCost: data.updateType === "ORDER" ? data.totalCost : cost * qty,
      date: new Date(data.date).toISOString(), // better format for backend
    };

    try {
      if (inventoryItem) {
        // 🔁 UPDATE
        const res = await axios.put(
          `http://localhost:3000/api/inventory/${inventoryItem.id}`,
          apiData,
        );

        toast("Inventory updated successfully!");
      } else {
        // ➕ CREATE
        const res = await axios.post(
          "http://localhost:3000/api/inventory",
          apiData,
        );
        markSetupDone("inventory");

        toast("Inventory added successfully!");
      }
      await Promise.all([refreshInventory(), refreshProfiles()]);

      form.reset();
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast("Something went wrong ❌");
    }
  }

  const toNumber = (v: unknown) =>
    typeof v === "number" && !Number.isNaN(v) ? v : 0;

  return (
    <Card className="w-full sm:max-w-md overflow-visible">
      <CardHeader className="pb-6 items-center justify-between flex">
        <div>
          {inventoryItem ? "Edit This Inventory Item" : "Update Filament Stock"}
        </div>
        <div>
          <Field orientation="horizontal" className="">
            <Button
              className=""
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                navigate(-1);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="form-rhf-demo2" className="">
              {inventoryItem ? "Update" : "Submit"}
            </Button>
          </Field>
        </div>
      </CardHeader>
      <CardContent className="">
        <div>
          <CardTitle className="">Update Details</CardTitle>
          <CardDescription className="pb-4">
            manage your filament usage and restocking.
          </CardDescription>
        </div>

        <form id="form-rhf-demo2" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="">
            <Controller
              name="profileId"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedProfile = profiles.find(
                  (p) => p.id === field.value,
                );

                return (
                  <Field className="">
                    <FieldLabel className="">Filament Profile</FieldLabel>

                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        if (value === "__create_new__") {
                          navigate("/materials/profiles-inventory/create");
                          return;
                        }

                        field.onChange(value); // store only the id
                      }}
                    >
                      <SelectTrigger className="min-h-fit">
                        <SelectValue placeholder="Select profile">
                          {selectedProfile && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md border"
                                style={{
                                  backgroundColor: selectedProfile.color,
                                }}
                              />
                              <div className="flex flex-col">
                                <div className="font-medium">
                                  {selectedProfile.name}
                                </div>
                                <div className="flex gap-1 text-gray-400 text-sm">
                                  <div>{selectedProfile.material}</div>
                                  <Separator
                                    orientation="vertical"
                                    className=""
                                  />
                                  <div>{selectedProfile.roleSize}kg</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent className="">
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md border"
                                style={{ backgroundColor: p.color }}
                              />
                              <div className="flex flex-col">
                                <div className="font-medium">{p.name}</div>
                                <div className="flex gap-1 text-gray-400 text-sm">
                                  <div>{p.material}</div>
                                  <Separator
                                    orientation="vertical"
                                    className=""
                                  />
                                  <div>{p.roleSize}kg</div>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}

                        {updateType === "ORDER" && (
                          <SelectItem
                            value="__create_new__"
                            className="text-blue-600"
                          >
                            + Create new profile
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError
                        children=""
                        errors={[fieldState.error]}
                        className="mt-1"
                      />
                    )}
                  </Field>
                );
              }}
            />

            <Controller
              name="updateType"
              control={form.control}
              render={({ field }) => (
                <Field className="">
                  <FieldLabel className="">Update Type</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                      <SelectItem value="ORDER" className="">
                        Order
                      </SelectItem>
                      <SelectItem value="REDUCTION" className="">
                        Reduction
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <div className="flex gap-2">
              {updateType === "ORDER" && (
                <Controller
                  name="totalCost"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="">
                      <FieldLabel className="">Total Price ($)</FieldLabel>

                      <div className="flex items-center border overflow-hidden">
                        <input
                          type="text"
                          value={`${toNumber(field.value)}$`}
                          onChange={(e) => {
                            const raw = e.target.value.replace("$", "").trim();

                            if (/^\d*$/.test(raw)) {
                              field.onChange(
                                raw === "" ? 0 : parseInt(raw, 10),
                              );
                            }
                          }}
                          className="flex-1 px-3 outline-none"
                          placeholder="0$"
                        />

                        <div className="flex flex-col border-l px-1">
                          <button
                            type="button"
                            onClick={() =>
                              field.onChange(toNumber(field.value) + 1)
                            }
                          >
                            <ChevronUp size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              field.onChange(
                                Math.max(0, toNumber(field.value) - 1),
                              )
                            }
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>

                      {fieldState.error && (
                        <FieldError
                          errors={[fieldState.error]}
                          className=""
                          children=""
                        />
                      )}
                    </Field>
                  )}
                />
              )}
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="">
                    <FieldLabel htmlFor="form-rhf-demo2-title" className="">
                      {updateType === "ORDER"
                        ? "Quantity Received (kg)"
                        : "Quantity Used (kg)"}
                    </FieldLabel>
                    <div className="flex items-center border  overflow-hidden">
                      <input
                        type="text"
                        value={
                          field.value !== undefined ? `${field.value}kg` : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace("kg", "").trim();

                          if (/^\d*$/.test(raw)) {
                            field.onChange(raw === "" ? "" : Number(raw));
                          }
                        }}
                        className="flex-1 px-3 outline-none"
                        placeholder="0kg"
                      />

                      <div className="flex flex-col border-l px-1">
                        <button
                          type="button"
                          className=" hover:bg-muted"
                          onClick={() =>
                            field.onChange((Number(field.value) || 0) + 1)
                          }
                        >
                          <ChevronUp size={16} />
                        </button>

                        <button
                          type="button"
                          className=" hover:bg-muted"
                          onClick={() =>
                            field.onChange(
                              Math.max(0, (Number(field.value) || 0) - 1),
                            )
                          }
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className=""
                        children=""
                      />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <Field className="">
                  <FieldLabel className="">Date</FieldLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "dd/MM/yyyy")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default FormInventory;
