import * as z from "zod";

export const sizeSchema = z.object({
  size: z.string().min(1, "Size is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

export const stationSchema = z.object({
  id: z.string(),
  machineType: z.string().min(1, "Machine type is required."),
  assignedWorker: z.string().min(1, "Worker is required."),
  workerId: z.string().min(1, "Worker ID is required."),
});

export const operationSchema = z.object({
  machineType: z.string().min(1, "Machine type is required."),
  operationDescription: z.string().min(1, "Description is required."),
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
  operations: z.array(operationSchema).min(1, "At least one operation is required."),
  productionLine: z.string().min(1, "Production Line is required."),
  status: z.string(),
  lineStations: z.array(stationSchema).optional(),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;
