import * as z from "zod";

export const sizeSchema = z.object({
  size: z.string().min(1, "Size is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

export const stationSchema = z.object({
  id: z.string(),
  machineType: z.string().min(1, "Machine type is required."),
  machineId: z.string().min(1, "Please select a machine."),
  assignedWorker: z.string(),
  workerId: z.string().min(1, "Worker ID is required."),
});

export const instructionSchema = z.object({
  machineType: z.string().min(1, "Machine type is required."),
  instructionDescription: z.string().min(1, "Description is required."),
  smv: z.coerce.number().positive("SMV must be a positive number."),
  target: z.coerce.number().int().positive("Target must be a positive number."),
});


export const workOrderSchema = z.object({
  workOrderNo: z.string().min(1, "Work Order No. is required."),
  styleNo: z.string().min(1, "Style No. is required."),
  garmentType: z.string().min(1, "Garment Type is required."),
  preProductionNo: z.string().min(1, "Pre-Production No. is required."),
  shipmentDate: z.date({
    required_error: "A shipment date is required.",
  }),
  sizes: z.array(sizeSchema).min(1, "At least one size breakdown is required."),
  qtyPerBundle: z.coerce.number().min(1, "Qty Per Bundle must be at least 1."),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
  targetOutputQtyPerDay: z.coerce.number().min(1, "Target Output Qty / Day must be at least 1."),
  instructions: z.array(instructionSchema).min(1, "At least one instruction is required."),
  productionLine: z.string().min(1, "Production Line is required."),
  status: z.string(),
  lineStations: z.array(stationSchema).optional(),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;


export const productionLineSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Line Name is required."),
    lineManager: z.string().min(1, "Line Manager is required."),
    stations: z.array(stationSchema),
});

export type ProductionLineFormValues = z.infer<typeof productionLineSchema>;

export const newLineSchema = z.object({
    name: z.string().min(1, { message: "Line Name is required." }),
    lineManager: z.string().min(1, { message: "Line Manager is required." }),
});

export type NewLineFormValues = z.infer<typeof newLineSchema>;

export const newMachineSchema = z.object({
  name: z.string().min(1, { message: "Machine name is required." }),
  type: z.string().min(1, { message: "Machine type is required." }),
  serialNo: z.string().min(1, { message: "Serial number is required." }),
  supplier: z.string().min(1, { message: "Supplier is required." }),
  purchaseDate: z.date({ required_error: "Purchase date is required."}),
  warrantyExpiryDate: z.date().optional(),
});

export type NewMachineFormValues = z.infer<typeof newMachineSchema>;

export const productionInstructionSchema = z.object({
    name: z.string().min(1, { message: "Instruction name is required." }),
    garmentType: z.string().min(1, { message: "Garment type is required." }),
    machineType: z.string().min(1, { message: "Machine type is required." }),
    smv: z.coerce.number().positive({ message: "SMV must be a positive number." }),
});

export type NewProductionInstructionFormValues = z.infer<typeof productionInstructionSchema>;

export const qcFailureReasonSchema = z.object({
    reason: z.string().min(1, { message: "Reason is required." }),
    description: z.string().optional(),
    category: z.string().min(1, { message: "Category is required." }),
});

export type NewQcFailureReasonFormValues = z.infer<typeof qcFailureReasonSchema>;

export const workerSchema = z.object({
    name: z.string().min(1, { message: "Worker name is required." }),
    hrmId: z.string().optional(),
    joinDate: z.date({ required_error: "Join date is required."}),
    status: z.enum(['Active', 'Resigned']),
    position: z.string().min(1, { message: "Position is required."}),
    line: z.string().optional(),
});

export type NewWorkerFormValues = z.infer<typeof workerSchema>;

const workOrderCreationSizeSchema = z.object({
  size: z.string(),
  selected: z.boolean(),
  quantity: z.coerce.number().min(0),
});

export const workOrderCreationSchema = z.object({
  productionLine: z.string().min(1, "Production Line is required."),
  qtyPerBundle: z.coerce.number().min(1, "Qty Per Bundle must be at least 1."),
  targetOutputQtyPerDay: z.coerce.number().min(1, "Target Output Qty / Day must be at least 1."),
  startDate: z.date({ required_error: "A start date is required."}),
  endDate: z.date({ required_error: "An end date is required."}),
  sizes: z.array(workOrderCreationSizeSchema)
}).refine(data => data.sizes.some(s => s.selected), {
  message: "At least one size must be selected.",
  path: ["sizes"],
}).refine(data => {
  return data.sizes.every(s => !s.selected || (s.quantity > 0))
}, {
  message: "Selected sizes must have a quantity greater than 0.",
  path: ["sizes"],
});

export type WorkOrderCreationFormValues = z.infer<typeof workOrderCreationSchema>;
