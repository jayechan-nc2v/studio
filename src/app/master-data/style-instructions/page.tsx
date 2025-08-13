
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, Save, PlusCircle, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStyleInstructionStore, useMachineTypeStore, useNeedleNumberStore, useNeedleTypeStore } from "@/lib/store";
import { styleInstructionSchema, type StyleInstructionFormValues } from "@/lib/schemas";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface ApiStyleInfo {
    style: string;
    cstyle: string;
    cust: string;
    brand: string | null;
    gtype: string;
}

export default function StyleInstructionsPage() {
  const { toast } = useToast();
  const { styleInstructions, addStyleInstruction, updateStyleInstruction } = useStyleInstructionStore();
  const { machineTypes } = useMachineTypeStore();
  const { needleNumbers } = useNeedleNumberStore();
  const { needleTypes } = useNeedleTypeStore();
  
  const [styleNo, setStyleNo] = React.useState("");
  const [searchStyleNo, setSearchStyleNo] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const availableMachineTypes = React.useMemo(() => machineTypes.map((mt) => mt.typeName).sort(), [machineTypes]);

  const form = useForm<StyleInstructionFormValues>({
    resolver: zodResolver(styleInstructionSchema),
    defaultValues: {
      styleNo: "",
      customerStyleNo: "",
      garmentType: "",
      customerName: "",
      brand: "",
      instructions: [{ 
          machineType: "", instructionDescription: "", smv: 0.1, target: 100,
          needleNo: '', needleGuage: '', spi: '', seamAllowance: '', edgeToStitchWidth: '',
          accessories: '', needles: '', bobbinLooper: '', notes: ''
      }],
    },
  });

  const { fields: instructionFields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  const resetFormState = () => {
    form.reset({
      styleNo: "",
      customerStyleNo: "",
      garmentType: "",
      customerName: "",
      brand: "",
      instructions: [{ 
          machineType: "", instructionDescription: "", smv: 0.1, target: 100,
          needleNo: '', needleGuage: '', spi: '', seamAllowance: '', edgeToStitchWidth: '',
          accessories: '', needles: '', bobbinLooper: '', notes: ''
      }],
    });
    setIsDataLoaded(false);
    setIsEditMode(false);
    setStyleNo("");
    setSearchStyleNo("");
  }

  const handleFetchData = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!styleNo.trim()) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter a Style No." });
      return;
    }

    setIsLoading(true);
    setIsDataLoaded(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BFN_API_BASE_URL;
      const response = await fetch(`${baseUrl}/getStyleInfo?styleno=${styleNo}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data: ApiStyleInfo = await response.json();
      
      if (data && data.style) {
         form.reset({
            styleNo: data.style,
            customerStyleNo: data.cstyle,
            customerName: data.cust,
            brand: data.brand || '',
            garmentType: data.gtype,
            instructions: [{ 
              machineType: "", instructionDescription: "", smv: 0.1, target: 100,
              needleNo: '', needleGuage: '', spi: '', seamAllowance: '', edgeToStitchWidth: '',
              accessories: '', needles: '', bobbinLooper: '', notes: ''
            }],
        });
        toast({ title: "Data Fetched", description: `Details for Style No. "${data.style}" have been loaded.` });
        setIsDataLoaded(true);
        setIsEditMode(false);
      } else {
         toast({ variant: "destructive", title: "Not Found", description: `No data found for Style No. "${styleNo}".` });
        resetFormState();
      }
    } catch (error) {
       toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Failed to fetch data. Please check the Style No. or try again later.",
        });
        resetFormState();
    } finally {
        setIsLoading(false);
    }
  };

  const handleSearchStyle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchStyleNo.trim()) {
        toast({ variant: "destructive", title: "Input Required", description: "Please enter a Style No. to search." });
        return;
    }
    const foundStyle = styleInstructions.find(si => si.styleNo.toLowerCase() === searchStyleNo.toLowerCase());
    if (foundStyle) {
        form.reset(foundStyle);
        setIsDataLoaded(true);
        setIsEditMode(true);
        toast({ title: "Record Found", description: `Displaying instructions for Style No. "${foundStyle.styleNo}".` });
    } else {
        toast({ variant: "destructive", title: "Not Found", description: `No existing instruction record found for Style No. "${searchStyleNo}".` });
        resetFormState();
    }
  };

  const handleManualSetup = () => {
    resetFormState();
    setIsDataLoaded(true);
    setIsEditMode(false);
  };
  
  const onSubmit = (data: StyleInstructionFormValues) => {
    if (isEditMode) {
      const originalInstruction = styleInstructions.find(si => si.styleNo.toLowerCase() === data.styleNo.toLowerCase());
      if(originalInstruction) {
        updateStyleInstruction(originalInstruction.id, data);
        toast({
            title: "Style Instruction Updated!",
            description: `The instructions for style "${data.styleNo}" have been successfully updated.`,
        });
      }
    } else {
        addStyleInstruction(data);
        toast({
            title: "Style Instruction Saved!",
            description: `The instructions for style "${data.styleNo}" have been successfully saved.`,
        });
    }
    
    resetFormState();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    move(result.source.index, result.destination.index);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Style Instructions</h1>
        <p className="text-muted-foreground">Manage standard instructions and SMV for each garment style.</p>
      </header>

      <Tabs defaultValue="create" onValueChange={() => resetFormState()}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="search">Search & Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
            <Card>
                <CardHeader>
                <CardTitle>Select Style</CardTitle>
                <CardDescription>Fetch style details from the external system or enter them manually.</CardDescription>
                </CardHeader>
                <CardContent>
                <Tabs defaultValue="fetch">
                    <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fetch">Fetch from System</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fetch" className="pt-4">
                    <form onSubmit={handleFetchData}>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            id="styleNo"
                            type="text"
                            placeholder="Enter Style No..."
                            value={styleNo}
                            onChange={(e) => setStyleNo(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Fetch
                        </Button>
                        </div>
                    </form>
                    </TabsContent>
                    <TabsContent value="manual" className="pt-4">
                    <Button onClick={handleManualSetup}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Style Instruction
                    </Button>
                    </TabsContent>
                </Tabs>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="search">
            <Card>
                <CardHeader>
                    <CardTitle>Search for Existing Style Instruction</CardTitle>
                    <CardDescription>Enter a Style No. to find and edit an existing record.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleSearchStyle}>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            id="searchStyleNo"
                            type="text"
                            placeholder="Enter Style No..."
                            value={searchStyleNo}
                            onChange={(e) => setSearchStyleNo(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading}>
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      
      {isLoading && <Skeleton className="h-96 w-full" />}

      {isDataLoaded && !isLoading && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core details for the style.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField control={form.control} name="styleNo" render={({ field }) => ( <FormItem><FormLabel>Style No.</FormLabel><FormControl><Input {...field} disabled={isEditMode} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="customerStyleNo" render={({ field }) => ( <FormItem><FormLabel>Customer Style No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="garmentType" render={({ field }) => ( <FormItem><FormLabel>Garment Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="customerName" render={({ field }) => ( <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Brand (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Instruction Breakdown</CardTitle>
                  <CardDescription>Define the instructional steps for this style. Drag and drop to reorder.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[80px]">No.</TableHead>
                                <TableHead className="min-w-[200px]">Machine Type</TableHead>
                                <TableHead className="min-w-[300px]">Instruction Description</TableHead>
                                <TableHead className="min-w-[120px]">SMV</TableHead>
                                <TableHead className="min-w-[100px]">Target</TableHead>
                                <TableHead className="min-w-[150px]">Needle No.</TableHead>
                                <TableHead className="min-w-[120px]">Needle Gauge</TableHead>
                                <TableHead className="min-w-[120px]">SPI</TableHead>
                                <TableHead className="min-w-[120px]">Seam Allowance</TableHead>
                                <TableHead className="min-w-[120px]">Edge to Stitch</TableHead>
                                <TableHead className="min-w-[200px]">Accessories</TableHead>
                                <TableHead className="min-w-[150px]">Needle(s)</TableHead>
                                <TableHead className="min-w-[150px]">Bobbin/Looper</TableHead>
                                <TableHead className="min-w-[300px]">Notes</TableHead>
                                <TableHead className="min-w-[50px]"><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                         {isClient ? (
                          <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="instructions">
                              {(provided) => (
                                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                                  {instructionFields.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                      {(provided, snapshot) => (
                                        <TableRow
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={cn(snapshot.isDragging && "bg-accent")}
                                        >
                                          <TableCell {...provided.dragHandleProps} className="font-medium cursor-grab">
                                            <div className="flex items-center gap-2">
                                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                                              <span>{index + 1}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                              <FormField control={form.control} name={`instructions.${index}.machineType`} render={({ field }) => (
                                                <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{availableMachineTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                                              )} />
                                          </TableCell>
                                          <TableCell>
                                            <FormField control={form.control} name={`instructions.${index}.instructionDescription`} render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                          </TableCell>
                                          <TableCell>
                                            <FormField control={form.control} name={`instructions.${index}.smv`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.0001" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                          </TableCell>
                                          <TableCell>
                                            <FormField control={form.control} name={`instructions.${index}.target`} render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                          </TableCell>
                                          <TableCell>
                                            <FormField control={form.control} name={`instructions.${index}.needleNo`} render={({ field }) => (
                                              <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{needleNumbers.map((n) => (<SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                                            )} />
                                          </TableCell>
                                          <TableCell><FormField control={form.control} name={`instructions.${index}.needleGuage`} render={({ field }) => (<FormItem><FormControl><Input {...field} maxLength={15} /></FormControl><FormMessage /></FormItem>)} /></TableCell>
                                          <TableCell><FormField control={form.control} name={`instructions.${index}.spi`} render={({ field }) => (<FormItem><FormControl><Input {...field} maxLength={10} /></FormControl><FormMessage /></FormItem>)} /></TableCell>
                                          <TableCell><FormField control={form.control} name={`instructions.${index}.seamAllowance`} render={({ field }) => (<FormItem><FormControl><Input {...field} maxLength={15} /></FormControl><FormMessage /></FormItem>)} /></TableCell>
                                          <TableCell><FormField control={form.control} name={`instructions.${index}.edgeToStitchWidth`} render={({ field }) => (<FormItem><FormControl><Input {...field} maxLength={15} /></FormControl><FormMessage /></FormItem>)} /></TableCell>
                                          <TableCell><FormField control={form.control} name={`instructions.${index}.accessories`} render={({ field }) => (<FormItem><FormControl><Input {...field} maxLength={100} /></FormControl><FormMessage /></FormItem>)} /></TableCell>
                                          <TableCell>
                                            <FormField control={form.control} name={`instructions.${index}.needles`} render={({ field }) => (
                                              <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{needleTypes.map((n) => (<SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                                            )} />
                                          </TableCell>
                                          <TableCell>
                                            <FormField control={form.control} name={`instructions.${index}.bobbinLooper`} render={({ field }) => (
                                              <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{needleTypes.map((n) => (<SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                                            )} />
                                          </TableCell>
                                          <TableCell><FormField control={form.control} name={`instructions.${index}.notes`} render={({ field }) => (<FormItem><FormControl><Input {...field} maxLength={200} /></FormControl><FormMessage /></FormItem>)} /></TableCell>
                                          <TableCell>
                                              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                  <Trash2 className="h-4 w-4" /><span className="sr-only">Remove Instruction</span>
                                              </Button>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </TableBody>
                              )}
                            </Droppable>
                          </DragDropContext>
                        ) : (
                          <TableBody><TableRow><TableCell colSpan={15} className="h-24 text-center">Loading...</TableCell></TableRow></TableBody>
                        )}
                    </Table>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ machineType: '', instructionDescription: '', smv: 0.1, target: 100, needleNo: '', needleGuage: '', spi: '', seamAllowance: '', edgeToStitchWidth: '', accessories: '', needles: '', bobbinLooper: '', notes: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Instruction
                  </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Style Instruction' : 'Save Style Instruction'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
