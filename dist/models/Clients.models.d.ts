import { Model } from 'sequelize-typescript';
import Service from './service.model';
declare class Client extends Model {
    name: string;
    password: number;
    email: string;
    phone: number;
    terms: boolean;
    services: Service[];
}
export default Client;
