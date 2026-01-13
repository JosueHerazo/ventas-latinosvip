import {Request, Response, NextFunction} from "express"
import {validationResult} from "express-validator"

export const handlerInputErrors = (req: Request, res: Response, next: NextFunction) => {

        //validation
        let errors = validationResult(req)
         
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        next()
        
}