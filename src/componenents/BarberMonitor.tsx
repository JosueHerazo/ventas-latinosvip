import { useLoaderData } from "react-router-dom";
import { getServices } from "../services/ServiceService";
import { type Service } from "../types";
import { formatCurrency } from "../utils";
import { useMemo } from "react";
import { motion } from "framer-motion";

export async function loader() {
    return await getServices();
}

export default function BarberMonitor() {
    const services = useLoaderData() as Service[];

    const monitorData = useMemo(() => {
        const hoy = new Date().toLocaleDateString();
        return services.filter(s => {
            const raw = s.createdAt;
            const clean = typeof raw === 'string'
                ? raw.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '')
                : raw;
            const serviceDate = new Date(clean).toLocaleDateString();
            // ✅ Sin filtro isPaid — todo en /api/service ya está cobrado
            return serviceDate === hoy && s.barber !== "SISTEMA";
        }).reduce((acc, cur) => {
            const name = cur.barber.trim().toUpperCase();
            if (!acc[name]) acc[name] = { total: 0, servicios: 0 };
            acc[name].total += Number(cur.price);
            acc[name].servicios += 1;
            return acc;
        }, {} as Record<string, { total: number, servicios: number }>);
    }, [services]);

    const totalGeneralHoy = Object.values(monitorData).reduce((a, b) => a + b.total, 0);

    const enviarCierreWhatsApp = () => {
        const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        let mensaje = `*RESUMEN DE CAJA - ${fecha}* 💈\n\n`;

        Object.entries(monitorData).forEach(([barber, stats]) => {
            mensaje += `👤 *${barber}*\n`;
            mensaje += `   Servicios: ${stats.servicios}\n`;
            mensaje += `   Total: ${formatCurrency(stats.total)}\n`;
            mensaje += `   Comisión (50%): ${formatCurrency(stats.total * 0.5)}\n`;
            mensaje += `---------------------------\n`;
        });

        mensaje += `\n💰 *TOTAL CAJA: ${formatCurrency(totalGeneralHoy)}*`;

        // ✅ Número corregido
        const numeroDueño = "34722335405";
        window.open(`https://wa.me/${numeroDueño}?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white pb-32">
            <header className="mb-10 flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        Monitor <span className="text-amber-500">Diario</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={enviarCierreWhatsApp}
                    className="bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                >
                    Cerrar Jornada 📲
                </button>
            </header>

            {Object.keys(monitorData).length === 0 ? (
                <div className="text-center py-32">
                    <p className="text-zinc-700 font-black uppercase text-sm tracking-widest">
                        Sin servicios registrados hoy
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(monitorData).map(([name, stats]) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={name}
                            className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative"
                        >
                            <h3 className="text-xl font-black italic text-zinc-500 uppercase mb-2">{name}</h3>
                            <p className="text-5xl font-black text-white mb-4 tracking-tighter">
                                {formatCurrency(stats.total)}
                            </p>
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                <span className="text-zinc-600">{stats.servicios} Servicios</span>
                                <span className="text-green-500">Ganancia: {formatCurrency(stats.total * 0.5)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-amber-500 text-black p-5 rounded-[2rem] shadow-2xl flex justify-between items-center z-50">
                <div>
                    <p className="text-[10px] font-black uppercase leading-none mb-1">Caja Total</p>
                    <p className="text-4xl font-black italic tracking-tighter">{formatCurrency(totalGeneralHoy)}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-60">Barberos Activos</p>
                    <p className="text-2xl font-black italic">{Object.keys(monitorData).length}</p>
                </div>
            </div>
        </div>
    );
}