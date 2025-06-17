import { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
    const data = {
        path: req.path,
        url: req.url,
        body: req.body,
        parmas: req.params,
        date: Date(),
    };
    console.dir(data, {
        depth: "Infinity",
    });
    next();
};

export default logger;
