import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils";
import { getServices } from "../services/ServiceService";
import { useLoaderData } from "react-router-dom";
import type { Service } from "../types";

export async function loader() {
    return await getServices();
}

export default function VentasTotales() {
    const services = useLoaderData() as Service[];
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const enviarRecordatorioWhatsApp = (telefono: string, nombre: string) => {
        if (!telefono) return alert("Sin teléfono");
        const link = `${window.location.origin}/reservar`;
        const msj = `¡Hola ${nombre}! 💈 Te extrañamos en la barbería. ¿Listo para renovar tu corte? Reserva aquí: ${link}`;
        window.open(`https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(msj)}`, '_blank');
    };

    const filteredData = useMemo(() => {
        if (!services) return [];
        return services.filter(s => {
            // ✅ FIX: parsear createdAt correctamente (puede venir con o sin Z)
            const raw = s.createdAt;
            if (!raw) return false;
            // Forzar interpretación local quitando Z o sufijo UTC
            const clean = typeof raw === 'string'
                ? raw.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '')
                : raw;
            const d = new Date(clean);
            if (isNaN(d.getTime())) return false;

            // ✅ FIX: isPaid puede ser boolean, number o string según Sequelize
            const isPaid = s.isPaid === true || s.isPaid === 1 || 
                           (s as any).isPaid === "1" || (s as any).isPaid === "true";

            return d.getMonth() === selectedMonth &&
                   d.getFullYear() === selectedYear &&
                   isPaid;
        });
    }, [services, selectedMonth, selectedYear]);

    const esAusente = (fechaCierre: string) => {
        const fecha = new Date(fechaCierre.replace('Z', '').replace(/\+\d{2}:\d{2}$/, ''));
        const hoy = new Date();
        return Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24)) > 20;
    };

    const totalMes = useMemo(() =>
        filteredData.reduce((acc, cur) => acc + (Number(cur.price) || 0), 0),
        [filteredData]
    );

    return (
        <div className="max-w-6xl mx-auto p-4">
            <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Cierres <span className="text-amber-500">Mensuales</span>
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-2">
                        Historial de facturación y retención
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-zinc-900 text-white p-3 rounded-xl border border-zinc-800 font-bold text-sm"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select
                        className="bg-zinc-900 text-white p-3 rounded-xl border border-zinc-800 font-bold text-sm"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-500 p-8 rounded-[2.5rem] mb-10 flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-amber-500/10"
            >
                <div>
                    <p className="text-black font-black uppercase text-[10px] tracking-[0.2em] mb-1">Total Recaudado en el Periodo</p>
                    <p className="text-6xl font-black text-black tracking-tighter">
                        {formatCurrency(totalMes)}
                    </p>
                </div>
                <div className="bg-black/10 px-6 py-4 rounded-3xl mt-4 md:mt-0 text-center">
                    <p className="text-black font-black text-2xl">{filteredData.length}</p>
                    <p className="text-black/60 font-bold uppercase text-[9px]">Servicios</p>
                </div>
            </motion.div>

            {/* ✅ DEBUG TEMPORAL — borra cuando funcione */}
            <div className="text-[10px] text-zinc-600 mb-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <p>Total servicios cargados: <span className="text-amber-500">{services?.length ?? 0}</span></p>
                <p>Filtrados para {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][selectedMonth]}/{selectedYear}: <span className="text-amber-500">{filteredData.length}</span></p>
                {services?.[0] && (
                    <p>Ejemplo createdAt: <span className="text-zinc-400">{String(services[0].createdAt)}</span> | isPaid: <span className="text-zinc-400">{String((services[0] as any).isPaid)}</span></p>
                )}
            </div>

            <div className="grid gap-4">
                {filteredData.length === 0 ? (
                    <p className="text-zinc-600 text-center py-20 font-bold uppercase italic">
                        No hay registros para esta fecha
                    </p>
                ) : (
                    filteredData.map(c => {
                        const ausente = esAusente(c.createdAt);
                        return (
                            <div key={c.id}
                                className={`bg-zinc-900 p-6 rounded-3xl border ${ausente ? 'border-red-900/40 bg-red-950/10' : 'border-zinc-800'} flex flex-wrap justify-between items-center gap-4 transition-all hover:border-zinc-700`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${ausente ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-amber-500'}`}>
                                        {ausente ? '!' : c.client[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase flex items-center gap-2">
                                            {c.client}
                                            {ausente && <span className="text-[8px] bg-red-600 px-2 py-0.5 rounded text-white italic tracking-tighter">Ausente +20 días</span>}
                                        </h4>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase">Atendido por: {c.barber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <p className="text-white font-black text-lg">{formatCurrency(c.price)}</p>
                                        <p className="text-zinc-600 text-[9px] font-bold uppercase">{c.createdAt}</p>
                                    </div>
                                    <button
                                        onClick={() => enviarRecordatorioWhatsApp(c.phone ?? "", c.client ?? "")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg ${
                                            ausente
                                            ? 'bg-red-600 text-white hover:bg-white hover:text-red-600'
                                            : 'bg-zinc-800 text-zinc-400 hover:text-amber-500 border border-zinc-700'
                                        }`}
                                    >
                                        <span>{ausente ? 'Recuperar' : 'Recordar'}</span>
                                        <span className="text-sm">💬</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}