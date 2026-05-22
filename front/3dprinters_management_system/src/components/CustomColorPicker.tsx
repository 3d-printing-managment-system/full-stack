"use client";

import { useState, useRef, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Utility to convert RGB to hex
function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// Ensure color is full hex or fallback to black
function safeHex(hex: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(hex) ? hex.toUpperCase() : "#000000";
}

export default function CustomColorPicker({ control }: { control: any }) {
  return (
    <Controller
      name="color"
      control={control}
      render={({ field, fieldState }) => {
        const [opened, setOpened] = useState(false);
        const [color, setColor] = useState(field.value || "");
        const pickerRef = useRef<HTMLDivElement>(null);

        // Close picker when clicked outside
        useEffect(() => {
          function handleClickOutside(e: MouseEvent) {
            if (
              pickerRef.current &&
              !pickerRef.current.contains(e.target as Node)
            ) {
              setOpened(false);
            }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () =>
            document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const val = e.target.value;
          // Allow empty or full 6-digit hex
          if (val === "" || /^#([0-9A-Fa-f]{6})$/.test(val)) {
            setColor(val);
            field.onChange(val);
          }
        };

        const swatches = ["#3e9cff", "#f97316", "#0c1f33", "#D8EBFF"];

        const handleSwatchClick = (hex: string) => {
          setColor(hex);
          field.onChange(hex);
        };

        // Safe hex for sliders
        const current = safeHex(color);

        return (
          <Field data-invalid={fieldState.invalid} className="flex-1">
            <FieldLabel className="">Color</FieldLabel>

            <div className="flex items-center gap-1 relative" ref={pickerRef}>
              {/* Hex input */}
              <Input
                className=""
                type="text"
                value={color}
                onChange={handleInputChange}
                placeholder="#000000"
              />

              {/* Preview square */}
              <div
                role="button"
                tabIndex={0}
                className="h-full aspect-square border cursor-pointer rounded-sm"
                style={{
                  backgroundColor: color || "transparent",
                  backgroundImage: !color
                    ? `repeating-linear-gradient(45deg,#ccc 0 10px,#fff 10px 20px
        )`
                    : undefined,
                }}
                onClick={() => setOpened((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setOpened((o) => !o);
                }}
              />

              {/* Picker dropdown */}
              {opened && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded shadow-lg z-50 w-64">
                  {/* Swatches */}
                  <div className="flex gap-2 mb-2">
                    {swatches.map((s) => (
                      <button
                        key={s}
                        type="button"
                        style={{ backgroundColor: s }}
                        className="w-6 h-6 rounded border"
                        onClick={() => handleSwatchClick(s)}
                      />
                    ))}
                  </div>

                  {/* RGB sliders */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm">
                      R
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={parseInt(current.slice(1, 3), 16)}
                        onChange={(e) => {
                          const r = parseInt(e.target.value);
                          const g = parseInt(current.slice(3, 5), 16);
                          const b = parseInt(current.slice(5, 7), 16);
                          const hex = rgbToHex(r, g, b);
                          setColor(hex);
                          field.onChange(hex);
                        }}
                      />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      G
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={parseInt(current.slice(3, 5), 16)}
                        onChange={(e) => {
                          const r = parseInt(current.slice(1, 3), 16);
                          const g = parseInt(e.target.value);
                          const b = parseInt(current.slice(5, 7), 16);
                          const hex = rgbToHex(r, g, b);
                          setColor(hex);
                          field.onChange(hex);
                        }}
                      />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      B
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={parseInt(current.slice(5, 7), 16)}
                        onChange={(e) => {
                          const r = parseInt(current.slice(1, 3), 16);
                          const g = parseInt(current.slice(3, 5), 16);
                          const b = parseInt(e.target.value);
                          const hex = rgbToHex(r, g, b);
                          setColor(hex);
                          field.onChange(hex);
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {fieldState.invalid && (
              <FieldError
                errors={[fieldState.error]}
                className=""
                children=""
              />
            )}
          </Field>
        );
      }}
    />
  );
}
