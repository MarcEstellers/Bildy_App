import nodemailer from 'nodemailer';
import env from '../config/env.js';

const transporter = nodemailer.createTransport({
    host:   env.MAIL_HOST,
    port:   Number(env.MAIL_PORT),
    secure: Number(env.MAIL_PORT) === 465,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS
    }
});

export const sendVerificationCode = async (email, code) => {
    if (process.env.NODE_ENV === 'test') return;
    await transporter.sendMail({
        from:    `"BildyApp" <${env.MAIL_FROM}>`,
        to:      email,
        subject: 'Verifica tu cuenta en BildyApp',
        html: `
            <h2>Bienvenido a BildyApp</h2>
            <p>Tu código de verificación es:</p>
            <h1 style="letter-spacing: 8px; color: #2563eb;">${code}</h1>
            <p>Este código expira en 24 horas.</p>
        `
    });
};

export const sendInvitation = async (email, code, companyName) => {
    if (process.env.NODE_ENV === 'test') return;
    await transporter.sendMail({
        from:    `"BildyApp" <${env.MAIL_FROM}>`,
        to:      email,
        subject: `Invitación a ${companyName} en BildyApp`,
        html: `
            <h2>Te han invitado a unirte a ${companyName}</h2>
            <p>Tu código de verificación es:</p>
            <h1 style="letter-spacing: 8px; color: #2563eb;">${code}</h1>
        `
    });
};
