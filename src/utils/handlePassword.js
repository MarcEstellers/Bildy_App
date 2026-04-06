import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
  Encripta una contraseña en texto plano.
  @param {string} password - Contraseña a encriptar.
  @returns {Promise<string>} - Hash de la contraseña.
 */
export const encrypt = async (password) => {
    return await bcryptjs.hash(password, SALT_ROUNDS);
};

/**
 Compara una contraseña en texto plano con un hash.
  @param {string} password - Contraseña enviada por el usuario.
  @param {string} hashedPassword - Hash almacenado en la base de datos.
  @returns {Promise<boolean>} - True si coinciden, false si no.
 */
export const compare = async (password, hashedPassword) => {
    return await bcryptjs.compare(password, hashedPassword);
};