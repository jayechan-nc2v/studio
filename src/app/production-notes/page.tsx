
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Search, Loader2, PlusCircle, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { type PreProductionNote, fetchPreProductionNote, presetInstructions } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkOrderStore, useProductionLineStore } from "@/lib/store";
import { type WorkOrderCreationFormValues, workOrderCreationSchema } from "@/lib/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { WorkOrderFormValues } from "@/lib/schemas";

export default function PreProductionPage() {
  const { toast } = useToast();
  const [noteNo, setNoteNo] = React.useState("PPN-001");
  const [isLoading, setIsLoading] = React.useState(false);
  const [noteData, setNoteData] = React.useState<PreProductionNote | null>(null);
  const [isCreateWoDialogOpen, setIsCreateWoDialogOpen] = React.useState(false);


  const handleFetchData = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!noteNo.trim()) {
        toast({
            variant: "destructive",
            title: "Input Required",
            description: "Please enter a Pre-Production Note No.",
        });
        return;
    }

    setIsLoading(true);
    setNoteData(null);
    try {
        const data = await fetchPreProductionNote(noteNo);
        if (data) {
            setNoteData(data);
        } else {
            toast({
                variant: "destructive",
                title: "Not Found",
                description: `No data found for Pre-Production Note "${noteNo}".`,
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Failed to fetch data. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  // Fetch initial data on load for demo purposes
  React.useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pre-Production</h1>
        <p className="text-muted-foreground">
          Fetch Pre-Production Note details from the external system.
        </p>
      </header>

      <Card>
        <form onSubmit={handleFetchData}>
          <CardHeader>
            <CardTitle>Fetch Pre-Production Note</CardTitle>
            <CardDescription>
              Enter the Pre-Production Note number to fetch its details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                id="noteNo"
                type="text"
                placeholder="e.g., PPN-001"
                value={noteNo}
                onChange={(e) => setNoteNo(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Fetch
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
      
      {isLoading && <LoadingSkeleton />}

      {noteData && !isLoading && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Details for {noteData.preProductionNo}</CardTitle>
                    <CardDescription>Style: {noteData.styleNo} | Customer: {noteData.customerName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InfoItem label="Style No." value={noteData.styleNo} />
                        <InfoItem label="Customer Style No." value={noteData.customerStyleNo} />
                        <InfoItem label="Customer Name" value={noteData.customerName} />
                        <InfoItem label="Brand" value={noteData.brand} />
                        <InfoItem label="Destination" value={noteData.destination} />
                        <InfoItem label="Delivery Date" value={format(noteData.deliveryDate, "PPP")} />
                        <InfoItem label="Garment Color" value={noteData.garmentColor} />
                        <InfoItem label="Total Quantity" value={noteData.totalQty.toLocaleString()} />
                    </div>
                    <div className="mt-6">
                        <h4 className="font-semibold mb-2">Size Breakdown</h4>
                         <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Size</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {noteData.sizes.map(size => (
                                        <TableRow key={size.size}>
                                            <TableCell>{size.size}</TableCell>
                                            <TableCell className="text-right">{size.quantity.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setIsCreateWoDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Work Order
                    </Button>
                </CardFooter>
            </Card>
            <CreateWorkOrderDialog 
                note={noteData} 
                open={isCreateWoDialogOpen} 
                onOpenChange={setIsCreateWoDialogOpen} 
            />
        </>
      )}

    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
    </div>
);

const LoadingSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-6 w-4/5" />
                    </div>
                ))}
            </div>
             <div className="mt-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-40 w-full" />
            </div>
        </CardContent>
    </Card>
);


function CreateWorkOrderDialog({ note, open, onOpenChange }: { note: PreProductionNote; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const { toast } = useToast();
    const { workOrders, addWorkOrder } = useWorkOrderStore();
    const { lines: productionLines } = useProductionLineStore();

    const allocatedQuantities = React.useMemo(() => {
        const allocations: { [size: string]: number } = {};
        note.sizes.forEach(s => allocations[s.size] = 0);

        workOrders
            .filter(wo => wo.preProductionNo === note.preProductionNo)
            .forEach(wo => {
                wo.sizes.forEach(woSize => {
                    if (allocations[woSize.size] !== undefined) {
                        allocations[woSize.size] += woSize.quantity;
                    }
                });
            });
        return allocations;
    }, [note, workOrders]);

    const form = useForm<WorkOrderCreationFormValues>({
        resolver: zodResolver(workOrderCreationSchema),
        defaultValues: {
            productionLine: "",
            qtyPerBundle: 24,
            targetOutputQtyPerDay: 100,
            sizes: note.sizes.map(s => ({
                size: s.size,
                selected: false,
                quantity: 0,
            }))
        }
    });
    // The problem was here: WorkOrderFormValues expects a different structure than WorkOrderCreationFormValues.
    const onSubmit = (data: WorkOrderCreationFormValues) => {
        const selectedSizes = data.sizes
            .filter(s => s.selected)
            .map(s => ({ size: s.size, quantity: s.quantity }));

        const workOrderData: WorkOrderFormValues = { // Changed type here
            workOrderNo: `WO-${Date.now().toString().slice(-6)}`,
            preProductionNo: note.preProductionNo,
            styleNo: note.styleNo,
            garmentType: note.garmentColor,
            shipmentDate: note.deliveryDate,
            productionLine: data.productionLine,
            qtyPerBundle: data.qtyPerBundle,
            targetOutputQtyPerDay: data.targetOutputQtyPerDay,
            startDate: data.startDate,
            endDate: data.endDate,
            sizes: selectedSizes,
            instructions: presetInstructions[note.styleNo] || [],
            status: "Cutting",
            mappedQrCodes: {}, // Initialize as an empty object
            lineStations: productionLines.find(line => line.id === data.productionLine)?.stations || [],
        };

        addWorkOrder(workOrderData);
        toast({
            title: "Work Order Created",
            description: `Work Order ${workOrderData.workOrderNo} has been successfully created.`,
        });
        onOpenChange(false);
        form.reset();
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create Work Order for {note.preProductionNo}</DialogTitle>
                    <DialogDescription>
                        Select sizes and quantities to include in this work order.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form id="create-wo-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <FormField
                                control={form.control}
                                name="productionLine"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Production Line</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a line" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {productionLines.map(line => (
                                                    <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                                    <FormLabel>Target Output/Day</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        
                        <div>
                            <Label>Allocate Quantities</Label>
                            <FormMessage>{form.formState.errors.sizes?.message}</FormMessage>
                            <div className="border rounded-md mt-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Inc.</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Total Qty</TableHead>
                                            <TableHead>Allocated</TableHead>
                                            <TableHead>Available</TableHead>
                                            <TableHead className="w-[150px]">WO Qty</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {note.sizes.map((noteSize, index) => {
                                            const total = noteSize.quantity;
                                            const allocated = allocatedQuantities[noteSize.size] || 0;
                                            const available = total - allocated;
                                            return (
                                                <TableRow key={noteSize.size}>
                                                    <TableCell>
                                                         <FormField
                                                            control={form.control}
                                                            name={`sizes.${index}.selected`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            disabled={available <= 0}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                         />
                                                    </TableCell>
                                                    <TableCell>{noteSize.size}</TableCell>
                                                    <TableCell>{total}</TableCell>
                                                    <TableCell>{allocated}</TableCell>
                                                    <TableCell>{available}</TableCell>
                                                    <TableCell>
                                                         <FormField
                                                            control={form.control}
                                                            name={`sizes.${index}.quantity`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input 
                                                                            type="number" 
                                                                            {...field}
                                                                            onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                                                                            max={available}
                                                                            disabled={!form.watch(`sizes.${index}.selected`)}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                         />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </form>
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" form="create-wo-form">Create Work Order</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
