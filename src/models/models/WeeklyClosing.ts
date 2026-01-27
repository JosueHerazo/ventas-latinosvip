import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'weekly_closings'
})
class WeeklyClosing extends Model {
    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    declare barber: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false
    })
    declare totalGross: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false
    })
    declare commission: number; // El 50%

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare servicesCount: number;

    @Column({
        type: DataType.TEXT, // Guardamos los IDs como '1,2,5,10'
        allowNull: false
    })
    declare archivedServiceIds: string;
}

export default WeeklyClosing;