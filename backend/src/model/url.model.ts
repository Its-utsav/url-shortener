import { Document, model, Model, ObjectId, Schema } from "mongoose";
import { urlData } from "../schema/url.schema";
import { genrateShortUrl } from "../utils/url.utils";
import bcrypt from "bcrypt";

interface IUrl extends Document, urlData {
    shortUrl: string;
    createdBy: ObjectId;
    checkPassword(userPassword: string): Promise<boolean>;
}

const urlSchema = new Schema<IUrl>(
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
        },
    },
    {
        timestamps: true,
    }
);

urlSchema.pre<IUrl>("save", function (next) {
    if (!this.isModified("originalUrl")) return next();

    this.shortUrl = genrateShortUrl();
    next();
});

urlSchema.pre<IUrl>("save", async function (next) {
    if (!this.isPasswordProtected) return next();
    if (!this.isModified("password") || !this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password!, 10);

    next();
});

urlSchema.methods.checkPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

const Url: Model<IUrl> = model("Url", urlSchema);

export default Url;
