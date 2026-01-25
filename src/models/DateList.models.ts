import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Client from './Clients.models';

@Table({
    tableName: 'dates'
})
class DateList extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    declare service: string;

    @Column({
        type: DataType.INTEGER(), // O DECIMAL(10,2) para dinero
        allowNull: false
    })
    declare price: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    declare barber: string;
    
    
   @Column({
        type: DataType.DATE(),
       
    })
    declare dateList: Date;
    
   @Column({
        type: DataType.STRING()
    })
    declare client: string;
    
   @Column({
        type: DataType.BIGINT()
    })
    declare phone: number;
    
    // --- AGREGA ESTO PARA ARREGLAR EL ERROR ---
    @ForeignKey(() => Client)
    @Column({
        type: DataType.INTEGER
    })
    declare clientId: number;
    
    @BelongsTo(() => Client)
    declare clientName: Client;
    
    
}
// --- CORRECCIÓN AQUÍ ---

export default DateList;