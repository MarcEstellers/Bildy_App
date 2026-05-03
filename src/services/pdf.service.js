import PDFDocument from 'pdfkit';

const formatAddress = (address) => {
    if (!address) return 'No especificada';
    const { street, number, city, postal, province } = address;
    return `${street} ${number}, ${postal} ${city} (${province})`;
};

export const generateDeliveryNotePdf = (deliveryNote) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const { user, company, client, project } = deliveryNote;

        doc.fontSize(20).font('Helvetica-Bold').text('ALBARÁN', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date(deliveryNote.workDate).toLocaleDateString('es-ES')}`, { align: 'right' });
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('EMPRESA');
        doc.fontSize(10).font('Helvetica');
        if (company) {
            doc.text(`${company.name || ''}`);
            doc.text(`CIF: ${company.cif || ''}`);
            doc.text(formatAddress(company.address));
        }
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('USUARIO');
        doc.fontSize(10).font('Helvetica');
        if (user) {
            doc.text(`${user.name || ''} ${user.lastName || ''}`);
            doc.text(`Email: ${user.email || ''}`);
        }
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('CLIENTE');
        doc.fontSize(10).font('Helvetica');
        if (client) {
            doc.text(`${client.name || ''}`);
            doc.text(`CIF: ${client.cif || ''}`);
            if (client.email) doc.text(`Email: ${client.email}`);
            if (client.phone) doc.text(`Teléfono: ${client.phone}`);
            doc.text(formatAddress(client.address));
        }
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('PROYECTO');
        doc.fontSize(10).font('Helvetica');
        if (project) {
            doc.text(`${project.name || ''}`);
            doc.text(`Código: ${project.projectCode || ''}`);
            if (project.notes) doc.text(`Notas: ${project.notes}`);
        }
        doc.moveDown();

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('DETALLE DEL ALBARÁN');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Tipo: ${deliveryNote.format === 'hours' ? 'Horas' : 'Material'}`);
        if (deliveryNote.description) doc.text(`Descripción: ${deliveryNote.description}`);
        doc.moveDown(0.5);

        if (deliveryNote.format === 'material') {
            doc.font('Helvetica-Bold').text('Material:', { continued: true });
            doc.font('Helvetica').text(` ${deliveryNote.material || ''}`);
            doc.text(`Cantidad: ${deliveryNote.quantity || 0} ${deliveryNote.unit || ''}`);
        }

        if (deliveryNote.format === 'hours') {
            if (deliveryNote.workers && deliveryNote.workers.length > 0) {
                doc.font('Helvetica-Bold').text('Trabajadores:');
                deliveryNote.workers.forEach(w => {
                    doc.font('Helvetica').text(`  - ${w.name}: ${w.hours}h`);
                });
            } else {
                doc.text(`Horas trabajadas: ${deliveryNote.hours || 0}h`);
            }
        }

        doc.moveDown();

        if (deliveryNote.signed && deliveryNote.signatureUrl) {
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text('FIRMA');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Firmado el: ${new Date(deliveryNote.signedAt).toLocaleDateString('es-ES')}`);
        }

        doc.end();
    });
};
