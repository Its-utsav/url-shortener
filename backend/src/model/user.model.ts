import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { Document, model, Model, Schema, Types } from "mongoose";

export interface IUserMethods {
    checkPassword(userPassword: string): Promise<boolean>;
    generateAccessToken(): string | undefined;
    generateRefershToken(): string | undefined;
}
export interface IUserData {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    refreshToken: string;
    createdShortUrl: Types.ObjectId;
}
export interface UserDocument
    extends IUserData,
        Document<Types.ObjectId>,
        IUserMethods {}

const userSchema = new Schema<UserDocument, Model<UserDocument>, IUserMethods>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        createdShortUrl: {
            type: Schema.Types.ObjectId,
            ref: "Url",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre<UserDocument>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.methods.checkPassword = async function (
    userPassword: string
): Promise<boolean> {
    return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.generateRefershToken = function (): string | undefined {
    const key = process.env.REFERSHTOKEN_KEY;
    if (!key) {
        throw new Error("Refersh Token not available in ENV");
    }
    const expiresIn = (process.env.REFERSHTOKEN_EXPIRY! ||
        "30D") as SignOptions["expiresIn"];

    try {
        return jwt.sign(
            {
                _id: this._id,
            },
            key,
            {
                expiresIn,
            }
        );
    } catch (error) {
        console.error(`Error while genrating refersh token ${error}`);
        return undefined;
    }
};

userSchema.methods.generateAccessToken = function (): string | undefined {
    const key = process.env.ACCESSTOKEN_KEY;
    if (!key) {
        throw new Error("Refersh Token not available in ENV");
    }
    const expiresIn = (process.env.ACCESSTOKEN_EXPIRY! ||
        "30D") as SignOptions["expiresIn"];
    try {
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
            },
            key,
            {
                expiresIn,
            }
        );
    } catch (error) {
        console.error(`Error while genrating refersh token ${error}`);
        return undefined;
    }
};

const User: Model<UserDocument> = model("User", userSchema);

export default User;
