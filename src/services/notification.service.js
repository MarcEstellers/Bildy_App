import { EventEmitter } from "node:events";

/**
 * Servicio encargado de gestionar eventos de notificación en la aplicación.
 * Permite que otros módulos reaccionen a cambios de estado del usuario
 * sin acoplar la lógica de negocio.
 */
class NotificationService extends EventEmitter {
    registerUser(userInfo) {
        this.emit('user:registered', userInfo);
    }

    verifyUser(userInfo) {
        this.emit('user:verified', userInfo);
    }

    inviteUser(userInfo) {
        this.emit('user:invited', userInfo);
    }

    deleteUser(userInfo) {
        this.emit('user:deleted', userInfo);
    }
}

// Creamos una única instancia para toda la aplicación (Singleton)
const notificationService = new NotificationService();

// --- Suscriptores (Listeners) ---
// Aquí es donde podrías conectar servicios de envío de emails (Nodemailer, SendGrid, etc.)

notificationService.on("user:registered", (info) => {
    console.log("[Event] user:registered - Enviando código de verificación a:", info.email);
});

notificationService.on("user:verified", (info) => {
    console.log("[Event] user:verified - Usuario verificado correctamente:", info.email);
});

notificationService.on("user:invited", (info) => {
    console.log("[Event] user:invited - Invitación enviada a:", info.email);
});

notificationService.on("user:deleted", (info) => {
    console.log("[Event] user:deleted - Cuenta eliminada:", info._id);
});

export default notificationService;