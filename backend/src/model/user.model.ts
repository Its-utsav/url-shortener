import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document, model, Model, Schema } from "mongoose";
import type { userData } from "../schema/user.schema";

interface IUser extends Document, userData {}

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
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.methods.checkPassword = async function (
    userPassword: string
): Promise<boolean> {
    return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.genrateRefershToken = function (): string | undefined {
    try {
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFERSHTOKEN_KEY! as string,
            {
                expiresIn: parseInt(process.env.REFERSHTOKEN_EXPIRY!),
            }
        );
    } catch (error) {
        console.error(`Error while genrating refersh token ${error}`);
        return undefined;
    }
};

userSchema.methods.genrateAccessToken = function (): string | undefined {
    try {
        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
            },
            process.env.ACCESSTOKEN_KEY! as string,
            {
                expiresIn: parseInt(process.env.ACCESSTOKEN_EXPIRY!),
            }
        );
    } catch (error) {
        console.error(`Error while genrating refersh token ${error}`);
        return undefined;
    }
};

const User: Model<IUser> = model("User", userSchema);

export default User;
