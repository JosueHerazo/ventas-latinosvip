import { safeParse } from "valibot"
import axios from "axios"
import { DraftServiceSchema, ServiceSchema, ServicesSchema, type Service } from "../types"

type serviceData = {
    [k: string]: FormDataEntryValue;
}

export async function addProduct(data: serviceData) {
    try {
        const result = safeParse(DraftServiceSchema, {
            barber: data.barber,
            service: data.service,
            client: data.client,
            phone: data.phone,
            price: Number(data.price),
        })

        if (result.success) {
            const url = `${import.meta.env.VITE_API_URL}/api/service`
            await axios.post(url, {
                barber: result.output.barber,
                service: result.output.service,
                client: result.output.client,
                phone: result.output.phone,
                price: +result.output.price,
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export async function getServices() {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service`
        const { data } = await axios(url, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })

        const cleanData = data.data.map((s: any) => ({
            ...s,
            client: typeof s.client === 'object' && s.client !== null ? s.client.name : s.client,
            price: Number(s.price),
            // ✅ Normalizar isPaid a boolean aquí, una sola vez para todos los componentes
            isPaid: s.isPaid === true || s.isPaid === 1 ||
                    s.isPaid === "1" || s.isPaid === "true",
            isArchived: s.isArchived === true || s.isArchived === 1 ||
                        s.isArchived === "1" || s.isArchived === "true",
        }))

        const result = safeParse(ServicesSchema, cleanData)

        if (result.success) {
            return result.output
        } else {
            console.error("VALIBOT FALLÓ:", result.issues)
            return cleanData as Service[]
        }
    } catch (error) {
        console.error("Error al obtener servicios", error)
        return []
    }
}

export async function getServiceById(id: Service["id"]) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
        const { data } = await axios(url)
        const result = safeParse(ServiceSchema, data.data)
        if (result.success) {
            return result.output
        } else {
            console.warn("VALIBOT FALLÓ EN getServiceById:", result.issues)
            return data.data as Service
        }
    } catch (error) {
        console.log(error)
    }
}

export async function updateService(data: serviceData, id: Service["id"]) {
    try {
        const result = safeParse(DraftServiceSchema, {
            service: data.service,
            price: Number(data.price),
            barber: data.barber,
            client: data.client,
            phone: data.phone,
        })
        if (result.success) {
            const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
            await axios.put(url, result.output)
        } else {
            console.error("Error validando datos antes de actualizar:", result.issues)
        }
    } catch (error) {
        console.log(error)
    }
}

export async function deleteService(id: Service["id"]) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
        await axios.delete(url)
    } catch (error) {
        console.log(error)
    }
}

// ✅ FIX: apunta a /:id/pay — ruta dedicada para marcar como pagado
export async function registrarCobro(ventaData: Service) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/${ventaData.id}/pay`
        await axios.patch(url)
        return { success: true }
    } catch (error) {
        console.error("Error al liquidar:", error)
        throw error
    }
}

// ✅ FIX: era /api/cierres → ahora /api/service/cierres
export async function archivarSemana(cierreData: any) {
    const url = `${import.meta.env.VITE_API_URL}/api/service/cierres`
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(cierreData),
        headers: { 'Content-Type': 'application/json' }
    })
    return await response.json()
}

export async function actualizarEstadoCita(id: number) {
    const url = `${import.meta.env.VITE_API_URL}/api/service/${id}/pay`
    await axios.patch(url)
}

export async function deleteDate(id: number) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
        await axios.delete(url)
    } catch (error) {
        console.error("Error al eliminar cita:", error)
    }
}

export async function updateDate(data: any, id: number) {
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/dates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.log(error)
    }
}

export async function createClientFromContact(contactData: { client: string, phone: string }) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/`
        const response = await axios.post(url, {
            client: contactData.client,
            phone: String(contactData.phone).replace(/\D/g, ''),
            barber: "SISTEMA",
            service: "CLIENTE_REGISTRADO",
            price: 0
        })
        return response.data
    } catch (error) {
        console.error("Error al guardar contacto:", error)
        return null
    }
}