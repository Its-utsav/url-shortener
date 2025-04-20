import { ObjectId } from "mongoose";

export interface IncomeingUrlData {
    originalUrl: string;
    description: string;
    isPasswordProtected?: boolean;
    password?: string;
}

export interface fullDataForShortUrlCreation extends IncomeingUrlData {
    createdBy: ObjectId;
}

export interface IShortUrl {
    shortUrl?: string;
}
