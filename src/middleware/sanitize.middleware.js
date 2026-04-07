const sanitize = (data) => {
    if (Array.isArray(data)) {
        return data.map(sanitize);
    }
    if (data !== null && typeof data === "object") {
        const cleanObject = {};
        for (const [key, value] of Object.entries(data)) {
            const safeKey = key.replace(/^\$+/g, "").replace(/\./g, "");
            cleanObject[safeKey] = sanitize(value);
        }
        return cleanObject;
    }
    return data;
};

const mongoSanitizeMiddleware = (req, res, next) => {
    // Para el body y params solemos poder reasignar, 
    // pero para estar seguros usamos Object.assign o mutación limpia
    if (req.body) {
        const sanitizedBody = sanitize(req.body);
        req.body = sanitizedBody; 
    }

    if (req.params) {
        const sanitizedParams = sanitize(req.params);
        // En lugar de req.params = ..., mutamos el objeto original
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, sanitizedParams);
    }

    if (req.query) {
        const sanitizedQuery = sanitize(req.query);
        // AQUÍ ESTABA EL FALLO: Borramos las keys viejas y metemos las limpias
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, sanitizedQuery);
    }

    next();
};

export default mongoSanitizeMiddleware;