/**
 * Plugin de Mongoose para implementar borrado lógico (Soft Delete).
 * Añade campos de control y modifica las consultas para excluir registros borrados por defecto.
 */
const softDeletePlugin = (schema) => {
    // 1. Añadimos los campos necesarios al esquema
    schema.add({
        deleted: {
            type: Boolean,
            default: false,
            index: true // Índice para optimizar las consultas que filtran por este campo
        },
        deletedAt: {
            type: Date,
            default: null
        },
        deletedBy: {
            type: String, // Puede ser el ID del usuario que borró
            default: null
        }
    });

    // 2. Middleware para filtrar registros borrados automáticamente
    const excludeDeleted = function (next) {
        // Si el desarrollador pide explícitamente "withDeleted", no filtramos
        if (!this.getOptions().withDeleted) {
            this.where({ deleted: { $ne: true } });
        }
        next();
    };

    // Aplicamos el filtro a los métodos de lectura y actualización comunes
    const queryMethods = ['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'aggregate'];
    queryMethods.forEach((method) => {
        schema.pre(method, excludeDeleted);
    });

    // --- MÉTODOS DE INSTANCIA (document.softDelete()) ---

    schema.methods.softDelete = async function (userId = null) {
        this.deleted = true;
        this.deletedAt = new Date();
        this.deletedBy = userId;
        return this.save();
    };

    schema.methods.restore = async function () {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
        return this.save();
    };

    // --- MÉTODOS ESTÁTICOS (Model.softDeleteById()) ---

    schema.statics.softDeleteById = async function (id, userId = null) {
        return this.findByIdAndUpdate(
            id,
            {
                deleted: true,
                deletedAt: new Date(),
                deletedBy: userId
            },
            { new: true }
        ).setOptions({ withDeleted: true });
    };

    schema.statics.restoreById = async function (id) {
        return this.findByIdAndUpdate(
            id,
            {
                deleted: false,
                deletedAt: null,
                deletedBy: null
            },
            { new: true }
        ).setOptions({ withDeleted: true });
    };

    schema.statics.findWithDeleted = function (filter = {}) {
        return this.find(filter).setOptions({ withDeleted: true });
    };

    schema.statics.findDeleted = function (filter = {}) {
        return this.find({ ...filter, deleted: true }).setOptions({ withDeleted: true });
    };

    // Borrado físico (real) si es necesario
    schema.statics.hardDelete = function (id) {
        return this.findByIdAndDelete(id).setOptions({ withDeleted: true });
    };
};

export default softDeletePlugin;