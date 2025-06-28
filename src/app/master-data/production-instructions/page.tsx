
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
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { PlusCircle } from "lucide-react";
import { useProductionInstructionStore, useMachineTypeStore } from "@/lib/store";
import { productionInstructionSchema, type NewProductionInstructionFormValues } from "@/lib/schemas";


export default function ProductionInstructionsPage() {
  const { toast } = useToast();
  const { instructions, addInstruction } = useProductionInstructionStore();
  const { machineTypes } = useMachineTypeStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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
    addInstruction(data);
    toast({
      title: "Success",
      description: `Production instruction "${data.name}" has been created.`,
    });
    form.reset();
    setIsAddDialogOpen(false);
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Instruction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Production Instruction</DialogTitle>
              <DialogDescription>
                Fill out the details for the new instruction.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormControl>
                          <Input placeholder="e.g., T-Shirt" {...field} />
                        </FormControl>
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
                          defaultValue={field.value}
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
                  <Button type="submit">Create Instruction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                  <TableHead className="text-right">SMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructions.length > 0 ? (
                  instructions.map((instruction) => (
                    <TableRow key={instruction.id}>
                      <TableCell className="font-code">{instruction.id}</TableCell>
                      <TableCell className="font-medium">{instruction.name}</TableCell>
                      <TableCell>{instruction.garmentType}</TableCell>
                      <TableCell>{instruction.machineType}</TableCell>
                      <TableCell className="text-right">{instruction.smv.toFixed(4)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No instructions found. Get started by adding one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
