// models/Barbero.models.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'barberos' })
class Barbero extends Model {
    @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
    declare nombre: string

    @Column({ type: DataType.STRING(200), allowNull: true })
    declare foto: string // URL de Cloudinary si quieres foto
}

export default Barbero