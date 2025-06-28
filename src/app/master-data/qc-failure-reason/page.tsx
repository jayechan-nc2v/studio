
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
import { Pencil, PlusCircle, Trash2, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useQcFailureReasonStore } from "@/lib/store";
import { qcFailureReasonSchema, type NewQcFailureReasonFormValues } from "@/lib/schemas";
import { mockQcFailureCategories, type QcFailureReason } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export default function QcFailureReasonsPage() {
  const { toast } = useToast();
  const { reasons, addReason, updateReason, deleteReason } = useQcFailureReasonStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedReason, setSelectedReason] = React.useState<QcFailureReason | null>(null);

  // State for filtering, sorting, pagination
  const [filters, setFilters] = React.useState({ reason: '', category: 'all' });
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof QcFailureReason, direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'descending' });
  const [visibleCount, setVisibleCount] = React.useState(30);

  
  const availableCategories = React.useMemo(
    () => [...new Set(reasons.map((i) => i.category))].sort(),
    [reasons]
  );

  const form = useForm<NewQcFailureReasonFormValues>({
    resolver: zodResolver(qcFailureReasonSchema),
    defaultValues: {
      reason: "",
      category: "",
      description: "",
    },
  });

  const onSubmit = (data: NewQcFailureReasonFormValues) => {
    if (dialogMode === "edit" && selectedReason) {
      updateReason(selectedReason.id, data);
      toast({
        title: "Success",
        description: `Reason "${data.reason}" has been updated.`,
      });
    } else {
      addReason(data);
      toast({
        title: "Success",
        description: `Reason "${data.reason}" has been created.`,
      });
    }
    form.reset();
    setIsDialogOpen(false);
    setSelectedReason(null);
  };
  
  const handleAdd = () => {
    setSelectedReason(null);
    setDialogMode("add");
    form.reset({
      reason: "",
      category: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (reason: QcFailureReason) => {
    setSelectedReason(reason);
    setDialogMode("edit");
    form.reset(reason);
    setIsDialogOpen(true);
  };

  const handleDelete = (reason: QcFailureReason) => {
    setSelectedReason(reason);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedReason) {
      deleteReason(selectedReason.id);
      toast({
        title: "Deleted",
        description: `Reason "${selectedReason.reason}" has been deleted.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      setSelectedReason(null);
    }
  };

  const requestSort = (key: keyof QcFailureReason) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setVisibleCount(30);
  }

  const filteredReasons = React.useMemo(() => {
    return reasons
      .filter((reason) => {
        const nameMatch = filters.reason
          ? reason.reason.toLowerCase().includes(filters.reason.toLowerCase())
          : true;
        const categoryMatch =
          filters.category !== 'all'
            ? reason.category === filters.category
            : true;
        return nameMatch && categoryMatch;
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
  }, [reasons, filters, sortConfig]);

  const SortableHeader = ({
      label,
      sortKey
  }: {
      label: string;
      sortKey: keyof QcFailureReason;
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
            Manage QC Failure Reasons
          </h1>
          <p className="text-muted-foreground">
            Define standard reasons for items that fail quality control.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reason
        </Button>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter and Search</CardTitle>
          <CardDescription>Narrow down the list of failure reasons.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <Label htmlFor="reason-filter">Reason</Label>
                <Input
                    id="reason-filter"
                    placeholder="Search by reason name..."
                    value={filters.reason}
                    onChange={(e) => handleFilterChange('reason', e.target.value)}
                />
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                 <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger id="category-filter">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {availableCategories.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Failure Reason List</CardTitle>
          <CardDescription>
            A comprehensive list of all QC failure reasons in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="ID" sortKey="id" /></TableHead>
                  <TableHead><SortableHeader label="Reason" sortKey="reason" /></TableHead>
                  <TableHead><SortableHeader label="Category" sortKey="category" /></TableHead>
                  <TableHead><SortableHeader label="Description" sortKey="description" /></TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReasons.length > 0 ? (
                  filteredReasons.slice(0, visibleCount).map((reason) => (
                    <TableRow key={reason.id} onDoubleClick={() => handleEdit(reason)}>
                      <TableCell className="font-code">{reason.id}</TableCell>
                      <TableCell className="font-medium">{reason.reason}</TableCell>
                      <TableCell>{reason.category}</TableCell>
                      <TableCell>{reason.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(reason)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(reason)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No reasons found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           {visibleCount < filteredReasons.length && (
                <div className="mt-4 flex justify-center">
                    <Button variant="secondary" onClick={() => setVisibleCount(prev => prev + 30)}>
                        Load More
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} QC Failure Reason</DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Update the details for the reason.' : 'Fill out the details for the new reason.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Broken Stitch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {mockQcFailureCategories.map((type) => (
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
              </div>
               <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the reason in more detail..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">{dialogMode === 'edit' ? 'Save Changes' : 'Create Reason'}</Button>
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
              This action cannot be undone. This will permanently delete the reason
              "{selectedReason?.reason}".
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
