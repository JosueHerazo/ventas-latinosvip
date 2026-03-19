import { createBrowserRouter } from "react-router-dom"
import Layout from "./layouts/Layout"
import NewService, { action as newServiceAction } from "./pages/NewService"
import Service, { loader as servicesLoader } from "./pages/Services"
import EditService, { loader as editServiceLoader, action as editServiceAction } from "./pages/EditProduct"
import { action as DeleteServiceAction } from "./componenents/ServiceDetail"
import BarberSummary, { loader as barberPagoLoader } from "./pages/BarberSummary"
import BarberServices, { loader as barberServicesLoader } from "./pages/BarberServices"
import SearchClients, { loader as searchClintsLoader } from "./pages/SearchClients"
import DatesList, { loader as DateListLoader } from "./pages/DateClient"
import VentasTotales, { loader as ventasTotalesLoader } from "./pages/VentasTotales"
import BarberHistory, { loader as barberHistoryLoader } from "./componenents/BarberHistory"
import EditDate, { loader as editDateLoader, action as editDateAction } from "./pages/EditDate"
import BarberMonitor, { loader as monitorLoader } from "./componenents/BarberMonitor"
import BarberStats, { loader as barberStatsLoader } from "./pages/BarberStats"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        hydrateFallbackElement: <div>Cargando...</div>,
        children: [
            { 
                index: true, 
                element: <Service />, 
                loader: servicesLoader 
            },
            { 
                path: "nuevo/servicio", 
                element: <NewService />, 
                action: newServiceAction 
            },
            {
                path: "servicios/:id/editar",
                element: <EditService />,
                action: editServiceAction,
                loader: editServiceLoader
            },
            {
                path: "servicios/:id/eliminar",
                action: DeleteServiceAction
            },
            {
                path: "pago/barberos",
                element: <BarberSummary />,
                loader: barberPagoLoader
            },
            // ✅ Una sola ruta para semana actual — sin duplicados
            {
                path: "barberos/:barber",
                element: <BarberServices />,
                loader: barberServicesLoader,
            },
            {
                path: "buscar/clientes",
                element: <SearchClients />,
                loader: searchClintsLoader,
            },
            {
                path: "lista/citas",
                element: <DatesList />,
                loader: DateListLoader,
            },
            // ✅ Historial por barbero — con loader
            {
                path: "admin/historial/:barber",
                element: <BarberHistory />,
                loader: barberHistoryLoader,
            },
            // ✅ Ventas totales mensuales — con loader
            {
                path: "admin/ventas-totales",
                element: <VentasTotales />,
                loader: ventasTotalesLoader,
            },
            // ✅ Estadísticas generales — con loader
            {
                path: "admin/estadisticas",
                element: <BarberStats />,
                loader: barberStatsLoader,
            },
            {
                path: "admin/citas/editar/:id",
                element: <EditDate />,
                loader: editDateLoader,
                action: editDateAction
            },
            // ✅ Monitor — con loader
            {
                path: "admin/monitor",
                element: <BarberMonitor />,
                loader: monitorLoader,
            }
        ]
    }
])

export default router