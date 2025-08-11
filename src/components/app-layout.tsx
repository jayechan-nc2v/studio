
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  ClipboardX,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Milestone,
  QrCode,
  Route,
  ScanLine,
  Settings,
  Shirt,
  StickyNote,
  Tags,
  User,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCheckPointStore, useUserStore, useGlobalSettingsStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tv-dashboard', label: 'Line Dashboard', icon: Warehouse },
  { href: '/production-notes', label: 'Pre-Production', icon: StickyNote },
  { href: '/work-orders', label: 'Work Orders', icon: ClipboardList },
  { href: '/generate-qr-code', label: 'Generate QR Code', icon: QrCode },
  {
    href: '/check-point-scanning',
    label: 'Check Point Scanning',
    icon: ScanLine,
  },
  { href: '/tracking', label: 'Bundle History', icon: History },
  {
    href: '/finish-sewing-qc',
    label: 'Finish Sewing QC',
    icon: ClipboardCheck,
  },
  { href: '/user-management', label: 'User Management', icon: UserCog },
  {
    href: '/master-data',
    label: 'Master Data',
    icon: Database,
    children: [
      { href: '/master-data/machines', label: 'Machines', icon: HardDrive },
      { href: '/master-data/lines', label: 'Production Lines', icon: Route },
      {
        href: '/master-data/machine-types',
        label: 'Machine Types',
        icon: Tags,
      },
      { href: '/master-data/workers', label: 'Workers', icon: Users },
      { href: '/master-data/style-instructions', label: 'Style Instructions', icon: Shirt },
      {
        href: '/master-data/production-instructions',
        label: 'Instructions',
        icon: ListChecks,
      },
      {
        href: '/master-data/qc-failure-reason',
        label: 'QC Failure Reasons',
        icon: ClipboardX,
      },
      {
        href: '/master-data/check-points',
        label: 'Check Points',
        icon: Milestone,
      },
      {
        href: '/master-data/working-hours',
        label: 'Working Hours',
        icon: Clock,
      },
    ],
  },
  { href: '/global-settings', label: 'Global Settings', icon: Settings },
  { href: '/ai-tools', label: 'AI Tools', icon: Cpu },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, selectedFactory: settingsFactory } = useGlobalSettingsStore();
  const { currentUser, selectedFactory, selectedCheckpoint, logout, setSelectedCheckpoint } = useUserStore();
  const { checkPoints } = useCheckPointStore();

  const [openSubmenus, setOpenSubmenus] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    const activeSubmenus: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children && pathname.startsWith(item.href)) {
        activeSubmenus[item.href] = true;
      }
    });
    setOpenSubmenus(activeSubmenus);
  }, [pathname]);

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };
  
  const handleLogout = () => {
      logout();
      router.push('/login');
  };

  const currentCheckPointName = React.useMemo(() => {
    if (!currentUser) return 'N/A';
    
    let checkpointId: string | null | undefined = null;

    if (currentUser.role === 'User') {
      // A User has a fixed checkpoint.
      checkpointId = currentUser.assignedCheckpoints?.[0];
    } else { // Admin and System Admin use the one selected from the dropdown.
      checkpointId = selectedCheckpoint;
    }

    if (!checkpointId) {
      // This is a fallback, but login flow should prevent this state.
      if (currentUser.role === 'System Admin') return 'Select a Station';
      return 'No Station Assigned'; 
    }

    const checkPoint = checkPoints.find((cp) => cp.id === checkpointId);
    return checkPoint?.name || 'Unknown Station';
  }, [currentUser, checkPoints, selectedCheckpoint]);

  const selectableCheckpoints = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'System Admin') {
      return checkPoints; // All of them
    }
    if (currentUser.role === 'Admin') {
      // Only assigned ones
      return checkPoints.filter(cp => currentUser.assignedCheckpoints.includes(cp.id));
    }
    return []; // Users don't get a selector
  }, [currentUser, checkPoints]);

  const canSelectCheckpoint = currentUser && (currentUser.role === 'System Admin' || (currentUser.role === 'Admin' && selectableCheckpoints.length > 1));


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </Button>
            <h1 className="text-xl font-semibold text-primary font-headline">
              BFN Production
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.children ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleSubmenu(item.href)}
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                      className="justify-between"
                      data-state={openSubmenus[item.href] ? 'open' : 'closed'}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform',
                          openSubmenus[item.href] && 'rotate-180'
                        )}
                      />
                    </SidebarMenuButton>

                    {openSubmenus[item.href] && (
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === child.href}
                            >
                              <Link href={child.href}>
                                {child.icon && <child.icon />}
                                <span>{child.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname.startsWith(item.href) &&
                      (item.href !== '/' || pathname === '/')
                    }
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span>{selectedFactory || 'No Factory'}</span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Milestone className="h-4 w-4 text-muted-foreground" />
                   {canSelectCheckpoint ? (
                    <>
                      <span className="text-muted-foreground">Station:</span>
                       <Select value={selectedCheckpoint || ''} onValueChange={setSelectedCheckpoint}>
                          <SelectTrigger className="h-auto border-0 p-0 text-sm font-medium focus:ring-0 shadow-none bg-transparent">
                              <SelectValue placeholder="Select Station" />
                          </SelectTrigger>
                          <SelectContent>
                              {selectableCheckpoints.map(cp => (
                                  <SelectItem key={cp.id} value={cp.id}>
                                      {cp.name}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <span>Station: {currentCheckPointName}</span>
                  )}
                </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentUser?.displayName || 'Guest'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Role: {currentUser?.role || 'N/A'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                      Station: {currentCheckPointName}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Language</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>English</DropdownMenuItem>
                    <DropdownMenuItem>Bahasa</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
