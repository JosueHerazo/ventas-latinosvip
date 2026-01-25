import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Date from './DateList.models';
import Service from './service.model';

@Table({
    tableName: 'clients'
})
class Client extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    declare name: string;

    @Column({
        type: DataType.INTEGER(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    })
    declare password: number;
    @Column({
        type: DataType.STRING(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    })
    declare email: string;
    @Column({
        type: DataType.INTEGER(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    })
    declare phone: number;
    @Column({
        type: DataType.BOOLEAN(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    })
    declare terms: boolean;

    // Relación: Un cliente puede tener muchos servicios registrados
    @HasMany(() => Service)
    declare services: Service[];
}

export default Client;