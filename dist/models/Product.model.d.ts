import { Model } from 'sequelize-typescript';
import Client from './Clients.models';
declare class Service extends Model {
    service: string;
    price: number;
    barber: string;
    client: string;
    phone: string;
    clientId: number;
    clientData: Client;
}
export default Service;
