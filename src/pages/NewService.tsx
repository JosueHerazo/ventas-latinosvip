import { useState, useEffect, useRef } from "react"
import { Form, type ActionFunctionArgs, redirect, useActionData, useSearchParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { addProduct } from "../services/ServiceService"
import ErrorMessaje from "../componenents/ErrorMessaje"

type Barber  = { id: string; name: string }
type Service = { name: string; price: number }

const INITIAL_BARBERS: Barber[] = [
    { id: "josue",  name: "Josue"  },
    { id: "vato",   name: "Vato"   },
    { id: "will",   name: "Will"   },
    { id: "stiven", name: "Stiven" },
]

const INITIAL_SERVICES: Service[] = [
    { name: "Corte",             price: 13 },
    { name: "Corte con cejas",   price: 15 },
    { name: "Corte con barba",   price: 18 },
    { name: "Corte Vip",         price: 25 },
    { name: "Barba",             price: 8  },
    { name: "Barba VIP",         price: 11 },
    { name: "Cejas",             price: 5  },
    { name: "Mechas",            price: 30 },
    { name: "Tinte",             price: 30 },
    { name: "Trenzas",           price: 20 },
    { name: "Mask Carbon",       price: 3  },
    { name: "Limpieza Facial",   price: 15 },
    { name: "Diseno",            price: 3  },
    { name: "Lavado de Cabello", price: 2  },
    { name: "Otros",             price: 0  },
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

    try {
        await addProduct({ ...data, phone: String(data.phone) })
        return redirect("/")
    } catch (error: any) {
        console.error("Error saving sale:", error)
        const msg = error?.response?.data?.message
            || error?.message
            || "Error al guardar la venta. Revisa la conexion con el servidor."
        return msg
    }
}

export default function NewService() {
    const error          = useActionData() as string
    const [searchParams] = useSearchParams()
    const fileInputRef   = useRef<HTMLInputElement>(null)

    const [barbers, setBarbers] = useState<Barber[]>(() => {
        try {
            const saved = localStorage.getItem("barberos_barber")
            if (!saved) return INITIAL_BARBERS
            const parsed = JSON.parse(saved)
            if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_BARBERS
            if (typeof parsed[0] === "string") {
                localStorage.removeItem("barberos_barber")
                return INITIAL_BARBERS
            }
            // Support both old {id, nombre} and new {id, name} formats
            const normalized = parsed.map((b: any) => ({
                id:   b.id,
                name: b.name ?? b.nombre ?? "?"
            }))
            if (!normalized[0]?.id || !normalized[0]?.name) {
                localStorage.removeItem("barberos_barber")
                return INITIAL_BARBERS
            }
            const ids      = normalized.map((b: Barber) => b.id)
            const missing  = INITIAL_BARBERS.filter(b => !ids.includes(b.id))
            return [...normalized, ...missing]
        } catch {
            localStorage.removeItem("barberos_barber")
            return INITIAL_BARBERS
        }
    })

    const [services, setServices] = useState<Service[]>(() => {
        try {
            const saved = localStorage.getItem("servicios_barber")
            if (!saved) return INITIAL_SERVICES
            const parsed = JSON.parse(saved)
            if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_SERVICES
            // Support both old {nombre, precio} and new {name, price} formats
            return parsed.map((s: any) => ({
                name:  s.name  ?? s.nombre ?? "?",
                price: s.price ?? s.precio ?? 0,
            }))
        } catch {
            return INITIAL_SERVICES
        }
    })

    const [photos, setPhotos] = useState<Record<string, string>>(() =>
        loadLocal("fotos_barberos", {})
    )

    const [selectedBarber,  setSelectedBarber]  = useState("")
    const [selectedService, setSelectedService] = useState(searchParams.get("service") || "")
    const [price,           setPrice]           = useState<number | string>("")

    const [showModal,      setShowModal]      = useState(false)
    const [modalTab,       setModalTab]       = useState<"barbers" | "services">("barbers")
    const [editingId,      setEditingId]      = useState<string | null>(null)
    const [editNames,      setEditNames]      = useState<Record<string, string>>({})
    const [editPrices,     setEditPrices]     = useState<Record<string, string>>({})
    const [newBarberName,  setNewBarberName]  = useState("")
    const [newService,     setNewService]     = useState({ name: "", price: "" })
    const [confirmDelete,  setConfirmDelete]  = useState<string | null>(null)

    useEffect(() => {
        const s = services.find(s => s.name === selectedService)
        if (s) setPrice(s.price)
    }, [selectedService, services])

    useEffect(() => {
        if (showModal) {
            const n: Record<string, string> = {}
            barbers.forEach(b => { n[b.id] = b.name })
            setEditNames(n)
            const p: Record<string, string> = {}
            services.forEach(s => { p[s.name] = String(s.price) })
            setEditPrices(p)
            setConfirmDelete(null)
        }
    }, [showModal])

    const updateBarbers = (list: Barber[]) => {
        setBarbers(list)
        saveLocal("barberos_barber", list)
    }
    const updateServices = (list: Service[]) => {
        setServices(list)
        saveLocal("servicios_barber", list)
    }
    const updatePhotos = (updated: Record<string, string>) => {
        setPhotos(updated)
        saveLocal("fotos_barberos", updated)
    }

    const handleAddBarber = () => {
        if (!newBarberName.trim()) return
        const newBarber: Barber = { id: Date.now().toString(), name: newBarberName.trim() }
        updateBarbers([...barbers, newBarber])
        setNewBarberName("")
    }

    const handleDeleteBarber = (id: string) => {
        if (confirmDelete !== id) { setConfirmDelete(id); return }
        if (selectedBarber === barbers.find(b => b.id === id)?.name) setSelectedBarber("")
        const updatedPhotos = { ...photos }
        delete updatedPhotos[id]
        updatePhotos(updatedPhotos)
        updateBarbers(barbers.filter(b => b.id !== id))
        setConfirmDelete(null)
    }

    const handleSaveName = (id: string) => {
        const updated = editNames[id]?.trim()
        if (!updated) return
        updateBarbers(barbers.map(b => b.id === id ? { ...b, name: updated } : b))
    }

    const handleChangePhoto = (id: string, file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            updatePhotos({ ...photos, [id]: base64 })
        }
        reader.readAsDataURL(file)
    }

    const handleAddService = () => {
        const { name, price } = newService
        if (!name.trim() || price === "") return
        updateServices([...services, { name: name.trim(), price: Number(price) }])
        setNewService({ name: "", price: "" })
    }

    const handleDeleteService = (name: string) => {
        if (confirmDelete !== name) { setConfirmDelete(name); return }
        updateServices(services.filter(s => s.name !== name))
        setConfirmDelete(null)
    }

    const handleSavePrice = (name: string) => {
        const updated = Number(editPrices[name])
        if (isNaN(updated)) return
        updateServices(services.map(s => s.name === name ? { ...s, price: updated } : s))
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
                        <h3 className="text-amber-500 font-black text-lg">Gestionar</h3>
                        <button onClick={() => setShowModal(false)}
                            className="text-zinc-500 hover:text-white w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">X</button>
                    </div>

                    <div className="flex gap-2 mb-5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                        {(["barbers", "services"] as const).map(tab => (
                            <button key={tab}
                                onClick={() => { setModalTab(tab); setConfirmDelete(null) }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all
                                    ${modalTab === tab ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}>
                                {tab === "barbers" ? "Barberos" : "Servicios"}
                            </button>
                        ))}
                    </div>

                    {modalTab === "barbers" && (
                        <div className="space-y-3">
                            {barbers.map(b => (
                                <div key={b.id}
                                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                    <div className="relative cursor-pointer flex-shrink-0"
                                        onClick={() => { setEditingId(b.id); fileInputRef.current?.click() }}>
                                        {photos[b.id]
                                            ? <img src={photos[b.id]} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700" />
                                            : <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl font-black text-amber-500">
                                                {b.name?.[0]?.toUpperCase() ?? "?"}
                                              </div>
                                        }
                                        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-black">E</span>
                                    </div>
                                    <input type="text"
                                        value={editNames[b.id] ?? b.name}
                                        onChange={e => setEditNames(p => ({ ...p, [b.id]: e.target.value }))}
                                        onBlur={() => handleSaveName(b.id)}
                                        className="flex-1 bg-zinc-800 text-white text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                    <button onClick={() => handleDeleteBarber(b.id)}
                                        className={`flex-shrink-0 px-3 h-8 rounded-full border flex items-center justify-center transition-all text-xs font-bold
                                            ${confirmDelete === b.id
                                                ? "bg-red-500 border-red-500 text-white animate-pulse"
                                                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"}`}>
                                        {confirmDelete === b.id ? "Sure?" : "Del"}
                                    </button>
                                </div>
                            ))}

                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file && editingId) handleChangePhoto(editingId, file)
                                    e.target.value = ""
                                }} />

                            <div className="border-t border-zinc-800 pt-4">
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">New barber</p>
                                <div className="flex gap-2">
                                    <input type="text" value={newBarberName}
                                        onChange={e => setNewBarberName(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddBarber() } }}
                                        placeholder="Name..."
                                        className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                    <button onClick={handleAddBarber}
                                        disabled={!newBarberName.trim()}
                                        className="bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black px-5 rounded-xl text-lg">+</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalTab === "services" && (
                        <div className="space-y-2">
                            {services.map(s => (
                                <div key={s.name}
                                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                    <span className="flex-1 text-white text-sm font-bold truncate">{s.name}</span>
                                    <input type="number"
                                        value={editPrices[s.name] ?? String(s.price)}
                                        onChange={e => setEditPrices(p => ({ ...p, [s.name]: e.target.value }))}
                                        onBlur={() => handleSavePrice(s.name)}
                                        className="w-16 bg-zinc-800 text-amber-500 text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-center font-black" />
                                    <span className="text-zinc-500 text-xs font-bold">€</span>
                                    <button onClick={() => handleDeleteService(s.name)}
                                        className={`flex-shrink-0 px-3 h-8 rounded-full border flex items-center justify-center transition-all text-xs font-bold
                                            ${confirmDelete === s.name
                                                ? "bg-red-500 border-red-500 text-white animate-pulse"
                                                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"}`}>
                                        {confirmDelete === s.name ? "Sure?" : "Del"}
                                    </button>
                                </div>
                            ))}

                            <div className="border-t border-zinc-800 pt-4">
                                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">New service</p>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={newService.name}
                                        onChange={e => setNewService(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Name..."
                                        className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                                    <input type="number" value={newService.price}
                                        onChange={e => setNewService(p => ({ ...p, price: e.target.value }))}
                                        placeholder="€"
                                        className="w-20 bg-zinc-900 text-amber-500 text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-center font-black" />
                                </div>
                                <button onClick={handleAddService}
                                    disabled={!newService.name.trim() || newService.price === ""}
                                    className="w-full bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black py-3 rounded-xl text-sm uppercase">
                                    + Add service
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
                    Gestionar
                </button>
            </div>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-5">

                <div className="space-y-2">
                    <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Barbero</label>
                    <div className="flex gap-3 flex-wrap">
                        {barbers.map(b => (
                            <div key={b.id} onClick={() => setSelectedBarber(b.name)}
                                className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200
                                    ${selectedBarber === b.name ? "scale-105" : "opacity-60 hover:opacity-90"}`}>
                                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors
                                    ${selectedBarber === b.name ? "border-amber-500" : "border-zinc-700"}`}>
                                    {photos[b.id]
                                        ? <img src={photos[b.id]} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-black text-amber-500">
                                            {b.name?.[0]?.toUpperCase() ?? "?"}
                                          </div>
                                    }
                                </div>
                                <span className={`text-[10px] font-black transition-colors
                                    ${selectedBarber === b.name ? "text-amber-500" : "text-zinc-500"}`}>
                                    {b.name}
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
                            {services.map(s => (
                                <option key={s.name} value={s.name}>{s.name}</option>
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
                        <label className="text-amber-500 text-[10px] font-black uppercase ml-1">Telefono</label>
                        <input name="phone" type="number"
                            defaultValue={searchParams.get("phone") || ""}
                            className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500" />
                    </div>
                </div>

                <button type="submit"
                    className="mt-4 bg-amber-600 hover:bg-amber-500 p-4 text-black font-black rounded-xl uppercase transition-all shadow-lg shadow-amber-900/20 active:scale-95">
                    Confirmar y Registrar Pago
                </button>

                <Link to="/" className="text-center text-zinc-500 text-xs font-bold hover:text-white uppercase">
                    Volver al inicio
                </Link>
            </Form>
        </motion.div>
        </>
    )
}