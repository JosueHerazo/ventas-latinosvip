import { Model } from 'sequelize-typescript';
import Service from './service.model';
declare class Client extends Model {
    name: string;
    password: string;
    email: string;
    phone: number;
    terms: boolean;
    services: Service[];
}
export default Client;
