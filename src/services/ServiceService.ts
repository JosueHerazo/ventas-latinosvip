import { safeParse } from "valibot"
import axios from "axios"
import { DraftServiceSchema, ServiceSchema, ServicesSchema, type Service } from "../types"

type serviceData = {
    [k: string]: FormDataEntryValue;
}

export async function addProduct(data: serviceData) {
    const result = safeParse(DraftServiceSchema, {
        barber: data.barber,
        service: data.service,
        client: data.client,
        phone: data.phone,
        price: Number(data.price),
    })

    if (!result.success) {
        console.error("Validation failed:", result.issues)
        throw new Error("Invalid data: " + result.issues.map(i => i.message).join(", "))
    }

    const url = `${import.meta.env.VITE_API_URL}/api/service`
    await axios.post(url, {
        barber: result.output.barber,
        service: result.output.service,
        client: result.output.client,
        phone: result.output.phone,
        price: +result.output.price,
    })
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
            isPaid: s.isPaid === true || s.isPaid === 1 ||
                    s.isPaid === "1" || s.isPaid === "true",
            isArchived: s.isArchived === true || s.isArchived === 1 ||
                        s.isArchived === "1" || s.isArchived === "true",
        }))

        const result = safeParse(ServicesSchema, cleanData)

        if (result.success) {
            return result.output
        } else {
            console.error("VALIBOT ERROR:", result.issues)
            return cleanData as Service[]
        }
    } catch (error) {
        console.error("Error fetching services", error)
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
            console.warn("VALIBOT ERROR IN getServiceById:", result.issues)
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
            console.error("Error validating data before update:", result.issues)
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

export async function registerPayment(ventaData: Service) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/${ventaData.id}/pay`
        await axios.patch(url)
        return { success: true }
    } catch (error) {
        console.error("Error registering payment:", error)
        throw error
    }
}

export async function archiveWeek(closeData: any) {
    const url = `${import.meta.env.VITE_API_URL}/api/service/archivar-semana`;   // ← Ruta corregida

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(closeData),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`HTTP ${response.status}: ${errorText || 'Error desconocido'}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error completo en archiveWeek:", error);
        throw error;   // Para que el catch del componente lo atrape
    }
}

export async function updateAppointmentStatus(id: number) {
    const url = `${import.meta.env.VITE_API_URL}/api/service/${id}/pay`
    await axios.patch(url)
}

export async function deleteDate(id: number) {
    try {
        const url = `${import.meta.env.VITE_API_URL}/api/service/${id}`
        await axios.delete(url)
    } catch (error) {
        console.error("Error deleting appointment:", error)
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
        console.error("Error saving contact:", error)
        return null
    }
}