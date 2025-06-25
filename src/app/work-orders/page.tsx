"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";


const workOrderSchema = z.object({
  workOrderId: z.string().min(1, "Work Order ID is required."),
  styleName: z.string().min(1, "Style Name is required."),
  orderQuantity: z.coerce.number().min(1, "Order Quantity must be at least 1."),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
  quantityPerBundle: z.coerce.number().min(1, "Quantity per bundle must be at least 1."),
  instructions: z.string().optional(),
  productionLine: z.string().min(1, "Production Line is required."),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

export default function WorkOrdersPage() {
    const { toast } = useToast();
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      workOrderId: `WO-${Date.now().toString().slice(-5)}`,
      styleName: "",
      orderQuantity: 100,
      quantityPerBundle: 25,
      instructions: "",
    },
  });

  function onSubmit(data: WorkOrderFormValues) {
    console.log(data);
    toast({
        title: "Work Order Created!",
        description: "The new work order has been successfully created.",
    })
    form.reset();
     form.setValue('workOrderId', `WO-${Date.now().toString().slice(-5)}`);

  }

  const totalBundles = React.useMemo(() => {
    const quantity = form.watch("orderQuantity");
    const bundleSize = form.watch("quantityPerBundle");
    if (quantity > 0 && bundleSize > 0) {
      return Math.ceil(quantity / bundleSize);
    }
    return 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("orderQuantity"), form.watch("quantityPerBundle")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Work Order
            </h1>
            <p className="text-muted-foreground">
              Fill out the details to generate a new work order.
            </p>
          </div>
          <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details of the work order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Order ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., WO-00126" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="styleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Men's Classic Tee" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="orderQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setDate(new Date().getDate() - 1))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                           <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < (form.getValues("startDate") || new Date())
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Bundle Details</CardTitle>
                    <CardDescription>
                        Define how to bundle the items for production.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantityPerBundle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity per Bundle</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="25" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-2">
                        <Label>Total Bundles</Label>
                        <Input value={totalBundles} disabled className="font-bold"/>
                        <FormDescription>
                            Calculated from Order Quantity and Quantity per Bundle.
                        </FormDescription>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. Special Instructions</CardTitle>
                    <CardDescription>
                        Add any specific notes or instructions for this work order.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., Use special thread color #5BCEFA. Double-check sleeve measurements."
                                        className="resize-y"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>4. Line Detail</CardTitle>
                    <CardDescription>
                        Assign this work order to a production line.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="productionLine"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Production Line</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a production line" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="line-1">Line 1 - T-Shirts</SelectItem>
                                        <SelectItem value="line-2">Line 2 - Hoodies</SelectItem>
                                        <SelectItem value="line-3">Line 3 - Denim</SelectItem>
                                        <SelectItem value="line-4">Line 4 - Specialty</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
