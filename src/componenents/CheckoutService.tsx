import { useNavigate } from "react-router-dom";
import { registerPayment } from "../services/ServiceService";
import { formatCurrency } from "../utils";
import { type Service } from "../types";

type CheckoutServiceProps = {
    service: Service;
};

export default function CheckoutService({ service }: CheckoutServiceProps) {
    const navigate = useNavigate();

    const handlePayment = async () => {
        const confirmed = confirm(
            `Confirmar cobro de ${formatCurrency(service.price)} para ${service.client}?`
        );

        if (confirmed) {
            try {
                await registerPayment(service);
                alert("Cobro registrado con exito");
                navigate(0);
            } catch (error) {
                alert("Hubo un error al registrar el cobro");
            }
        }
    };

    return (
        <button
            onClick={handlePayment}
            className="bg-green-600 hover:bg-green-700 text-white font-black py-2 px-4 rounded-xl text-xs uppercase transition-colors shadow-lg shadow-green-900/20"
        >
            Cobrar Servicio
        </button>
    );
}