import { useState, useEffect, useRef } from "react"
import { Form, type ActionFunctionArgs, redirect, useActionData, useSearchParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { addProduct } from "../services/ServiceService"
import ErrorMessaje from "../componenents/ErrorMessaje"

const API = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""

async function getConfig(clave: string) {
    const res  = await fetch(`${API}/api/config`)
    const data = await res.json()
    return data[clave] ?? null
}

async function saveConfig(clave: string, valor: unknown) {
    await fetch(`${API}/api/config`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clave, valor })
    })
}

// ── Defaults ────────────────────────────────────────────────────────
const INITIAL_SERVICES = [
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

const INITIAL_BARBERS: Barbero[] = [
    { id: "Josue", nombre: "Josue", foto: "" },
    { id: "Bryan", nombre: "Bryan", foto: "" },
]

type Barbero  = { id: string; nombre: string; foto: string }
type Servicio = { nombre: string; precio: number }

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

    // ── Estado principal ─────────────────────────────────────────────
    const [barberos,  setBarberos]  = useState<Barbero[]>(INITIAL_BARBERS)
    const [servicios, setServicios] = useState<Servicio[]>(INITIAL_SERVICES)
    const [loadingCfg, setLoadingCfg] = useState(true)
    const [saving,     setSaving]     = useState(false)

    // ── Estado formulario ────────────────────────────────────────────
    const [selectedService, setSelectedService] = useState(searchParams.get("service") || "")
    const [price,           setPrice]           = useState<number | string>("")

    // ── Estado modal ─────────────────────────────────────────────────
    const [showModal,     setShowModal]     = useState(false)
    const [modalTab,      setModalTab]      = useState<"barberos" | "servicios">("barberos")
    const [editandoId,    setEditandoId]    = useState<string | null>(null)
    const [editNombres,   setEditNombres]   = useState<Record<string, string>>({})
    const [nuevoBarber,   setNuevoBarber]   = useState("")
    const [nuevoServicio, setNuevoServicio] = useState({ nombre: "", precio: "" })
    const [editPrecios,   setEditPrecios]   = useState<Record<string, string>>({})

    // ── Cargar config desde PostgreSQL ───────────────────────────────
    useEffect(() => {
        async function cargarConfig() {
            try {
                const [barberData, serviceData] = await Promise.all([
                    getConfig("barberos"),
                    getConfig("servicios_ventas") // clave distinta a la de citas
                ])
                if (Array.isArray(barberData)  && barberData.length  > 0) setBarberos(barberData)
                if (Array.isArray(serviceData) && serviceData.length > 0) setServicios(serviceData)
            } catch (e) {
                console.warn("Config no disponible, usando defaults", e)
            } finally {
                setLoadingCfg(false)
            }
        }
        cargarConfig()
    }, [])

    // Sincronizar precio al cambiar servicio
    useEffect(() => {
        const encontrado = servicios.find(s => s.nombre === selectedService)
        if (encontrado) setPrice(encontrado.precio)
    }, [selectedService, servicios])

    // Sincronizar campos editables al abrir modal
    useEffect(() => {
        if (showModal) {
            const nombres: Record<string, string> = {}
            barberos.forEach(b => { nombres[b.id] = b.nombre })
            setEditNombres(nombres)

            const precios: Record<string, string> = {}
            servicios.forEach(s => { precios[s.nombre] = String(s.precio) })
            setEditPrecios(precios)
        }
    }, [showModal])

    // ── Helpers persistencia ─────────────────────────────────────────
    const persistirBarberos = async (lista: Barbero[]) => {
        setBarberos(lista)
        setSaving(true)
        try { await saveConfig("barberos", lista) }
        catch (e) { console.error(e) }
        finally { setSaving(false) }
    }

    const persistirServicios = async (lista: Servicio[]) => {
        setServicios(lista)
        setSaving(true)
        try { await saveConfig("servicios_ventas", lista) }
        catch (e) { console.error(e) }
        finally { setSaving(false) }
    }

    // ── Barberos: añadir / borrar / editar nombre / foto ────────────
    const handleAñadirBarbero = async () => {
        if (!nuevoBarber.trim()) return
        const nuevo: Barbero = { id: Date.now().toString(), nombre: nuevoBarber.trim(), foto: "" }
        await persistirBarberos([...barberos, nuevo])
        setNuevoBarber("")
    }

    const handleBorrarBarbero = async (id: string) =>
        await persistirBarberos(barberos.filter(b => b.id !== id))

    const handleGuardarNombreBarbero = async (id: string) => {
        const nuevo = editNombres[id]?.trim()
        if (!nuevo) return
        await persistirBarberos(barberos.map(b => b.id === id ? { ...b, nombre: nuevo } : b))
    }

    const handleCambiarFoto = (id: string, archivo: File) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result as string
            await persistirBarberos(barberos.map(b => b.id === id ? { ...b, foto: base64 } : b))
        }
        reader.readAsDataURL(archivo)
    }

    // ── Servicios: añadir / borrar / editar precio ───────────────────
    const handleAñadirServicio = async () => {
        const { nombre, precio } = nuevoServicio
        if (!nombre.trim() || precio === "") return
        const nuevo: Servicio = { nombre: nombre.trim(), precio: Number(precio) }
        await persistirServicios([...servicios, nuevo])
        setNuevoServicio({ nombre: "", precio: "" })
    }

    const handleBorrarServicio = async (nombre: string) =>
        await persistirServicios(servicios.filter(s => s.nombre !== nombre))

    const handleGuardarPrecio = async (nombre: string) => {
        const nuevo = Number(editPrecios[nombre])
        if (isNaN(nuevo)) return
        await persistirServicios(servicios.map(s => s.nombre === nombre ? { ...s, precio: nuevo } : s))
    }

    if (loadingCfg) return (
        <div className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center h-40">
            <p className="text-amber-500 animate-pulse font-bold">Cargando...</p>
        </div>
    )

    return (
        <>
        {/* ══════════════════════════════════════════
            MODAL GESTIÓN
        ══════════════════════════════════════════ */}
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1,   opacity: 1, y: 0  }}
                        exit={{    scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-amber-500 font-black text-lg">⚙️ Ajustes</h3>
                            <button onClick={() => setShowModal(false)}
                                className="text-zinc-500 hover:text-white w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center transition-colors">
                                ✕
                            </button>
                        </div>

                        {saving && (
                            <p className="text-amber-500 text-[10px] font-bold animate-pulse text-center mb-3">
                                Guardando en servidor...
                            </p>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-2 mb-5">
                            {(["barberos", "servicios"] as const).map(tab => (
                                <button key={tab} onClick={() => setModalTab(tab)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-colors
                                        ${modalTab === tab
                                            ? "bg-amber-500 text-black"
                                            : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"}`}>
                                    {tab === "barberos" ? "✂️ Barberos" : "💈 Servicios"}
                                </button>
                            ))}
                        </div>

                        {/* ── TAB BARBEROS ── */}
                        {modalTab === "barberos" && (
                            <div className="space-y-3">
                                {barberos.map(b => (
                                    <div key={b.id}
                                        className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                        {/* Foto */}
                                        <div className="relative cursor-pointer flex-shrink-0"
                                            onClick={() => { setEditandoId(b.id); fileInputRef.current?.click() }}>
                                            {b.foto
                                                ? <img src={b.foto} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700" />
                                                : <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl font-black text-amber-500">
                                                    {b.nombre[0]?.toUpperCase()}
                                                  </div>
                                            }
                                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-black">✎</span>
                                        </div>
                                        {/* Nombre */}
                                        <input
                                            type="text"
                                            value={editNombres[b.id] ?? b.nombre}
                                            onChange={e => setEditNombres(p => ({ ...p, [b.id]: e.target.value }))}
                                            onBlur={() => handleGuardarNombreBarbero(b.id)}
                                            className="flex-1 bg-zinc-800 text-white text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none"
                                        />
                                        {/* Borrar */}
                                        <button onClick={() => handleBorrarBarbero(b.id)}
                                            className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors text-sm">
                                            🗑
                                        </button>
                                    </div>
                                ))}

                                {/* Input file oculto */}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0]
                                        if (file && editandoId) handleCambiarFoto(editandoId, file)
                                        e.target.value = ""
                                    }} />

                                {/* Añadir barbero */}
                                <div className="border-t border-zinc-800 pt-4">
                                    <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Añadir barbero</p>
                                    <div className="flex gap-2">
                                        <input type="text" value={nuevoBarber}
                                            onChange={e => setNuevoBarber(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAñadirBarbero() } }}
                                            placeholder="Nombre"
                                            className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                        <button onClick={handleAñadirBarbero}
                                            disabled={!nuevoBarber.trim()}
                                            className="bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black px-4 rounded-xl transition-colors">
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB SERVICIOS ── */}
                        {modalTab === "servicios" && (
                            <div className="space-y-2">
                                {servicios.map(s => (
                                    <div key={s.nombre}
                                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                        {/* Nombre (solo lectura) */}
                                        <span className="flex-1 text-white text-sm font-bold truncate">{s.nombre}</span>
                                        {/* Precio editable */}
                                        <input
                                            type="number"
                                            value={editPrecios[s.nombre] ?? String(s.precio)}
                                            onChange={e => setEditPrecios(p => ({ ...p, [s.nombre]: e.target.value }))}
                                            onBlur={() => handleGuardarPrecio(s.nombre)}
                                            className="w-20 bg-zinc-800 text-amber-500 text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-center font-black"
                                        />
                                        <span className="text-zinc-500 text-xs">€</span>
                                        {/* Borrar */}
                                        <button onClick={() => handleBorrarServicio(s.nombre)}
                                            className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors text-sm flex-shrink-0">
                                            🗑
                                        </button>
                                    </div>
                                ))}

                                {/* Añadir servicio */}
                                <div className="border-t border-zinc-800 pt-4">
                                    <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Añadir servicio</p>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text"
                                            value={nuevoServicio.nombre}
                                            onChange={e => setNuevoServicio(p => ({ ...p, nombre: e.target.value }))}
                                            placeholder="Nombre"
                                            className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                        <input type="number"
                                            value={nuevoServicio.precio}
                                            onChange={e => setNuevoServicio(p => ({ ...p, precio: e.target.value }))}
                                            placeholder="€"
                                            className="w-20 bg-zinc-900 text-amber-500 text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-center font-black" />
                                    </div>
                                    <button onClick={handleAñadirServicio}
                                        disabled={!nuevoServicio.nombre.trim() || nuevoServicio.precio === ""}
                                        className="w-full bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black py-2 rounded-xl transition-colors text-sm">
                                        + Añadir servicio
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════
            FORMULARIO PRINCIPAL
        ══════════════════════════════════════════ */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-lg mx-auto bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-amber-500 uppercase italic">
                    Pagar <span className="text-white">Servicio</span>
                </h2>
                <button type="button" onClick={() => setShowModal(true)}
                    className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full hover:text-amber-500 transition-colors">
                    ⚙️ Ajustes
                </button>
            </div>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-5">

                {/* SELECT BARBERO — con foto */}
                <div className="space-y-2">
                    <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Barbero</label>
                    <div className="flex gap-3 flex-wrap">
                        {barberos.map(b => (
                            <label key={b.id}
                                className="flex flex-col items-center gap-1 cursor-pointer group">
                                <input type="radio" name="barber" value={b.nombre} className="hidden"
                                    onChange={() => {}} />
                                <div onClick={(e) => {
                                        // seleccionar el radio manualmente
                                        const radio = e.currentTarget.previousElementSibling as HTMLInputElement
                                        if (radio) radio.checked = true
                                    }}
                                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-700 group-has-[:checked]:border-amber-500 transition-all group-has-[:checked]:scale-110">
                                    {b.foto
                                        ? <img src={b.foto} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xl font-black text-amber-500">
                                            {b.nombre[0]?.toUpperCase()}
                                          </div>
                                    }
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 group-has-[:checked]:text-amber-500 transition-colors">
                                    {b.nombre}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* SERVICIO Y PRECIO */}
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
                        <input name="price" type="number" step="0.01"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-900 border border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                </div>

                {/* DATOS CLIENTE */}
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