"use client";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function Calendar({ className, classNames, ...props }: CalendarProps) {
  return <DayPicker showOutsideDays className={cn("p-3", className)} classNames={{ months: "flex flex-col sm:flex-row gap-2", month: "space-y-4", month_caption: "flex justify-center pt-1 relative items-center", caption_label: "text-sm font-medium", nav: "space-x-1 flex items-center", button_previous: "absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent", button_next: "absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent", month_grid: "w-full border-collapse space-y-1", weekdays: "flex", weekday: "w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground", week: "flex w-full mt-2", day: "h-9 w-9 p-0 text-center text-sm [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md", day_button: "h-9 w-9 rounded-md p-0 font-normal aria-selected:bg-primary aria-selected:text-primary-foreground hover:bg-accent", outside: "text-muted-foreground opacity-50", disabled: "text-muted-foreground opacity-50", selected: "bg-primary text-primary-foreground", today: "bg-accent text-accent-foreground", ...classNames }} components={{ Chevron: ({ orientation }) => orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> }} {...props} />;
}
Calendar.displayName = "Calendar";
export { Calendar };
