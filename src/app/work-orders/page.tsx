
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2, LinkIcon, XCircle } from "lucide-react";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useWorkOrderStore, useProductionLineStore, useQrCodeStore } from "@/lib/store";
import { workOrderSchema, type WorkOrderFormValues } from "@/lib/schemas";
import { presetInstructions, mockMachines, mockPreProductionNotes } from "@/lib/data";


const generateBundles = (totalQuantity: number, bundleSize: number) => {
    if (!totalQuantity || !bundleSize || totalQuantity <= 0 || bundleSize <= 0) {
      return [];
    }
    const bundles = [];
    let remainingQty = totalQuantity;
    let bundleNumber = 1;
    while (remainingQty > 0) {
      const bundleQty = Math.min(remainingQty, bundleSize);
      bundles.push({
        number: bundleNumber,
        quantityInBundle: bundleQty,
      });
      remainingQty -= bundleQty;
      bundleNumber++;
    }
    return bundles;
  };

export default function WorkOrdersPage() {
    const { toast } = useToast();
    const addWorkOrder = useWorkOrderStore((state) => state.addWorkOrder);
    const { lines: productionLines } = useProductionLineStore();
    const { mapQrCode } = useQrCodeStore();

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      workOrderNo: `WO-${Date.now().toString().slice(-5)}`,
      styleNo: "DNM-JKT-01",
      garmentType: "Denim Jacket",
      preProductionNo: "PPN-001",
      sizes: [
        { size: "S", quantity: 50 },
        { size: "M", quantity: 100 },
      ],
      qtyPerBundle: 24,
      targetOutputQtyPerDay: 50,
      instructions: presetInstructions["DNM-JKT-01"] || [],
      productionLine: "line-3",
      status: "Cutting",
      lineStations: productionLines.find(line => line.id === "line-3")?.stations || [],
      mappedQrCodes: {}
    },
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize, replace: replaceSizes } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control: form.control,
    name: "instructions",
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

  const [isMapDialogOpen, setIsMapDialogOpen] = React.useState(false);
  const [currentBundleToMap, setCurrentBundleToMap] = React.useState<{size: string, bundleNo: number} | null>(null);
  const [qrCodeInput, setQrCodeInput] = React.useState('');


  function onSubmit(data: WorkOrderFormValues) {
    // Validate that all bundles have a QR code assigned
    const totalBundles = watchedSizes.reduce((acc, size) => {
        return acc + generateBundles(size.quantity, watchedQtyPerBundle).length;
    }, 0);
    const mappedBundlesCount = Object.keys(watchedMappedQrCodes).length;

    if (mappedBundlesCount < totalBundles) {
        toast({
            variant: "destructive",
            title: "Mapping Incomplete",
            description: `Please map a QR code to all ${totalBundles} bundles before creating the work order.`,
        });
        return;
    }

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
  
  const assignedMachinesInStore = React.useMemo(() => {
      const ids = new Set<string>();
      productionLines.forEach(line => {
          line.stations.forEach(station => {
              if (station.machineId) {
                  ids.add(station.machineId);
              }
          });
      });
      return ids;
  }, [productionLines]);

  React.useEffect(() => {
    const selectedLine = productionLines.find(line => line.id === watchedProductionLine);
    if (selectedLine) {
      replaceStations(selectedLine.stations);
    } else {
      replaceStations([]);
    }
  }, [watchedProductionLine, replaceStations, productionLines]);

  React.useEffect(() => {
    if (watchedStyleNo && presetInstructions[watchedStyleNo]) {
        form.setValue('instructions', presetInstructions[watchedStyleNo]);
    } else {
        form.setValue('instructions', [{ machineType: '', instructionDescription: '', smv: 0.1, target: 100 }]);
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
            form.setValue('mappedQrCodes', {});
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPreProductionNo]);


  const totalQty = React.useMemo(() => {
    return watchedSizes.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  }, [watchedSizes]);
  
  const totalBundles = React.useMemo(() => {
    let count = 0;
    watchedSizes.forEach(size => {
        if(size.quantity && watchedQtyPerBundle) {
            count += generateBundles(size.quantity, watchedQtyPerBundle).length;
        }
    });
    return count;
  }, [watchedSizes, watchedQtyPerBundle]);

  const handleOpenMapDialog = (size: string, bundleNo: number) => {
    setCurrentBundleToMap({ size, bundleNo });
    setQrCodeInput('');
    setIsMapDialogOpen(true);
  };
  
  const handleMapQrCode = () => {
    if (!currentBundleToMap || !qrCodeInput.trim()) return;

    const bundleKey = `${currentBundleToMap.size}-${currentBundleToMap.bundleNo}`;
    const result = mapQrCode(qrCodeInput, form.getValues('workOrderNo'), bundleKey);

    if (result.success) {
        form.setValue(`mappedQrCodes.${bundleKey}`, qrCodeInput);
        toast({ title: 'QR Code Mapped!', description: `Bundle ${bundleKey} is now linked to QR code ${qrCodeInput}.`});
        setIsMapDialogOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Mapping Failed', description: result.error });
    }
  };
  
  const handleUnmapQrCode = (bundleKey: string) => {
    const qrCodeId = form.getValues(`mappedQrCodes.${bundleKey}`);
    if (qrCodeId) {
        // This should ideally also update the QR code's status in the store
        // For now, just remove from form state
        const currentMappings = form.getValues('mappedQrCodes');
        delete currentMappings[bundleKey];
        form.setValue('mappedQrCodes', currentMappings);
        toast({ title: 'QR Code Unmapped', description: `QR code for bundle ${bundleKey} has been removed.`});
    }
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
                           <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(presetInstructions).map(style => (
                                <SelectItem key={style} value={style}>{style}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                      <Label>Total Qty</Label>
                      <Input type="number" value={totalQty} disabled />
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bundle">Bundle Details</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
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
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Bundle Breakdown &amp; QR Code Mapping</CardTitle>
                    <CardDescription>
                      Generated bundles based on size breakdown and quantity per bundle. Map a QR code to each bundle.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {watchedSizes.map((sizeItem) => {
                        if (
                          !sizeItem.size ||
                          !sizeItem.quantity ||
                          sizeItem.quantity <= 0 ||
                          !watchedQtyPerBundle ||
                          watchedQtyPerBundle <= 0
                        )
                          return null;

                        const bundles = generateBundles(
                          sizeItem.quantity,
                          watchedQtyPerBundle
                        );

                        return (
                          <div key={sizeItem.size} className="border rounded-lg">
                            <h4 className="font-semibold text-center bg-muted p-2 rounded-t-md">
                              {sizeItem.size} ({sizeItem.quantity})
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Bundle</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead className="text-right">QR Code</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bundles.map((bundle) => {
                                  const bundleKey = `${sizeItem.size}-${bundle.number}`;
                                  const mappedCode = watchedMappedQrCodes[bundleKey];
                                  return (
                                  <TableRow key={bundleKey}>
                                    <TableCell className="font-medium">
                                      {bundle.number}
                                    </TableCell>
                                    <TableCell>
                                      {bundle.quantityInBundle}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       {mappedCode ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-xs font-mono">{mappedCode.split('-').pop()}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUnmapQrCode(bundleKey)}>
                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                       ) : (
                                            <Button type="button" size="sm" variant="outline" onClick={() => handleOpenMapDialog(sizeItem.size, bundle.number)}>
                                                <LinkIcon className="mr-1 h-3 w-3" /> Map
                                            </Button>
                                       )}
                                    </TableCell>
                                  </TableRow>
                                )})}
                              </TableBody>
                            </Table>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="instructions">
                 <Card>
                    <CardHeader>
                        <CardTitle>Instruction Breakdown</CardTitle>
                        <CardDescription>
                            Define the instructional steps for this work order. These are often preset by style.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border rounded-md">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Machine Type</TableHead>
                                        <TableHead>Instruction Description</TableHead>
                                        <TableHead className="w-[120px]">SMV</TableHead>
                                        <TableHead className="w-[100px]">Target</TableHead>
                                        <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {instructionFields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`instructions.${index}.machineType`}
                                                    render={({ field }) => (
                                                      <FormItem>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                          <FormControl>
                                                            <SelectTrigger>
                                                              <SelectValue placeholder="Select machine" />
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
                                                    name={`instructions.${index}.instructionDescription`}
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
                                                    name={`instructions.${index}.smv`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" step="0.0001" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`instructions.${index}.target`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                                                  onClick={() => removeInstruction(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove Instruction</span>
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
                          onClick={() => appendInstruction({ machineType: '', instructionDescription: '', smv: 0.1, target: 100 })}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Instruction
                        </Button>
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
                                    {stationFields.map((field, index) => {
                                      const machineType = form.watch(`lineStations.${index}.machineType`);
                                      
                                      const assignedOnThisWorkOrder = new Set<string>();
                                      if (form.getValues('lineStations')) {
                                          form.getValues('lineStations').forEach((station, i) => {
                                              if (i !== index && station.machineId) {
                                                  assignedOnThisWorkOrder.add(station.machineId);
                                              }
                                          });
                                      }
                                      
                                      const currentMachineId = form.getValues('lineStations') ? form.getValues('lineStations')[index]?.machineId : undefined;
                              
                                      const availableMachines = mockMachines.filter(
                                          (m) =>
                                              m.type === machineType &&
                                              (
                                                  m.id === currentMachineId ||
                                                  (!assignedMachinesInStore.has(m.id) && !assignedOnThisWorkOrder.has(m.id))
                                              )
                                      );

                                      return (
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
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!machineType}>
                                                              <FormControl>
                                                                <SelectTrigger>
                                                                  <SelectValue placeholder="Select machine" />
                                                                </SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent>
                                                                {availableMachines.map((machine) => (
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
                                    )})}
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
        
        {/* QR Code Mapping Dialog */}
        <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Map QR Code to Bundle {currentBundleToMap?.size}-{currentBundleToMap?.bundleNo}</DialogTitle>
                    <DialogDescription>
                        Scan or enter the QR Code ID to link it to this bundle.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="qr-code-map-input">QR Code ID</Label>
                    <Input
                        id="qr-code-map-input"
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        placeholder="Scan or type ID..."
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleMapQrCode}>Map QR Code</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </form>
    </Form>
  );
}
