import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Tags } from "@/lib/types";
import { useState } from "react";
import { useProfiles } from "@/context/ProfilesContext";
import axios from "axios";
import { generateLightHexColor } from "@/lib/utils";

export const printerFormSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  printerType: z.enum(["Bambulab", "Creality", "Prusa", "Voron", "Other"]),
  model: z.string().min(1, "Model is required"),
  nozzleDiameter: z.number().positive("Must be a positive number"),
  cameraLink: z.string().url("Enter a valid URL").or(z.literal("")),
  ipAddress: z
    .string()
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Enter a valid IP address",
    ),
  tags: z.array(z.string()).default([]),
});
type FormPrinterProps = {
  printer?: Printer; // Optional if creating new, required for editing
};

function FormPrinter({ printer }: FormPrinterProps) {
  const { existingTags, refreshPrinters, refreshTags } = useProfiles();
  const [tagsList, setTagsList] = useState<Tags[]>(existingTags);
  const navigate = useNavigate();
  console.log("here is teh printer in the form", printer);

  const form = useForm<z.infer<typeof printerFormSchema>>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      name: printer?.name || "",
      printerType: (printer?.printerType as any) || "Bambulab",
      model: printer?.model || "",
      nozzleDiameter: printer?.nozzleDiameter || 0.4,
      cameraLink: printer?.cameraLink || "",
      ipAddress: printer?.ipAddress || "",
      tags: printer?.tags?.map((t) => t.tagId) || [],
    },
  });

  async function onSubmit(data: z.infer<typeof printerFormSchema>) {
    const payload = {
      name: data.name,
      model: data.model,
      printerType: data.printerType,
      ipAddress: data.ipAddress,
      nozzleDiameter: data.nozzleDiameter,
      cameraLink: data.cameraLink,

      // ✅ ONLY IDS
      tags: data.tags.map((tagId) => ({ printerId: printer?.id, tagId })), // string[]
    };

    console.log("PUT payload:", payload);

    try {
      await axios.put(
        `http://localhost:3000/api/printers/${printer?.id}`,
        payload,
      );

      toast.success("Printer updated successfully!");

      refreshPrinters();
      // navigate(-1);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <Card className="w-full sm:max-w-md overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-xl">
          {printer ? "Edit Printer" : "Add Printer"}
        </CardTitle>
        <div className="flex gap-2">
          <Button type="submit" form="printer-form" className="">
            Save
          </Button>
        </div>
      </CardHeader>

      <CardContent className="">
        <form id="printer-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-2">
            {/* Display Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="">
                  <FieldLabel className="">Friendly Name</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. My Bambu A1"
                    value={field.value || ""}
                  />
                  {fieldState.error && (
                    <FieldError className="" errors="">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => {
                const [open, setOpen] = useState(false);
                const [input, setInput] = useState("");

                // ✅ SOURCE OF TRUTH
                const allTags = tagsList;

                const selectedIds: string[] = field.value || [];

                const selectedTags = allTags.filter((tag) =>
                  selectedIds.includes(tag.id),
                );

                const filteredTags = allTags.filter(
                  (tag) =>
                    tag.name.toLowerCase().includes(input.toLowerCase()) &&
                    !selectedIds.includes(tag.id),
                );

                const addTag = (tagId: string) => {
                  if (!selectedIds.includes(tagId)) {
                    field.onChange([...selectedIds, tagId]);
                  }
                };

                const removeTag = (id: string) => {
                  field.onChange(selectedIds.filter((t) => t !== id));
                };

                // const createTag = async (name: string) => {
                //   const trimmed = name.trim();
                //   if (!trimmed) return;

                //   // check if exists
                //   const exists = allTags.find(
                //     (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
                //   );

                //   if (exists) {
                //     addTag(exists.id);
                //     return;
                //   }

                //   // create NEW tag (you should ideally call backend here)
                //   const newTag: Tags = {
                //     id: crypto.randomUUID(),
                //     name: trimmed,
                //   };

                //   // update UI source (important)
                //   setTagsList((prev) => [...prev, newTag]);

                //   addTag(newTag.id);
                // };
                const createTag = async (name: string) => {
                  const trimmed = name.trim();
                  if (!trimmed) return;

                  const exists = allTags.find(
                    (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
                  );
                  if (exists) {
                    addTag(exists.id);
                    return;
                  }

                  try {
                    const { data: newTag } = await axios.post(
                      "http://localhost:3000/api/tags",
                      {
                        name: trimmed,
                        color: generateLightHexColor(),
                      },
                    );

                    if (printer?.id) {
                      await axios.post(
                        `http://localhost:3000/api/printers/${printer.id}/tags`,
                        {
                          tagId: newTag.id,
                        },
                      );
                    }
                    await refreshTags();

                    setTagsList((prev) => [...prev, newTag]);
                    addTag(newTag.id);
                  } catch (error: any) {
                    toast.error(
                      error?.response?.data?.message || "Failed to create tag",
                    );
                  }
                };

                const canCreate =
                  input.trim() &&
                  !allTags.some(
                    (t) => t.name.toLowerCase() === input.toLowerCase(),
                  );

                return (
                  <Field className="">
                    <FieldLabel className="">Tags</FieldLabel>

                    {/* INPUT */}
                    <div
                      className="border rounded-md p-2 flex flex-wrap gap-2 cursor-text"
                      onClick={() => setOpen(true)}
                    >
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            className="text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        className="flex-1 outline-none min-w-[120px]"
                        placeholder="Search or create tags..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setOpen(true)}
                      />
                    </div>

                    {/* DROPDOWN */}
                    {open && (
                      <div className="border mt-2 rounded-md bg-white max-h-40 overflow-y-auto shadow-md relative z-50">
                        {/* EXISTING TAGS ONLY */}
                        {filteredTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              addTag(tag.id);
                              setInput("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                          >
                            {tag.name}
                          </button>
                        ))}

                        {/* CREATE NEW */}
                        {canCreate && (
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

                        {filteredTags.length === 0 && !canCreate && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No matches
                          </div>
                        )}
                      </div>
                    )}

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

            <Separator className="" />

            {/* Hardware Section: Type & Model side-by-side */}
            <div className="space-y-2">
              <div className="flex gap-4">
                <Controller
                  name="printerType"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="flex-1">
                      <FieldLabel className="">Type</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent className="">
                          <SelectItem value="Bambulab" className="">
                            Bambulab
                          </SelectItem>
                          <SelectItem value="Creality" className="">
                            Creality
                          </SelectItem>
                          <SelectItem value="Prusa" className="">
                            Prusa
                          </SelectItem>
                          <SelectItem value="Voron" className="">
                            Voron
                          </SelectItem>
                          <SelectItem value="Other" className="">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />

                <Controller
                  name="model"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="flex-1" data-invalid={fieldState.invalid}>
                      <FieldLabel className="">Model</FieldLabel>
                      <Input {...field} placeholder="e.g. A1, P1P, Ender 3" />
                    </Field>
                  )}
                />
              </div>

              {/* Nozzle Bottom of them */}
              <Controller
                name="nozzleDiameter"
                control={form.control}
                render={({ field }) => (
                  <Field className="">
                    <FieldLabel className="">Nozzle Diameter (mm)</FieldLabel>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Field>
                )}
              />
            </div>

            <Separator className="" />

            {/* Network Section */}
            <div className="space-y-2">
              <Controller
                name="ipAddress"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="">
                    <FieldLabel className="">IP Address</FieldLabel>
                    <Input
                      {...field}
                      placeholder="192.168.1.XX"
                      value={field.value || ""}
                    />
                    {fieldState.error && (
                      <FieldError className="" errors="">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="cameraLink"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="">
                    <FieldLabel className="">Camera Feed URL</FieldLabel>
                    <Input
                      {...field}
                      placeholder="http://..."
                      value={field.value || ""}
                    />
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

export default FormPrinter;
