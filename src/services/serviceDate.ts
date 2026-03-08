import axios from "axios"
import { safeParse } from "valibot"
import { DatesSchema, type DateList } from "../types"

const API = import.meta.env.VITE_API_URL

// ✅ Obtener todas las citas
export async function getDatesList(): Promise<DateList[]> {
    try {
        const { data } = await axios.get(`${API}/api/date`)
        const result = safeParse(DatesSchema, data.data)
        return result.success ? result.output : (data.data as DateList[])
    } catch (error) {
        console.error("Error al obtener citas:", error)
        return []
    }
}

// ✅ Eliminar cita — usa /api/date NO /api/service
export async function deleteDate(id: number): Promise<void> {
    try {
        await axios.delete(`${API}/api/date/${id}`)
    } catch (error) {
        console.error("Error al eliminar cita:", error)
        throw error
    }
}

// ✅ Actualizar cita completa
export async function updateDate(id: number, data: any): Promise<void> {
    try {
        await axios.put(`${API}/api/date/${id}`, data)
    } catch (error) {
        console.error("Error al actualizar cita:", error)
        throw error
    }
}

// ✅ Registrar cobro — crea venta en /api/service Y marca cita pagada en /api/date
export async function registrarCobro(ventaData: DateList): Promise<{ success: boolean }> {
    try {
        // 1. Crear la venta con isPaid: true desde el inicio
        await axios.post(`${API}/api/service`, {
            barber: ventaData.barber,
            service: ventaData.service,
            client: ventaData.client,
            phone: String(ventaData.phone ?? ""),
            price: Number(ventaData.price),
            isPaid: true  // ✅ FIX PRINCIPAL
        })

        // 2. Marcar la cita como pagada en /api/date
        await axios.patch(`${API}/api/date/${ventaData.id}`)

        return { success: true }
    } catch (error) {
        console.error("Error en registrarCobro:", error)
        throw error
    }
}