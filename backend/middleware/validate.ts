import type { NextFunction, Request , Response } from "express";
import { ZodType } from "zod";
export function validate (schema:ZodType){
    return (req:Request ,res:Response , next:NextFunction) : void =>{
       const result = schema.safeParse(req.body)
       console.log("hxdhfdgf",result)
       if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
      return;
    }

    req.body = result.data; // replaced with the parsed, trimmed, lowercased version
    next();

    }
}