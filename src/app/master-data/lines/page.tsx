import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProductionLinesPage() {
  return (
    <div className="flex flex-col gap-6">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Production Lines</h1>
          <p className="text-muted-foreground">
            Configure and manage your factory's production lines.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Line
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>A complete interface for managing your factory's production lines will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
