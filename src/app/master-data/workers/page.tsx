
"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusCircle, Trash2, ChevronsUpDown, ArrowUp, ArrowDown, CalendarIcon } from "lucide-react";
import { useWorkerStore, useProductionLineStore } from "@/lib/store";
import { workerSchema, type NewWorkerFormValues } from "@/lib/schemas";
import { type Worker, mockPositions } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export default function WorkersPage() {
  const { toast } = useToast();
  const { workers, addWorker, updateWorker, deleteWorker } = useWorkerStore();
  const { lines } = useProductionLineStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null);

  const [filters, setFilters] = React.useState({ name: '', status: 'all', position: 'all', line: 'all' });
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Worker, direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'descending' });
  const [visibleCount, setVisibleCount] = React.useState(15);

  const form = useForm<NewWorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: "",
      hrmId: "",
      status: "Active",
      position: "",
      line: "",
    },
  });

  const onSubmit = (data: NewWorkerFormValues) => {
    if (dialogMode === "edit" && selectedWorker) {
      updateWorker(selectedWorker.id, data);
      toast({
        title: "Success",
        description: `Worker "${data.name}" has been updated.`,
      });
    } else {
      addWorker(data);
      toast({
        title: "Success",
        description: `Worker "${data.name}" has been created.`,
      });
    }
    form.reset();
    setIsDialogOpen(false);
    setSelectedWorker(null);
  };
  
  const handleAdd = () => {
    setSelectedWorker(null);
    setDialogMode("add");
    form.reset({
      name: "",
      hrmId: "",
      joinDate: new Date(),
      status: "Active",
      position: "",
      line: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setDialogMode("edit");
    form.reset({
        ...worker,
        line: worker.line || "",
        hrmId: worker.hrmId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWorker) {
      deleteWorker(selectedWorker.id);
      toast({
        title: "Deleted",
        description: `Worker "${selectedWorker.name}" has been deleted.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      setSelectedWorker(null);
    }
  };

  const requestSort = (key: keyof Worker) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setVisibleCount(15);
  }

  const filteredWorkers = React.useMemo(() => {
    return workers
      .filter((worker) => {
        const nameMatch = filters.name
          ? worker.name.toLowerCase().includes(filters.name.toLowerCase())
          : true;
        const statusMatch =
          filters.status !== 'all'
            ? worker.status === filters.status
            : true;
        const positionMatch =
          filters.position !== 'all'
            ? worker.position === filters.position
            : true;
        const lineMatch = (() => {
          if (filters.line === 'all') return true;
          if (filters.line === '_UNASSIGNED_') return !worker.line;
          return worker.line === filters.line;
        })();
        return nameMatch && statusMatch && positionMatch && lineMatch;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        const aValue = a[key];
        const bValue = b[key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) {
          return direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
  }, [workers, filters, sortConfig]);

  const SortableHeader = ({
      label,
      sortKey
  }: {
      label: string;
      sortKey: keyof Worker;
  }) => {
      const isSorted = sortConfig?.key === sortKey;
      return (
          <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2">
              {label}
              {isSorted ? (
                  sortConfig?.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Workers
          </h1>
          <p className="text-muted-foreground">
            View, add, and manage your workforce.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter and Search</CardTitle>
          <CardDescription>Narrow down the list of workers.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name-filter">Name</Label>
                <Input
                    id="name-filter"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                 <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Resigned">Resigned</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="position-filter">Position</Label>
                 <Select value={filters.position} onValueChange={(value) => handleFilterChange('position', value)}>
                    <SelectTrigger id="position-filter">
                        <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {mockPositions.map(pos => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="line-filter">Line</Label>
                 <Select value={filters.line} onValueChange={(value) => handleFilterChange('line', value)}>
                    <SelectTrigger id="line-filter">
                        <SelectValue placeholder="Select a line" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Lines</SelectItem>
                        <SelectItem value="_UNASSIGNED_">Unassigned</SelectItem>
                        {lines.map(line => (
                            <SelectItem key={line.id} value={line.name}>{line.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Worker List</CardTitle>
          <CardDescription>
            A comprehensive list of all workers in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="ID" sortKey="id" /></TableHead>
                  <TableHead><SortableHeader label="HRM ID" sortKey="hrmId" /></TableHead>
                  <TableHead><SortableHeader label="Name" sortKey="name" /></TableHead>
                  <TableHead><SortableHeader label="Position" sortKey="position" /></TableHead>
                  <TableHead><SortableHeader label="Line" sortKey="line" /></TableHead>
                  <TableHead><SortableHeader label="Join Date" sortKey="joinDate" /></TableHead>
                  <TableHead><SortableHeader label="Status" sortKey="status" /></TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.slice(0, visibleCount).map((worker) => (
                    <TableRow key={worker.id} onDoubleClick={() => handleEdit(worker)}>
                      <TableCell className="font-code">{worker.id}</TableCell>
                      <TableCell className="font-code">{worker.hrmId || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.position}</TableCell>
                      <TableCell>{worker.line || "N/A"}</TableCell>
                      <TableCell>{format(worker.joinDate, "PPP")}</TableCell>
                      <TableCell>
                        <Badge variant={worker.status === 'Active' ? 'secondary' : 'outline'}>
                            {worker.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(worker)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No workers found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           {visibleCount < filteredWorkers.length && (
                <div className="mt-4 flex justify-center">
                    <Button variant="secondary" onClick={() => setVisibleCount(prev => prev + 15)}>
                        Load More
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} Worker</DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Update the details for the worker.' : 'Fill out the details for the new worker.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="hrmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HRM ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., HRM-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockPositions.map(pos => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="line"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === '_UNASSIGNED_' ? '' : value)}
                        value={field.value || '_UNASSIGNED_'}
                      >
                          <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a line" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="_UNASSIGNED_">Unassigned</SelectItem>
                            {lines.map(line => (
                                <SelectItem key={line.id} value={line.name}>{line.name}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joinDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2 sm:pt-0">
                      <FormLabel>Join Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Resigned">Resigned</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">{dialogMode === 'edit' ? 'Save Changes' : 'Create Worker'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the worker
              "{selectedWorker?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
