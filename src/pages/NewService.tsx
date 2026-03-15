import { useState, useEffect, useRef } from "react"
import { Form, type ActionFunctionArgs, redirect, useActionData, useSearchParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { addProduct } from "../services/ServiceService"
import ErrorMessaje from "../componenents/ErrorMessaje"

type Barbero  = { id: string; nombre: string }
type Servicio = { nombre: string; precio: number }

const INITIAL_BARBERS: Barbero[] = [
    { id: "josue", nombre: "Josue" },
    { id: "vato",  nombre: "Vato"  },
    { id: "will",  nombre: "Will"  },
    { id: "stiven",nombre: "Stiven"},
]

const INITIAL_SERVICES: Servicio[] = [
    { nombre: "Corte",             precio: 13 },
    { nombre: "Corte con cejas",   precio: 15 },
    { nombre: "Corte con barba",   precio: 18 },
    { nombre: "Corte Vip",         precio: 25 },
    { nombre: "Barba",             precio: 8  },
    { nombre: "Barba VIP",         precio: 11 },
    { nombre: "Cejas",             precio: 5  },
    { nombre: "Mechas",            precio: 30 },
    { nombre: "Tinte",             precio: 30 },
    { nombre: "Trenzas",           precio: 20 },
    { nombre: "Mask Carbon",       precio: 3  },
    { nombre: "Limpieza Facial",   precio: 15 },
    { nombre: "Diseño",            precio: 3  },
    { nombre: "Lavado de Cabello", precio: 2  },
    { nombre: "Otros",             precio: 0  },
]

function loadLocal<T>(key: string, fallback: T): T {
    try {
        const s = localStorage.getItem(key)
        return s ? JSON.parse(s) : fallback
    } catch { return fallback }
}

function saveLocal(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value))
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data     = Object.fromEntries(formData)
    if (Object.values(data).includes("")) return "Todos los campos son obligatorios"
    await addProduct({ ...data, phone: String(data.phone) })
    return redirect("/")
}

