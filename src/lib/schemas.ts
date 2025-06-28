import * as z from "zod";

export const sizeSchema = z.object({
  size: z.string().min(1, "Size is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

export const stationSchema = z.object({
  id: z.string(),
  machineType: z.string().min(1, "Machine type is required."),
  assignedWorker: z.string().min(1, "Worker name is required."),
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
  productionNoteNo: z.string().min(1, "Production Note No. is required."),
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
