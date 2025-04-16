import { Document, model, Model, Schema } from "mongoose";
import { urlData } from "../schema/url.schema";
import { genrateShortUrl } from "../utils/url.utils";

interface IUrl extends Document, urlData {}

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
        },
        description: {
            type: String,
        },
        totalClicks: {
            type: Number,
            default: 0,
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

const Url: Model<IUrl> = model("Url", urlSchema);

export default Url;
