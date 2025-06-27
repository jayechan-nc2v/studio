"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMachineTypeStore } from "@/lib/store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MachineTypesPage() {
  const { toast } = useToast();
  const { machineTypes, addMachineType } = useMachineTypeStore();
  const [newTypeName, setNewTypeName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTypeName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Machine type name cannot be empty.",
      });
      return;
    }
    addMachineType(newTypeName);
    toast({
      title: "Success!",
      description: `Machine type "${newTypeName}" has been created.`,
    });
    setNewTypeName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Machine Types
          </h1>
          <p className="text-muted-foreground">
            Categorize and view machines by their type.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Machine Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Machine Type</DialogTitle>
                <DialogDescription>
                  Enter a name for the new machine type. The system will
                  generate a unique ID.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Type Name
                  </Label>
                  <Input
                    id="name"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Heavy-Duty Sewing"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {machineTypes.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {machineTypes.map((machineType) => (
            <AccordionItem value={machineType.id} key={machineType.id}>
              <AccordionTrigger>
                <span className="font-semibold text-lg">{machineType.typeName}</span>
              </AccordionTrigger>
              <AccordionContent>
                 <div className="space-y-6">
                   <Card>
                    <CardHeader>
                      <CardTitle>Machine Type Information</CardTitle>
                      <CardDescription>
                        Core details for the "{machineType.typeName}" type.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>System ID</Label>
                          <Input value={machineType.id} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Type Name</Label>
                          <Input value={machineType.typeName} disabled />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                 <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Machines of this Type</CardTitle>
                       <CardDescription>
                        A list of all machines categorized under "{machineType.typeName}".
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Machine ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Available</TableHead>
                              <TableHead>Current Line</TableHead>
                              <TableHead>In Warranty</TableHead>
                              <TableHead>Warranty Expires</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {machineType.machines.length > 0 ? (
                              machineType.machines.map((machine) => (
                                <TableRow key={machine.id}>
                                  <TableCell className="font-code">{machine.id}</TableCell>
                                  <TableCell>{machine.name}</TableCell>
                                  <TableCell>
                                    <Badge variant={machine.isAvailable ? "default" : "destructive"}>
                                      {machine.isAvailable ? "Yes" : "No"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{machine.currentLine || "N/A"}</TableCell>
                                  <TableCell>
                                    <Badge variant={machine.inWarranty ? "secondary" : "outline"}>
                                      {machine.inWarranty ? "Yes" : "No"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {machine.warrantyExpiryDate ? format(machine.warrantyExpiryDate, "PPP") : "N/A"}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  No machines found for this type.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                 </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Machine Types Found</CardTitle>
            <CardDescription>
              Get started by adding your first machine type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Click the "Add Machine Type" button to create a new category for your machines.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
