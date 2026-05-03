import { EventEmitter } from "node:events";

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

notificationService.on("user:registered", (info) => {
    console.log("[Event] user:registered:", info.email);
});

notificationService.on("user:verified", (info) => {
    console.log("[Event] user:verified:", info.email);
});

notificationService.on("user:invited", (info) => {
    console.log("[Event] user:invited:", info.email);
});

notificationService.on("user:deleted", (info) => {
    console.log("[Event] user:deleted:", info._id);
});

export default notificationService;
