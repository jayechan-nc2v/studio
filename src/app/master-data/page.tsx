import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HardDrive, Route, ListChecks, Tags, ClipboardX, Users, Milestone, Clock, Shirt } from "lucide-react";

export default function MasterDataPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Master Data Management</h1>
        <p className="text-muted-foreground">
          Manage core data for your production lines, machinery, and more.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <HardDrive className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Machines</CardTitle>
            <CardDescription>View and manage machine information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Define and configure all machinery used in production.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/machines">Manage Machines</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Route className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Production Lines</CardTitle>
            <CardDescription>Define and configure production lines.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set up and manage the production lines in your factory.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/lines">Manage Lines</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Tags className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Machine Types</CardTitle>
            <CardDescription>Organize machines into categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Group machines by their function, e.g., "Sewing Machines".
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/machine-types">Manage Machine Types</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Workers</CardTitle>
            <CardDescription>Manage your factory workforce.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add, edit, and view details of all employees.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/workers">Manage Workers</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Shirt className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Style Instructions</CardTitle>
            <CardDescription>Manage instructions for specific styles.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Define standard instructions and SMV for each garment style.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/style-instructions">Manage Styles</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <ListChecks className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Production Instructions</CardTitle>
            <CardDescription>Manage standard operation instructions.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Define standard times (SMV) for production steps.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/production-instructions">Manage Instructions</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <ClipboardX className="h-8 w-8 text-primary mb-2" />
            <CardTitle>QC Failure Reasons</CardTitle>
            <CardDescription>Define reasons for QC failures.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage a standard list of reasons for tracking quality issues.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/qc-failure-reason">Manage Reasons</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Milestone className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Check Points</CardTitle>
            <CardDescription>Manage production scanning points.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Define physical stations for scanning bundle QR codes.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/check-points">Manage Check Points</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>Configure factory working schedules.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set the standard working hours and breaks for each day.
            </p>
            <Button asChild variant="secondary">
              <Link href="/master-data/working-hours">Manage Working Hours</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
