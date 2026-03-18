import { Link, useLoaderData, useParams } from "react-router-dom";
import { getServices } from "../services/ServiceService";
import { formatCurrency } from "../utils";
import { type Service } from "../types";
import { useMemo } from "react";

export async function loader() {
    return await getServices();
}

export default function BarberHistory() {
    const services = useLoaderData() as Service[];
    const { barber } = useParams();

    // ✅ Sin filtro isPaid — todo en /api/service ya está cobrado
    const barberServices = useMemo(() => {
        return services.filter(s =>
            s.barber.trim().toLowerCase() === barber?.trim().toLowerCase()
        );
    }, [services, barber]);

    const statsPorAnio = useMemo(() => {
        return barberServices.reduce((acc, curr) => {
            const raw = curr.createdAt;
            const clean = typeof raw === 'string'
                ? raw.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '')
                : raw;
            const date = new Date(clean);
            if (isNaN(date.getTime())) return acc;

            const anio = date.getFullYear();
            const mes = date.toLocaleString('es-ES', { month: 'long' });

            if (!acc[anio]) acc[anio] = {};
            acc[anio][mes] = (acc[anio][mes] || 0) + Number(curr.price);
            return acc;
        }, {} as Record<number, Record<string, number>>);
    }, [barberServices]);

    return (
        <div className="max-w-4xl mx-auto p-6 text-white">
            <Link
                to="/admin/ventas-totales"
                className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase mb-6 block"
            >
                ← Volver a servicios
            </Link>

            {Object.keys(statsPorAnio).length === 0 ? (
                <p className="text-zinc-600 text-center py-20 font-bold uppercase italic">
                    Sin historial para {barber}
                </p>
            ) : (
                Object.entries(statsPorAnio)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([anio, meses]) => (
                        <div key={anio} className="mb-10">
                            <h2 className="text-5xl font-black text-zinc-800 mb-6">{anio}</h2>
                            <div className="grid gap-4">
                                {Object.entries(meses).map(([mes, total]) => (
                                    <div
                                        key={mes}
                                        className="group bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 flex justify-between items-center hover:border-amber-500/50"
                                    >
                                        <div>
                                            <h3 className="capitalize font-black text-xl group-hover:text-amber-500 transition-colors">{mes}</h3>
                                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">Liquidación Mensual</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black italic">{formatCurrency(total)}</p>
                                            <p className="text-green-400 text-sm font-bold">
                                                + {formatCurrency(total * 0.5)} <span className="text-zinc-600">(50%)</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}