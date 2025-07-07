
import { create } from 'zustand';
import type { WorkOrderFormValues, NewMachineFormValues, NewProductionInstructionFormValues, NewQcFailureReasonFormValues, NewWorkerFormValues } from '@/lib/schemas';
import { 
    presetInstructions, 
    mockMachineTypes, 
    type MachineTypeDetail, 
    productionLines, 
    type ProductionLine, 
    mockMachines, 
    type Machine,
    mockProductionInstructions,
    type ProductionInstruction,
    mockQcFailureReasons,
    type QcFailureReason,
    mockWorkers,
    type Worker
} from '@/lib/data';

interface WorkOrderState {
  workOrders: WorkOrderFormValues[];
  addWorkOrder: (order: WorkOrderFormValues) => void;
}

const initialWorkOrders: WorkOrderFormValues[] = [
    {
        workOrderNo: 'WO-00125',
        styleNo: "TEE-CLASSIC",
        garmentType: "T-Shirt",
        preProductionNo: "PPN-002",
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
        qrCodes: [],
    },
    {
        workOrderNo: 'WO-00124',
        styleNo: "DNM-JKT-01",
        garmentType: "Jacket",
        preProductionNo: "PPN-001",
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
        qrCodes: [],
    },
    {
        workOrderNo: 'WO-00123',
        styleNo: "Kids Graphic Hoodie",
        garmentType: "Hoodie",
        preProductionNo: "PPN-003",
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
        qrCodes: [],
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
  addLine: (name: string, lineManager: string) => string;
  updateLine: (lineId: string, updatedLine: ProductionLine) => void;
}

export const useProductionLineStore = create<ProductionLineState>((set) => ({
  lines: productionLines,
  addLine: (name, lineManager) => {
    const newId = `line-${Date.now().toString().slice(-6)}`;
    const newLine: ProductionLine = {
      id: newId,
      name,
      lineManager,
      stations: [],
    };
    set((state) => ({
      lines: [...state.lines, newLine],
    }));
    return newId;
  },
  updateLine: (lineId, updatedLine) => set((state) => ({
    lines: state.lines.map(line => line.id === lineId ? updatedLine : line),
  })),
}));

// Store for Machines
interface MachineState {
    machines: Machine[];
    addMachine: (data: NewMachineFormValues) => Machine;
}

export const useMachineStore = create<MachineState>((set, get) => ({
    machines: mockMachines,
    addMachine: (data) => {
        const newId = `MC-${(get().machines.length + 1).toString().padStart(3, '0')}`;
        const newMachine: Machine = {
            id: newId,
            name: data.name,
            type: data.type,
            serialNo: data.serialNo,
            supplier: data.supplier,
            purchaseDate: data.purchaseDate,
            warrantyExpiryDate: data.warrantyExpiryDate || null,
            inWarranty: data.warrantyExpiryDate ? data.warrantyExpiryDate > new Date() : false,
            isAvailable: true,
        };
        set((state) => ({ machines: [newMachine, ...state.machines] }));
        return newMachine;
    }
}));


// Store for Production Instructions
interface ProductionInstructionState {
    instructions: ProductionInstruction[];
    addInstruction: (data: NewProductionInstructionFormValues) => void;
    updateInstruction: (id: string, data: NewProductionInstructionFormValues) => void;
    deleteInstruction: (id: string) => void;
}

export const useProductionInstructionStore = create<ProductionInstructionState>((set, get) => ({
    instructions: mockProductionInstructions,
    addInstruction: (data) => {
        const newId = `PI-${(get().instructions.length + 1).toString().padStart(3, '0')}`;
        const newInstruction: ProductionInstruction = {
            id: newId,
            ...data
        };
        set((state) => ({ instructions: [newInstruction, ...state.instructions] }));
    },
    updateInstruction: (id, data) => {
        set((state) => ({
            instructions: state.instructions.map(inst => 
                inst.id === id ? { ...inst, ...data } : inst
            )
        }));
    },
    deleteInstruction: (id) => {
        set((state) => ({
            instructions: state.instructions.filter(inst => inst.id !== id)
        }));
    }
}));


// Store for QC Failure Reasons
interface QcFailureReasonState {
    reasons: QcFailureReason[];
    addReason: (data: NewQcFailureReasonFormValues) => void;
    updateReason: (id: string, data: NewQcFailureReasonFormValues) => void;
    deleteReason: (id: string) => void;
}

export const useQcFailureReasonStore = create<QcFailureReasonState>((set, get) => ({
    reasons: mockQcFailureReasons,
    addReason: (data) => {
        const newId = `QCF-${(get().reasons.length + 1).toString().padStart(3, '0')}`;
        const newReason: QcFailureReason = {
            id: newId,
            ...data,
            description: data.description || '',
        };
        set((state) => ({ reasons: [newReason, ...state.reasons] }));
    },
    updateReason: (id, data) => {
        set((state) => ({
            reasons: state.reasons.map(r => 
                r.id === id ? { ...r, ...data, description: data.description || '' } : r
            )
        }));
    },
    deleteReason: (id) => {
        set((state) => ({
            reasons: state.reasons.filter(r => r.id !== id)
        }));
    }
}));


// Store for Workers
interface WorkerState {
    workers: Worker[];
    addWorker: (data: NewWorkerFormValues) => void;
    updateWorker: (id: string, data: NewWorkerFormValues) => void;
    deleteWorker: (id: string) => void;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
    workers: mockWorkers,
    addWorker: (data) => {
        const newId = `E-${(get().workers.length + 1).toString().padStart(3, '0')}`;
        const newWorker: Worker = {
            id: newId,
            ...data,
        };
        set((state) => ({ workers: [newWorker, ...state.workers] }));
    },
    updateWorker: (id, data) => {
        set((state) => ({
            workers: state.workers.map(w => 
                w.id === id ? { ...w, ...data } : w
            )
        }));
    },
    deleteWorker: (id) => {
        set((state) => ({
            workers: state.workers.filter(w => w.id !== id)
        }));
    }
}));

