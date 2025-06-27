import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMachineTypes } from "@/lib/data";
import { format } from "date-fns";

export default function MachineTypesPage() {
  // For prototyping, we'll display the first machine type from our mock data.
  const machineType = mockMachineTypes[0];

  return (
    <div className="flex flex-col gap-6">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Machine Types</h1>
          <p className="text-muted-foreground">
            Categorize and view machines by their type.
          </p>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Type: {machineType.typeName}</CardTitle>
          <CardDescription>System Generated ID: {machineType.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Machines under this Type</h3>
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
                        <Badge variant={machine.isAvailable ? "default" : "destructive"} className="bg-green-500 hover:bg-green-600">
                          {machine.isAvailable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>{machine.currentLine || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={machine.inWarranty ? "secondary" : "outline"}>
                          {machine.inWarranty ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        {machine.warrantyExpiryDate ? format(machine.warrantyExpiryDate, "PPP") : 'N/A'}
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
  );
}