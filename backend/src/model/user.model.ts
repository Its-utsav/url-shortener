import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document, model, Model, Schema, Types } from "mongoose";
import type { userData } from "../schema/user.schema";

export interface IUser extends Document, userData {
    checkPassword(userPassword: string): Promise<boolean>;
    generateAccessToken(): string | undefined;
    generateRefershToken(): string | undefined;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
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

userSchema.pre<IUser>("save", async function (next) {
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
    try {
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFERSHTOKEN_KEY as string,
            {
                expiresIn:
                    `${parseInt(process.env.REFERSHTOKEN_EXPIRY!, 10)}D` ||
                    "30D",
            }
        );
    } catch (error) {
        console.error(`Error while genrating refersh token ${error}`);
        return undefined;
    }
};

userSchema.methods.generateAccessToken = function (): string | undefined {
    try {
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
            },
            process.env.ACCESSTOKEN_KEY as string,
            {
                expiresIn:
                    `${parseInt(process.env.ACCESSTOKEN_EXPIRY!, 10)}D` || "1D",
            }
        );
    } catch (error) {
        console.error(`Error while genrating refersh token ${error}`);
        return undefined;
    }
};

const User: Model<IUser> = model("User", userSchema);

export default User;
