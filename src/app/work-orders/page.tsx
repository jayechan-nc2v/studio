
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2, GripVertical, FileText } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWorkOrderStore, useProductionLineStore, useQrCodeStore, useNeedleNumberStore, useNeedleTypeStore, useStyleInstructionStore } from "@/lib/store";
import { workOrderSchema, type WorkOrderFormValues } from "@/lib/schemas";
import { mockMachines, mockPreProductionNotes, type Instruction } from "@/lib/data";
import { Label } from "@/components/ui/label";

interface Bundle {
  key: string;
  size: string;
  bundleNo: number;
  quantity: number;
}

export default function WorkOrdersPage() {
    const { toast } = useToast();
    const { addWorkOrder } = useWorkOrderStore();
    const { lines: productionLines } = useProductionLineStore();
    const { qrCodes, mapQrCode } = useQrCodeStore();
    const { styleInstructions } = useStyleInstructionStore();

    const [isMapQrDialogOpen, setIsMapQrDialogOpen] = React.useState(false);
    const [qrCodeInput, setQrCodeInput] = React.useState("");
    const [selectedBundleKey, setSelectedBundleKey] = React.useState<string | null>(null);
    const [isInstructionDialogOpen, setIsInstructionDialogOpen] = React.useState(false);


  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      workOrderNo: `WO-${Date.now().toString().slice(-5)}`,
      styleNo: "",
      garmentType: "",
      preProductionNo: "",
      sizes: [
        { size: "", quantity: 0 },
      ],
      qtyPerBundle: 24,
      targetOutputQtyPerDay: 50,
      instructions: [],
      productionLine: "",
      status: "Cutting",
      lineStations: [],
      mappedQrCodes: {}
    },
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize, replace: replaceSizes } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const { fields: stationFields, append: appendStation, remove: removeStation, replace: replaceStations } = useFieldArray({
    control: form.control,
    name: "lineStations",
  });
  
  const watchedSizes = form.watch("sizes");
  const watchedQtyPerBundle = form.watch("qtyPerBundle");
  const watchedProductionLine = form.watch("productionLine");
  const watchedStyleNo = form.watch("styleNo");
  const watchedPreProductionNo = form.watch("preProductionNo");
  const watchedMappedQrCodes = form.watch("mappedQrCodes");
  const watchedInstructions = form.watch("instructions");

  function onSubmit(data: WorkOrderFormValues) {
    addWorkOrder(data);
    toast({
        title: "Work Order Created!",
        description: "The new work order has been successfully created and added to the dashboard.",
    })
    form.reset({
        workOrderNo: `WO-${Date.now().toString().slice(-5)}`,
        styleNo: "",
        garmentType: "",
        preProductionNo: "",
        sizes: [{ size: '', quantity: 0}],
        instructions: [],
        status: 'Cutting',
        lineStations: [],
        mappedQrCodes: {},
        qtyPerBundle: 24,
        targetOutputQtyPerDay: 50,
    });
  }

  const machineTypes = React.useMemo(
    () =>
      [
        ...new Set(
          productionLines.flatMap((line) =>
            line.stations.map((station) => station.machineType)
          )
        ),
      ].sort(),
    [productionLines]
  );
  
  React.useEffect(() => {
    const selectedLine = productionLines.find(line => line.id === watchedProductionLine);
    if (selectedLine) {
      replaceStations(selectedLine.stations);
    } else {
      replaceStations([]);
    }
  }, [watchedProductionLine, replaceStations, productionLines]);
  
  React.useEffect(() => {
    const selectedStyle = styleInstructions.find(si => si.styleNo === watchedStyleNo);
    if (selectedStyle) {
        form.setValue('instructions', selectedStyle.instructions);
    } else {
        form.setValue('instructions', []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedStyleNo, form.setValue]);
  
  React.useEffect(() => {
    if (watchedPreProductionNo) {
        const selectedNote = mockPreProductionNotes.find(note => note.preProductionNo === watchedPreProductionNo);
        if (selectedNote) {
            form.setValue('styleNo', selectedNote.styleNo);
            form.setValue('garmentType', selectedNote.garmentColor);
            form.setValue('shipmentDate', selectedNote.deliveryDate);
            replaceSizes(selectedNote.sizes);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPreProductionNo]);


  const totalQty = React.useMemo(() => {
    return watchedSizes.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  }, [watchedSizes]);

  const bundleBreakdown = React.useMemo(() => {
    const bundles: Bundle[] = [];
    if (!watchedSizes || watchedQtyPerBundle <= 0) {
      return bundles;
    }

    watchedSizes.forEach((size) => {
      if (size.size && size.quantity > 0) {
        let remainingQty = size.quantity;
        let bundleCounter = 1;
        while (remainingQty > 0) {
          const bundleQty = Math.min(remainingQty, watchedQtyPerBundle);
          bundles.push({
            key: `${size.size}-${bundleCounter}`,
            size: size.size,
            bundleNo: bundleCounter,
            quantity: bundleQty,
          });
          remainingQty -= bundleQty;
          bundleCounter++;
        }
      }
    });

    return bundles;
  }, [watchedSizes, watchedQtyPerBundle]);

  const groupedBundles = React.useMemo(() => {
    return bundleBreakdown.reduce((acc, bundle) => {
      const { size } = bundle;
      if (!acc[size]) {
        acc[size] = [];
      }
      acc[size].push(bundle);
      return acc;
    }, {} as Record<string, Bundle[]>);
  }, [bundleBreakdown]);


  const handleOpenMapDialog = (bundleKey: string) => {
    setSelectedBundleKey(bundleKey);
    setQrCodeInput("");
    setIsMapQrDialogOpen(true);
  };
  
  const handleMapQrCode = () => {
    if (!selectedBundleKey || !qrCodeInput) return;

    const workOrderNo = form.getValues("workOrderNo");
    const bundleData = bundleBreakdown.find(b => b.key === selectedBundleKey);
    if (!bundleData) {
        toast({variant: "destructive", title: "Error", description: "Could not find bundle data."});
        return;
    }

    const { size, bundleNo, quantity } = bundleData;
    const result = mapQrCode(qrCodeInput, workOrderNo, selectedBundleKey, size, bundleNo, quantity);
    
    if (result.success) {
      form.setValue(`mappedQrCodes.${selectedBundleKey}`, qrCodeInput);
      toast({
        title: "Success",
        description: `QR Code ${qrCodeInput} mapped to bundle ${selectedBundleKey}.`,
      });
      setIsMapQrDialogOpen(false);
      setQrCodeInput("");
      setSelectedBundleKey(null);
    } else {
      toast({
        variant: "destructive",
        title: "Mapping Failed",
        description: result.error,
      });
    }
  };

  const handleUnmapQrCode = (bundleKey: string) => {
    const currentMappings = form.getValues("mappedQrCodes");
    const qrId = currentMappings[bundleKey];
    
    // This part would ideally also update the QR code's status in the store
    // For now, we just remove it from the WO form state
    const { [bundleKey]: _, ...newMappings } = currentMappings;
    form.setValue("mappedQrCodes", newMappings);

    toast({
        title: "QR Code Unmapped",
        description: `QR Code ${qrId} has been unmapped from bundle ${bundleKey}.`
    });
  };

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
                      name="preProductionNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pre-Production No.</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a note" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockPreProductionNotes.map(note => (
                                <SelectItem key={note.preProductionNo} value={note.preProductionNo}>{note.preProductionNo}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <div className="flex items-center gap-2">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {styleInstructions.map(style => (
                                  <SelectItem key={style.id} value={style.styleNo}>{style.styleNo}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsInstructionDialogOpen(true)} disabled={!watchedStyleNo}>
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Instructions</span>
                            </Button>
                          </div>
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
                     <div className="space-y-2">
                      <FormLabel>Total Qty</FormLabel>
                      <FormControl>
                        <Input type="number" value={totalQty} disabled />
                      </FormControl>
                      <FormDescription>Calculated from size breakdown.</FormDescription>
                    </div>
                     <FormField
                      control={form.control}
                      name="qtyPerBundle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty Per Bundle</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                            <Input type="number" placeholder="200" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bundle">Bundle Details</TabsTrigger>
                <TabsTrigger value="line-detail">Line Detail</TabsTrigger>
              </TabsList>
              <TabsContent value="bundle">
                <Card>
                  <CardHeader>
                    <CardTitle>Size Breakdown</CardTitle>
                    <CardDescription>
                      Define the quantity for each size in this work order.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {sizeFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                          <FormField
                            control={form.control}
                            name={`sizes.${index}.size`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className={cn(index !== 0 && "sr-only")}>Size</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 34B, M" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`sizes.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className={cn(index !== 0 && "sr-only")}>Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className={cn(index !== 0 ? "pt-8" : "pt-8", "flex items-center")}>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeSize(index)}
                              disabled={sizeFields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Remove size</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendSize({ size: "", quantity: 0 })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Size
                    </Button>

                    <div className="pt-4">
                      <h4 className="font-semibold text-lg mb-2">Bundle Breakdown</h4>
                        {Object.keys(groupedBundles).length > 0 ? (
                            Object.entries(groupedBundles).map(([size, bundles]) => (
                                <div key={size} className="space-y-2 mb-6">
                                    <h5 className="font-semibold text-md">Size: {size}</h5>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Bundle No.</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>QR Code</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bundles.map((bundle) => {
                                                    const mappedQr = watchedMappedQrCodes[bundle.key];
                                                    return (
                                                        <TableRow key={bundle.key}>
                                                            <TableCell>{bundle.bundleNo}</TableCell>
                                                            <TableCell>{bundle.quantity}</TableCell>
                                                            <TableCell className="font-mono">{mappedQr || "Not Mapped"}</TableCell>
                                                            <TableCell className="text-right">
                                                                {mappedQr ? (
                                                                    <Button type="button" variant="destructive" size="sm" onClick={() => handleUnmapQrCode(bundle.key)}>
                                                                        Unmap
                                                                    </Button>
                                                                ) : (
                                                                    <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenMapDialog(bundle.key)}>
                                                                        Map QR Code
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border rounded-md">
                                No bundles to display. Enter quantities and a bundle size above.
                            </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="line-detail">
                <Card>
                    <CardHeader>
                        <CardTitle>Line Detail</CardTitle>
                        <CardDescription>
                           Assign this work order to a production line. The station details will be copied from the line template and can be adjusted below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                            {productionLines.map(line => (
                                                <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Machine Type</TableHead>
                                        <TableHead>Machine</TableHead>
                                        <TableHead>Assigned Worker</TableHead>
                                        <TableHead>Worker ID</TableHead>
                                        <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stationFields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`lineStations.${index}.machineType`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                              <FormControl>
                                                                <SelectTrigger>
                                                                  <SelectValue placeholder="Select machine type" />
                                                                </SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent>
                                                                {machineTypes.map((type) => (
                                                                  <SelectItem key={type} value={type}>
                                                                    {type}
                                                                  </SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                          </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`lineStations.${index}.machineId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                              <FormControl>
                                                                <SelectTrigger>
                                                                  <SelectValue placeholder="Select machine" />
                                                                </SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent>
                                                                {mockMachines
                                                                    .filter(m => m.type === form.watch(`lineStations.${index}.machineType`))
                                                                    .filter(m => m.isAvailable || m.id === field.value)
                                                                    .map((machine) => (
                                                                        <SelectItem key={machine.id} value={machine.id}>
                                                                            {`${machine.id} - ${machine.name}`}
                                                                        </SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                          </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`lineStations.${index}.assignedWorker`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`lineStations.${index}.workerId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                  type="button"
                                                  variant="destructive"
                                                  size="icon"
                                                  onClick={() => removeStation(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove Station</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendStation({ id: `new-${Date.now()}`, machineType: '', machineId: '', assignedWorker: '', workerId: '' })}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Station
                        </Button>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </form>

      <Dialog open={isMapQrDialogOpen} onOpenChange={setIsMapQrDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Map QR Code to Bundle</DialogTitle>
                <DialogDescription>
                    Scan or enter the QR Code ID to map to bundle <span className="font-bold">{selectedBundleKey}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="qr-code-input">QR Code ID</Label>
                <Input 
                    id="qr-code-input"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="Scan or enter code..."
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleMapQrCode} disabled={!qrCodeInput}>Map Code</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <InstructionDialog 
        open={isInstructionDialogOpen} 
        onOpenChange={setIsInstructionDialogOpen} 
        styleNo={watchedStyleNo} 
        instructions={watchedInstructions}
      />
    </Form>
  );
}

function InstructionDialog({ open, onOpenChange, styleNo, instructions }: { open: boolean, onOpenChange: (open: boolean) => void, styleNo: string, instructions: Instruction[] }) {
    if (!instructions || instructions.length === 0) {
        return (
             <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Instruction Details for {styleNo}</DialogTitle>
                        <DialogDescription>
                            No instruction details found for this style.
                        </DialogDescription>
                    </DialogHeader>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Instruction Details for {styleNo}</DialogTitle>
                    <DialogDescription>
                        This is a read-only view of the instructions set in the Style Instructions module.
                    </DialogDescription>
                </DialogHeader>
                <div className="border rounded-md overflow-auto max-h-[60vh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Machine Type</TableHead>
                                <TableHead>Instruction</TableHead>
                                <TableHead>SMV</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Needle No.</TableHead>
                                <TableHead>SPI</TableHead>
                                <TableHead>Accessories</TableHead>
                                <TableHead>Component</TableHead>
                                <TableHead>Needle(s)</TableHead>
                                <TableHead>Bobbin/Looper</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {instructions.map((inst, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{inst.machineType}</TableCell>
                                    <TableCell>{inst.instructionDescription}</TableCell>
                                    <TableCell>{inst.smv}</TableCell>
                                    <TableCell>{inst.target}</TableCell>
                                    <TableCell>{inst.needleNo}</TableCell>
                                    <TableCell>{inst.spi}</TableCell>
                                    <TableCell>{inst.accessories}</TableCell>
                                    <TableCell>{inst.component}</TableCell>
                                    <TableCell>{inst.needles}</TableCell>
                                    <TableCell>{inst.bobbinLooper}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
