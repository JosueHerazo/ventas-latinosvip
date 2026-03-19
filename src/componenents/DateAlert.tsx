import { useEffect, useRef, useState, useCallback } from "react";
import { getDatesList } from "../services/serviceDate";
import { toast } from "react-toastify";

// Sonido generado por Web Audio API — sin depender de archivo externo
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Nota 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.value = 880;
        gain1.gain.setValueAtTime(0.3, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);

        // Nota 2 — tono más alto después
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime + 0.2);
        osc2.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.warn("Audio no disponible:", e);
    }
};

export function useCitaAlert() {
    const [pendientesCount, setPendientesCount] = useState(0);
    const lastCount = useRef<number | null>(null);

    const checkNewDates = useCallback(async () => {
        try {
            const dates = await getDatesList();
            // Citas pendientes = las que NO están pagadas
            const pendientes = dates.filter(c => !c.isPaid).length;
            setPendientesCount(pendientes);

            // Primera carga — solo guardar, no alertar
            if (lastCount.current === null) {
                lastCount.current = pendientes;
                return;
            }

            // Nueva cita detectada
            if (pendientes > lastCount.current) {
                const nuevas = pendientes - lastCount.current;

                // Sonido
                playNotificationSound();

                // Toast con estilo — icon como JSX (type-safe)
                toast.info(
                    `💈 \( {nuevas > 1 ? ` \){nuevas} NUEVAS CITAS` : "¡NUEVA CITA RECIBIDA!"}`,
                    {
                        position: "top-right",
                        autoClose: 5000,
                        style: {
                            background: '#18181b',
                            border: '1px solid #d97706',
                            color: '#fff',
                            fontWeight: 'bold',
                            borderRadius: '1rem'
                        },
                        icon: <span>🔥</span>   // ← Cambio clave aquí
                    }
                );
            }

            lastCount.current = pendientes;
        } catch (error) {
            console.error("Error en useCitaAlert:", error);
        }
    }, []);

    useEffect(() => {
        checkNewDates();
        const interval = setInterval(checkNewDates, 30000);
        return () => clearInterval(interval);
    }, [checkNewDates]);

    return pendientesCount;
}