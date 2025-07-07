
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, PlusCircle, Trash2, ChevronsUpDown, ArrowUp, ArrowDown, UserCog } from "lucide-react";
import { useUserStore, useCheckPointStore } from "@/lib/store";
import { userSchema, type NewUserFormValues } from "@/lib/schemas";
import { type User, mockModules } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const roleVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'System Admin': 'default',
    'Admin': 'secondary',
    'User': 'outline',
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const { checkPoints } = useCheckPointStore();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const [sortConfig, setSortConfig] = React.useState<{ key: keyof User, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      role: "User",
      assignedCheckpoints: [],
      permissions: Object.fromEntries(mockModules.map(m => [m.href, { read: true, write: false, delete: false }])),
    },
  });

  const watchedRole = form.watch('role');

  const onSubmit = (data: NewUserFormValues) => {
    let finalData = { ...data };
    if (data.role === 'System Admin') {
        finalData.assignedCheckpoints = checkPoints.map(cp => cp.id);
        finalData.permissions = Object.fromEntries(mockModules.map(m => [m.href, { read: true, write: true, delete: true }]));
    }

    if (dialogMode === "edit" && selectedUser) {
      updateUser(selectedUser.id, finalData);
      toast({ title: "Success", description: `User "${data.name}" has been updated.` });
    } else {
      addUser(finalData);
      toast({ title: "Success", description: `User "${data.name}" has been created.` });
    }
    form.reset();
    setIsDialogOpen(false);
    setSelectedUser(null);
  };
  
  const handleAdd = () => {
    setSelectedUser(null);
    setDialogMode("add");
    form.reset({
      name: "",
      role: "User",
      assignedCheckpoints: [],
      permissions: Object.fromEntries(mockModules.map(m => [m.href, { read: true, write: false, delete: false }])),
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogMode("edit");
    form.reset(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      toast({ title: "Deleted", description: `User "${selectedUser.name}" has been deleted.`, variant: "destructive" });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        const aValue = a[key] ?? '';
        const bValue = b[key] ?? '';

        if (aValue < bValue) {
          return direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });
  }, [users, sortConfig]);

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof User; }) => {
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions.</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Name" sortKey="name" /></TableHead>
                  <TableHead><SortableHeader label="Role" sortKey="role" /></TableHead>
                  <TableHead>Assigned Checkpoints</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.length > 0 ? (
                  sortedUsers.map((user) => (
                    <TableRow key={user.id} onDoubleClick={() => handleEdit(user)}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge variant={roleVariantMap[user.role]}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.role === 'System Admin' ? (
                             <Badge variant="secondary">All</Badge>
                          ) : (
                            user.assignedCheckpoints.map(cpId => {
                                const cp = checkPoints.find(c => c.id === cpId);
                                return <Badge key={cpId} variant="outline">{cp?.name || cpId}</Badge>;
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add New'} User</DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Update the details for the user.' : 'Fill out the details for the new user.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>User Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="User">User</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="System Admin">System Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="assignedCheckpoints" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assigned Checkpoints</FormLabel>
                                <FormControl>
                                    <>
                                     {watchedRole === 'System Admin' && (
                                        <p className="text-sm text-muted-foreground pt-2">System Admins have access to all checkpoints.</p>
                                     )}
                                     {watchedRole === 'User' && (
                                        <Select onValueChange={(value) => field.onChange([value])} value={field.value?.[0] || ''}>
                                            <SelectTrigger><SelectValue placeholder="Select a checkpoint" /></SelectTrigger>
                                            <SelectContent>
                                                {checkPoints.map(cp => <SelectItem key={cp.id} value={cp.id}>{cp.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                     )}
                                     {watchedRole === 'Admin' && (
                                         <ScrollArea className="h-40 rounded-md border p-4">
                                             <div className="space-y-2">
                                                {checkPoints.map(cp => (
                                                    <FormItem key={cp.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(cp.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), cp.id])
                                                                        : field.onChange(field.value?.filter(id => id !== cp.id))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{cp.name}</FormLabel>
                                                    </FormItem>
                                                ))}
                                             </div>
                                         </ScrollArea>
                                     )}
                                    </>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="space-y-2">
                        <Label>Module Permissions</Label>
                        {watchedRole === 'System Admin' ? (
                            <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-4 border rounded-md">
                                System Admins have full access to all modules.
                            </div>
                        ) : (
                            <ScrollArea className="h-80 rounded-md border">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted">
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead className="text-center">Read</TableHead>
                                            <TableHead className="text-center">Write</TableHead>
                                            <TableHead className="text-center">Delete</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockModules.map(module => (
                                            <TableRow key={module.href}>
                                                <TableCell className="font-medium">{module.name}</TableCell>
                                                <TableCell className="text-center">
                                                     <FormField control={form.control} name={`permissions.${module.href}.read`} render={({ field }) => (
                                                        <FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                                    )} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                     <FormField control={form.control} name={`permissions.${module.href}.write`} render={({ field }) => (
                                                        <FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                                    )} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                     <FormField control={form.control} name={`permissions.${module.href}.delete`} render={({ field }) => (
                                                        <FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                                    )} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="submit" form="user-form">{dialogMode === 'edit' ? 'Save Changes' : 'Create User'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user "{selectedUser?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    