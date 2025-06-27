
export interface Station {
  id: string;
  machineType: string;
  assignedWorker: string;
  workerId: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  stations: Station[];
}

export const productionLines: ProductionLine[] = [
  {
    id: 'line-1',
    name: 'Line 1 - T-Shirts',
    stations: [
      { id: 's1-1', machineType: 'Cutting Machine', assignedWorker: 'Alice', workerId: 'E-001' },
      { id: 's1-2', machineType: 'Sewing Machine (Juki)', assignedWorker: 'Bob', workerId: 'E-002' },
      { id: 's1-3', machineType: 'Overlock Machine', assignedWorker: 'Charlie', workerId: 'E-003' },
      { id: 's1-4', machineType: 'QC Station', assignedWorker: 'Diana', workerId: 'E-004' },
      { id: 's1-5', machineType: 'Coverstitch', assignedWorker: 'Ethan', workerId: 'E-017' },
    ],
  },
  {
    id: 'line-2',
    name: 'Line 2 - Hoodies',
    stations: [
        { id: 's2-1', machineType: 'Fabric Spreader', assignedWorker: 'Eve', workerId: 'E-005' },
        { id: 's2-2', machineType: 'Sewing Machine (Brother)', assignedWorker: 'Frank', workerId: 'E-006' },
        { id: 's2-3', machineType: 'Pocket Setter', assignedWorker: 'Grace', workerId: 'E-007' },
        { id: 's2-4', machineType: 'QC Station', assignedWorker: 'Heidi', workerId: 'E-008' },
    ]
  },
  {
      id: 'line-3',
      name: 'Line 3 - Denim',
      stations: [
          { id: 's3-1', machineType: 'Heavy-Duty Cutting', assignedWorker: 'Ivan', workerId: 'E-009' },
          { id: 's3-2', machineType: 'Lockstitch Machine', assignedWorker: 'Judy', workerId: 'E-010' },
          { id: 's3-3', machineType: 'Rivet Machine', assignedWorker: 'Mallory', workerId: 'E-011' },
          { id: 's3-4', machineType: 'Washing Unit', assignedWorker: 'Oscar', workerId: 'E-012' },
          { id: 's3-5', machineType: 'QC Station', assignedWorker: 'Peggy', workerId: 'E-013' },
          { id: 's3-6', machineType: 'Bar Tack', assignedWorker: 'Quentin', workerId: 'E-018' },
          { id: 's3-7', machineType: 'Buttonhole', assignedWorker: 'Roger', workerId: 'E-019' },
      ]
  },
  {
      id: 'line-4',
      name: 'Line 4 - Specialty',
      stations: [
          { id: 's4-1', machineType: 'Laser Cutter', assignedWorker: 'Trent', workerId: 'E-014' },
          { id: 's4-2', machineType: 'Embroidery Machine', assignedWorker: 'Walter', workerId: 'E-015' },
          { id: 's4-3', machineType: 'QC Station', assignedWorker: 'Wendy', workerId: 'E-016' },
      ]
  }
];

export interface Instruction {
    machineType: string;
    instructionDescription: string;
    smv: number;
    target: number;
}

export const presetInstructions: Record<string, Instruction[]> = {
    "DNM-JKT-01": [
        { machineType: "Lockstitch Machine", instructionDescription: "Front pocket attach", smv: 0.55, target: 120 },
        { machineType: "Overlock Machine", instructionDescription: "Side seam join", smv: 0.80, target: 90 },
        { machineType: "Buttonhole", instructionDescription: "Create buttonholes", smv: 0.30, target: 200 },
        { machineType: "Bar Tack", instructionDescription: "Reinforce stress points", smv: 0.20, target: 250 },
    ],
    "TEE-CLASSIC": [
        { machineType: "Sewing Machine (Juki)", instructionDescription: "Attach collar", smv: 0.60, target: 110 },
        { machineType: "Overlock Machine", instructionDescription: "Sleeve join", smv: 0.75, target: 95 },
        { machineType: "Coverstitch", instructionDescription: "Hem bottom", smv: 0.45, target: 140 },
    ]
};

