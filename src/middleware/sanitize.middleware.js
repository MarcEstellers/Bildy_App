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
    if (req.body) {
        req.body = sanitize(req.body);
    }

    if (req.params) {
        const sanitizedParams = sanitize(req.params);
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, sanitizedParams);
    }

    if (req.query) {
        const sanitizedQuery = sanitize(req.query);
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, sanitizedQuery);
    }

    next();
};

export default mongoSanitizeMiddleware;
