import { Form, useActionData, type ActionFunctionArgs, redirect, 
         type LoaderFunctionArgs, useLoaderData, Link } from "react-router-dom"
import ErrorMessaje from "../componenents/ErrorMessaje"
import { getDatesList, updateDate } from "../services/serviceDate"
import type { DateList } from "../types"
import { motion } from "framer-motion"

const INITIAL_SERVICES = [
    { nombre: "Corte", precio: 13 },
    { nombre: "Corte con cejas", precio: 15 },
    { nombre: "Corte con barba", precio: 18 },
    { nombre: "Corte Vip", precio: 25 },
    { nombre: "Barba", precio: 8 },
    { nombre: "Barba VIP", precio: 11 },
    { nombre: "Cejas", precio: 5 },
    { nombre: "Mechas", precio: 30 },
    { nombre: "Tinte", precio: 30 },
    { nombre: "Trenzas", precio: 20 },
    { nombre: "Mask Carbon", precio: 3 },
    { nombre: "Limpieza Facial", precio: 15 },
    { nombre: "Diseño", precio: 3 },
    { nombre: "Lavado de Cabello", precio: 2 },
    { nombre: "Otros", precio: 0 },
]
const INITIAL_BARBERS = ["Josue", "Bryan"]

export async function loader({ params }: LoaderFunctionArgs) {
    if (params.id !== undefined) {
        const dates = await getDatesList()
        const cita = dates.find(d => d.id === +params.id!)
        if (!cita) return redirect("/lista/citas")
        return cita
    }
    return redirect("/lista/citas")
}

export async function action({ request, params }: ActionFunctionArgs) {
    const data = Object.fromEntries(await request.formData())
    if (Object.values(data).includes("")) return "Todos los campos son obligatorios"
    if (params.id !== undefined) {
        await updateDate(+params.id, data)
        return redirect("/lista/citas")
    }
}

export default function EditDate() {
    const cita = useLoaderData() as DateList
    const error = useActionData() as string

    // ✅ Lee del mismo localStorage que NewService
    const barberos: string[] = JSON.parse(
        localStorage.getItem("barberos_barber") || "null"
    ) ?? INITIAL_BARBERS

    const servicios: { nombre: string, precio: number }[] = JSON.parse(
        localStorage.getItem("servicios_barber") || "null"
    ) ?? INITIAL_SERVICES

    // ✅ Convierte dateList a formato "YYYY-MM-DDTHH:mm" para datetime-local
    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return ""
        try {
            return new Date(dateStr).toISOString().slice(0, 16)
        } catch {
            return dateStr.slice(0, 16)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-lg mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl"
        >
            <h2 className="text-3xl font-black text-amber-500 uppercase italic mb-6 text-center">
                Editar <span className="text-white">Cita</span>
            </h2>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-5">

                <div className="grid grid-cols-2 gap-4">
                    {/* ✅ Barberos desde localStorage */}
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Barbero</label>
                        <select name="barber" defaultValue={cita.barber}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500 appearance-none">
                            {barberos.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    {/* ✅ FIX: name="dateList" y type="datetime-local" con valor formateado */}
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Fecha y Hora</label>
                        <input
                            name="dateList"
                            type="datetime-local"
                            defaultValue={formatDateForInput(cita.dateList)}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500"
                        />
                    </div>
                </div>

                {/* ✅ Servicios desde localStorage */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Servicio</label>
                        <select name="service" defaultValue={cita.service}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 appearance-none">
                            {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Precio ($)</label>
                        <input name="price" type="number" step="0.01" defaultValue={cita.price}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Duración (min)</label>
                    <select name="duration" defaultValue={cita.duration}
                        className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 appearance-none">
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                    </select>
                </div>

                <div className="space-y-4 bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/50">
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Nombre Cliente</label>
                        <input name="client" type="text" defaultValue={cita.client}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 focus:border-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Teléfono</label>
                        <input name="phone" type="text" defaultValue={cita.phone ?? ""}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 focus:border-amber-500" />
                    </div>
                </div>

                <button type="submit"
                    className="mt-4 bg-amber-600 hover:bg-amber-500 p-4 text-black font-black rounded-xl uppercase transition-all shadow-lg active:scale-95">
                    Actualizar Cita ✓
                </button>

                <Link to="/lista/citas"
                    className="text-center text-zinc-500 text-xs font-bold hover:text-white uppercase">
                    Volver a Citas
                </Link>
            </Form>
        </motion.div>
    )
}