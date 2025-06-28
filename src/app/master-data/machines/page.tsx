
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, PlusCircle, Search, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { type Machine, type MaintenanceRecord, type AllocationRecord } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useMachineStore, useMachineTypeStore } from "@/lib/store";
import {
  mockMaintenanceHistory,
  mockAllocationHistory,
} from "@/lib/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newMachineSchema, type NewMachineFormValues } from "@/lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function MachinesPage() {
  const { toast } = useToast();
  const { machines, addMachine } = useMachineStore();
  const { machineTypes } = useMachineTypeStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const [selectedMachine, setSelectedMachine] = React.useState<Machine | null>(null);
  const [searchResults, setSearchResults] = React.useState<Machine[]>([]);
  const [isResultDialogOpen, setIsResultDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Sorting state
  const [maintenanceSortConfig, setMaintenanceSortConfig] = React.useState<{ key: keyof MaintenanceRecord, direction: 'ascending' | 'descending' } | null>({ key: 'startDate', direction: 'descending' });
  const [allocationSortConfig, setAllocationSortConfig] = React.useState<{ key: keyof AllocationRecord, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });


  React.useEffect(() => {
    if (machines.length > 0 && !selectedMachine) {
        setSelectedMachine(machines[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines]);


  const machineTypesForFilter = React.useMemo(
    () => [...new Set(machines.map((m) => m.type))].sort(),
    [machines]
  );
  
  const machineTypesForSelect = React.useMemo(
    () => machineTypes.map(mt => mt.typeName).sort(),
    [machineTypes]
  );

  const form = useForm<NewMachineFormValues>({
      resolver: zodResolver(newMachineSchema),
      defaultValues: {
          name: "",
          type: "",
          serialNo: "",
          supplier: "",
      }
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    let results: Machine[] = machines;

    if (searchQuery.trim()) {
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      results = results.filter((m) => m.type === typeFilter);
    }

    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No machines found matching your criteria.",
      });
      setSelectedMachine(null);
    } else if (results.length === 1) {
      setSelectedMachine(results[0]);
      toast({
        title: "Machine Found",
        description: `Displaying details for ${results[0].name}.`,
      });
    } else {
      setSearchResults(results);
      setIsResultDialogOpen(true);
    }
  };

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsResultDialogOpen(false);
  };
  
  const handleAddMachine = (data: NewMachineFormValues) => {
    const newMachine = addMachine(data);
    setSelectedMachine(newMachine);
    toast({
        title: "Machine Created",
        description: `Machine "${newMachine.name}" has been successfully created.`,
    });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const sortedMaintenanceHistory = React.useMemo(() => {
      let sortableItems = [...mockMaintenanceHistory];
      if (maintenanceSortConfig !== null) {
          sortableItems.sort((a, b) => {
              if (a[maintenanceSortConfig.key] < b[maintenanceSortConfig.key]) {
                  return maintenanceSortConfig.direction === 'ascending' ? -1 : 1;
              }
              if (a[maintenanceSortConfig.key] > b[maintenanceSortConfig.key]) {
                  return maintenanceSortConfig.direction === 'ascending' ? 1 : -1;
              }
              return 0;
          });
      }
      return sortableItems;
  }, [maintenanceSortConfig]);

  const sortedAllocationHistory = React.useMemo(() => {
      let sortableItems = [...mockAllocationHistory];
      if (allocationSortConfig !== null) {
          sortableItems.sort((a, b) => {
              const aVal = a[allocationSortConfig.key];
              const bVal = b[allocationSortConfig.key];
              if (aVal < bVal) {
                  return allocationSortConfig.direction === 'ascending' ? -1 : 1;
              }
              if (aVal > bVal) {
                  return allocationSortConfig.direction === 'ascending' ? 1 : -1;
              }
              return 0;
          });
      }
      return sortableItems;
  }, [allocationSortConfig]);

  const requestMaintenanceSort = (key: keyof MaintenanceRecord) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (maintenanceSortConfig && maintenanceSortConfig.key === key && maintenanceSortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setMaintenanceSortConfig({ key, direction });
  };

  const requestAllocationSort = (key: keyof AllocationRecord) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (allocationSortConfig && allocationSortConfig.key === key && allocationSortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setAllocationSortConfig({ key, direction });
  };
  
  const MaintenanceSortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof MaintenanceRecord; }) => {
    const isSorted = maintenanceSortConfig?.key === sortKey;
    return (
        <Button variant="ghost" onClick={() => requestMaintenanceSort(sortKey)} className="px-2">
            {label}
            {isSorted ? (
                maintenanceSortConfig?.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    );
  };

  const AllocationSortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof AllocationRecord; }) => {
      const isSorted = allocationSortConfig?.key === sortKey;
      return (
          <Button variant="ghost" onClick={() => requestAllocationSort(sortKey)} className="px-2">
              {label}
              {isSorted ? (
                  allocationSortConfig?.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
          </Button>
      );
    };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Machines</h1>
          <p className="text-muted-foreground">
            Search for a machine or add a new one.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Machine
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Machine</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new machine to the inventory.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddMachine)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Machine Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Juki DDL-8700" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Machine Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {machineTypesForSelect.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="serialNo"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serial Number</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., SN-J87A001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="supplier"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Juki Central" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchaseDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Purchase Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                                name="warrantyExpiryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Warranty Expiry Date (Optional)</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                         <div className="flex justify-end gap-2 pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create Machine</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </header>

      {/* Search Panel */}
      <Card>
        <form onSubmit={handleSearch}>
          <CardHeader>
            <CardTitle>Search Machines</CardTitle>
            <CardDescription>
              Find a machine by its name, ID, or type. Leave fields blank to see all machines.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="search-query">Search by Name or ID</Label>
                <Input
                  id="search-query"
                  placeholder="Enter machine name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-filter">Filter by Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Types</SelectItem>
                    {machineTypesForFilter.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Results Dialog for Multiple Matches */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Multiple Machines Found</DialogTitle>
            <DialogDescription>
              Please select a machine from the list below to view its details.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((machine) => (
                  <TableRow
                    key={machine.id}
                    onClick={() => handleSelectMachine(machine)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-code">{machine.id}</TableCell>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell>{machine.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={machine.isAvailable ? "default" : "secondary"}
                      >
                        {machine.isAvailable ? "Available" : "In Use"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {selectedMachine ? (
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation History</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Machine Information</CardTitle>
                <CardDescription>
                  Detailed information for Machine ID: {selectedMachine.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>System ID</Label>
                    <Input value={selectedMachine.id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={selectedMachine.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input value={selectedMachine.type} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial No.</Label>
                    <Input value={selectedMachine.serialNo} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input
                      value={format(selectedMachine.purchaseDate, "PPP")}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty Expiry Date</Label>
                    <Input
                      value={
                        selectedMachine.warrantyExpiryDate
                          ? format(selectedMachine.warrantyExpiryDate, "PPP")
                          : "N/A"
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Input value={selectedMachine.supplier} disabled />
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Label>In Warranty</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="in-warranty"
                        checked={selectedMachine.inWarranty}
                        disabled
                      />
                      <Label htmlFor="in-warranty">
                        {selectedMachine.inWarranty ? "Yes" : "No"}
                      </Label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Label>Availability</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="availability"
                        checked={selectedMachine.isAvailable}
                        disabled
                      />
                      <Label htmlFor="availability">
                        {selectedMachine.isAvailable ? "Available" : "Unavailable"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>
                  History of maintenance records for this machine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><MaintenanceSortableHeader label="Start Date" sortKey="startDate" /></TableHead>
                        <TableHead><MaintenanceSortableHeader label="Finish Date" sortKey="finishDate" /></TableHead>
                        <TableHead><MaintenanceSortableHeader label="Company" sortKey="company" /></TableHead>
                        <TableHead><MaintenanceSortableHeader label="In Charge" sortKey="inCharge" /></TableHead>
                        <TableHead><MaintenanceSortableHeader label="Ref No." sortKey="refNo" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMaintenanceHistory.map((record) => (
                        <TableRow key={record.refNo}>
                          <TableCell>{format(record.startDate, "PPP")}</TableCell>
                          <TableCell>
                            {format(record.finishDate, "PPP")}
                          </TableCell>
                          <TableCell>{record.company}</TableCell>
                          <TableCell>{record.inCharge}</TableCell>
                          <TableCell className="font-code">{record.refNo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="allocation">
            <Card>
              <CardHeader>
                <CardTitle>Machine Allocation History</CardTitle>
                <CardDescription>
                  Record of which line and worker have used this machine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><AllocationSortableHeader label="Action" sortKey="action" /></TableHead>
                        <TableHead><AllocationSortableHeader label="Date" sortKey="date" /></TableHead>
                        <TableHead><AllocationSortableHeader label="Production Line" sortKey="productionLine" /></TableHead>
                        <TableHead><AllocationSortableHeader label="Worker" sortKey="worker" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAllocationHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge
                              variant={
                                record.action === "Allocate"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {record.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(record.date, "PPP")}</TableCell>
                          <TableCell>{record.productionLine}</TableCell>
                          <TableCell>{record.worker}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please search for a machine to view its details or add a new one.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
