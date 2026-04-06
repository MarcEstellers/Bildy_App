import { z } from "zod";

export const schemaUserBody = z.object({
    body: z.object({
        email: z
            .string({ required_error: "El email es obligatorio" })
            .trim()
            .email("Formato de correo incorrecto") // Zod ya tiene validación de email nativa
            .toLowerCase(),
        
        password: z
            .string()
            .min(8, "La contraseña debe contener mínimo 8 caracteres")
            .max(16, "La contraseña puede contener máximo 16 caracteres"),
        
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
        
        company: z
            .string({ required_error: "El ID de la empresa es requerido" })
            .length(24, "El ID de la empresa no es válido"), // Asumiendo que es un ObjectId de MongoDB (24 chars)
        
        address: z.object({
            street: z.string().default(""),
            number: z.string().default(""),
            postal: z.string().default(""),
            city: z.string().default(""),
            province: z.string().default("")
        }).optional()
    })
});