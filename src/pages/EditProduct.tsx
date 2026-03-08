import { useState } from "react"
import { Form, useActionData, type ActionFunctionArgs, redirect,
         type LoaderFunctionArgs, useLoaderData, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import ErrorMessaje from "../componenents/ErrorMessaje"
import { updateService, getServiceById } from "../services/ServiceService"
import type { Service } from "../types"

const INITIAL_SERVICES = [
    { nombre: "Corte", precio: 13 }, { nombre: "Corte con cejas", precio: 15 },
    { nombre: "Corte con barba", precio: 18 }, { nombre: "Corte Vip", precio: 25 },
    { nombre: "Barba", precio: 8 }, { nombre: "Barba VIP", precio: 11 },
    { nombre: "Cejas", precio: 5 }, { nombre: "Mechas", precio: 30 },
    { nombre: "Tinte", precio: 30 }, { nombre: "Trenzas", precio: 20 },
    { nombre: "Mask Carbon", precio: 3 }, { nombre: "Limpieza Facial", precio: 15 },
    { nombre: "Diseño", precio: 3 }, { nombre: "Lavado de Cabello", precio: 2 },
    { nombre: "Otros", precio: 0 },
]
const INITIAL_BARBERS = ["Josue", "Bryan"]

export async function loader({ params }: LoaderFunctionArgs) {
    if (params.id) {
        const service = await getServiceById(+params.id)
        if (!service) return redirect("/")
        return service
    }
    return redirect("/")
}

export async function action({ request, params }: ActionFunctionArgs) {
    const data = Object.fromEntries(await request.formData())
    if (Object.values(data).includes("")) return "Todos los campos son obligatorios"
    if (params.id !== undefined) {
        await updateService(data, +params.id)
        return redirect("/")
    }
}

export default function EditService() {
    const service = useLoaderData() as Service
    const error = useActionData() as string
    const [showAdmin, setShowAdmin] = useState(false)

    // ✅ useState igual que NewService
    const [barberos, setBarberos] = useState<string[]>(() =>
        JSON.parse(localStorage.getItem("barberos_barber") || "null") ?? INITIAL_BARBERS
    )
    const [servicios, setServicios] = useState<{ nombre: string; precio: number }[]>(() =>
        JSON.parse(localStorage.getItem("servicios_barber") || "null") ?? INITIAL_SERVICES
    )

    const guardarBarberos = (nuevos: string[]) => {
        setBarberos(nuevos)
        localStorage.setItem("barberos_barber", JSON.stringify(nuevos))
    }
    const guardarServicios = (nuevos: { nombre: string; precio: number }[]) => {
        setServicios(nuevos)
        localStorage.setItem("servicios_barber", JSON.stringify(nuevos))
    }

    const handleAddBarber = () => {
        const nombre = prompt("Nombre del nuevo barbero:")
        if (nombre?.trim()) guardarBarberos([...barberos, nombre.trim()])
    }
    const handleAddService = () => {
        const nombre = prompt("Nombre del servicio:")
        const precio = prompt("Precio del servicio:")
        if (nombre?.trim() && precio) guardarServicios([...servicios, { nombre: nombre.trim(), precio: Number(precio) }])
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-10 max-w-lg mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-amber-500 uppercase italic">
                    Editar <span className="text-white">Venta</span>
                </h2>
                <button type="button" onClick={() => setShowAdmin(!showAdmin)}
                    className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full hover:text-amber-500 transition-colors">
                    {showAdmin ? "Cerrar Ajustes" : "⚙️ Ajustes"}
                </button>
            </div>

            <AnimatePresence>
                {showAdmin && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6 space-y-4 p-4 bg-zinc-900/50 rounded-3xl border border-zinc-800">

                        <div>
                            <p className="text-amber-500 font-bold text-[10px] uppercase mb-2">Gestionar Barberos</p>
                            <div className="flex flex-wrap gap-2">
                                {barberos.map((b) => (
                                    <button key={b} type="button"
                                        onClick={() => guardarBarberos(barberos.filter(x => x !== b))}
                                        className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-lg border border-zinc-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all">
                                        {b} ✕
                                    </button>
                                ))}
                                <button type="button" onClick={handleAddBarber}
                                    className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/20 font-bold">
                                    + Nuevo
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-amber-500 font-bold text-[10px] uppercase mb-2">Gestionar Servicios</p>
                            <div className="flex flex-wrap gap-2">
                                {servicios.map((s) => (
                                    <button key={s.nombre} type="button"
                                        onClick={() => guardarServicios(servicios.filter(x => x.nombre !== s.nombre))}
                                        className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-lg border border-zinc-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all">
                                        {s.nombre} (${s.precio}) ✕
                                    </button>
                                ))}
                                <button type="button" onClick={handleAddService}
                                    className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/20 font-bold">
                                    + Nuevo
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-5">
                <div className="space-y-1">
                    <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Barbero</label>
                    <select name="barber" defaultValue={service.barber}
                        className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500 appearance-none">
                        {barberos.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Servicio</label>
                        <select name="service" defaultValue={service.service}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500 appearance-none">
                            {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Precio ($)</label>
                        <input name="price" type="number" step="0.01" defaultValue={service.price}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                </div>

                <div className="space-y-4 bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/50">
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Nombre Cliente</label>
                        <input name="client" type="text" defaultValue={service.client}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 focus:border-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Teléfono</label>
                        <input name="phone" type="text" defaultValue={service.phone ?? ""}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 focus:border-amber-500" />
                    </div>
                </div>

                <button type="submit"
                    className="mt-4 bg-amber-600 hover:bg-amber-500 p-4 text-black font-black rounded-xl uppercase transition-all active:scale-95">
                    Guardar Cambios ✓
                </button>
                <Link to="/" className="text-center text-zinc-500 text-xs font-bold hover:text-white uppercase">
                    Cancelar
                </Link>
            </Form>
        </motion.div>
    )
}