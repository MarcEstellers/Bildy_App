import { z } from "zod";

// --- Regex Auxiliares ---
const nifRegex = /^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])$/;
const cifRegex = /^[A-Z][0-9]{7}[0-9A-Z]$/;
const postalRegex = /^(0[1-9]|[1-4][0-9]|5[0-2])[0-9]{3}$/;
const verifyEmailCodeRegex = /^\d{6}$/;

// --- Esquemas Reutilizables ---
const addressSchema = z.object({
    street: z.string().trim().min(1, "La calle es obligatoria"),
    number: z.string().trim().min(1, "El número es obligatorio"),
    postal: z.string().trim().regex(postalRegex, "Código postal inválido (5 dígitos)"),
    city: z.string().trim().min(1, "La ciudad es obligatoria"),
    province: z.string().trim().min(1, "La provincia es obligatoria")
});

// --- Esquemas Principales ---

export const schemaMailBody = z.object({
    body: z.object({
        email: z.string().trim().email("Formato de correo incorrecto").toLowerCase(),
        password: z.string()
            .min(8, "Mínimo 8 caracteres")
            .max(16, "Máximo 16 caracteres")
    })
});

export const schemaUserBody = z.object({
    body: z.object({
        name: z.string().trim().min(1, "El nombre es obligatorio"),
        lastName: z.string().trim().min(1, "El apellido es obligatorio"),
        nif: z.string().trim().toUpperCase().regex(nifRegex, "Formato de NIE/DNI inválido"),
        address: addressSchema.optional()
    })
});

export const schemaCodeBody = z.object({
    body: z.object({
        code: z.string().regex(verifyEmailCodeRegex, "El código debe ser de 6 dígitos")
    })
});

export const schemaCompanyBody = z.object({
    body: z.discriminatedUnion("isFreelance", [
        // Caso Freelance: No requiere datos extra, se sacan del User
        z.object({
            isFreelance: z.literal(true)
        }),
        // Caso Empresa: Requiere CIF y dirección propia
        z.object({
            isFreelance: z.literal(false),
            name: z.string().trim().min(1, "El nombre de la empresa es obligatorio"),
            cif: z.string().trim().toUpperCase().regex(cifRegex, "Formato de CIF inválido"),
            address: addressSchema
        })
    ])
});

export const schemaRefreshTokenBody = z.object({
    body: z.object({
        refreshToken: z.string().min(1, "El token de refresco es obligatorio")
    })
});

export const schemaSoftDelete = z.object({
    query: z.object({
        // Transforma el string "true"/"false" en un booleano real
        soft: z.enum(["true", "false"]).transform((val) => val === "true")
    })
});

export const schemaPasswordBody = z.object({
    body: z.object({
        currentPassword: z.string().min(8, "La contraseña actual debe tener al menos 8 caracteres"),
        newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: "La nueva contraseña debe ser diferente de la actual",
        path: ["newPassword"]
    })
});