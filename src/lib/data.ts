
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

export interface Operation {
    machineType: string;
    operationDescription: string;
    smv: number;
    target: number;
}

export const presetOperations: Record<string, Operation[]> = {
    "DNM-JKT-01": [
        { machineType: "Single Needle", operationDescription: "Front pocket attach", smv: 0.55, target: 120 },
        { machineType: "Overlock", operationDescription: "Side seam join", smv: 0.80, target: 90 },
        { machineType: "Buttonhole", operationDescription: "Create buttonholes", smv: 0.30, target: 200 },
        { machineType: "Bar Tack", operationDescription: "Reinforce stress points", smv: 0.20, target: 250 },
    ],
    "TEE-CLASSIC": [
        { machineType: "Single Needle", operationDescription: "Attach collar", smv: 0.60, target: 110 },
        { machineType: "Overlock", operationDescription: "Sleeve join", smv: 0.75, target: 95 },
        { machineType: "Coverstitch", operationDescription: "Hem bottom", smv: 0.45, target: 140 },
    ]
};
