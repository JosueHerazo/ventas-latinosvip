import {object, string, number, any, nullable, array, type InferOutput, boolean, optional  } from "valibot"

// draft de sales
export const DraftServiceSchema = object({
    service: string(),
    price: number(),
    barber: string(),
    client: string(),
    phone: nullable(string()),
    // createdAt: string()
})

// En types.ts
// types.ts
// En tu archivo de types/schemas
// types.ts
export const ServiceSchema = object({
    id: number(),
    service: string(),
    price: any(),
    barber: string(),
    client: string(), 
    phone: nullable(string()),
    createdAt: any(),
    isPaid: optional(nullable(any())), 
    isArchived: optional(nullable(any())), 
    updatedAt: optional(nullable(any())),
})



export const BarberSchema  = object({
    service: string(),
    price: number(),
    barber: string(),
    createdAt: string()
})
export const ClientSchema = object({
    clientId: number(),
    name: string(),
    phone: string(),
})
export const DraftDateSchema = object({
    service: string(),
    price: number(),
    barber: string(),
    client: string(),
    phone: string(),  // Cambia date() por any() para evitar el error de parseo
    dateList: string(),
    duration: number()// <-- AÑADE ESTO para que Valibot no rechace el formulario
         })
// schema de citas
export const DateSchema = object({
    id: number(),
    service: string(),
    price: number(),
    barber: string(),
    client: string(),   
    phone: nullable(string()),   
    createdAt: any(), // IMPORTANTE: Sequelize siempre lo envía
    updatedAt: any(), // IMPORTANTE: Sequelize siempre lo envía
    clientId: nullable(any()),     
    dateList: string(),
    isPaid: boolean(),
    // isArchived: boolean(),  // <--- Añadir esto

})
// Añade esto a tu archivo de types junto a ServiceSchema
export const WeeklyClosingSchema = object({
    id: number(),
    barber: string(),
    totalGross: any(), // any por el FLOAT de Sequelize
    commission: any(),
    servicesCount: number(),
    archivedServiceIds: string(),
    createdAt: any()
})

export const WeeklyClosingsSchema = array(WeeklyClosingSchema)

export type WeeklyClosing = InferOutput<typeof WeeklyClosingSchema>

export const DatesSchema = array(DateSchema)
export const ServicesSchema = array(ServiceSchema)


// export const  BarbersSummaryType = array(BarberSchema)


export type Client = InferOutput<typeof ClientSchema>
export type Service = InferOutput<typeof ServiceSchema>
export type DateList = InferOutput<typeof DateSchema>
