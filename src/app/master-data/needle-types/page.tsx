
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useNeedleTypeStore } from "@/lib/store";
import type { NeedleType } from "@/lib/data";

const needleTypeSchema = z.object({
  name: z.string().min(1, "Needle Type is required."),
});

type NeedleTypeFormValues = z.infer<typeof needleTypeSchema>;

export default function NeedleTypesPage() {
  const { toast } = useToast();
  const { needleTypes, addNeedleType, updateNeedleType, deleteNeedleType } = useNeedleTypeStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedNeedle, setSelectedNeedle] = React.useState<NeedleType | null>(null);

  const form = useForm<NeedleTypeFormValues>({
    resolver: zodResolver(needleTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: NeedleTypeFormValues) => {
    if (dialogMode === "edit" && selectedNeedle) {
      updateNeedleType(selectedNeedle.id, data.name);
      toast({
        title: "Success",
        description: `Needle Type "${data.name}" has been updated.`,
      });
    } else {
      addNeedleType(data.name);
      toast({
        title: "Success",
        description: `Needle Type "${data.name}" has been created.`,
      });
    }
    form.reset();
    setIsDialogOpen(false);
    setSelectedNeedle(null);
  };
  
  const handleAdd = () => {
    setSelectedNeedle(null);
    setDialogMode("add");
    form.reset({ name: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (needle: NeedleType) => {
    setSelectedNeedle(needle);
    setDialogMode("edit");
    form.reset({ name: needle.name });
    setIsDialogOpen(true);
  };

  const handleDelete = (needle: NeedleType) => {
    setSelectedNeedle(needle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNeedle) {
      deleteNeedleType(selectedNeedle.id);
      toast({
        title: "Deleted",
        description: `Needle Type "${selectedNeedle.name}" has been deleted.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      setSelectedNeedle(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Needle Types
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or delete types for needles, bobbins, and loopers.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Needle Type
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Needle Type List</CardTitle>
          <CardDescription>
            A list of all available needle types.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Needle Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needleTypes.length > 0 ? (
                  needleTypes.map((needle) => (
                    <TableRow key={needle.id} onDoubleClick={() => handleEdit(needle)}>
                      <TableCell className="font-code">{needle.id}</TableCell>
                      <TableCell className="font-medium">{needle.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(needle)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(needle)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No needle types found.
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} Needle Type</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id="needle-type-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Needle Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DBx1" {...field} />
                    </FormControl>
                    <FormMessage />
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
            <Button type="submit" form="needle-type-form">{dialogMode === 'edit' ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the needle type
              "{selectedNeedle?.name}".
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
