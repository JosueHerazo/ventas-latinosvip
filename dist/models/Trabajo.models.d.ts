import { Model } from 'sequelize-typescript';
declare class Trabajo extends Model {
    titulo: string;
    descripcion: string;
    categoria: string;
    tipo: string;
    url: string;
    publicId: string;
    barbero: string;
}
export default Trabajo;
