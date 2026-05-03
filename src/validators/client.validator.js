import { z } from "zod";

const cifNifRegex = /^([A-Z][0-9]{7}[0-9A-Z]|[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])$/;

const addressSchema = z.object({
    street:   z.string().trim().min(1, "La calle es obligatoria"),
    number:   z.string().trim().min(1, "El número es obligatorio"),
    postal:   z.string().trim().min(1, "El código postal es obligatorio"),
    city:     z.string().trim().min(1, "La ciudad es obligatoria"),
    province: z.string().trim().min(1, "La provincia es obligatoria")
});

export const schemaCreateClient = z.object({
    body: z.object({
        name:    z.string().trim().min(1, "El nombre es obligatorio"),
        cif:     z.string().trim().toUpperCase().regex(cifNifRegex, "Formato de CIF/NIF inválido"),
        email:   z.string().trim().email("Formato de email inválido").toLowerCase().optional(),
        phone:   z.string().trim().optional(),
        address: addressSchema.optional()
    })
});

export const schemaUpdateClient = z.object({
    params: z.object({
        id: z.string().min(1, "El id es obligatorio")
    }),
    body: z.object({
        name:    z.string().trim().min(1, "El nombre es obligatorio").optional(),
        cif:     z.string().trim().toUpperCase().regex(cifNifRegex, "Formato de CIF/NIF inválido").optional(),
        email:   z.string().trim().email("Formato de email inválido").toLowerCase().optional(),
        phone:   z.string().trim().optional(),
        address: addressSchema.optional()
    })
});

export const schemaClientId = z.object({
    params: z.object({
        id: z.string().min(1, "El id es obligatorio")
    })
});
