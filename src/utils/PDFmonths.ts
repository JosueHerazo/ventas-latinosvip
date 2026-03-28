import jsPDF from "jspdf";
import { formatCurrency } from ".";

const generatePDFMonth = (barbero: string, mes: string, anio: string, total: number) => {
    const doc = new jsPDF();
    const comision = total * 0.5;

    // Estilo de encabezado
    doc.setFontSize(20);
    doc.setTextColor(191, 155, 48); // Ámbar
    doc.text(`REPORTE MENSUAL: ${mes.toUpperCase()} ${anio}`, 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Barbero: ${barbero.toUpperCase()}`, 14, 32);
    doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 38);

    // Cuadro de Resumen
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 50, 180, 40, 'F');
    
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Financiero", 20, 60);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Bruto Generado: ${formatCurrency(total)}`, 20, 70);
    
    doc.setTextColor(34, 197, 94); // Verde
    doc.setFont("helvetica", "bold");
    doc.text(`LIQUIDACIÓN NETA (50%): ${formatCurrency(comision)}`, 20, 82);

    // Nota al pie
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Este documento es un comprobante digital de los servicios realizados en LatinosVip.", 14, 110);

    doc.save(`Reporte_${barbero}_${mes}_${anio}.pdf`);
};

export { generatePDFMonth };