
import { create } from 'zustand';
import type { WorkOrderFormValues, NewMachineFormValues, NewProductionInstructionFormValues, NewQcFailureReasonFormValues, NewWorkerFormValues, NewUserFormValues, GlobalSettingsFormValues, StyleInstructionFormValues } from '@/lib/schemas';
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
    type Worker,
    type BundleHistory,
    mockUsers,
    type User,
    mockGlobalSettings,
    type GlobalSettings,
    mockFactories,
    type StyleInstruction,
    mockNeedleNumbers,
    type NeedleNumber,
    mockNeedleTypes,
    type NeedleType,
} from '@/lib/data';
import { useCheckPointStore } from './checkpoint-store';


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
        mappedQrCodes: {},
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
        mappedQrCodes: {},
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
            { machineType: "Fabric Spreader", instructionDescription: "Spread fabric", smv: 0.2, target: 300, needleNo: '', needleGuage: '', spi: '', seamAllowance: '', edgeToStitchWidth: '', accessories: '', needles: '', bobbinLooper: '', notes: ''},
            { machineType: "Sewing Machine (Brother)", instructionDescription: "Main body sewing", smv: 1.2, target: 60, needleNo: '', needleGuage: '', spi: '', seamAllowance: '', edgeToStitchWidth: '', accessories: '', needles: '', bobbinLooper: '', notes: ''},
        ],
        mappedQrCodes: {},
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
    status: string; // Unassigned, Assigned to WO, Cutting, Sewing, etc.
    bundleKey: string | null; // e.g., "S-1", "M-5"
    size: string | null;
    bundleNo: number | null;
    bundleQty: number | null;
}

interface QrCodeState {
    qrCodes: QrCode[];
    addQrCodes: (ids: string[]) => void;
    mapQrCode: (qrCodeId: string, workOrderId: string, bundleKey: string, size: string, bundleNo: number, quantity: number) => { success: boolean, error?: string };
    updateQrCodeStatus: (qrCodeId: string, newStatus: string) => void;
}

const initialQrCodes: QrCode[] = [
    ...Array.from({ length: 200 }, (_, i) => ({
        id: `BNDL-NEW-${i.toString().padStart(3, '0')}`,
        workOrderId: null,
        status: 'Unassigned',
        bundleKey: null,
        size: null,
        bundleNo: null,
        bundleQty: null,
    })),
    { id: 'BNDL-TEST-001', workOrderId: 'WO-00125', status: 'Cutting', bundleKey: 'M-1', size: 'M', bundleNo: 1, bundleQty: 25 },
    { id: 'BNDL-TEST-002', workOrderId: 'WO-00125', status: 'Cutting', bundleKey: 'M-2', size: 'M', bundleNo: 2, bundleQty: 25 },
    { id: 'BNDL-TEST-101', workOrderId: null, status: 'Unassigned', bundleKey: null, size: null, bundleNo: null, bundleQty: null },
    { id: 'BNDL-TEST-102', workOrderId: null, status: 'Unassigned', bundleKey: null, size: null, bundleNo: null, bundleQty: null },
    { id: 'BNDL-TEST-103', workOrderId: null, status: 'Unassigned', bundleKey: null, size: null, bundleNo: null, bundleQty: null },
    { id: 'BNDL-TEST-104', workOrderId: null, status: 'Unassigned', bundleKey: null, size: null, bundleNo: null, bundleQty: null },
    { id: 'BNDL-TEST-105', workOrderId: null, status: 'Unassigned', bundleKey: null, size: null, bundleNo: null, bundleQty: null },
];

