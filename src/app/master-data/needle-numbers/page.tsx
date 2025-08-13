
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
import { useNeedleNumberStore } from "@/lib/store";
import type { NeedleNumber } from "@/lib/data";

const needleNumberSchema = z.object({
  name: z.string().min(1, "Needle Number is required."),
});

type NeedleNumberFormValues = z.infer<typeof needleNumberSchema>;

export default function NeedleNumbersPage() {
  const { toast } = useToast();
  const { needleNumbers, addNeedleNumber, updateNeedleNumber, deleteNeedleNumber } = useNeedleNumberStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedNeedle, setSelectedNeedle] = React.useState<NeedleNumber | null>(null);

  const form = useForm<NeedleNumberFormValues>({
    resolver: zodResolver(needleNumberSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: NeedleNumberFormValues) => {
    if (dialogMode === "edit" && selectedNeedle) {
      updateNeedleNumber(selectedNeedle.id, data.name);
      toast({
        title: "Success",
        description: `Needle Number "${data.name}" has been updated.`,
      });
    } else {
      addNeedleNumber(data.name);
      toast({
        title: "Success",
        description: `Needle Number "${data.name}" has been created.`,
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

  const handleEdit = (needle: NeedleNumber) => {
    setSelectedNeedle(needle);
    setDialogMode("edit");
    form.reset({ name: needle.name });
    setIsDialogOpen(true);
  };

  const handleDelete = (needle: NeedleNumber) => {
    setSelectedNeedle(needle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNeedle) {
      deleteNeedleNumber(selectedNeedle.id);
      toast({
        title: "Deleted",
        description: `Needle Number "${selectedNeedle.name}" has been deleted.`,
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
            Manage Needle Numbers
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or delete needle numbers for use in instructions.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Needle Number
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Needle Number List</CardTitle>
          <CardDescription>
            A list of all available needle numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Needle Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needleNumbers.length > 0 ? (
                  needleNumbers.map((needle) => (
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
                      No needle numbers found.
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
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} Needle Number</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id="needle-number-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Needle Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 90/14" {...field} />
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
            <Button type="submit" form="needle-number-form">{dialogMode === 'edit' ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the needle number
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
