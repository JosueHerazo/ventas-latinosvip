import { Request, Response } from "express";
export declare const createWorks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getWorks: (req: Request, res: Response) => Promise<void>;
export declare const deleteWorks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
