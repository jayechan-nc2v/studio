"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockMachines, mockMaintenanceHistory, mockAllocationHistory } from "@/lib/data";
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

export default function MachinesPage() {
  // For prototyping, we'll display the first machine from our mock data.
  const machine = mockMachines[0];

  return (
    <div className="flex flex-col gap-6">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Machines</h1>
          <p className="text-muted-foreground">
            View, add, and edit machine information.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Machine
        </Button>
      </header>

      {/* Machine Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Information</CardTitle>
          <CardDescription>Detailed information for Machine ID: {machine.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>System ID</Label>
              <Input value={machine.id} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={machine.name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input value={machine.type} disabled />
            </div>
            <div className="space-y-2">
              <Label>Serial No.</Label>
              <Input value={machine.serialNo} disabled />
            </div>
             <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input value={format(machine.purchaseDate, "PPP")} disabled />
            </div>
            <div className="space-y-2">
              <Label>Warranty Expiry Date</Label>
              <Input value={machine.warrantyExpiryDate ? format(machine.warrantyExpiryDate, "PPP") : 'N/A'} disabled />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={machine.supplier} disabled />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Label>In Warranty</Label>
              <div className="flex items-center space-x-2">
                <Switch id="in-warranty" checked={machine.inWarranty} disabled />
                <Label htmlFor="in-warranty">{machine.inWarranty ? "Yes" : "No"}</Label>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Label>Availability</Label>
               <div className="flex items-center space-x-2">
                <Switch id="availability" checked={machine.isAvailable} disabled />
                <Label htmlFor="availability">{machine.isAvailable ? "Available" : "Unavailable"}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Schedule Section */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <CardDescription>History of maintenance records for this machine.</CardDescription>
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
                    <TableCell>{format(record.finishDate, "PPP")}</TableCell>
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

      {/* Machine Allocation List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Allocation History</CardTitle>
          <CardDescription>Record of which line and worker have used this machine.</CardDescription>
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
                      <Badge variant={record.action === "Allocate" ? "default" : "secondary"}>
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
    </div>
  );
}
