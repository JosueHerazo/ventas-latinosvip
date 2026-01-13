import {Table, Column, Model, DataType, Default} from "sequelize-typescript"

@Table({
    tableName: "services",
    timestamps: true
})

class Service extends Model{
    @Column({
        type: DataType.STRING(100)
    })
    declare service: string
    
    @Column({
        type: DataType.FLOAT(2,2) 
    })
    declare price: number
    
    @Column({
        type: DataType.STRING(100)
    })
    declare barber: string
    @Column({
        type: DataType.STRING(100)
    })
    declare client: string
    @Column({
        type: DataType.INTEGER() 
    })
    declare phone: number
    @Column({
        type: DataType.DATE() 
    })
    declare createdAt: Date
    // @Default(true)
    // @Column({
    //     type: DataType.BOOLEAN()
    // })
    // declare availability: boolean
}

export default Service