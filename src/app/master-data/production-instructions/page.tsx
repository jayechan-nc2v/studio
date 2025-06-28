
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
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useProductionInstructionStore, useMachineTypeStore } from "@/lib/store";
import { productionInstructionSchema, type NewProductionInstructionFormValues } from "@/lib/schemas";
import { mockGarmentTypes, type ProductionInstruction } from "@/lib/data";


export default function ProductionInstructionsPage() {
  const { toast } = useToast();
  const { instructions, addInstruction, updateInstruction, deleteInstruction } = useProductionInstructionStore();
  const { machineTypes } = useMachineTypeStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedInstruction, setSelectedInstruction] = React.useState<ProductionInstruction | null>(null);

  const availableMachineTypes = React.useMemo(
    () => machineTypes.map((mt) => mt.typeName).sort(),
    [machineTypes]
  );

  const form = useForm<NewProductionInstructionFormValues>({
    resolver: zodResolver(productionInstructionSchema),
    defaultValues: {
      name: "",
      garmentType: "",
      machineType: "",
      smv: 0,
    },
  });

  const onSubmit = (data: NewProductionInstructionFormValues) => {
    if (dialogMode === "edit" && selectedInstruction) {
      updateInstruction(selectedInstruction.id, data);
      toast({
        title: "Success",
        description: `Production instruction "${data.name}" has been updated.`,
      });
    } else {
      addInstruction(data);
      toast({
        title: "Success",
        description: `Production instruction "${data.name}" has been created.`,
      });
    }
    form.reset();
    setIsDialogOpen(false);
    setSelectedInstruction(null);
  };
  
  const handleAdd = () => {
    setSelectedInstruction(null);
    setDialogMode("add");
    form.reset({
      name: "",
      garmentType: "",
      machineType: "",
      smv: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (instruction: ProductionInstruction) => {
    setSelectedInstruction(instruction);
    setDialogMode("edit");
    form.reset(instruction);
    setIsDialogOpen(true);
  };

  const handleDelete = (instruction: ProductionInstruction) => {
    setSelectedInstruction(instruction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInstruction) {
      deleteInstruction(selectedInstruction.id);
      toast({
        title: "Deleted",
        description: `Instruction "${selectedInstruction.name}" has been deleted.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      setSelectedInstruction(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Production Instructions
          </h1>
          <p className="text-muted-foreground">
            Define, view, and manage standard instructions for production.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Instruction
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Instruction List</CardTitle>
          <CardDescription>
            A comprehensive list of all production instructions in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>System ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Garment Type</TableHead>
                  <TableHead>Machine Type</TableHead>
                  <TableHead>SMV</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructions.length > 0 ? (
                  instructions.map((instruction) => (
                    <TableRow key={instruction.id} onDoubleClick={() => handleEdit(instruction)}>
                      <TableCell className="font-code">{instruction.id}</TableCell>
                      <TableCell className="font-medium">{instruction.name}</TableCell>
                      <TableCell>{instruction.garmentType}</TableCell>
                      <TableCell>{instruction.machineType}</TableCell>
                      <TableCell>{instruction.smv.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(instruction)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(instruction)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No instructions found. Get started by adding one.
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} Production Instruction</DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Update the details for the instruction.' : 'Fill out the details for the new instruction.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruction Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Attach Collar" {...field} />
                      </FormControl>
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
                       <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a garment type" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              {mockGarmentTypes.map((type) => (
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
                  name="machineType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a machine type" />
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
                <FormField
                  control={form.control}
                  name="smv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMV (Standard Minute Value)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g., 0.55"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
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
                <Button type="submit">{dialogMode === 'edit' ? 'Save Changes' : 'Create Instruction'}</Button>
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
              This action cannot be undone. This will permanently delete the instruction
              "{selectedInstruction?.name}".
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
