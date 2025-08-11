
"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, Save, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStyleInstructionStore, useMachineTypeStore } from "@/lib/store";
import { styleInstructionSchema, type StyleInstructionFormValues } from "@/lib/schemas";
import { mockPreProductionNotes } from "@/lib/data";

export default function StyleInstructionsPage() {
  const { toast } = useToast();
  const { addStyleInstruction } = useStyleInstructionStore();
  const { machineTypes } = useMachineTypeStore();

  const [styleNo, setStyleNo] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const availableMachineTypes = React.useMemo(() => machineTypes.map((mt) => mt.typeName).sort(), [machineTypes]);

  const form = useForm<StyleInstructionFormValues>({
    resolver: zodResolver(styleInstructionSchema),
    defaultValues: {
      styleNo: "",
      customerStyleNo: "",
      garmentType: "",
      customerName: "",
      brand: "",
      instructions: [{ machineType: "", instructionDescription: "", smv: 0.1, target: 100 }],
    },
  });

  const { fields: instructionFields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  const handleFetchData = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!styleNo.trim()) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter a Style No." });
      return;
    }

    setIsLoading(true);
    setIsDataLoaded(false);
    setTimeout(() => {
      const note = mockPreProductionNotes.find(n => n.styleNo.toLowerCase() === styleNo.toLowerCase());
      if (note) {
        form.reset({
          styleNo: note.styleNo,
          customerStyleNo: note.customerStyleNo,
          garmentType: note.garmentColor,
          customerName: note.customerName,
          brand: note.brand,
          instructions: [{ machineType: "", instructionDescription: "", smv: 0.1, target: 100 }],
        });
        toast({ title: "Data Fetched", description: `Details for Style No. "${note.styleNo}" have been loaded.` });
        setIsDataLoaded(true);
      } else {
        toast({ variant: "destructive", title: "Not Found", description: `No data found for Style No. "${styleNo}".` });
        form.reset();
      }
      setIsLoading(false);
    }, 500);
  };

  const handleManualSetup = () => {
    form.reset({
      styleNo: "",
      customerStyleNo: "",
      garmentType: "",
      customerName: "",
      brand: "",
      instructions: [{ machineType: "", instructionDescription: "", smv: 0.1, target: 100 }],
    });
    setIsDataLoaded(true);
  };
  
  const onSubmit = (data: StyleInstructionFormValues) => {
    addStyleInstruction(data);
    toast({
        title: "Style Instruction Saved!",
        description: `The instructions for style "${data.styleNo}" have been successfully saved.`,
    })
    form.reset();
    setIsDataLoaded(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Style Instructions</h1>
        <p className="text-muted-foreground">Manage standard instructions and SMV for each garment style.</p>
      </header>

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
                  <FormField control={form.control} name="styleNo" render={({ field }) => ( <FormItem><FormLabel>Style No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="customerStyleNo" render={({ field }) => ( <FormItem><FormLabel>Customer Style No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="garmentType" render={({ field }) => ( <FormItem><FormLabel>Garment Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="customerName" render={({ field }) => ( <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Brand (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Instruction Breakdown</CardTitle>
                  <CardDescription>Define the instructional steps for this style.</CardDescription>
              </CardHeader>
              <CardContent>
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
                                        <FormField control={form.control} name={`instructions.${index}.machineType`} render={({ field }) => (
                                          <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Select machine" /></SelectTrigger></FormControl>
                                              <SelectContent>{availableMachineTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )} />
                                    </TableCell>
                                      <TableCell>
                                        <FormField control={form.control} name={`instructions.${index}.instructionDescription`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </TableCell>
                                    <TableCell>
                                        <FormField control={form.control} name={`instructions.${index}.smv`} render={({ field }) => (
                                            <FormItem><FormControl><Input type="number" step="0.0001" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </TableCell>
                                    <TableCell>
                                        <FormField control={form.control} name={`instructions.${index}.target`} render={({ field }) => (
                                            <FormItem><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </TableCell>
                                    <TableCell>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" /><span className="sr-only">Remove Instruction</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ machineType: '', instructionDescription: '', smv: 0.1, target: 100 })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Instruction
                  </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Style Instruction
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
