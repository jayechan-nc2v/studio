
"use client";

import * as React from "react";
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
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusCircle, Trash2, ChevronsUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useCheckPointStore } from "@/lib/checkpoint-store";
import { checkPointSchema, type NewCheckPointFormValues } from "@/lib/schemas";
import { mockCheckPointTypes, type CheckPoint } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/lib/store";


export default function CheckPointsPage() {
  const { toast } = useToast();
  const { checkPoints, fetchCheckPoints, addCheckPoint, updateCheckPoint, deleteCheckPoint, loading, error } = useCheckPointStore();
  const { selectedFactory } = useUserStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedCheckPoint, setSelectedCheckPoint] = React.useState<CheckPoint | null>(null);

  const [filters, setFilters] = React.useState({ name: '', type: 'all' });
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof CheckPoint, direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'descending' });
  
  React.useEffect(() => {
    if (selectedFactory) {
      fetchCheckPoints(selectedFactory);
    }
  }, [selectedFactory, fetchCheckPoints]);

  const form = useForm<NewCheckPointFormValues>({
    resolver: zodResolver(checkPointSchema),
    defaultValues: {
      name: "",
      type: "Sewing",
      isProductionEntry: false,
      isProductionExit: false,
    },
  });

  const onSubmit = async (data: NewCheckPointFormValues) => {
    if (!selectedFactory) {
      toast({ variant: "destructive", title: "Error", description: "No factory selected." });
      return;
    }
    try {
      if (dialogMode === "edit" && selectedCheckPoint) {
        await updateCheckPoint(selectedFactory, selectedCheckPoint.id, data);
        toast({
          title: "Success",
          description: `Check Point "${data.name}" has been updated.`,
        });
      } else {
        await addCheckPoint(selectedFactory, data);
        toast({
          title: "Success",
          description: `Check Point "${data.name}" has been created.`,
        });
      }
      form.reset();
      setIsDialogOpen(false);
      setSelectedCheckPoint(null);
    } catch (e) {
       toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not save the check point. Please try again.",
      });
    }
  };
  
  const handleAdd = () => {
    setSelectedCheckPoint(null);
    setDialogMode("add");
    form.reset({
      name: "",
      type: undefined,
      isProductionEntry: false,
      isProductionExit: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (checkPoint: CheckPoint) => {
    setSelectedCheckPoint(checkPoint);
    setDialogMode("edit");
    form.reset(checkPoint);
    setIsDialogOpen(true);
  };

  const handleDelete = (checkPoint: CheckPoint) => {
    setSelectedCheckPoint(checkPoint);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCheckPoint && selectedFactory) {
      try {
        await deleteCheckPoint(selectedFactory, selectedCheckPoint.id);
        toast({
          title: "Deleted",
          description: `Check Point "${selectedCheckPoint.name}" has been deleted.`,
          variant: "destructive"
        });
        setIsDeleteDialogOpen(false);
        setSelectedCheckPoint(null);
      } catch (e) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Could not delete the check point. Please try again.",
        });
      }
    }
  };

  const requestSort = (key: keyof CheckPoint) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  }

  const filteredCheckPoints = React.useMemo(() => {
    return checkPoints
      .filter((cp) => {
        const nameMatch = filters.name
          ? cp.name.toLowerCase().includes(filters.name.toLowerCase())
          : true;
        const typeMatch =
          filters.type !== 'all'
            ? cp.type === filters.type
            : true;
        return nameMatch && typeMatch;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        const aValue = a[key];
        const bValue = b[key];

        if (aValue < bValue) {
          return direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
  }, [checkPoints, filters, sortConfig]);

  const SortableHeader = ({
      label,
      sortKey
  }: {
      label: string;
      sortKey: keyof CheckPoint;
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
            Manage Check Points
          </h1>
          <p className="text-muted-foreground">
            Define and configure production scanning points.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Check Point
        </Button>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter and Search</CardTitle>
          <CardDescription>Narrow down the list of check points.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <Label htmlFor="name-filter">Name</Label>
                <Input
                    id="name-filter"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                />
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                 <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger id="type-filter">
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {mockCheckPointTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Check Point List</CardTitle>
          <CardDescription>
            A comprehensive list of all production check points in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="ID" sortKey="id" /></TableHead>
                  <TableHead><SortableHeader label="Name" sortKey="name" /></TableHead>
                  <TableHead><SortableHeader label="Type" sortKey="type" /></TableHead>
                  <TableHead><SortableHeader label="Is Entry Point" sortKey="isProductionEntry" /></TableHead>
                  <TableHead><SortableHeader label="Is Exit Point" sortKey="isProductionExit" /></TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredCheckPoints.length > 0 ? (
                  filteredCheckPoints.map((cp) => (
                    <TableRow key={cp.id} onDoubleClick={() => handleEdit(cp)}>
                      <TableCell className="font-mono">{cp.id}</TableCell>
                      <TableCell className="font-medium">{cp.name}</TableCell>
                      <TableCell>{cp.type}</TableCell>
                      <TableCell>
                        <Checkbox checked={cp.isProductionEntry} disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={cp.isProductionExit} disabled />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cp)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cp)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {error || "No check points found matching your criteria."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} Check Point</DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Update the details for the check point.' : 'Fill out the details for the new check point.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form id="checkpoint-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Point Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., QC Station 1" {...field} />
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
                    <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {mockCheckPointTypes.map((type) => (
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
               <FormField
                  control={form.control}
                  name="isProductionEntry"
                  render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                      <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                      />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                      <FormLabel>
                          Production Entry
                      </FormLabel>
                      <FormDescription>
                          Is this the first checkpoint in the production flow?
                      </FormDescription>
                      </div>
                  </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name="isProductionExit"
                  render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                      <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                      />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                      <FormLabel>
                          Production Exit
                      </FormLabel>
                      <FormDescription>
                          Is this the final checkpoint in the production flow?
                      </FormDescription>
                      </div>
                  </FormItem>
                  )}
              />
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" form="checkpoint-form" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dialogMode === 'edit' ? 'Save Changes' : 'Create Check Point'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the check point
              "{selectedCheckPoint?.name}".
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
