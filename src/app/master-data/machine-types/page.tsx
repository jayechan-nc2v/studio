
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
import { Check, ChevronsUpDown, PlusCircle, ArrowUp, ArrowDown } from "lucide-react";
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
import { type Machine } from "@/lib/data";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function MachineTypesPage() {
  const { toast } = useToast();
  const { machineTypes, addMachineType } = useMachineTypeStore();
  const [newTypeName, setNewTypeName] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [selectedTypeId, setSelectedTypeId] = React.useState<string | null>(
    null
  );

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Machine, direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'ascending' });


  React.useEffect(() => {
    if (machineTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(machineTypes[0].id);
    }
  }, [machineTypes, selectedTypeId]);

  const selectedMachineType = React.useMemo(() => {
    return machineTypes.find((mt) => mt.id === selectedTypeId) || null;
  }, [machineTypes, selectedTypeId]);
  
  const sortedMachines = React.useMemo(() => {
    if (!selectedMachineType) return [];
    const sortableItems = [...selectedMachineType.machines];
    if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue == null) return 1;
            if (bValue == null) return -1;
            
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        });
    }
    return sortableItems;
  }, [selectedMachineType, sortConfig]);


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
    const newId = addMachineType(newTypeName);
    toast({
      title: "Success!",
      description: `Machine type "${newTypeName}" has been created.`,
    });
    setNewTypeName("");
    setIsAddDialogOpen(false);
    setSelectedTypeId(newId);
  };
  
  const requestSort = (key: keyof Machine) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };
  
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Machine; }) => {
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
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Machine Types
          </h1>
          <p className="text-muted-foreground">
            Search for a machine type or create a new one.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isSearchOpen}
                className="w-[250px] justify-between"
              >
                {selectedMachineType
                  ? selectedMachineType.typeName
                  : "Select machine type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Search machine type..." />
                <CommandList>
                  <CommandEmpty>No machine type found.</CommandEmpty>
                  <CommandGroup>
                    {machineTypes.map((machineType) => (
                      <CommandItem
                        key={machineType.id}
                        value={machineType.id}
                        onSelect={(currentValue) => {
                          setSelectedTypeId(
                            currentValue === selectedTypeId ? null : currentValue
                          );
                          setIsSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTypeId === machineType.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {machineType.typeName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Type
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
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {selectedMachineType ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Machine Type Information</CardTitle>
              <CardDescription>
                Core details for the "{selectedMachineType.typeName}" type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>System ID</Label>
                  <Input value={selectedMachineType.id} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Type Name</Label>
                  <Input value={selectedMachineType.typeName} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Machines of this Type</CardTitle>
              <CardDescription>
                A list of all machines categorized under "
                {selectedMachineType.typeName}".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortableHeader label="Machine ID" sortKey="id" /></TableHead>
                      <TableHead><SortableHeader label="Name" sortKey="name" /></TableHead>
                      <TableHead><SortableHeader label="Available" sortKey="isAvailable" /></TableHead>
                      <TableHead><SortableHeader label="Current Line" sortKey="currentLine" /></TableHead>
                      <TableHead><SortableHeader label="In Warranty" sortKey="inWarranty" /></TableHead>
                      <TableHead><SortableHeader label="Warranty Expires" sortKey="warrantyExpiryDate" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMachines.length > 0 ? (
                      sortedMachines.map((machine) => (
                        <TableRow key={machine.id}>
                          <TableCell className="font-code">
                            {machine.id}
                          </TableCell>
                          <TableCell>{machine.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                machine.isAvailable ? "default" : "destructive"
                              }
                            >
                              {machine.isAvailable ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{machine.currentLine || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                machine.inWarranty ? "secondary" : "outline"
                              }
                            >
                              {machine.inWarranty ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {machine.warrantyExpiryDate
                              ? format(machine.warrantyExpiryDate, "PPP")
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center"
                        >
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Machine Types Found</CardTitle>
            <CardDescription>
              Get started by adding your first machine type, or search for an
              existing one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Click the "Add Type" button to create a new category for your
              machines.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
