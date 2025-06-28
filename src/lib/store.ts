import { create } from 'zustand';
import type { WorkOrderFormValues } from '@/lib/schemas';
import { presetInstructions, mockMachineTypes, type MachineTypeDetail, productionLines, type ProductionLine } from '@/lib/data';

interface WorkOrderState {
  workOrders: WorkOrderFormValues[];
  addWorkOrder: (order: WorkOrderFormValues) => void;
}

const initialWorkOrders: WorkOrderFormValues[] = [
    {
        workOrderNo: 'WO-00125',
        styleNo: "TEE-CLASSIC",
        garmentType: "T-Shirt",
        productionNoteNo: "PN-002",
        shipmentDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        sizes: [
            { size: "M", quantity: 300 },
            { size: "L", quantity: 200 },
        ],
        qtyPerBundle: 25,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        targetOutputQtyPerDay: 100,
        productionLine: 'line-1',
        status: 'Sewing',
        instructions: presetInstructions["TEE-CLASSIC"],
    },
    {
        workOrderNo: 'WO-00124',
        styleNo: "DNM-JKT-01",
        garmentType: "Jacket",
        productionNoteNo: "PN-001",
        shipmentDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        sizes: [
            { size: "S", quantity: 100 },
            { size: "M", quantity: 150 },
        ],
        qtyPerBundle: 25,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        targetOutputQtyPerDay: 50,
        productionLine: 'line-3',
        status: 'QC',
        instructions: presetInstructions["DNM-JKT-01"],
    },
    {
        workOrderNo: 'WO-00123',
        styleNo: "Kids Graphic Hoodie",
        garmentType: "Hoodie",
        productionNoteNo: "PN-003",
        shipmentDate: new Date(new Date().setDate(new Date().getDate() + 12)),
        sizes: [{ size: "10", quantity: 700 }],
        qtyPerBundle: 50,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 4)),
        targetOutputQtyPerDay: 200,
        productionLine: 'line-2',
        status: 'Cutting',
        instructions: [
            { machineType: "Fabric Spreader", instructionDescription: "Spread fabric", smv: 0.2, target: 300},
            { machineType: "Sewing Machine (Brother)", instructionDescription: "Main body sewing", smv: 1.2, target: 60},
        ],
    },
];

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  workOrders: initialWorkOrders,
  addWorkOrder: (order) => set((state) => ({ 
      workOrders: [order, ...state.workOrders] 
  })),
}));

// Store for Machine Types
interface MachineTypeState {
  machineTypes: MachineTypeDetail[];
  addMachineType: (typeName: string) => string;
}

export const useMachineTypeStore = create<MachineTypeState>((set, get) => ({
  machineTypes: mockMachineTypes,
  addMachineType: (typeName: string) => {
    const newId = `MT-${(get().machineTypes.length + 1)
      .toString()
      .padStart(3, "0")}`;
    const newMachineType: MachineTypeDetail = {
      id: newId,
      typeName: typeName,
      machines: [], // New types start with no machines
    };
    set((state) => ({ machineTypes: [newMachineType, ...state.machineTypes] }));
    return newId;
  },
}));


// Store for Production Lines
interface ProductionLineState {
  lines: ProductionLine[];
  updateLine: (lineId: string, updatedLine: ProductionLine) => void;
}

export const useProductionLineStore = create<ProductionLineState>((set) => ({
  lines: productionLines,
  updateLine: (lineId, updatedLine) => set((state) => ({
    lines: state.lines.map(line => line.id === lineId ? updatedLine : line),
  })),
}));
