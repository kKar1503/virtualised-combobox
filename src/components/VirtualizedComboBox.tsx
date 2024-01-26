"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import * as Button from "@/components/ui/button";
import * as Command from "@/components/ui/command";
import * as Popover from "@/components/ui/popover";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface VirtualizedComboboxItem {
  label: string;
  value: string;
}

type UseVirtualizerParam = Parameters<typeof useVirtualizer>[0];
// need to remove count and getScrollElement from VirtualizedComboboxVirtualizerOptions
export type VirtualizerOptions = Omit<
  UseVirtualizerParam,
  "count" | "getScrollElement"
>;

export interface VirtualizedCommandProps {
  height: React.CSSProperties["height"];
  items: VirtualizedComboboxItem[];
  placeholderText: string;
  notFoundText: string;
  searchText: string;
  selectedValue: string | null;
  onSelect?: (value: string) => void;
  virtualizerOptions?: VirtualizerOptions;
}

function VirtualizedCommand({
  height,
  items,
  placeholderText,
  notFoundText,
  searchText,
  selectedValue,
  onSelect,
  virtualizerOptions,
}: VirtualizedCommandProps) {
  const [filteredItems, setFilteredItems] = React.useState(items);
  const parentRef = React.useRef(null);

  // Virtualizer logic
  const _virtualizerOptions =
    virtualizerOptions === undefined
      ? {
          count: filteredItems.length,
          getScrollElement: () => parentRef.current,
          estimateSize: () => 35,
          overscan: 5,
        }
      : {
          ...virtualizerOptions,
          count: filteredItems.length,
          getScrollElement: () => parentRef.current,
        };
  const virtualizer = useVirtualizer(_virtualizerOptions);
  const virtualItems = virtualizer.getVirtualItems();

  React.useEffect(() => {
    console.log({ virtualItems, parentRef });
  });

  const handleSearch = (search: string) => {
    setFilteredItems(
      items.filter((item) =>
        item.value.toLowerCase().includes(search.toLowerCase() ?? []),
      ),
    );
  };

  return (
    <Command.Command shouldFilter={false} onValueChange={handleSearch}>
      <Command.CommandInput placeholder={searchText} />
      <Command.CommandEmpty>{notFoundText}</Command.CommandEmpty>
      <Command.CommandGroup
        ref={parentRef}
        style={{
          height: height,
          width: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((item) => (
            <Command.CommandItem
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`,
              }}
              key={filteredItems[item.index].value}
              value={filteredItems[item.index].value}
              onSelect={onSelect}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedValue === filteredItems[item.index].value
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
              {filteredItems[item.index].label}
            </Command.CommandItem>
          ))}
        </div>
      </Command.CommandGroup>
    </Command.Command>
  );
}

export interface VirtualizedComboboxProps {
  items: VirtualizedComboboxItem[];
  height?: React.CSSProperties["height"];
  width?: React.CSSProperties["width"];
  /**
   * Value is null if no item is selected
   * */
  onSelect?: (value: string | null) => void;
  onOpen?: (open: boolean) => void;
  placeholderText?: string;
  notFoundText?: string;
  searchText?: string;
  virtualizerOptions?: VirtualizerOptions;
}

export function VirtualizedCombobox({
  items,
  height = "400px",
  width = "200px",
  onSelect,
  onOpen,
  placeholderText = "No item selected.",
  notFoundText = "No items found.",
  searchText = "Search item...",
  virtualizerOptions,
}: VirtualizedComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (onSelect !== undefined) {
      onSelect(selectedValue);
    }
  }, [selectedValue, onSelect]);

  React.useEffect(() => {
    if (onOpen !== undefined) {
      onOpen(open);
    }
  }, [open, onOpen]);

  return (
    <Popover.Popover open={open} onOpenChange={setOpen}>
      <Popover.PopoverTrigger asChild>
        <Button.Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          style={{ width: width }}
        >
          {selectedValue
            ? items.find((item) => item.value === selectedValue)?.label
            : placeholderText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button.Button>
      </Popover.PopoverTrigger>
      <Popover.PopoverContent
        className="w-[200px] p-0"
        style={{ width: width }}
      >
        <VirtualizedCommand
          height={height}
          items={items}
          selectedValue={selectedValue}
          onSelect={(value) => {
            setSelectedValue(value === selectedValue ? null : value);
            setOpen(false);
          }}
          placeholderText={placeholderText}
          notFoundText={notFoundText}
          searchText={searchText}
          virtualizerOptions={virtualizerOptions}
        />
      </Popover.PopoverContent>
    </Popover.Popover>
  );
}
