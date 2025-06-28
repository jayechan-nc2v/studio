
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, GripVertical, PlusCircle, Trash2 } from "lucide-react";
import { mockLineWorkerHistory, mockLinePerformanceData, mockWorkers, mockMachines } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productionLineSchema, type ProductionLineFormValues } from "@/lib/schemas";
import { useProductionLineStore, useMachineTypeStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const chartConfig: ChartConfig = {
  output: {
    label: "Output (units)",
    color: "hsl(var(--primary))",
  },
  efficiency: {
    label: "Efficiency (%)",
    color: "hsl(var(--accent))",
  },
};

export default function ProductionLinesPage() {
  const { toast } = useToast();
  const { lines, updateLine } = useProductionLineStore();
  const { machineTypes } = useMachineTypeStore();
  
  const [selectedLineId, setSelectedLineId] = React.useState<string>(
    lines[0]?.id || ""
  );

  // State for history tab
  const [historyFilters, setHistoryFilters] = React.useState({
    workerName: "",
    machineType: "all",
  });
  const [historyDateRange, setHistoryDateRange] = React.useState<DateRange | undefined>();
  const [visibleHistoryCount, setVisibleHistoryCount] = React.useState(10);

  const availableMachineTypes = React.useMemo(
    () => machineTypes.map((mt) => mt.typeName).sort(),
    [machineTypes]
  );

  const selectedLine = React.useMemo(() => {
    return lines.find((line) => line.id === selectedLineId);
  }, [lines, selectedLineId]);

  const form = useForm<ProductionLineFormValues>({
    resolver: zodResolver(productionLineSchema),
    defaultValues: selectedLine,
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "stations",
  });

  React.useEffect(() => {
    if (selectedLine) {
      form.reset(selectedLine);
    }
  }, [selectedLine, form]);

  const onSubmit = (data: ProductionLineFormValues) => {
    updateLine(data.id, data);
    toast({
      title: "Line Updated",
      description: `Production line "${data.name}" has been saved.`,
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    move(result.source.index, result.destination.index);
  };

  const historyMachineTypes = React.useMemo(() => [...new Set(mockLineWorkerHistory.map(h => h.machineType))].sort(), []);

  const filteredHistory = React.useMemo(() => {
    return mockLineWorkerHistory.filter(record => {
      const workerMatch = historyFilters.workerName ? record.workerName.toLowerCase().includes(historyFilters.workerName.toLowerCase()) : true;
      const machineTypeMatch = historyFilters.machineType !== 'all' ? record.machineType === historyFilters.machineType : true;
      
      const date = record.date;
      const dateMatch = (() => {
        if (!historyDateRange?.from) return true;
        const fromDate = historyDateRange.from;
        const toDate = historyDateRange.to || fromDate; 
        return date >= fromDate && date <= toDate;
      })();

      return workerMatch && machineTypeMatch && dateMatch;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [historyFilters, historyDateRange]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Production Lines
            </h1>
            <p className="text-muted-foreground">
              Configure and manage your factory's production lines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedLineId} onValueChange={setSelectedLineId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a line" />
              </SelectTrigger>
              <SelectContent>
                {lines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </div>
        </header>

        {selectedLine ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Line Information</CardTitle>
                <CardDescription>
                  Core details for "{selectedLine.name}".
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>System ID</Label>
                    <Input {...form.register('id')} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Name</Label>
                    <Input {...form.register('name')} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Manager</Label>
                    <Input {...form.register('lineManager')} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="workers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workers">Workers Assigned</TabsTrigger>
                <TabsTrigger value="history">Assignment History</TabsTrigger>
                <TabsTrigger value="performance">Line Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="workers">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Current Workers Assigned</CardTitle>
                        <CardDescription>
                          List of workers currently assigned to stations on this line.
                        </CardDescription>
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Station #</TableHead>
                            <TableHead>Machine Type</TableHead>
                            <TableHead>Machine</TableHead>
                            <TableHead>Worker ID</TableHead>
                            <TableHead>Assigned Worker</TableHead>
                            <TableHead className="w-[50px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <DragDropContext onDragEnd={onDragEnd}>
                          <Droppable droppableId="stations-list">
                            {(provided) => (
                              <TableBody
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {fields.map((field, index) => {
                                  const machineType = form.watch(`stations.${index}.machineType`);
                                  const availableMachines = React.useMemo(() => {
                                      return mockMachines.filter((m) => m.type === machineType);
                                  }, [machineType]);
                                  
                                  return (
                                  <Draggable
                                    key={field.id}
                                    draggableId={field.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <TableRow
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={cn(snapshot.isDragging && "bg-accent")}
                                      >
                                        <TableCell
                                          {...provided.dragHandleProps}
                                          className="align-top font-medium cursor-grab"
                                        >
                                          <div className="flex items-center gap-2">
                                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                                            <span>{index + 1}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <FormField
                                            control={form.control}
                                            name={`stations.${index}.machineType`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <Select onValueChange={(value) => {
                                                  field.onChange(value);
                                                  form.setValue(`stations.${index}.machineId`, '');
                                                }} value={field.value}>
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select machine type" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    {availableMachineTypes.map((type) => (
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
                                        <TableCell className="align-top">
                                          <FormField
                                            control={form.control}
                                            name={`stations.${index}.machineId`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!machineType}>
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select machine" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    {availableMachines.map((machine) => (
                                                      <SelectItem key={machine.id} value={machine.id}>
                                                        {machine.name}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <FormField
                                            control={form.control}
                                            name={`stations.${index}.workerId`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormControl>
                                                  <Input {...field} onChange={(e) => {
                                                      const workerId = e.target.value;
                                                      field.onChange(workerId);
                                                      const worker = mockWorkers.find(w => w.id.toLowerCase() === workerId.toLowerCase());
                                                      form.setValue(`stations.${index}.assignedWorker`, worker ? worker.name : '');
                                                  }} />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <FormField
                                            control={form.control}
                                            name={`stations.${index}.assignedWorker`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormControl>
                                                  <Input {...field} disabled />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </TableCell>
                                        <TableCell className="align-top">
                                          <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => remove(index)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </Draggable>
                                )})}
                                {provided.placeholder}
                              </TableBody>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </Table>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => append({ id: `station-${Date.now()}`, machineType: '', machineId: '', assignedWorker: '', workerId: '' })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Station
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>History of Assigned Workers</CardTitle>
                    <CardDescription>
                      A log of all worker assignments and removals for this line.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 border rounded-md bg-muted/50">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="worker-name-filter">Worker Name</Label>
                            <Input 
                                id="worker-name-filter"
                                placeholder="Filter by worker name..."
                                value={historyFilters.workerName}
                                onChange={e => {
                                    setHistoryFilters(prev => ({ ...prev, workerName: e.target.value }));
                                    setVisibleHistoryCount(10);
                                }}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="machine-type-filter">Machine Type</Label>
                            <Select 
                                value={historyFilters.machineType}
                                onValueChange={value => {
                                    setHistoryFilters(prev => ({ ...prev, machineType: value }));
                                    setVisibleHistoryCount(10);
                                }}
                            >
                                <SelectTrigger id="machine-type-filter">
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {historyMachineTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Date Range</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal bg-background",
                                      !historyDateRange && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {historyDateRange?.from ? (
                                      historyDateRange.to ? (
                                        <>
                                          {format(historyDateRange.from, "LLL dd, y")} -{" "}
                                          {format(historyDateRange.to, "LLL dd, y")}
                                        </>
                                      ) : (
                                        format(historyDateRange.from, "LLL dd, y")
                                      )
                                    ) : (
                                      <span>Pick a date range</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={historyDateRange?.from}
                                    selected={historyDateRange}
                                    onSelect={setHistoryDateRange}
                                    numberOfMonths={2}
                                  />
                                </PopoverContent>
                              </Popover>
                        </div>
                      </div>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Worker Name</TableHead>
                            <TableHead>Worker ID</TableHead>
                            <TableHead>Machine Type</TableHead>
                            <TableHead>Station ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHistory.length > 0 ? (
                            filteredHistory.slice(0, visibleHistoryCount).map((record, index) => (
                                <TableRow key={index}>
                                <TableCell>{format(record.date, "PPP")}</TableCell>
                                <TableCell>
                                    <Badge variant={record.action === "Assigned" ? "secondary" : "outline"}>
                                    {record.action}
                                    </Badge>
                                </TableCell>
                                <TableCell>{record.workerName}</TableCell>
                                <TableCell className="font-code">{record.workerId}</TableCell>
                                <TableCell>{record.machineType}</TableCell>
                                <TableCell className="font-code">{record.stationId}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                No history records found matching your filters.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                      </Table>
                    </div>
                     {visibleHistoryCount < filteredHistory.length && (
                        <div className="mt-4 flex justify-center">
                            <Button variant="secondary" onClick={() => setVisibleHistoryCount(prev => prev + 10)}>
                                Load More
                            </Button>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Line Performance</CardTitle>
                    <CardDescription>
                      Daily output and efficiency over the last 7 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart accessibilityLayer data={mockLinePerformanceData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-output)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-efficiency)" tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar yAxisId="left" dataKey="output" fill="var(--color-output)" radius={4} />
                        <Bar yAxisId="right" dataKey="efficiency" fill="var(--color-efficiency)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Line Selected</CardTitle>
              <CardDescription>
                Please select a production line to view its details.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </form>
    </FormProvider>
  );
}
