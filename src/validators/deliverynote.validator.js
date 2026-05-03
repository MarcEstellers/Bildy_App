import { z } from "zod";

export const schemaCreateDeliveryNote = z.object({
    body: z.object({
        project:     z.string().min(1, "El proyecto es obligatorio"),
        format:      z.enum(["material", "hours"], { error: "El formato debe ser 'material' o 'hours'" }),
        description: z.string().trim().optional(),
        workDate:    z.string().min(1, "La fecha de trabajo es obligatoria"),
        material:    z.string().trim().optional(),
        quantity:    z.number().min(0).optional(),
        unit:        z.string().trim().optional(),
        hours:       z.number().min(0).optional(),
        workers:     z.array(z.object({
            name:  z.string().trim().min(1, "El nombre del trabajador es obligatorio"),
            hours: z.number().min(0, "Las horas deben ser positivas")
        })).optional()
    }).superRefine((data, ctx) => {
        if (data.format === "material" && !data.material) {
            ctx.addIssue({ path: ["material"], message: "El material es obligatorio para este formato", code: "custom" });
        }
        if (data.format === "hours" && !data.hours && (!data.workers || data.workers.length === 0)) {
            ctx.addIssue({ path: ["hours"], message: "Debes indicar horas o trabajadores para este formato", code: "custom" });
        }
    })
});

export const schemaDeliveryNoteId = z.object({
    params: z.object({
        id: z.string().min(1, "El id es obligatorio")
    })
});