export const useQrCodeStore = create<QrCodeState>((set, get) => ({
    qrCodes: initialQrCodes,
    addQrCodes: (ids) => {
        const newCodes: QrCode[] = ids.map(id => ({
            id,
            workOrderId: null,
            status: 'Unassigned',
            bundleKey: null,
            size: null,
            bundleNo: null,
            bundleQty: null,
        }));
        set((state) => ({
            qrCodes: [...state.qrCodes, ...newCodes]
        }));
    },
    mapQrCode: (qrCodeId, workOrderId, bundleKey, size, bundleNo, quantity) => {
        const code = get().qrCodes.find(c => c.id.toLowerCase() === qrCodeId.toLowerCase());
        if (!code) {
            return { success: false, error: "QR Code not found." };
        }
        if (code.status !== 'Unassigned') {
            return { success: false, error: `QR Code is already in use (Status: ${code.status}).`};
        }

        const updatedQrCodes = get().qrCodes.map(c => {
            if (c.id === code.id) {
                return { ...c, workOrderId, bundleKey, status: 'Assigned to WO', size, bundleNo, bundleQty: quantity };
            }
            return c;
        });

        set({ qrCodes: updatedQrCodes });
        return { success: true };
    },
    updateQrCodeStatus: (qrCodeId, newStatus) => {
        set((state) => ({
            qrCodes: state.qrCodes.map(code => 
                code.id === qrCodeId ? { ...code, status: newStatus } : code
            ),
        }));
    },
}));

interface BundleHistoryState {
  history: BundleHistory[];
  addHistoryRecord: (record: Omit<BundleHistory, 'id' | 'timestamp' | 'user'>) => void;
}

export const useBundleHistoryStore = create<BundleHistoryState>((set, get) => ({
  history: [
      { id: 'HIST-1', qrCodeId: 'BNDL-TEST-001', workOrderId: 'WO-00125', checkPointName: 'Cutting Table', status: 'Passed', timestamp: new Date('2024-07-28T10:00:00Z'), user: 'Admin User' },
      { id: 'HIST-2', qrCodeId: 'BNDL-TEST-002', workOrderId: 'WO-00125', checkPointName: 'Cutting Table', status: 'Passed', timestamp: new Date('2024-07-28T10:05:00Z'), user: 'Admin User' },
  ],
  addHistoryRecord: (record) => {
    const { currentUser } = useUserStore.getState();
    const newRecord: BundleHistory = {
      ...record,
      id: `HIST-${Date.now()}`,
      timestamp: new Date(),
      user: currentUser?.displayName || 'System',
    };
    set((state) => ({ history: [newRecord, ...state.history] }));
  },
}));

// Store for Users & Authentication
interface UserState {
    users: User[];
    currentUser: User | null;
    selectedFactory: string | null;
    selectedCheckpoint: string | null; // For admins to select a default station
    login: (username: string, password?: string, factory?: string) => Promise<User | null>;
    logout: () => void;
    setSelectedCheckpoint: (checkpointId: string | null) => void;
    addUser: (data: NewUserFormValues) => void;
    updateUser: (id: string, data: Partial<NewUserFormValues>) => void;
    deleteUser: (id: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    users: mockUsers,
    currentUser: null,
    selectedFactory: null,
    selectedCheckpoint: null,
    login: async (username, password, factory) => {
        const user = get().users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user && user.status === 'Active') {
            set({ currentUser: user, selectedFactory: factory || null });
            const { selectFactory } = useGlobalSettingsStore.getState();
            if (factory) {
                selectFactory(factory);
            }
            return user;
        }
        return null;
    },
    logout: () => {
        set({ currentUser: null, selectedFactory: null, selectedCheckpoint: null });
    },
    setSelectedCheckpoint: (checkpointId) => {
        set({ selectedCheckpoint: checkpointId });
    },
    addUser: (data) => {
        const newId = `U-${(get().users.length + 1).toString().padStart(3, '0')}`;
        const { confirmPassword, ...userData } = data;
        const newUser: User = { id: newId, ...userData };
        set((state) => ({ users: [newUser, ...state.users] }));
    },
    updateUser: (id, data) => {
        const { confirmPassword, ...userData } = data;
        set((state) => ({
            users: state.users.map(u => 
                u.id === id ? { ...u, ...userData } : u
            )
        }));
    },
    deleteUser: (id) => {
        set((state) => ({
            users: state.users.filter(u => u.id !== id)
        }));
    }
}));

interface GlobalSettingsState {
    settings: GlobalSettingsFormValues;
    selectedFactory: string | null;
    selectFactory: (factory: string) => void;
    updateSettings: (newSettings: GlobalSettingsFormValues) => void;
}

