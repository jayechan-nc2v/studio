import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function PreProductionPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre-Production</h1>
          <p className="text-muted-foreground">
            Register and manage pre-production styles, colors, and sizes.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Pre-Production
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. Here you will be able to manage all your pre-production notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>The interface will include a form to add new pre-production notes (style info, details, color, size breakdown) and a table to view, edit, and delete existing notes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
