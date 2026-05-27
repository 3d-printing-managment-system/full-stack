"use client";
import { v4 as uuid } from "uuid";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronUp, ChevronDown } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Separator } from "./ui/separator";
import CustomColorPicker from "./CustomColorPicker";
import { useProfiles } from "@/context/ProfilesContext";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/lib/types";
import axios from "axios";

export const formSchema = z.object({
  name: z
    .string()
    .min(3, "Filament name must be at least 3 characters.")
    .max(32, "Filament name must be at most 32 characters."),

  material: z.enum(["PLA", "PLA+", "ABS", "PETG", "TPU", "ASA"]),

  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Enter a valid hex color (e.g. #FFAA00)"),

  roleSize: z.number().positive("Role size must be greater than 0"),
});

type FormProfilesProps = {
  profile: Profile;
};
function FormProfiles({ profile }: FormProfilesProps) {
  const { addProfile, updateProfile, markSetupDone } = useProfiles();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: profile
      ? {
          name: profile.name,
          material: profile.material,
          color: profile.color,
          roleSize: profile.roleSize,
        }
      : {
          name: "",
          material: "PLA",
          color: "",
          roleSize: 0,
        },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("the data", data);

    try {
      if (profile && profile.id) {
        // UPDATE
        await axios.put(
          `http://localhost:3000/api/filament-profiles/${profile.id}`,
          data,
        );

        updateProfile({ ...profile, ...data });
        toast.success("Profile updated successfully!", {
          description: `${data.name} has been updated.`,
        });
      } else {
        // CREATE
        const res = await axios.post(
          "http://localhost:3000/api/filament-profiles",
          {
            ...data,
          },
        );

        addProfile(res.data);
        markSetupDone("filament");
        toast.success("Profile added successfully!", {
          description: `${data.name} is now available for printing.`,
        });
        form.reset();
      }

      navigate(-1);
    } catch (error: any) {
      console.error(error);
      toast.error("Something went wrong", {
        description:
          error?.response?.data?.message ??
          "Failed to save the filament profile.",
      });
    }
  }

  return (
    <Card className="w-full sm:max-w-md overflow-visible">
      <CardHeader className="pb-6 items-center justify-between flex">
        <div>
          {profile ? "Edit Filament Profile" : "Create Filament Profile"}
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
            <Button type="submit" form="form-rhf-demo" className="">
              {profile ? "Update" : "Submit"}
            </Button>
          </Field>
        </div>
      </CardHeader>
      <CardContent className="">
        <div>
          <CardTitle className="">Basic Details</CardTitle>
          <CardDescription className="pb-4">
            General information about the filament.
          </CardDescription>
        </div>

        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="">
                  <FieldLabel htmlFor="form-rhf-demo-title" className="">
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Choose a name for this profile"
                    autoComplete="off"
                    className=""
                    type=""
                  />
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
            <Controller
              name="roleSize"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="">
                  <FieldLabel htmlFor="form-rhf-demo-title" className="">
                    Role Size
                  </FieldLabel>
                  <div className="flex items-center border  overflow-hidden rounded-md">
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
                      className="flex-1 px-3 outline-none "
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

            <div>
              <Separator className="mb-4 mt-6" orientation="horizontal" />
              <CardTitle className="">Physical Proprieties</CardTitle>
              <CardDescription className="">
                Key physical characteristics for printing performance.
              </CardDescription>
            </div>

            <div className="flex  gap-4 ">
              <CustomColorPicker control={form.control} />
              <Controller
                name="material"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldLabel className="">Material</FieldLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a material" />
                      </SelectTrigger>

                      <SelectContent className="w-full">
                        <SelectItem value="PLA" className="">
                          PLA
                        </SelectItem>
                        <SelectItem value="ABS" className="">
                          ABS
                        </SelectItem>
                        <SelectItem value="PETG" className="">
                          PETG
                        </SelectItem>
                        <SelectItem value="TPU" className="">
                          TPU
                        </SelectItem>
                        <SelectItem value="PLA+" className="">
                          PLA+
                        </SelectItem>
                        <SelectItem value="ASA" className="">
                          ASA
                        </SelectItem>
                      </SelectContent>
                    </Select>

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
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default FormProfiles;
