import { z } from "zod";

const addressSchema = z.object({
    street:   z.string().trim().min(1, "La calle es obligatoria"),
    number:   z.string().trim().min(1, "El número es obligatorio"),
    postal:   z.string().trim().min(1, "El código postal es obligatorio"),
    city:     z.string().trim().min(1, "La ciudad es obligatoria"),
    province: z.string().trim().min(1, "La provincia es obligatoria")
});

export const schemaCreateProject = z.object({
    body: z.object({
        name:        z.string().trim().min(1, "El nombre es obligatorio"),
        projectCode: z.string().trim().min(1, "El código de proyecto es obligatorio"),
        client:      z.string().min(1, "El cliente es obligatorio"),
        address:     addressSchema.optional(),
        email:       z.string().trim().email("Formato de email inválido").toLowerCase().optional(),
        notes:       z.string().trim().optional(),
        active:      z.boolean().optional()
    })
});

export const schemaUpdateProject = z.object({
    params: z.object({
        id: z.string().min(1, "El id es obligatorio")
    }),
    body: z.object({
        name:        z.string().trim().min(1, "El nombre es obligatorio").optional(),
        projectCode: z.string().trim().min(1, "El código de proyecto es obligatorio").optional(),
        client:      z.string().min(1, "El cliente es obligatorio").optional(),
        address:     addressSchema.optional(),
        email:       z.string().trim().email("Formato de email inválido").toLowerCase().optional(),
        notes:       z.string().trim().optional(),
        active:      z.boolean().optional()
    })
});

export const schemaProjectId = z.object({
    params: z.object({
        id: z.string().min(1, "El id es obligatorio")
    })
});
