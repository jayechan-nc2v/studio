import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode } from "lucide-react";

export default function TrackingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Bundle Tracking</h1>
        <p className="text-muted-foreground">
          Scan QR codes to track bundles through the production process.
        </p>
      </header>
       <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
            <Input placeholder="Scan or enter QR code..." />
            <Button>
                <QrCode className="mr-2 h-4 w-4" />
                Track Bundle
            </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The tracking interface is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>This page will feature a kanban-style board with columns for each production checkpoint (e.g., Cutting, Sewing, QC). Scanning a QR code will move the corresponding bundle to the next stage, providing a real-time visual of the production flow.</p>
        </CardContent>
      </Card>
    </div>
  );
}
