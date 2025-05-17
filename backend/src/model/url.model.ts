import bcrypt from "bcrypt";
import { Document, model, Model, Schema, Types } from "mongoose";
import { generateShortUrl } from "../utils/url.utils";

export interface IUrlMethods {
    checkPassword(userPassword: string): Promise<boolean>;
}

export interface IUrlData {
    _id: Types.ObjectId;
    shortUrl: string;
    createdBy: Types.ObjectId;
    originalUrl: string;
    description: string;
    isPasswordProtected: boolean;
    password?: string;
}

export interface UrlDocument
    extends IUrlData,
        Document<Types.ObjectId>,
        IUrlMethods {}

const urlSchema = new Schema<UrlDocument, Model<UrlDocument>, IUrlMethods>(
    {
        originalUrl: {
            type: String,
            required: true,
        },
        shortUrl: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        description: {
            type: String,
            maxlength: 200,
        },
        isPasswordProtected: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

urlSchema.pre<UrlDocument>("save", function (next) {
    if (!this.isModified("originalUrl")) return next();

    this.shortUrl = generateShortUrl();
    next();
});

urlSchema.pre<UrlDocument>("save", async function (next) {
    if (!this.isPasswordProtected) return next();
    if (!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password!, 10);
    next();
});

urlSchema.methods.checkPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password!);
};

const Url: Model<UrlDocument> = model("Url", urlSchema);

export default Url;
