# BildyApp – Documentación  Marc Estellers Pocovi

Backend REST desarrollado con **Node.js**, **Express**, **MongoDB/Mongoose** y **Zod**.  
Incluye gestión de usuarios, autenticación con **JWT + refresh tokens**, administración de compañías, subida de logos con **Multer**, validación avanzada, control de roles, borrado lógico y eventos con **EventEmitter**.

---

##  Tecnologías usadas

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

##  Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 22 o superior  
- npm  
- MongoDB (local o remoto)

---

##  Instalación

```bash
git clone https://github.com/juanfelipe1104/BildyApp.git
cd BildyApp
npm install
```
## Variables de entorno
Crear un archivo .env basado en .env.example:

```bash
NODE_ENV=development
PORT=3000
DB_URI=mongodb://127.0.0.1:27017
DB_NAME=bildyapp
JWT_SECRET=una_clave_de_al_menos_32_caracteres
```
Descripción
NODE_ENV: entorno (development, production, test)

PORT: puerto del servidor

DB_URI: conexión a MongoDB

DB_NAME: nombre de la base de datos

JWT_SECRET: clave para firmar tokens JWT

## Estructura 
```bash
src/
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   └── user.controller.js
├── middleware/
│   ├── auth.midddleware.js
│   ├── error-handler.js
│   ├── rate-limit.js
│   ├── role.middleware.js
│   ├── upload.js
│   └── validate.js
├── models/
│   ├── Company.js
│   ├── RefreshToken.js
│   └── User.js
├── plugins/
│   └── softDelete.plugin.js
├── routes/
│   └── user.routes.js
├── services/
│   └── notification.service.js
├── utils/
│   ├── AppError.js
│   ├── handleJWT.js
│   └── handlePassword.js
├── validators/
│   └── user.validator.js
├── app.js
└── index.js

```


## Autenticación
Los endpoints protegidos requieren:

```bash
Authorization: Bearer <access_token>
El sistema usa:
```

access token JWT

refresh token persistido en base de datos
