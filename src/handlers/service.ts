import { Request, Response } from 'express'
import Service from '../models/service.model'
import Client from '../models/Clients.models'
import WeeklyClosing from '../models/models/WeeklyClosing'

export const getProducts = async (req: Request, res: Response) => {

    try {
        const service = await Service.findAll({
            order: [
                ["createdAt", "DESC"]
            ],
            attributes: {exclude: ["updatedAt", ]}, 
            include: [Client]
        })
        
        res.json({data:service})
    } catch (error) {
        console.log(error);
        
    }

}

export const createProduct = async  (req: Request, res: Response) =>{
    
    try {
        const service = await Service.create(req.body)
        res.json({data: service})
        
    } catch (error) {   
        console.log(error);
        
        
    }
}

export const getProductById = async (req:Request, res: Response) => {
    try {
        const {id} = req.params
        const service = await Service.findByPk(id)
       
        if(!service) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            })
        }
        // siempre hay que responder la data 
        res.json({data: service})
    } catch (error) {
        console.log(error);
        
    }
    
}


export const UpdateProduct = async (req:Request, res:Response) => {
       try {
        // primero se busca el ID del producto o el mismo producto
        const {id} = req.params
        // const id = req.params.id
        
        // luego se busca el peoducto por id
        const date = await Service.findByPk(id)
    //    super importante validar que haya producto
    if(!date) {
        return res.status(404).json({
            error: "Producto No Encontrado"
        })
        //Actulizar
    }
    // el producto que esta en el body o en el formulario lo actuliza con este codigo  y luego

    // put reemplza el elemento con lo que le envies, si no usa el update a diferencia de patch
    await date.update(req.body)
    // se guarda el dateo actualizado
    await date.save()
        res.json({data: date})


    } catch (error) {
        console.log(error);
        
    }
}

export const updateAvailability = async  (req: Request, res: Response)=> 
    {
     try {
        // primero se busca el ID del producto o el mismo producto
        const {id} = req.params
        // const id = req.params.id
        
        // luego se busca el peoducto por id
        const date = await Service.findByPk(id)
    //    super importante validar que haya producto
    if(!date) {
        return res.status(404).json({
            error: "Producto No Encontrado"
        })
        //Actulizar
    }
    // el producto que esta en el body o en el formulario lo actuliza con este codigo  y luego
    // este codigo toma la informacion del body pero queremos que sea mas sencillo entonces se usa el datavalue
    //  product.availability = req.body.availability
    // el data value toma el objeto y se toma una parte del objeto  en este caso se toma lo contrario del objeto es decir si es true que lo envie como false 
    //  product.availability = !product.dataValues.availability
    // se guarda el producto actualizado
    await date.save()
console.log();

        
        res.json({data: date})


    } catch (error) {
        console.log(error);
        
    }

}

export const deleteProduct = async (req: Request, res: Response) => {

     try {
        const {id} = req.params
        const date = await Service.findByPk(id)
        
        if(!date) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            })
        }
        await date.destroy()
        // siempre hay que responder la data 
        res.json({data: "Product Eliminado"})
    } catch (error) {
        console.log(error);
        
    }

}
export const archivarSemana = async (req : Request, res : Response) => {
    const { barbero, totalBruto, comision50, serviciosArchivados } = req.body;

    // 1. Guardar el resumen histórico
    await WeeklyClosing.create({
        barber: barbero,
        totalGross: totalBruto,
        commission: comision50,
        servicesCount: serviciosArchivados.length,
        archivedServiceIds: serviciosArchivados.join(',')
    });

    // 2. Marcar servicios como pagados para que "desaparezcan" del resumen actual
    await Service.update({ isPaid: true }, {
        where: { id: serviciosArchivados }
    });

    res.json({ msg: "Cierre completado con éxito" });
}

// En tu controlador de servicios (ej. getServices)
export const getActiveServices = async (req : Request, res : Response   ) => {
    const services = await Service.findAll({
        where: {
            isPaid: false // <--- CLAVE: Solo traemos lo que NO se ha pagado aún
        },
        order: [['createdAt', 'DESC']]
    });
    res.json(services);
};




// // // export const getProduct = async (req: Request, res:Response) =>{
// // //     const products = Product.findAll(req.body)
// // //     res.json(products)
    

// // //     res.json("Desde GET products")
// // // 

// src/handlers/date.ts