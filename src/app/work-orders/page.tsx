import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function WorkOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Generate and manage work orders for production lines.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. Here you will be able to generate and track work orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>The interface will allow for generating work orders, assigning sizes and quantities, and associating them with specific production lines. A comprehensive table will display all active and past work orders.</p>
        </CardContent>
      </Card>
    </div>
  );
}
