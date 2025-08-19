import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export type ComboboxItem = {
  value: string;
  label: string;
};

interface ComboboxProps {
  items: ComboboxItem[];
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean | undefined) => void;
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function Combobox({
  items,
  defaultOpen,
  open,
  onOpenChange,
  value,
  onValueChange,
  placeholder = "Select an item",
  emptyMessage = "No items found.",
}: ComboboxProps) {
  const [_open, setOpen] = useControllableState<boolean | undefined>({
    prop: open,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });
  const [_value, setValue] = useControllableState<string | undefined>({
    prop: value,
    defaultProp: "",
    onChange: onValueChange,
  });

  return (
    <Popover open={_open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={_open}
          className="w-[200px] justify-between"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
