import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

export const encrypt = async (password) => {
    return await bcryptjs.hash(password, SALT_ROUNDS);
};

export const compare = async (password, hashedPassword) => {
    return await bcryptjs.compare(password, hashedPassword);
};
