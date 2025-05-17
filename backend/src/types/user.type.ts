import { ObjectId, Types } from "mongoose";

export interface IUser {
    username: string;
    email: string;
    password: string;
}

export interface UserResponse {
    _id: Types.ObjectId;
    email: string;
    username: string;
}
