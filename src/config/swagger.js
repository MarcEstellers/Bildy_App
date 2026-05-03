import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BildyApp API',
            version: '1.0.0',
            description: 'API REST para gestión de albaranes entre clientes y proveedores'
        },
        servers: [{ url: '/api', description: 'Servidor principal' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Address: {
                    type: 'object',
                    properties: {
                        street:   { type: 'string', example: 'Calle Mayor' },
                        number:   { type: 'string', example: '10' },
                        postal:   { type: 'string', example: '08001' },
                        city:     { type: 'string', example: 'Barcelona' },
                        province: { type: 'string', example: 'Barcelona' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id:      { type: 'string' },
                        email:    { type: 'string', format: 'email' },
                        name:     { type: 'string' },
                        lastName: { type: 'string' },
                        nif:      { type: 'string' },
                        role:     { type: 'string', enum: ['admin', 'guest'] },
                        status:   { type: 'string', enum: ['pending', 'verified'] },
                        company:  { type: 'string', description: 'ObjectId de la compañía' },
                        address:  { $ref: '#/components/schemas/Address' }
                    }
                },
                Company: {
                    type: 'object',
                    properties: {
                        _id:         { type: 'string' },
                        name:        { type: 'string' },
                        cif:         { type: 'string' },
                        owner:       { type: 'string' },
                        logo:        { type: 'string' },
                        isFreelance: { type: 'boolean' },
                        address:     { $ref: '#/components/schemas/Address' }
                    }
                },
                Client: {
                    type: 'object',
                    properties: {
                        _id:     { type: 'string' },
                        name:    { type: 'string', example: 'Empresa ABC' },
                        cif:     { type: 'string', example: 'B12345678' },
                        email:   { type: 'string', format: 'email' },
                        phone:   { type: 'string' },
                        address: { $ref: '#/components/schemas/Address' },
                        deleted: { type: 'boolean' }
                    }
                },
                Project: {
                    type: 'object',
                    properties: {
                        _id:         { type: 'string' },
                        name:        { type: 'string', example: 'Reforma oficina' },
                        projectCode: { type: 'string', example: 'PRJ-001' },
                        client:      { type: 'string' },
                        email:       { type: 'string', format: 'email' },
                        notes:       { type: 'string' },
                        active:      { type: 'boolean' },
                        deleted:     { type: 'boolean' },
                        address:     { $ref: '#/components/schemas/Address' }
                    }
                },
                DeliveryNote: {
                    type: 'object',
                    properties: {
                        _id:          { type: 'string' },
                        project:      { type: 'string' },
                        client:       { type: 'string' },
                        format:       { type: 'string', enum: ['material', 'hours'] },
                        description:  { type: 'string' },
                        workDate:     { type: 'string', format: 'date' },
                        material:     { type: 'string' },
                        quantity:     { type: 'number' },
                        unit:         { type: 'string' },
                        hours:        { type: 'number' },
                        workers:      { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, hours: { type: 'number' } } } },
                        signed:       { type: 'boolean' },
                        signedAt:     { type: 'string', format: 'date-time' },
                        signatureUrl: { type: 'string' },
                        pdfUrl:       { type: 'string' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error:   { type: 'boolean', example: true },
                        message: { type: 'string' },
                        code:    { type: 'string' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);
