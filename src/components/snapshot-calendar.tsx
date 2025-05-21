import React from "react";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetAccountSnapshots } from "@/hooks/useApiService";

type SnapshotCalendarProps = {
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  className?: string;
};

export function SnapshotCalendar({
  className,
  onDateSelect,
  selectedDate,
}: SnapshotCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(selectedDate);
  const { data: availableDates } = useGetAccountSnapshots();

  const handleSelect = React.useCallback(
    (selectedDay: Date | undefined) => {
      if (!selectedDay || !availableDates) {
        setDate(undefined);
        onDateSelect(undefined);
        return;
      }

      // Find the exact snapshot date that matches the selected day
      const matchingDate = availableDates.find((d) =>
        isSameDay(d, selectedDay)
      );
      setDate(matchingDate);
      onDateSelect(matchingDate);
    },
    [onDateSelect, availableDates]
  );

  const modifiers = React.useMemo(
    () => ({ snapshot: availableDates || [] }),
    [availableDates]
  );

  const modifiersStyles = React.useMemo(
    () => ({
      snapshot: {
        fontWeight: "600",
        border: "2px solid var(--primary)",
      },
    }),
    []
  );

  const disabledDays = React.useCallback(
    (day: Date) => {
      if (!availableDates) return true;
      return !availableDates.some((d) => isSameDay(d, day));
    },
    [availableDates]
  );

  React.useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disabledDays}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
