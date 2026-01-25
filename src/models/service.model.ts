import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Client from './Clients.models';

@Table({
    tableName: 'services'
})
class Service extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    declare service: string;

    @Column({
        type: DataType.FLOAT(), // O DECIMAL(10,2) para dinero
        allowNull: false
    })
    declare price: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    declare barber: string;

   
    // -----------------------

    // Mantenemos estas columnas si las usas directamente en el form 
    // aunque lo ideal es que vengan de la relación con Client
    @Column({
        type: DataType.STRING(100)
    })
    declare client: string;

    @Column({
        type: DataType.BIGINT() // Use BIGINT because phone numbers exceed standard INTEGER limits
    })
    declare phone: number
    @ForeignKey(() => Client)
    
    @Column({
        type: DataType.INTEGER(),
        allowNull: true // Permite servicios sin cliente si fuera necesario
    })
    declare clientId: number;
    
    @BelongsTo(() => Client)
    declare clientData: Client;
}
// --- CORRECCIÓN AQUÍ ---

export default Service;