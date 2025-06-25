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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";


const workOrderSchema = z.object({
  workOrderNo: z.string().min(1, "Work Order No. is required."),
  styleNo: z.string().min(1, "Style No. is required."),
  garmentType: z.string().min(1, "Garment Type is required."),
  productionNoteNo: z.string().min(1, "Production Note No. is required."),
  shipmentDate: z.date({
    required_error: "A shipment date is required.",
  }),
  totalQty: z.coerce.number().min(1, "Total Qty must be at least 1."),
  qtyPerBundle: z.coerce.number().min(1, "Qty Per Bundle must be at least 1."),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
  targetOutputQtyPerDay: z.coerce.number().min(1, "Target Output Qty / Day must be at least 1."),
  instructions: z.string().optional(),
  productionLine: z.string().min(1, "Production Line is required."),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

export default function WorkOrdersPage() {
    const { toast } = useToast();
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      workOrderNo: `WO-${Date.now().toString().slice(-5)}`,
      styleNo: "",
      garmentType: "",
      productionNoteNo: "",
      totalQty: 1000,
      qtyPerBundle: 25,
      targetOutputQtyPerDay: 200,
      instructions: "",
      productionLine: "",
    },
  });

  function onSubmit(data: WorkOrderFormValues) {
    console.log(data);
    toast({
        title: "Work Order Created!",
        description: "The new work order has been successfully created.",
    })
    form.reset();
     form.setValue('workOrderNo', `WO-${Date.now().toString().slice(-5)}`);

  }

  const totalBundles = React.useMemo(() => {
    const quantity = form.watch("totalQty");
    const bundleSize = form.watch("qtyPerBundle");
    if (quantity > 0 && bundleSize > 0) {
      return Math.ceil(quantity / bundleSize);
    }
    return 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("totalQty"), form.watch("qtyPerBundle")]);

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

        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details of the work order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="workOrderNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Order No.</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="styleNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style No.</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., S-123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="garmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garment Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., T-Shirt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="productionNoteNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Production Note No.</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., PN-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      <FormField
                      control={form.control}
                      name="totalQty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Qty</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="qtyPerBundle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty Per Bundle</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetOutputQtyPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Output Qty / Day</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="shipmentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                          <FormLabel>Shipment Date</FormLabel>
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

            <Tabs defaultValue="bundle" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bundle">Bundle Details</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="line-detail">Line Detail</TabsTrigger>
              </TabsList>
              <TabsContent value="bundle">
                <Card>
                    <CardHeader>
                        <CardTitle>Bundle Details</CardTitle>
                        <CardDescription>
                            Define how to bundle the items for production.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Total Bundles</Label>
                            <Input value={totalBundles} disabled className="font-bold"/>
                            <FormDescription>
                                Calculated from Total Qty and Qty per Bundle.
                            </FormDescription>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="instructions">
                <Card>
                    <CardHeader>
                        <CardTitle>Special Instructions</CardTitle>
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
              </TabsContent>
              <TabsContent value="line-detail">
                <Card>
                    <CardHeader>
                        <CardTitle>Line Detail</CardTitle>
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
              </TabsContent>
            </Tabs>
        </div>
      </form>
    </Form>
  );
}
