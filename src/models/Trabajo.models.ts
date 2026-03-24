import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'trabajos' })
class Trabajo extends Model {
    @Column({ type: DataType.STRING(200), allowNull: false })
    declare titulo: string

    @Column({ type: DataType.TEXT, allowNull: true })
    declare descripcion: string

    @Column({ type: DataType.STRING(50), allowNull: false })
    declare categoria: string  // "Cortes" | "Químicos" | "Estilo" | "Estética"

    @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'image' })
    declare tipo: string  // 'image' | 'video'

    @Column({ type: DataType.TEXT, allowNull: false })
    declare url: string  // URL de Cloudinary

    @Column({ type: DataType.STRING(200), allowNull: true })
    declare publicId: string  // Para poder borrar de Cloudinary

    @Column({ type: DataType.STRING(100), allowNull: true })
    declare barbero: string
}

export default Trabajo