export default function NewService() {
    const error          = useActionData() as string
    const [searchParams] = useSearchParams()
    const fileInputRef   = useRef<HTMLInputElement>(null)

    const [barberos, setBarberos] = useState<Barbero[]>(() => {
        try {
            const saved = localStorage.getItem("barberos_barber")
            if (!saved) return INITIAL_BARBERS

            const parsed = JSON.parse(saved)

            if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_BARBERS
            // formato viejo: array de strings
            if (typeof parsed[0] === "string") {
                localStorage.removeItem("barberos_barber")
                return INITIAL_BARBERS
            }
            // objeto sin estructura válida
            if (!parsed[0]?.id || !parsed[0]?.nombre) {
                localStorage.removeItem("barberos_barber")
                return INITIAL_BARBERS
            }
            // fusionar: respetar guardados + añadir los que falten
            const ids = parsed.map((b: Barbero) => b.id)
            const faltantes = INITIAL_BARBERS.filter(b => !ids.includes(b.id))
            return [...parsed, ...faltantes]
        } catch {
            localStorage.removeItem("barberos_barber")
            return INITIAL_BARBERS
        }
    })

    const [servicios, setServicios] = useState<Servicio[]>(() =>
        loadLocal("servicios_barber", INITIAL_SERVICES)
    )
    const [fotos, setFotos] = useState<Record<string, string>>(() =>
        loadLocal("fotos_barberos", {})
    )

    const [selectedBarber,  setSelectedBarber]  = useState("")
    const [selectedService, setSelectedService] = useState(searchParams.get("service") || "")
    const [price,           setPrice]           = useState<number | string>("")

    const [showModal,     setShowModal]     = useState(false)
    const [modalTab,      setModalTab]      = useState<"barberos" | "servicios">("barberos")
    const [editandoId,    setEditandoId]    = useState<string | null>(null)
    const [editNombres,   setEditNombres]   = useState<Record<string, string>>({})
    const [editPrecios,   setEditPrecios]   = useState<Record<string, string>>({})
    const [nuevoBarber,   setNuevoBarber]   = useState("")
    const [nuevoServicio, setNuevoServicio] = useState({ nombre: "", precio: "" })
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

    useEffect(() => {
        const s = servicios.find(s => s.nombre === selectedService)
        if (s) setPrice(s.precio)
    }, [selectedService, servicios])

    useEffect(() => {
        if (showModal) {
            const n: Record<string, string> = {}
            barberos.forEach(b => { n[b.id] = b.nombre })
            setEditNombres(n)
            const p: Record<string, string> = {}
            servicios.forEach(s => { p[s.nombre] = String(s.precio) })
            setEditPrecios(p)
            setConfirmDelete(null)
        }
    }, [showModal])

    const actualizarBarberos = (lista: Barbero[]) => {
        setBarberos(lista)
        saveLocal("barberos_barber", lista)
    }
    const actualizarServicios = (lista: Servicio[]) => {
        setServicios(lista)
        saveLocal("servicios_barber", lista)
    }
    const actualizarFotos = (nuevas: Record<string, string>) => {
        setFotos(nuevas)
        saveLocal("fotos_barberos", nuevas)
    }

    const handleAñadirBarbero = () => {
        if (!nuevoBarber.trim()) return
        const nuevo: Barbero = { id: Date.now().toString(), nombre: nuevoBarber.trim() }
        actualizarBarberos([...barberos, nuevo])
        setNuevoBarber("")
    }

    const handleBorrarBarbero = (id: string) => {
        if (confirmDelete !== id) { setConfirmDelete(id); return }
        if (selectedBarber === barberos.find(b => b.id === id)?.nombre) setSelectedBarber("")
        const nuevasFotos = { ...fotos }
        delete nuevasFotos[id]
        actualizarFotos(nuevasFotos)
        actualizarBarberos(barberos.filter(b => b.id !== id))
        setConfirmDelete(null)
    }

    const handleGuardarNombre = (id: string) => {
        const nuevo = editNombres[id]?.trim()
        if (!nuevo) return
        actualizarBarberos(barberos.map(b => b.id === id ? { ...b, nombre: nuevo } : b))
    }

    const handleCambiarFoto = (id: string, archivo: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            actualizarFotos({ ...fotos, [id]: base64 })
        }
        reader.readAsDataURL(archivo)
    }

    const handleAñadirServicio = () => {
        const { nombre, precio } = nuevoServicio
        if (!nombre.trim() || precio === "") return
        actualizarServicios([...servicios, { nombre: nombre.trim(), precio: Number(precio) }])
        setNuevoServicio({ nombre: "", precio: "" })
    }

    const handleBorrarServicio = (nombre: string) => {
        if (confirmDelete !== nombre) { setConfirmDelete(nombre); return }
        actualizarServicios(servicios.filter(s => s.nombre !== nombre))
        setConfirmDelete(null)
    }

    const handleGuardarPrecio = (nombre: string) => {
        const nuevo = Number(editPrecios[nombre])
        if (isNaN(nuevo)) return
        actualizarServicios(servicios.map(s => s.nombre === nombre ? { ...s, precio: nuevo } : s))
    }

    return (
        <>
        <AnimatePresence>
        {showModal && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>

                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 24 }}
                    animate={{ scale: 1,    opacity: 1, y: 0   }}
                    exit={{    scale: 0.92, opacity: 0, y: 24  }}
                    className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[88vh] overflow-y-auto">

                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-amber-500 font-black text-lg">⚙️ Gestionar</h3>
                        <button onClick={() => setShowModal(false)}
                            className="text-zinc-500 hover:text-white w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">✕</button>
                    </div>

                    <div className="flex gap-2 mb-5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                        {(["barberos", "servicios"] as const).map(tab => (
                            <button key={tab}
                                onClick={() => { setModalTab(tab); setConfirmDelete(null) }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all
                                    ${modalTab === tab ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}>
                                {tab === "barberos" ? "✂️ Barberos" : "💈 Servicios"}
                            </button>
                        ))}
                    </div>

                    {modalTab === "barberos" && (
                        <div className="space-y-3">
                            {barberos.map(b => (
                                <div key={b.id}
                                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                    <div className="relative cursor-pointer flex-shrink-0"
                                        onClick={() => { setEditandoId(b.id); fileInputRef.current?.click() }}>
                                        {fotos[b.id]
                                            ? <img src={fotos[b.id]} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700" />
                                            : <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl font-black text-amber-500">
                                                {b.nombre?.[0]?.toUpperCase() ?? "?"}
                                              </div>
                                        }
                                        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-black">✎</span>
                                    </div>
                                    <input type="text"
                                        value={editNombres[b.id] ?? b.nombre}
                                        onChange={e => setEditNombres(p => ({ ...p, [b.id]: e.target.value }))}
                                        onBlur={() => handleGuardarNombre(b.id)}
                                        className="flex-1 bg-zinc-800 text-white text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                    <button onClick={() => handleBorrarBarbero(b.id)}
                                        className={`flex-shrink-0 px-3 h-8 rounded-full border flex items-center justify-center transition-all text-xs font-bold
                                            ${confirmDelete === b.id
                                                ? "bg-red-500 border-red-500 text-white animate-pulse"
                                                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"}`}>
                                        {confirmDelete === b.id ? "¿Seguro?" : "🗑"}
                                    </button>
                                </div>
                            ))}

                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file && editandoId) handleCambiarFoto(editandoId, file)
                                    e.target.value = ""
                                }} />

                            <div className="border-t border-zinc-800 pt-4">
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Nuevo barbero</p>
                                <div className="flex gap-2">
                                    <input type="text" value={nuevoBarber}
                                        onChange={e => setNuevoBarber(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAñadirBarbero() } }}
                                        placeholder="Nombre..."
                                        className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                    <button onClick={handleAñadirBarbero}
                                        disabled={!nuevoBarber.trim()}
                                        className="bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black px-5 rounded-xl text-lg">+</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalTab === "servicios" && (
                        <div className="space-y-2">
                            {servicios.map(s => (
                                <div key={s.nombre}
                                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                    <span className="flex-1 text-white text-sm font-bold truncate">{s.nombre}</span>
                                    <input type="number"
                                        value={editPrecios[s.nombre] ?? String(s.precio)}
                                        onChange={e => setEditPrecios(p => ({ ...p, [s.nombre]: e.target.value }))}
                                        onBlur={() => handleGuardarPrecio(s.nombre)}
                                        className="w-16 bg-zinc-800 text-amber-500 text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-center font-black" />
                                    <span className="text-zinc-500 text-xs font-bold">€</span>
                                    <button onClick={() => handleBorrarServicio(s.nombre)}
                                        className={`flex-shrink-0 px-3 h-8 rounded-full border flex items-center justify-center transition-all text-xs font-bold
                                            ${confirmDelete === s.nombre
                                                ? "bg-red-500 border-red-500 text-white animate-pulse"
                                                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"}`}>
                                        {confirmDelete === s.nombre ? "¿Seguro?" : "🗑"}
                                    </button>
                                </div>
                            ))}

                            <div className="border-t border-zinc-800 pt-4">
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Nuevo servicio</p>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={nuevoServicio.nombre}
                                        onChange={e => setNuevoServicio(p => ({ ...p, nombre: e.target.value }))}
                                        placeholder="Nombre..."
                                        className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                    <input type="number" value={nuevoServicio.precio}
                                        onChange={e => setNuevoServicio(p => ({ ...p, precio: e.target.value }))}
                                        placeholder="€"
                                        className="w-20 bg-zinc-900 text-amber-500 text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-center font-black" />
                                </div>
                                <button onClick={handleAñadirServicio}
                                    disabled={!nuevoServicio.nombre.trim() || nuevoServicio.precio === ""}
                                    className="w-full bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black py-3 rounded-xl text-sm uppercase">
                                    + Añadir servicio
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-lg mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-amber-500 uppercase italic">
                    Pagar <span className="text-white">Servicio</span>
                </h2>
                <button type="button" onClick={() => setShowModal(true)}
                    className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full hover:text-amber-500 transition-colors">
                    ⚙️ Gestionar
                </button>
            </div>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-5">

                <div className="space-y-2">
                    <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Barbero</label>
                    <div className="flex gap-3 flex-wrap">
                        {barberos.map(b => (
                            <div key={b.id} onClick={() => setSelectedBarber(b.nombre)}
                                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200
                                    ${selectedBarber === b.nombre ? "scale-105" : "opacity-60 hover:opacity-90"}`}>
                                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors
                                    ${selectedBarber === b.nombre ? "border-amber-500" : "border-zinc-700"}`}>
                                    {fotos[b.id]
                                        ? <img src={fotos[b.id]} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-black text-amber-500">
                                            {b.nombre?.[0]?.toUpperCase() ?? "?"}
                                          </div>
                                    }
                                </div>
                                <span className={`text-[10px] font-black transition-colors
                                    ${selectedBarber === b.nombre ? "text-amber-500" : "text-zinc-500"}`}>
                                    {b.nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={selectedBarber} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Servicio</label>
                        <select name="service" value={selectedService}
                            onChange={e => setSelectedService(e.target.value)}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500 appearance-none">
                            <option value="">Selecciona...</option>
                            {servicios.map(s => (
                                <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Precio (€)</label>
                        <input name="price" type="number" step="0.01" value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                </div>

                <div className="space-y-4 bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/50">
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Nombre Cliente</label>
                        <input name="client" type="text"
                            defaultValue={searchParams.get("client") || ""}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Teléfono</label>
                        <input name="phone" type="number"
                            defaultValue={searchParams.get("phone") || ""}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500" />
                    </div>
                </div>

                <button type="submit"
                    className="mt-4 bg-amber-600 hover:bg-amber-500 p-4 text-black font-black rounded-xl uppercase transition-all shadow-lg shadow-amber-900/20 active:scale-95">
                    Confirmar y Registrar Pago ✓
                </button>

                <Link to="/" className="text-center text-zinc-500 text-xs font-bold hover:text-white uppercase">
                    Volver al inicio
                </Link>
            </Form>
        </motion.div>
        </>
    )
}