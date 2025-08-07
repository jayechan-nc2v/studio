
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  isBreak: z.boolean(),
});

const workingHoursSchema = z.object({
  schedule: z.array(
    z.object({
      day: z.string(),
      slots: z.array(timeSlotSchema),
    })
  ),
});

type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

const initialSchedule: WorkingHoursFormValues["schedule"] = [
  { day: "Monday", slots: [{ startTime: "07:00", endTime: "12:00", isBreak: false }, { startTime: "12:00", endTime: "13:00", isBreak: true }, { startTime: "13:00", endTime: "16:00", isBreak: false }] },
  { day: "Tuesday", slots: [{ startTime: "07:00", endTime: "12:00", isBreak: false }, { startTime: "12:00", endTime: "13:00", isBreak: true }, { startTime: "13:00", endTime: "16:00", isBreak: false }] },
  { day: "Wednesday", slots: [{ startTime: "07:00", endTime: "12:00", isBreak: false }, { startTime: "12:00", endTime: "13:00", isBreak: true }, { startTime: "13:00", endTime: "16:00", isBreak: false }] },
  { day: "Thursday", slots: [{ startTime: "07:00", endTime: "12:00", isBreak: false }, { startTime: "12:00", endTime: "13:00", isBreak: true }, { startTime: "13:00", endTime: "16:00", isBreak: false }] },
  { day: "Friday", slots: [{ startTime: "07:00", endTime: "11:30", isBreak: false }, { startTime: "11:30", endTime: "13:00", isBreak: true }, { startTime: "13:00", endTime: "16:00", isBreak: false }] },
  { day: "Saturday", slots: [{ startTime: "07:00", endTime: "12:00", isBreak: false }] },
  { day: "Sunday", slots: [] },
];

export default function WorkingHoursPage() {
  const { toast } = useToast();
  // In a real app, this would come from a store like Zustand or a server.
  const [schedule, setSchedule] = React.useState(initialSchedule);

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      schedule: schedule,
    },
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const onSubmit = (data: WorkingHoursFormValues) => {
    setSchedule(data.schedule);
    toast({
      title: "Schedule Saved",
      description: "The factory working hours have been successfully updated.",
    });
  };

  const addSlot = (dayIndex: number) => {
    const currentSlots = form.getValues(`schedule.${dayIndex}.slots`);
    const newSlots = [...currentSlots, { startTime: "", endTime: "", isBreak: false }];
    form.setValue(`schedule.${dayIndex}.slots`, newSlots);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const currentSlots = form.getValues(`schedule.${dayIndex}.slots`);
    const newSlots = currentSlots.filter((_, i) => i !== slotIndex);
    form.setValue(`schedule.${dayIndex}.slots`, newSlots);
  };

  const toggleBreak = (dayIndex: number, slotIndex: number) => {
      const currentVal = form.getValues(`schedule.${dayIndex}.slots.${slotIndex}.isBreak`);
      form.setValue(`schedule.${dayIndex}.slots.${slotIndex}.isBreak`, !currentVal);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Manage Working Hours</h1>
        <p className="text-muted-foreground">
          Define the standard working schedule and break times for each day.
        </p>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Set the time slots for each day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, dayIndex) => (
                <div key={field.id}>
                  <Label className="text-lg font-semibold">{field.day}</Label>
                  <div className="mt-2 border rounded-md p-4 space-y-4">
                    {form.watch(`schedule.${dayIndex}.slots`).length > 0 ? (
                      form.watch(`schedule.${dayIndex}.slots`).map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                           <FormField
                            control={form.control}
                            name={`schedule.${dayIndex}.slots.${slotIndex}.startTime`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                           />
                           <span className="text-muted-foreground">-</span>
                           <FormField
                            control={form.control}
                            name={`schedule.${dayIndex}.slots.${slotIndex}.endTime`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                           />
                           <Button type="button" variant={slot.isBreak ? 'secondary' : 'outline'} onClick={() => toggleBreak(dayIndex, slotIndex)}>
                                {slot.isBreak ? 'Break' : 'Work'}
                           </Button>
                           <Button type="button" variant="destructive" size="icon" onClick={() => removeSlot(dayIndex, slotIndex)}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">No working hours scheduled (Day Off).</p>
                    )}
                     <Button type="button" variant="outline" size="sm" onClick={() => addSlot(dayIndex)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Time Slot
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
             <CardFooter>
                <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Schedule
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
