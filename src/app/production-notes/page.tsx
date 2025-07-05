"use client";

import * as React from "react";
import { format } from "date-fns";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { type PreProductionNote, fetchPreProductionNote } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreProductionPage() {
  const { toast } = useToast();
  const [noteNo, setNoteNo] = React.useState("PPN-001");
  const [isLoading, setIsLoading] = React.useState(false);
  const [noteData, setNoteData] = React.useState<PreProductionNote | null>(null);

  const handleFetchData = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!noteNo.trim()) {
        toast({
            variant: "destructive",
            title: "Input Required",
            description: "Please enter a Pre-Production Note No.",
        });
        return;
    }

    setIsLoading(true);
    setNoteData(null);
    try {
        const data = await fetchPreProductionNote(noteNo);
        if (data) {
            setNoteData(data);
        } else {
            toast({
                variant: "destructive",
                title: "Not Found",
                description: `No data found for Pre-Production Note "${noteNo}".`,
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Failed to fetch data. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  // Fetch initial data on load for demo purposes
  React.useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pre-Production</h1>
        <p className="text-muted-foreground">
          Fetch Pre-Production Note details from the external system.
        </p>
      </header>

      <Card>
        <form onSubmit={handleFetchData}>
          <CardHeader>
            <CardTitle>Fetch Pre-Production Note</CardTitle>
            <CardDescription>
              Enter the Pre-Production Note number to fetch its details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                id="noteNo"
                type="text"
                placeholder="e.g., PPN-001"
                value={noteNo}
                onChange={(e) => setNoteNo(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Fetch
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
      
      {isLoading && <LoadingSkeleton />}

      {noteData && !isLoading && (
        <Card>
            <CardHeader>
                <CardTitle>Details for {noteData.preProductionNo}</CardTitle>
                <CardDescription>Style: {noteData.styleNo} | Customer: {noteData.customerName}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoItem label="Style No." value={noteData.styleNo} />
                    <InfoItem label="Customer Style No." value={noteData.customerStyleNo} />
                    <InfoItem label="Customer Name" value={noteData.customerName} />
                    <InfoItem label="Brand" value={noteData.brand} />
                    <InfoItem label="Destination" value={noteData.destination} />
                    <InfoItem label="Delivery Date" value={format(noteData.deliveryDate, "PPP")} />
                    <InfoItem label="Garment Color" value={noteData.garmentColor} />
                    <InfoItem label="Total Quantity" value={noteData.totalQty.toLocaleString()} />
                </div>
                <div className="mt-6">
                    <h4 className="font-semibold mb-2">Size Breakdown</h4>
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {noteData.sizes.map(size => (
                                    <TableRow key={size.size}>
                                        <TableCell>{size.size}</TableCell>
                                        <TableCell className="text-right">{size.quantity.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
    </div>
);

const LoadingSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-6 w-4/5" />
                    </div>
                ))}
            </div>
             <div className="mt-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-40 w-full" />
            </div>
        </CardContent>
    </Card>
);