// --- New Master Data Structures ---

export interface Machine {
  id: string;
  name: string;
  type: string; // Corresponds to a MachineType's name
  serialNo: string;
  inWarranty: boolean;
  warrantyExpiryDate: Date | null;
  purchaseDate: Date;
  supplier: string;
  isAvailable: boolean;
  currentLine?: string; // Name of the production line
}

export interface MaintenanceRecord {
  startDate: Date;
  finishDate: Date;
  company: string;
  inCharge: string;
  refNo: string;
}

export interface AllocationRecord {
  action: 'Allocate' | 'Return';
  date: Date;
  productionLine: string;
  worker: string;
}

export interface MachineTypeDetail {
  id: string;
  typeName: string;
  machines: Machine[];
}

// Mock Data for Machines
export const mockMachines: Machine[] = [
  {
    id: "MC-001",
    name: "Juki DDL-8700",
    type: "Sewing Machine (Juki)",
    serialNo: "SN-J87A001",
    inWarranty: true,
    warrantyExpiryDate: new Date("2025-12-31"),
    purchaseDate: new Date("2023-12-31"),
    supplier: "Juki Central",
    isAvailable: false,
    currentLine: "Line 1 - T-Shirts",
  },
  {
    id: "MC-002",
    name: "Brother S-7200",
    type: "Sewing Machine (Brother)",
    serialNo: "SN-B72B002",
    inWarranty: false,
    warrantyExpiryDate: null,
    purchaseDate: new Date("2022-05-15"),
    supplier: "Sewing Supplies Inc.",
    isAvailable: true,
  },
  {
    id: "MC-003",
    name: "Gerber GTxL Cutter",
    type: "Cutting Machine",
    serialNo: "SN-GTC003",
    inWarranty: true,
    warrantyExpiryDate: new Date("2026-08-01"),
    purchaseDate: new Date("2024-08-01"),
    supplier: "Gerber Technology",
    isAvailable: true,
  },
   {
    id: "MC-004",
    name: "Pegasus M900",
    type: "Overlock Machine",
    serialNo: "SN-PM9004",
    inWarranty: false,
    warrantyExpiryDate: null,
    purchaseDate: new Date("2021-02-20"),
    supplier: "Global Sewing Machines",
    isAvailable: false,
    currentLine: "Line 1 - T-Shirts",
  }
];

// Mock Data for Maintenance
export const mockMaintenanceHistory: MaintenanceRecord[] = [
    {
        startDate: new Date("2024-05-10"),
        finishDate: new Date("2024-05-12"),
        company: "Juki Services",
        inCharge: "John Doe",
        refNo: "MAINT-0524-001"
    },
    {
        startDate: new Date("2023-11-20"),
        finishDate: new Date("2023-11-21"),
        company: "In-house",
        inCharge: "Maintenance Team",
        refNo: "MAINT-1123-005"
    }
];

// Mock Data for Allocation
export const mockAllocationHistory: AllocationRecord[] = [
    {
        action: "Allocate",
        date: new Date("2024-01-15"),
        productionLine: "Line 1 - T-Shirts",
        worker: "Bob (E-002)"
    },
     {
        action: "Return",
        date: new Date("2023-12-20"),
        productionLine: "Line 1 - T-Shirts",
        worker: "Anna (E-021)"
    },
    {
        action: "Allocate",
        date: new Date("2023-08-01"),
        productionLine: "Line 1 - T-Shirts",
        worker: "Anna (E-021)"
    }
];


// Mock Data for Machine Types page
export const mockMachineTypes: MachineTypeDetail[] = [
    {
        id: "MT-001",
        typeName: "Sewing Machine (Juki)",
        machines: mockMachines.filter(m => m.type === 'Sewing Machine (Juki)')
    },
    {
        id: "MT-002",
        typeName: "Cutting Machine",
        machines: mockMachines.filter(m => m.type === 'Cutting Machine')
    },
];
