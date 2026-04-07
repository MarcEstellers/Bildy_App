# BildyApp – Documentación para Maarc Estellers Pocovi

Backend REST desarrollado con **Node.js**, **Express**, **MongoDB/Mongoose** y **Zod**.  
Incluye gestión de usuarios, autenticación con **JWT + refresh tokens**, administración de compañías, subida de logos con **Multer**, validación avanzada, control de roles, borrado lógico y eventos con **EventEmitter**.

---

## 🛠 Tecnologías usadas

- Node.js 22+
- Express 5
- MongoDB + Mongoose
- Zod
- JWT
- bcryptjs
- Multer
- Helmet
- express-rate-limit

---

## 📌 Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 22 o superior  
- npm  
- MongoDB (local o remoto)

---

## 🚀 Instalación

```bash
git clone https://github.com/juanfelipe1104/BildyApp.git
cd BildyApp
npm install



🔐 Variables de entorno
Crear un archivo .env basado en .env.example:

Código
NODE_ENV=development
PORT=3000
DB_URI=mongodb://127.0.0.1:27017
DB_NAME=bildyapp
JWT_SECRET=una_clave_de_al_menos_32_caracteres
Descripción
NODE_ENV: entorno (development, production, test)

PORT: puerto del servidor

DB_URI: conexión a MongoDB

DB_NAME: nombre de la base de datos

JWT_SECRET: clave para firmar tokens JWT
