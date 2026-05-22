"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

interface FilterButtonsProps {
  filterKeys: string[];
  selectedKey: string | null; // currently selected key
  onFilterChange: (key: string | null) => void;
}

export function FilterButtons({
  filterKeys,
  selectedKey,
  onFilterChange,
}: FilterButtonsProps) {
  return (
    <div className="flex gap-2">
      {/* "All" button */}
      <Button
        className=""
        variant={selectedKey === null ? "default" : "outline"}
        onClick={() => onFilterChange(null)}
      >
        All
      </Button>

      {filterKeys.map((key) => (
        <Button
          key={key}
          className=""
          variant={selectedKey === key ? "default" : "outline"}
          onClick={() => onFilterChange(key)}
        >
          {key}
        </Button>
      ))}
    </div>
  );
}
