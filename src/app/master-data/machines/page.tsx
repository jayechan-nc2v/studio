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
import { PlusCircle, Search } from "lucide-react";
import {
  mockMachines,
  mockMaintenanceHistory,
  mockAllocationHistory,
  type Machine,
} from "@/lib/data";
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
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";


export default function MachinesPage() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const [selectedMachine, setSelectedMachine] = React.useState<Machine | null>(
    mockMachines[0] || null
  );
  const [searchResults, setSearchResults] = React.useState<Machine[]>([]);
  const [isResultDialogOpen, setIsResultDialogOpen] = React.useState(false);

  const machineTypes = React.useMemo(
    () => [...new Set(mockMachines.map((m) => m.type))].sort(),
    []
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    let results: Machine[] = mockMachines;

    // Filter by search query (name or ID)
    if (searchQuery.trim()) {
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Further filter by type
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Machines</h1>
          <p className="text-muted-foreground">
            Search for a machine or add a new one.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Machine
        </Button>
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
                    {machineTypes.map((type) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <TableHead>Start Date</TableHead>
                        <TableHead>Finish Date</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>In Charge</TableHead>
                        <TableHead>Ref No.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMaintenanceHistory.map((record) => (
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
                        <TableHead>Action</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Production Line</TableHead>
                        <TableHead>Worker</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAllocationHistory.map((record, index) => (
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
              Please search for a machine to view its details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
