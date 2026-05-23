"use client";

import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { useLocation, useNavigate } from "react-router-dom";
import { PrintModelFile, Tags } from "@/lib/types";
// import { useProfiles } from "@/context/ProfilesContext";
import { formatSecondsToDuration } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useProfiles } from "@/context/ProfilesContext";

/* ---------------- SCHEMA ---------------- */

export const queueSchema = z.object({
  printerSelectionMode: z.enum([
    "NEXT_AVAILABLE_WITH_SPECIFIC_TAG",
    "SPECIFIC_PRINTER",
  ]),

  position: z.enum(["top", "bottom"]),

  profileId: z.string().min(1, "Profile is required"),

  tagIds: z.array(z.string()).optional(),

  printerId: z.string().optional(),

  quantity: z.number().min(1),
});

/* ---------------- COMPONENT ---------------- */

function PrintFileForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    profiles,
    existingTags,
    setExistingTags,
    refreshJobs,
    markSetupDone,
    printers,
  } = useProfiles();

  const { data } = location.state as {
    data: PrintModelFile;
  };

  const form = useForm<z.infer<typeof queueSchema>>({
    resolver: zodResolver(queueSchema),
    defaultValues: {
      printerSelectionMode: "NEXT_AVAILABLE_WITH_SPECIFIC_TAG",
      position: "top",
      quantity: 1,
      tagIds: [],
      printerId: "",
      profileId: "",
    },
  });

  const mode = form.watch("printerSelectionMode");

  /* ---------------- HELPERS ---------------- */

  // const hasEnoughMaterial = (profile: any) => {
  //   const total = profile.inventory.reduce(
  //     (sum: number, i: any) => sum + i.quantity,
  //     0,
  //   );
  //   return total > data.filament_used;
  // };

  /* ---------------- SUBMIT ---------------- */

  async function onSubmit(formData: z.infer<typeof queueSchema>) {
    const { quantity, printerSelectionMode, profileId, tagIds, printerId } =
      formData;

    console.log("quantity:", quantity);
    console.log("printerSelectionMode:", printerSelectionMode);
    console.log("profileId:", profileId);
    console.log("tagIds:", tagIds);
    console.log("printerId:", printerId);

    try {
      // Create multiple jobs based on quantity
      const jobs = Array.from({ length: quantity }, () => ({
        fileId: data.id,

        profileId: profileId || null,

        printerId:
          printerSelectionMode === "SPECIFIC_PRINTER"
            ? printerId || null
            : null,

        printerSelectionMode,

        estimatedTime: data.duration,

        createdAt: new Date().toISOString(),

        requiredTagIds:
          printerSelectionMode === "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
            ? tagIds || []
            : [],

        queuePosition: 0,
      }));

      // Send all jobs
      await Promise.all(
        jobs.map((job) =>
          axios.post("http://localhost:3000/api/print-jobs", job),
        ),
      );
      markSetupDone("firstPrint");

      toast.success("Added to queue successfully");

      // refresh table / list
      await refreshJobs();

      form.reset();
      navigate(-1);
    } catch (error: any) {
      console.error("Create print jobs failed:", error);

      toast.error(
        error?.response?.data?.message || "Failed to add jobs to queue",
      );
    }
  }
  /* ---------------- UI ---------------- */

  return (
    <Card className="w-full sm:max-w-md overflow-visible h-min">
      <CardHeader className="pb-6">
        <CardTitle className="">Print This File</CardTitle>
      </CardHeader>

      <CardContent className="">
        {/* FILE INFO */}
        <div className="flex gap-4 border rounded p-2 mb-6">
          <div className="h-24 aspect-square">
            <img
              src={`http://localhost:3000${data.image}`}
              alt="Preview"
              className="w-full h-full object-cover rounded"
            />
          </div>

          <div className="flex flex-col justify-center gap-2">
            <div className="font-bold">{data.title}</div>
            <div>Duration: {formatSecondsToDuration(data.duration)}</div>
            <div>Filament: {data.filamentUsed}g</div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="">
            {/* MODE */}
            <Controller
              name="printerSelectionMode"
              control={form.control}
              render={({ field }) => (
                <Field className="">
                  <FieldLabel className="">Printer Mode</FieldLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="">
                      <SelectItem
                        value="NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
                        className=""
                      >
                        Next Available With Tags
                      </SelectItem>

                      <SelectItem value="SPECIFIC_PRINTER" className="">
                        Specific Printer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* PROFILE (FILTERED BY INVENTORY) */}
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
                      onValueChange={(value) => field.onChange(value)}
                    >
                      {/* TRIGGER */}
                      <SelectTrigger className="min-h-fit">
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>

                      {/* DROPDOWN */}
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
                      </SelectContent>
                    </Select>

                    {/* ERROR */}
                    {fieldState.error && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="mt-1"
                      />
                    )}
                  </Field>
                );
              }}
            />

            {/* TAGS (ONLY FOR NEXT AVAILABLE MODE) */}
            {mode === "NEXT_AVAILABLE_WITH_SPECIFIC_TAG" && (
              <Controller
                name="tagIds"
                control={form.control}
                defaultValue={[]}
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  const [input, setInput] = useState("");

                  // ✅ FIX: convert string[] → Tags[]
                  const selected: Tags[] = (field.value || [])
                    .map((id: string) => existingTags.find((t) => t.id === id))
                    .filter(Boolean) as Tags[];

                  const filteredTags = existingTags.filter((tag: Tags) =>
                    tag.name.toLowerCase().includes(input.toLowerCase()),
                  );

                  // ✅ ADD TAG
                  const addTag = (tag: Tags) => {
                    const current: string[] = field.value || [];

                    if (!current.includes(tag.id)) {
                      field.onChange([...current, tag.id]);
                    }
                  };

                  // ❌ REMOVE TAG
                  const removeTag = (id: string) => {
                    const current: string[] = field.value || [];
                    field.onChange(current.filter((t) => t !== id));
                  };

                  // ➕ CREATE TAG
                  const createTag = (name: string) => {
                    const trimmed = name.trim();
                    if (!trimmed) return;

                    const exists = existingTags.find(
                      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
                    );

                    const newTag: Tags = exists || {
                      id: crypto.randomUUID(),
                      name: trimmed,
                    };

                    if (!exists) {
                      setExistingTags((prev) => [...prev, newTag]);
                    }

                    const current: string[] = field.value || [];

                    if (!current.includes(newTag.id)) {
                      field.onChange([...current, newTag.id]);
                    }
                  };

                  return (
                    <Field className="">
                      <FieldLabel className="">Tags</FieldLabel>

                      {/* INPUT BOX */}
                      <div
                        className="border rounded-md p-2 flex flex-wrap gap-2 cursor-text"
                        onClick={() => setOpen(true)}
                      >
                        {/* SELECTED TAGS */}
                        {selected.map((tag) => (
                          <span
                            key={tag.id}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                          >
                            {tag.name}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag.id);
                              }}
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        {/* INPUT */}
                        <input
                          className="flex-1 outline-none min-w-[120px]"
                          placeholder="Search or add tags..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onFocus={() => setOpen(true)}
                        />
                      </div>

                      {/* DROPDOWN */}
                      {open && (
                        <div className="border mt-1 rounded-md bg-white max-h-40 overflow-y-auto shadow-md relative z-50">
                          {/* EXISTING TAGS */}
                          {filteredTags.length > 0 ? (
                            filteredTags.map((tag: Tags) => {
                              const isSelected = selected.some(
                                (t) => t.id === tag.id,
                              );

                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => {
                                    isSelected
                                      ? removeTag(tag.id)
                                      : addTag(tag);

                                    setInput("");
                                  }}
                                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                                    isSelected ? "bg-gray-100" : ""
                                  }`}
                                >
                                  {tag.name}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No matches
                            </div>
                          )}

                          {/* CREATE TAG */}
                          {input.trim() &&
                            !existingTags.some(
                              (t) =>
                                t.name.toLowerCase() === input.toLowerCase(),
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  createTag(input);
                                  setInput("");
                                }}
                                className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50"
                              >
                                + Create "{input}"
                              </button>
                            )}
                        </div>
                      )}

                      {/* OUTSIDE CLICK */}
                      {open && (
                        <div
                          className="fixed inset-0"
                          onClick={() => setOpen(false)}
                        />
                      )}
                    </Field>
                  );
                }}
              />
            )}

            {/* PRINTER (ONLY SPECIFIC MODE) */}
            {mode === "SPECIFIC_PRINTER" && (
              <Controller
                name="printerId"
                control={form.control}
                render={({ field }) => (
                  <Field className="">
                    <FieldLabel className="">Printer</FieldLabel>

                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Select printer" />
                      </SelectTrigger>

                      <SelectContent className="">
                        {printers.filter((p) => p.status === "IDLE").length ===
                        0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No idle printers available
                          </div>
                        ) : (
                          printers
                            .filter((p) => p.status === "IDLE")
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id} className="">
                                <div className="flex flex-col">
                                  <div className="font-medium">{p.name}</div>

                                  <div className="flex gap-1 text-gray-400 text-sm">
                                    <div>{p.printerType}</div>

                                    <Separator
                                      orientation="vertical"
                                      className=""
                                    />

                                    <div>{p.model}</div>

                                    <Separator
                                      orientation="vertical"
                                      className=""
                                    />

                                    <div>{p.nozzleDiameter}mm</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            )}

            {/* QUANTITY */}
            <Controller
              name="quantity"
              control={form.control}
              render={({ field }) => (
                <Field className="">
                  <FieldLabel className="">Quantity</FieldLabel>

                  <div className="flex border">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          field.onChange(val === "" ? 1 : Number(val));
                        }
                      }}
                      className="flex-1 px-2"
                    />

                    <div className="flex flex-col border-l">
                      <button
                        type="button"
                        onClick={() => field.onChange(field.value + 1)}
                      >
                        <ChevronUp size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.max(1, field.value - 1))
                        }
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>

            <Button type="submit" className="flex-1">
              Add to Queue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PrintFileForm;
