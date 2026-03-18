import { useLoaderData } from "react-router-dom";
import { formatCurrency } from "../utils";
import { getServices } from "../services/ServiceService";
import { type Service } from "../types";

export async function loader() {
    return await getServices();
}

export default function BarberStats() {
    const services = useLoaderData() as Service[];

    // ✅ Todo en /api/service ya está cobrado — sin filtro isPaid
    const statsPorMes = services.reduce((acc, curr) => {
        const raw = curr.createdAt;
        const clean = typeof raw === 'string'
            ? raw.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '')
            : raw;
        const d = new Date(clean);
        if (isNaN(d.getTime())) return acc;
        const mes = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        acc[mes] = (acc[mes] || 0) + Number(curr.price);
        return acc;
    }, {} as Record<string, number>);

    const totalAcumulado = services.reduce((acc, s) => acc + Number(s.price), 0);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-4xl font-black text-white italic uppercase mb-8">
                Estadísticas <span className="text-amber-500">Generales</span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                    <h3 className="text-amber-500 font-black uppercase mb-4 text-sm tracking-widest">
                        Ventas por Mes
                    </h3>
                    {Object.keys(statsPorMes).length === 0 ? (
                        <p className="text-zinc-600 text-sm font-bold uppercase italic">Sin registros</p>
                    ) : (
                        Object.entries(statsPorMes).map(([mes, total]) => (
                            <div key={mes} className="flex justify-between border-b border-zinc-800 py-3">
                                <span className="capitalize text-zinc-300 font-bold text-sm">{mes}</span>
                                <span className="font-black text-green-400">{formatCurrency(total)}</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-amber-600 p-6 rounded-3xl text-black flex flex-col justify-center items-center shadow-2xl shadow-amber-600/20">
                    <p className="font-black text-xs uppercase opacity-70 mb-2">Total Acumulado</p>
                    <p className="text-5xl font-black italic">
                        {formatCurrency(totalAcumulado)}
                    </p>
                    <p className="text-black/60 font-bold text-xs mt-2 uppercase">
                        {services.length} servicios cobrados
                    </p>
                </div>
            </div>
        </div>
    );
}