export interface QrCode {
    id: string;
    workOrderId: string | null;
    status: 'Unassigned' | 'Assigned' | 'In Progress' | 'Completed';
    size?: string;
    bundleNo?: number;
    bundleQty?: number;
}

interface QrCodeState {
    qrCodes: QrCode[];
    addQrCodes: (ids: string[]) => void;
    assignQrCodesToWorkOrder: (
        workOrderId: string, 
        bundles: { size: string; bundleNo: number, quantity: number }[]
    ) => { success: boolean, assigned: QrCode[], required: number, available: number };
}

export const useQrCodeStore = create<QrCodeState>((set, get) => ({
    qrCodes: [],
    addQrCodes: (ids) => {
        const newCodes: QrCode[] = ids.map(id => ({
            id,
            workOrderId: null,
            status: 'Unassigned'
        }));
        set((state) => ({
            qrCodes: [...state.qrCodes, ...newCodes]
        }));
    },
    assignQrCodesToWorkOrder: (workOrderId, bundles) => {
        const unassignedCodes = get().qrCodes.filter(c => c.status === 'Unassigned');
        const requiredCount = bundles.length;

        if (unassignedCodes.length < requiredCount) {
            return { success: false, assigned: [], required: requiredCount, available: unassignedCodes.length };
        }
        
        const codesToAssign = unassignedCodes.slice(0, requiredCount);
        const assignedCodes: QrCode[] = [];
  
        const updatedQrCodes = get().qrCodes.map(qrCode => {
            const assignmentIndex = codesToAssign.findIndex(c => c.id === qrCode.id);
            if (assignmentIndex !== -1) {
                const bundleInfo = bundles[assignmentIndex];
                const updatedCode = {
                    ...qrCode,
                    workOrderId,
                    status: 'Assigned' as const,
                    size: bundleInfo.size,
                    bundleNo: bundleInfo.bundleNo,
                    bundleQty: bundleInfo.quantity
                };
                assignedCodes.push(updatedCode);
                return updatedCode;
            }
            return qrCode;
        });

        set({ qrCodes: updatedQrCodes });
  
        return { success: true, assigned: assignedCodes, required: requiredCount, available: unassignedCodes.length };
    },
}));
