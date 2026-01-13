import {Request, Response} from "express"
import Service from "../models/Product.model"
export const getProducts = async (req: Request, res: Response) => {

    try {
        const services = await Service.findAll({
            order: [
                ["createdAt", "DESC"]
            ],
            attributes: {exclude: ["updatedAt", ]}
        })
        
        res.json({data:services})
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
        const product = await Service.findByPk(id)
       
        if(!product) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            })
        }
        // siempre hay que responder la data 
        res.json({data: product})
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
        const product = await Service.findByPk(id)
    //    super importante validar que haya producto
    if(!product) {
        return res.status(404).json({
            error: "Producto No Encontrado"
        })
        //Actulizar
    }
    // el producto que esta en el body o en el formulario lo actuliza con este codigo  y luego

    // put reemplza el elemento con lo que le envies, si no usa el update a diferencia de patch
    await product.update(req.body)
    // se guarda el producto actualizado
    await product.save()
        res.json({data: product})


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
        const product = await Service.findByPk(id)
    //    super importante validar que haya producto
    if(!product) {
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
    await product.save()
console.log();

        
        res.json({data: product})


    } catch (error) {
        console.log(error);
        
    }

}

export const deleteProduct = async (req: Request, res: Response) => {

     try {
        const {id} = req.params
        const product = await Service.findByPk(id)
        
        if(!product) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            })
        }
        await product.destroy()
        // siempre hay que responder la data 
        res.json({data: "Product Eliminado"})
    } catch (error) {
        console.log(error);
        
    }

}






// export const getProduct = async (req: Request, res:Response) =>{
//     const products = Product.findAll(req.body)
//     res.json(products)
    

//     res.json("Desde GET products")
// }