

export interface Station {
  id: string;
  machineType: string;
  machineId: string;
  assignedWorker: string;
  workerId: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  lineManager: string;
  stations: Station[];
}

export interface Worker {
  id: string;
  hrmId?: string;
  name: string;
  joinDate: Date;
  status: 'Active' | 'Resigned';
  line?: string;
  position: string;
}

export interface Instruction {
    machineType: string;
    instructionDescription: string;
    smv: number;
    target: number;
}

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

export interface ProductionInstruction {
  id: string;
  name: string;
  garmentType: string;
  machineType: string;
  smv: number;
}

export interface QcFailureReason {
  id: string;
  reason: string;
  description: string;
  category: string;
}

export interface PreProductionSize {
  size: string;
  quantity: number;
}

export interface PreProductionNote {
  preProductionNo: string;
  styleNo: string;
  customerStyleNo: string;
  customerName: string;
  brand: string;
  destination: string;
  deliveryDate: Date;
  garmentColor: string;
  totalQty: number;
  sizes: PreProductionSize[];
}

export interface CheckPoint {
  id: string;
  name: string;
  type: 'Pre-production' | 'Sewing' | 'Packing' | 'Finishing';
  isProductionEntry: boolean;
  isProductionExit: boolean;
}

export interface BundleHistory {
  id: string;
  qrCodeId: string;
  workOrderId: string;
  checkPointName: string;
  status: 'Passed' | 'Failed QC';
  details?: string;
  timestamp: Date;
  user: string;
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
  },
  { id: "MC-005", name: "Inspection Table 1", type: "QC Station", serialNo: "SN-QC001", inWarranty: true, warrantyExpiryDate: new Date("2025-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "QC Supplies", isAvailable: true },
  { id: "MC-006", name: "Kansai Special", type: "Coverstitch", serialNo: "SN-KS001", inWarranty: false, warrantyExpiryDate: null, purchaseDate: new Date("2022-01-01"), supplier: "Global Sewing Machines", isAvailable: true },
  { id: "MC-007", name: "Spreader GX-100", type: "Fabric Spreader", serialNo: "SN-FS001", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Fabric Systems", isAvailable: true },
  { id: "MC-008", name: "Auto Pocket Setter", type: "Pocket Setter", serialNo: "SN-PS001", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "AutoSew", isAvailable: true },
  { id: "MC-009", name: "Heavy Duty Cutter X", type: "Heavy-Duty Cutting", serialNo: "SN-HDC001", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Gerber Technology", isAvailable: true },
  { id: "MC-010", name: "Juki DDL-9000", type: "Lockstitch Machine", serialNo: "SN-J9000", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Juki Central", isAvailable: true },
  { id: "MC-011", name: "Rivet Press 500", type: "Rivet Machine", serialNo: "SN-RP500", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Hardware Automation", isAvailable: true },
  { id: "MC-012", name: "Denim Washer 5000", type: "Washing Unit", serialNo: "SN-DW5000", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Laundry Systems", isAvailable: true },
  { id: "MC-013", name: "Brother BAS-311", type: "Bar Tack", serialNo: "SN-BT311", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Sewing Supplies Inc.", isAvailable: true },
  { id: "MC-014", name: "Brother HE-800B", type: "Buttonhole", serialNo: "SN-BH800", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Sewing Supplies Inc.", isAvailable: true },
  { id: "MC-015", name: "Epilog Laser Cutter", type: "Laser Cutter", serialNo: "SN-LC001", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Laser Inc.", isAvailable: true },
  { id: "MC-016", name: "Tajima TMEZ", type: "Embroidery Machine", serialNo: "SN-EM001", inWarranty: true, warrantyExpiryDate: new Date("2026-01-01"), purchaseDate: new Date("2024-01-01"), supplier: "Embroidery Kings", isAvailable: true },
];


export const productionLines: ProductionLine[] = [
  {
    id: 'line-1',
    name: 'Line 1 - T-Shirts',
    lineManager: 'Sarah Connor',
    stations: [
      { id: 's1-1', machineType: 'Cutting Machine', machineId: 'MC-003', assignedWorker: 'Alice', workerId: 'E-001' },
      { id: 's1-2', machineType: 'Sewing Machine (Juki)', machineId: 'MC-001', assignedWorker: 'Bob', workerId: 'E-002' },
      { id: 's1-3', machineType: 'Overlock Machine', machineId: 'MC-004', assignedWorker: 'Charlie', workerId: 'E-003' },
      { id: 's1-4', machineType: 'QC Station', machineId: 'MC-005', assignedWorker: 'Diana', workerId: 'E-004' },
      { id: 's1-5', machineType: 'Coverstitch', machineId: 'MC-006', assignedWorker: 'Ethan', workerId: 'E-017' },
    ],
  },
  {
    id: 'line-2',
    name: 'Line 2 - Hoodies',
    lineManager: 'John Rambo',
    stations: [
        { id: 's2-1', machineType: 'Fabric Spreader', machineId: 'MC-007', assignedWorker: 'Eve', workerId: 'E-005' },
        { id: 's2-2', machineType: 'Sewing Machine (Brother)', machineId: 'MC-002', assignedWorker: 'Frank', workerId: 'E-006' },
        { id: 's2-3', machineType: 'Pocket Setter', machineId: 'MC-008', assignedWorker: 'Grace', workerId: 'E-007' },
        { id: 's2-4', machineType: 'QC Station', machineId: 'MC-005', assignedWorker: 'Heidi', workerId: 'E-008' },
    ]
  },
  {
      id: 'line-3',
      name: 'Line 3 - Denim',
      lineManager: 'Ellen Ripley',
      stations: [
          { id: 's3-1', machineType: 'Heavy-Duty Cutting', machineId: 'MC-009', assignedWorker: 'Ivan', workerId: 'E-009' },
          { id: 's3-2', machineType: 'Lockstitch Machine', machineId: 'MC-010', assignedWorker: 'Judy', workerId: 'E-010' },
          { id: 's3-3', machineType: 'Rivet Machine', machineId: 'MC-011', assignedWorker: 'Mallory', workerId: 'E-011' },
          { id: 's3-4', machineType: 'Washing Unit', machineId: 'MC-012', assignedWorker: 'Oscar', workerId: 'E-012' },
          { id: 's3-5', machineType: 'QC Station', machineId: 'MC-005', assignedWorker: 'Peggy', workerId: 'E-013' },
          { id: 's3-6', machineType: 'Bar Tack', machineId: 'MC-013', assignedWorker: 'Quentin', workerId: 'E-018' },
          { id: 's3-7', machineType: 'Buttonhole', machineId: 'MC-014', assignedWorker: 'Roger', workerId: 'E-019' },
      ]
  },
  {
      id: 'line-4',
      name: 'Line 4 - Specialty',
      lineManager: 'Kyle Reese',
      stations: [
          { id: 's4-1', machineType: 'Laser Cutter', machineId: 'MC-015', assignedWorker: 'Trent', workerId: 'E-014' },
          { id: 's4-2', machineType: 'Embroidery Machine', machineId: 'MC-016', assignedWorker: 'Walter', workerId: 'E-015' },
          { id: 's4-3', machineType: 'QC Station', machineId: 'MC-005', assignedWorker: 'Wendy', workerId: 'E-016' },
      ]
  }
];

export const mockPositions = ['Operator', 'Supervisor', 'QC Inspector', 'Cutter', 'Packer', 'Line Manager'];

export const mockWorkers: Worker[] = [
    { id: 'E-001', hrmId: 'HRM-1001', name: 'Alice', joinDate: new Date('2022-01-15'), status: 'Active', line: 'Line 1 - T-Shirts', position: 'Operator' },
    { id: 'E-002', hrmId: 'HRM-1002', name: 'Bob', joinDate: new Date('2022-02-20'), status: 'Active', line: 'Line 1 - T-Shirts', position: 'Operator' },
    { id: 'E-003', hrmId: 'HRM-1003', name: 'Charlie', joinDate: new Date('2022-03-10'), status: 'Active', line: 'Line 1 - T-Shirts', position: 'Operator' },
    { id: 'E-004', hrmId: 'HRM-1004', name: 'Diana', joinDate: new Date('2022-04-05'), status: 'Active', line: 'Line 1 - T-Shirts', position: 'QC Inspector' },
    { id: 'E-005', hrmId: 'HRM-1005', name: 'Eve', joinDate: new Date('2022-05-25'), status: 'Active', line: 'Line 2 - Hoodies', position: 'Cutter' },
    { id: 'E-006', hrmId: 'HRM-1006', name: 'Frank', joinDate: new Date('2022-06-18'), status: 'Active', line: 'Line 2 - Hoodies', position: 'Operator' },
    { id: 'E-007', name: 'Grace', joinDate: new Date('2022-07-22'), status: 'Active', line: 'Line 2 - Hoodies', position: 'Operator' },
    { id: 'E-008', name: 'Heidi', joinDate: new Date('2022-08-30'), status: 'Resigned', line: 'Line 2 - Hoodies', position: 'QC Inspector' },
    { id: 'E-009', name: 'Ivan', joinDate: new Date('2022-09-12'), status: 'Active', line: 'Line 3 - Denim', position: 'Cutter' },
    { id: 'E-010', name: 'Judy', joinDate: new Date('2022-10-19'), status: 'Active', line: 'Line 3 - Denim', position: 'Operator' },
    { id: 'E-011', name: 'Mallory', joinDate: new Date('2022-11-01'), status: 'Active', line: 'Line 3 - Denim', position: 'Operator' },
    { id: 'E-012', name: 'Oscar', joinDate: new Date('2022-12-05'), status: 'Resigned', line: 'Line 3 - Denim', position: 'Packer' },
    { id: 'E-013', hrmId: 'HRM-1013', name: 'Peggy', joinDate: new Date('2023-01-15'), status: 'Active', line: 'Line 3 - Denim', position: 'QC Inspector' },
    { id: 'E-014', name: 'Trent', joinDate: new Date('2023-02-11'), status: 'Active', line: 'Line 4 - Specialty', position: 'Operator' },
    { id: 'E-015', name: 'Walter', joinDate: new Date('2023-03-20'), status: 'Active', line: 'Line 4 - Specialty', position: 'Operator' },
    { id: 'E-016', name: 'Wendy', joinDate: new Date('2023-04-25'), status: 'Active', line: 'Line 4 - Specialty', position: 'QC Inspector' },
    { id: 'E-017', name: 'Ethan', joinDate: new Date('2023-05-14'), status: 'Active', line: 'Line 1 - T-Shirts', position: 'Operator' },
    { id: 'E-018', name: 'Quentin', joinDate: new Date('2023-06-30'), status: 'Active', line: 'Line 3 - Denim', position: 'Operator' },
    { id: 'E-019', name: 'Roger', joinDate: new Date('2023-07-07'), status: 'Active', line: 'Line 3 - Denim', position: 'Operator' },
    { id: 'E-020', name: 'Samantha', joinDate: new Date('2023-08-19'), status: 'Active', position: 'Supervisor' },
];


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
// Programmatically generate from mockMachines to ensure consistency
const machineTypesGrouped: Record<string, Machine[]> = mockMachines.reduce((acc, machine) => {
    const key = machine.type;
    if (!acc[key]) {
        acc[key] = [];
    }
    acc[key].push(machine);
    return acc;
}, {} as Record<string, Machine[]>);

export const mockMachineTypes: MachineTypeDetail[] = Object.entries(machineTypesGrouped).map(([typeName, machines], index) => ({
    id: `MT-${(index + 1).toString().padStart(3, '0')}`,
    typeName,
    machines,
}));


// New data for Production Lines page
export interface LineWorkerHistory {
  date: Date;
  workerName: string;
  workerId: string;
  action: 'Assigned' | 'Removed';
  stationId: string;
  machineType: string;
}

export const mockLineWorkerHistory: LineWorkerHistory[] = [
    { date: new Date('2024-07-21'), workerName: 'Alicia', workerId: 'E-021', action: 'Assigned', stationId: 's1-1', machineType: 'Cutting Machine' },
    { date: new Date('2024-07-20'), workerName: 'Alice', workerId: 'E-001', action: 'Removed', stationId: 's1-1', machineType: 'Cutting Machine' },
    { date: new Date('2024-07-18'), workerName: 'Bobby', workerId: 'E-022', action: 'Assigned', stationId: 's1-2', machineType: 'Sewing Machine (Juki)' },
    { date: new Date('2024-07-17'), workerName: 'Bob', workerId: 'E-002', action: 'Removed', stationId: 's1-2', machineType: 'Sewing Machine (Juki)' },
    { date: new Date('2024-07-15'), workerName: 'Charles', workerId: 'E-023', action: 'Assigned', stationId: 's1-3', machineType: 'Overlock Machine' },
    { date: new Date('2024-07-14'), workerName: 'Charlie', workerId: 'E-003', action: 'Removed', stationId: 's1-3', machineType: 'Overlock Machine' },
    { date: new Date('2024-07-13'), workerName: 'Diana', workerId: 'E-004', action: 'Assigned', stationId: 's1-4', machineType: 'QC Station' },
    { date: new Date('2024-07-12'), workerName: 'Ethan', workerId: 'E-017', action: 'Assigned', stationId: 's1-5', machineType: 'Coverstitch' },
    { date: new Date('2024-07-11'), workerName: 'Frank', workerId: 'E-006', action: 'Assigned', stationId: 's2-2', machineType: 'Sewing Machine (Brother)' },
    { date: new Date('2024-07-10'), workerName: 'Grace', workerId: 'E-007', action: 'Assigned', stationId: 's2-3', machineType: 'Pocket Setter' },
    { date: new Date('2024-07-09'), workerName: 'Heidi', workerId: 'E-008', action: 'Assigned', stationId: 's2-4', machineType: 'QC Station' },
    { date: new Date('2024-07-08'), workerName: 'Ivan', workerId: 'E-009', action: 'Assigned', stationId: 's3-1', machineType: 'Heavy-Duty Cutting' },
    { date: new Date('2024-07-07'), workerName: 'Judy', workerId: 'E-010', action: 'Assigned', stationId: 's3-2', machineType: 'Lockstitch Machine' },
    { date: new Date('2024-07-06'), workerName: 'Mallory', workerId: 'E-011', action: 'Assigned', stationId: 's3-3', machineType: 'Rivet Machine' },
    { date: new Date('2024-07-05'), workerName: 'Oscar', workerId: 'E-012', action: 'Assigned', stationId: 's3-4', machineType: 'Washing Unit' },
];

export interface LinePerformanceData {
  date: string;
  output: number;
  efficiency: number;
}

// Get last 30 days for chart
const today = new Date();
const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().split('T')[0];
}).reverse();

export const mockLinePerformanceData: LinePerformanceData[] = last30Days.map(date => ({
    date,
    output: Math.floor(Math.random() * (120 - 80 + 1) + 80), // random between 80-120
    efficiency: Math.floor(Math.random() * (95 - 85 + 1) + 85) // random between 85-95
}));

export const mockGarmentTypes = ["T-Shirt", "Denim Jacket", "Hoodie", "Polo Shirt", "Trousers"];

export const mockProductionInstructions: ProductionInstruction[] = [
    { id: 'PI-001', name: 'Attach Collar', garmentType: 'T-Shirt', machineType: 'Sewing Machine (Juki)', smv: 0.6000 },
    { id: 'PI-002', name: 'Sleeve Join', garmentType: 'T-Shirt', machineType: 'Overlock Machine', smv: 0.7500 },
    { id: 'PI-003', name: 'Hem Bottom', garmentType: 'T-Shirt', machineType: 'Coverstitch', smv: 0.4500 },
    { id: 'PI-004', name: 'Front Pocket Attach', garmentType: 'Denim Jacket', machineType: 'Lockstitch Machine', smv: 0.5500 },
    { id: 'PI-005', name: 'Side Seam Join', garmentType: 'Denim Jacket', machineType: 'Overlock Machine', smv: 0.8000 },
    { id: 'PI-006', name: 'Create Buttonholes', garmentType: 'Denim Jacket', machineType: 'Buttonhole', smv: 0.3000 },
    { id: 'PI-007', name: 'Reinforce Stress Points', garmentType: 'Denim Jacket', machineType: 'Bar Tack', smv: 0.2000 },
];


export const mockQcFailureCategories = ["Sewing Defect", "Fabric Flaw", "Measurement Error", "Finishing Issue", "Component Mismatch"];

export const mockQcFailureReasons: QcFailureReason[] = [
  { id: 'QCF-001', reason: 'Broken Stitch', description: 'A stitch that is broken or not continuous.', category: 'Sewing Defect' },
  { id: 'QCF-002', reason: 'Skipped Stitch', description: 'A stitch that has been missed by the needle.', category: 'Sewing Defect' },
  { id: 'QCF-003', reason: 'Fabric Hole', description: 'A hole or tear in the fabric.', category: 'Fabric Flaw' },
  { id: 'QCF-004', reason: 'Incorrect Measurement', description: 'Garment dimensions do not match the spec sheet.', category: 'Measurement Error' },
  { id: 'QCF-005', reason: 'Poor Pressing', description: 'Garment is not neatly pressed or has creases.', category: 'Finishing Issue' },
  { id: 'QCF-006', reason: 'Wrong Button Type', description: 'A different button was used than specified.', category: 'Component Mismatch' },
];

export const mockPreProductionNotes: PreProductionNote[] = [
    {
        preProductionNo: 'PPN-001',
        styleNo: 'DNM-JKT-01',
        customerStyleNo: 'CUST-DNM-552',
        customerName: 'Global Fashion Co.',
        brand: 'Urban Threads',
        destination: 'USA',
        deliveryDate: new Date('2024-09-15'),
        garmentColor: 'Denim Jacket',
        totalQty: 250,
        sizes: [
            { size: 'S', quantity: 50 },
            { size: 'M', quantity: 100 },
            { size: 'L', quantity: 70 },
            { size: 'XL', quantity: 30 },
        ],
    },
    {
        preProductionNo: 'PPN-002',
        styleNo: 'TEE-CLASSIC',
        customerStyleNo: 'CUST-TEE-101',
        customerName: 'Direct Apparel',
        brand: 'Basics+',
        destination: 'EU',
        deliveryDate: new Date('2024-08-30'),
        garmentColor: 'T-Shirt',
        totalQty: 500,
        sizes: [
            { size: 'M', quantity: 300 },
            { size: 'L', quantity: 200 },
        ],
    },
];

export const mockCheckPointTypes = ['Pre-production', 'Sewing', 'Packing', 'Finishing'] as const;

export const mockCheckPoints: CheckPoint[] = [
  { id: 'CP-001', name: 'Cutting Table', type: 'Pre-production', isProductionEntry: true, isProductionExit: false },
  { id: 'CP-002', name: 'Sewing Line 1 Input', type: 'Sewing', isProductionEntry: false, isProductionExit: false },
  { id: 'CP-003', name: 'QC Station 1', type: 'Sewing', isProductionEntry: false, isProductionExit: false },
  { id: 'CP-004', name: 'Finishing Station', type: 'Finishing', isProductionEntry: false, isProductionExit: false },
  { id: 'CP-005', name: 'Packing Area', type: 'Packing', isProductionEntry: false, isProductionExit: true },
];

export async function fetchPreProductionNote(noteNo: string): Promise<PreProductionNote | null> {
    console.log(`Fetching data for Pre-Production Note: ${noteNo}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const note = mockPreProductionNotes.find(n => n.preProductionNo.toLowerCase() === noteNo.toLowerCase());
    
    if (note) {
        return Promise.resolve(note);
    }
    return Promise.resolve(null);
}
