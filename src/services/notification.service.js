import { EventEmitter } from "node:events";
import { sendVerificationCode, sendInvitation } from "./mail.service.js";

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

const notificationService = new NotificationService();

notificationService.on("user:registered", async (info) => {
    try {
        await sendVerificationCode(info.email, info.code);
    } catch (err) {
        console.error("[Email] Error enviando código de verificación:", err.message);
    }
});

notificationService.on("user:invited", async (info) => {
    try {
        await sendInvitation(info.invitedEmail, info.code, info.companyName);
    } catch (err) {
        console.error("[Email] Error enviando invitación:", err.message);
    }
});

notificationService.on("user:verified", (info) => {
    console.log("[Event] user:verified:", info.email);
});

notificationService.on("user:deleted", (info) => {
    console.log("[Event] user:deleted:", info._id);
});

export default notificationService;
