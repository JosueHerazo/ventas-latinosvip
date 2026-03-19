import { useLoaderData, useParams, Link, useNavigate } from "react-router-dom";
import { archiveWeek, getServices } from "../services/ServiceService";
import type { Service } from "../types";
import { formatDate, formatCurrency } from "../utils";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export async function loader() {
    return await getServices();
}

const generatePaymentPDF = (barber: string, total: number, commission: number, services: any[]) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(191, 155, 48);
    doc.text("BARBERIA VIP - RECIBO DE PAGO", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de emision: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Barbero: ${barber.toUpperCase()}`, 14, 35);

    autoTable(doc, {
        startY: 45,
        head: [['Servicio', 'Cliente', 'Fecha', 'Precio']],
        body: services.map(s => [
            s.service,
            s.client,
            new Date(s.createdAt).toLocaleDateString(),
            formatCurrency(s.price)
        ]),
        headStyles: { fillColor: [191, 155, 48] },
        theme: 'striped'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Bruto Recaudado: ${formatCurrency(total)}`, 14, finalY);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 197, 94);
    doc.text(`TOTAL A PAGAR (50%): ${formatCurrency(commission)}`, 14, finalY + 10);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("__________________________", 14, finalY + 30);
    doc.text("Firma del Barbero", 14, finalY + 35);

    doc.save(`Liquidacion_${barber}_${new Date().toLocaleDateString()}.pdf`);
};

export default function BarberServices() {
    const services = useLoaderData() as Service[];
    const { barber } = useParams();
    const navigate = useNavigate();

    const getStartOfWeek = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };
    const startOfWeek = getStartOfWeek();

    const barberServices = services.filter((service) => {
        const raw = service.createdAt;
        const clean = typeof raw === 'string'
            ? raw.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '')
            : raw;
        const serviceDate = new Date(clean);

        const matchesBarber  = service.barber.toLowerCase() === barber?.toLowerCase();
        const isThisWeek     = serviceDate >= startOfWeek;
        const notArchived    = service.isArchived !== true;

        return matchesBarber && isThisWeek && notArchived;
    });

    const weekTotal      = barberServices.reduce((acc, cur) => acc + Number(cur.price), 0);
    const barberCommission = weekTotal * 0.50;

    const closeWeek = async () => {
        const confirmed = confirm(`Cerrar semana de ${barber}?`);
        if (confirmed) {
            const closeData = {
                barbero: barber || "Desconocido",
                fechaCierre: new Date().toISOString(),
                totalBruto: weekTotal,
                comision50: barberCommission,
                serviciosArchivados: barberServices.map(s => s.id)
            };
            try {
                await archiveWeek(closeData);
                generatePaymentPDF(
                    barber || "Sin Nombre",
                    weekTotal,
                    barberCommission,
                    barberServices
                );
                alert("La semana ha sido liquidada. Se ha descargado el comprobante de pago.");
                navigate("/admin/ventas-totales");
            } catch (error) {
                alert("Error al conectar con el servidor de archivos.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic">
                        Semana Actual: <span className="text-amber-500">{barber}</span>
                    </h2>
                </div>
                <Link
                    to={`/admin/historial/${barber}`}
                    className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest border border-zinc-700 transition-all flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faChartLine} /> Ver Historial Completo
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-zinc-900 text-white rounded-lg overflow-hidden border border-amber-600/30">
                    <thead>
                        <tr className="bg-amber-700">
                            <th className="p-3 border-b border-amber-600">Cliente</th>
                            <th className="p-3 border-b border-amber-600">Servicio</th>
                            <th className="p-3 border-b border-amber-600">Fecha</th>
                            <th className="p-3 border-b border-amber-600">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {barberServices.length > 0 ? (
                            barberServices.map((service) => (
                                <tr key={service.id} className="text-center border-b border-zinc-800 hover:bg-zinc-800">
                                    <td className="p-3">{service.client}</td>
                                    <td className="p-3">{service.service}</td>
                                    <td className="p-3">{formatDate(service.createdAt)}</td>
                                    <td className="p-3 font-bold text-green-400">{formatCurrency(service.price)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-gray-500">
                                    No hay servicios registrados esta semana.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800 flex flex-col items-center">
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Recaudado</span>
                    <p className="text-4xl text-white font-black">{formatCurrency(weekTotal)}</p>
                </div>

                <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-amber-500 p-8 rounded-[2rem] flex flex-col items-center shadow-2xl shadow-amber-500/20"
                >
                    <span className="text-black text-[10px] font-black uppercase tracking-widest mb-2">Tu Liquidacion (50%)</span>
                    <p className="text-4xl text-black font-black italic">{formatCurrency(barberCommission)}</p>
                </motion.div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <Link className="bg-zinc-700 hover:bg-zinc-600 rounded-xl p-3 font-bold text-white transition-colors" to="/pago/barberos">
                    Volver al Resumen
                </Link>
                <p className="text-2xl text-white font-bold bg-amber-600/20 p-4 rounded-xl border border-amber-600">
                    Total Semana: <span className="text-amber-500">{formatCurrency(weekTotal)}</span>
                </p>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeWeek}
                className="w-full mt-10 bg-red-600 hover:bg-red-500 text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40"
            >
                Cerrar Semana y Archivar Caja
            </motion.button>
        </div>
    );
}