export const useGlobalSettingsStore = create<GlobalSettingsState>((set, get) => ({
    settings: {
        factoryName: "DMF",
        factoryInCharge: "Mr. Budi",
        efficiencyTarget: 85,
        overtimePaid: 2.5
    },
    selectedFactory: "DMF",
    selectFactory: (factory) => {
        const currentSettings = mockGlobalSettings[factory as keyof typeof mockGlobalSettings];
        if (currentSettings) {
            set({ 
                selectedFactory: factory,
                settings: {
                    factoryName: factory,
                    ...currentSettings,
                }
            });
        }
    },
    updateSettings: (newSettings) => set({ settings: newSettings }),
}));

const initialStyleInstructions: StyleInstruction[] = [
    {
        id: 'SI-1628364872',
        styleNo: 'DNM-JKT-01',
        customerStyleNo: 'CUST-DNM-552',
        garmentType: 'Denim Jacket',
        customerName: 'Global Fashion Co.',
        brand: 'Urban Threads',
        instructions: presetInstructions['DNM-JKT-01']
    }
];
// Store for Style Instructions
interface StyleInstructionState {
    styleInstructions: StyleInstruction[];
    addStyleInstruction: (data: StyleInstructionFormValues) => void;
    updateStyleInstruction: (id: string, data: StyleInstructionFormValues) => void;
}

export const useStyleInstructionStore = create<StyleInstructionState>((set, get) => ({
    styleInstructions: initialStyleInstructions,
    addStyleInstruction: (data) => {
        const newInstruction: StyleInstruction = {
            id: `SI-${Date.now()}`,
            ...data,
        };
        set((state) => ({
            styleInstructions: [newInstruction, ...state.styleInstructions],
        }));
    },
    updateStyleInstruction: (id, data) => {
        set((state) => ({
            styleInstructions: state.styleInstructions.map(si => 
                si.id === id ? { ...si, ...data } : si
            )
        }));
    }
}));
    
// Store for Needle Numbers
interface NeedleNumberState {
    needleNumbers: NeedleNumber[];
    addNeedleNumber: (name: string) => void;
    updateNeedleNumber: (id: string, name: string) => void;
    deleteNeedleNumber: (id: string) => void;
}

export const useNeedleNumberStore = create<NeedleNumberState>((set, get) => ({
    needleNumbers: mockNeedleNumbers,
    addNeedleNumber: (name) => {
        const newId = `NN-${(get().needleNumbers.length + 1).toString().padStart(3, '0')}`;
        const newNeedleNumber: NeedleNumber = { id: newId, name };
        set((state) => ({ needleNumbers: [newNeedleNumber, ...state.needleNumbers] }));
    },
    updateNeedleNumber: (id, name) => {
        set((state) => ({
            needleNumbers: state.needleNumbers.map(n => 
                n.id === id ? { ...n, name } : n
            )
        }));
    },
    deleteNeedleNumber: (id) => {
        set((state) => ({
            needleNumbers: state.needleNumbers.filter(n => n.id !== id)
        }));
    }
}));


// Store for Needle Types
interface NeedleTypeState {
    needleTypes: NeedleType[];
    addNeedleType: (name: string) => void;
    updateNeedleType: (id: string, name: string) => void;
    deleteNeedleType: (id: string) => void;
}

export const useNeedleTypeStore = create<NeedleTypeState>((set, get) => ({
    needleTypes: mockNeedleTypes,
    addNeedleType: (name) => {
        const newId = `NT-${(get().needleTypes.length + 1).toString().padStart(3, '0')}`;
        const newNeedleType: NeedleType = { id: newId, name };
        set((state) => ({ needleTypes: [newNeedleType, ...state.needleTypes] }));
    },
    updateNeedleType: (id, name) => {
        set((state) => ({
            needleTypes: state.needleTypes.map(n => 
                n.id === id ? { ...n, name } : n
            )
        }));
    },
    deleteNeedleType: (id) => {
        set((state) => ({
            needleTypes: state.needleTypes.filter(n => n.id !== id)
        }));
    }
}));
