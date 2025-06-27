import { create } from 'zustand';
import type { WorkOrderFormValues } from '@/lib/schemas';

interface WorkOrderState {
  workOrders: WorkOrderFormValues[];
  addWorkOrder: (order: WorkOrderFormValues) => void;
}

const initialWorkOrders: WorkOrderFormValues[] = [
    {
        workOrderNo: 'WO-00125',
        styleNo: "Men's Classic Tee",
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
        productionLine: 'line-3',
        status: 'Sewing',
        instructions: '',
    },
    {
        workOrderNo: 'WO-00124',
        styleNo: "Women's Denim Jacket",
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
        productionLine: 'line-1',
        status: 'QC',
        instructions: '',
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
        instructions: '',
    },
];

export const useWorkOrderStore = create<WorkOrderState>((set) => ({
  workOrders: initialWorkOrders,
  addWorkOrder: (order) => set((state) => ({ 
      workOrders: [order, ...state.workOrders] 
  })),
}));
