import { useLoaderData, Link } from "react-router-dom"
import { useState, useMemo } from "react"
import { getServices, createClientFromContact } from "../services/ServiceService" 
import { type Service } from "../types"

export async function loader() {
    const services = await getServices()
    return services || []
}

export default function SearchClients() {
    const services = useLoaderData() as Service[]
    const [query, setQuery] = useState("")
    const [isImporting, setIsImporting] = useState(false)

    const baseUrl = "https://latinosvip.netlify.app/"

    // REPARACIÓN: Definimos la función que faltaba
    const enviarWhatsApp = (cliente: string, telefono: string) => {
        const msj = `¡Hola ${cliente}! 💈 Te escribimos de la barbería LatinosVIP. ¿Deseas agendar una nueva cita? Reserva aquí: ${baseUrl}`;
        // Limpiamos el teléfono de espacios o símbolos
        const telLimpio = String(telefono).replace(/\D/g, '');
        window.open(`https://wa.me/${telLimpio}?text=${encodeURIComponent(msj)}`, '_blank');
    };

    const importarContactos = async () => {
        const props = ['name', 'tel'];
        const opts = { multiple: true };

        try {
            // @ts-ignore
            const contacts = await navigator.contacts.select(props, opts);
            
            if (contacts.length) {
                setIsImporting(true);
                const promesas = contacts.map(async (c: any) => {
                    if (c.name?.[0] && c.tel?.[0]) {
                        return await createClientFromContact({
                            client: c.name[0],
                            phone: c.tel[0]
                        });
                    }
                });

                await Promise.all(promesas);
                alert(`¡Éxito! ${contacts.length} clientes guardados.`);
                window.location.reload(); 
            }
        } catch (ex) {
            alert("Error al importar o acción cancelada.");
        } finally {
            setIsImporting(false);
        }
    };

    const filteredResults = useMemo(() => {
        // Obtenemos clientes únicos de la base de datos por teléfono para no repetir
        const uniqueClientsDB = Array.from(
            new Map(services.map(s => [s.phone, s])).values()
        );

        if (!query.trim()) return uniqueClientsDB;

        return uniqueClientsDB.filter(service => 
            service.client?.toLowerCase().includes(query.toLowerCase()) || 
            service.phone?.toString().includes(query)
        );
    }, [query, services]);

    return (
        <div className="max-w-4xl mx-auto p-5">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-amber-500 uppercase italic">
                        Agenda <span className="text-white">Clientes</span>
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Total en base de datos: {services.length}
                    </p>
                </div>
                
                <button 
                    onClick={importarContactos}
                    disabled={isImporting}
                    className={`${isImporting ? 'bg-zinc-600' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase`}
                >
                    <span>{isImporting ? '⌛ Guardando...' : '📱 Importar Contactos'}</span>
                </button>
            </header>
            
            <div className="mb-8">
                <input 
                    type="text" 
                    placeholder="Buscar cliente guardado..."
                    className="w-full p-5 rounded-2xl bg-zinc-900 text-white border-2 border-zinc-800 focus:border-amber-500 focus:outline-none transition-all shadow-xl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filteredResults.length > 0 ? (
                    filteredResults.map(client => (
                        <div key={client.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex justify-between items-center hover:border-zinc-700 transition-all">
                            <div>
                                <h4 className="text-white font-black uppercase text-lg">{client.client}</h4>
                                <p className="text-zinc-500 text-sm font-medium">{client.phone}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => enviarWhatsApp(client.client, String(client.phone))}
                                    className="bg-green-600/10 text-green-500 p-3 rounded-2xl border border-green-600/20 hover:bg-green-600 hover:text-white transition-all"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.826c1.554.921 3.193 1.408 4.874 1.408 5.178 0 9.397-4.22 9.399-9.399.001-2.51-.978-4.87-2.757-6.648-1.779-1.778-4.139-2.758-6.649-2.758-5.18 0-9.401 4.221-9.403 9.4-.001 1.765.49 3.482 1.42 5.01l-.991 3.616 3.707-.973zm10.12-6.852c-.273-.137-1.616-.797-1.867-.889-.251-.09-.433-.136-.615.137-.182.273-.706.89-.865 1.072-.16.182-.319.205-.592.068-.273-.137-1.153-.425-2.196-1.355-.811-.723-1.358-1.617-1.517-1.891-.16-.273-.017-.421.119-.557.123-.122.273-.319.41-.478.137-.16.182-.273.273-.455.09-.182.046-.341-.023-.478-.069-.137-.615-1.481-.843-2.027-.221-.532-.443-.459-.615-.468-.159-.008-.341-.01-.523-.01s-.478.068-.729.341c-.251.273-.956.934-.956 2.278 0 1.344.979 2.641 1.115 2.824.137.182 1.928 2.944 4.672 4.129.653.282 1.163.451 1.56.578.655.209 1.25.18 1.72.11.524-.077 1.616-.661 1.844-1.298.228-.638.228-1.185.16-1.298-.069-.114-.251-.182-.524-.319z"/></svg>
                                </button>
                                <Link 
                                    to={`/nuevo/servicio?client=${encodeURIComponent(client.client)}&phone=${client.phone}`}
                                    className="bg-amber-500 text-black px-4 py-2 rounded-2xl font-black text-[10px] flex items-center hover:bg-white transition-all uppercase"
                                >
                                    Agendar
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-zinc-600 font-bold uppercase italic">
                        No hay clientes guardados.
                    </div>
                )}
            </div>
        </div>
    )
}