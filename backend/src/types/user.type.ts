import { ObjectId } from "mongoose";

export interface IUser {
    username: string;
    email: string;
    password: string;
}

export interface UserResponse {
    _id: ObjectId;
    email: string;
    username: string;
}
