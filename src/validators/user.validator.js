import { z } from "zod";

// --- Esquema para Login / Registro inicial ---
export const schemaMailBody = z.object({
    body: z.object({
        email: z
            .string({ required_error: "El email es obligatorio" })
            .trim()
            .email("Formato de correo incorrecto")
            .toLowerCase(),
        password: z
            .string({ required_error: "La contraseña es obligatoria" })
            .min(8, "La contraseña debe contener mínimo 8 caracteres")
            .max(16, "La contraseña puede contener máximo 16 caracteres")
    })
});

// --- Esquema para completar datos (registerDataUser) ---
export const schemaUserBody = z.object({
    body: z.object({
        name: z
            .string({ required_error: "El nombre es requerido" })
            .trim()
            .min(1, "El nombre no puede estar vacío"),
        lastName: z
            .string({ required_error: "El apellido es requerido" })
            .trim()
            .min(1, "El apellido no puede estar vacío"),
        nif: z
            .string({ required_error: "El NIF es requerido" })
            .trim()
            .toUpperCase(),
        address: z.object({
            street: z.string().default(""),
            number: z.string().default(""),
            postal: z.string().default(""),
            city: z.string().default(""),
            province: z.string().default("")
        }).optional()
    })
});

// --- Esquema para validación de código ---
export const schemaCodeBody = z.object({
    body: z.object({
        code: z
            .string({ required_error: "El código es obligatorio" })
            .trim()
            .length(6, "El código debe ser de exactamente 6 dígitos")
    })
});

export const schemaCompanyBody = z.object({
    body: z.object({
        name: z.string(),
        cif: z.string(),
        address: z.object({
            street: z.string(),
            number: z.string(),
            postal: z.string(),
            city: z.string(),
            province: z.string()
        }).optional(),
        isFreelance: z.boolean()
    })
});