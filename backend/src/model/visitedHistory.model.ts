import { Document, model, Schema } from "mongoose";
import { visitedHistoryData } from "../schema/visitedHistory.schema";

interface IVisitedHistory extends Document, visitedHistoryData { }

const visitedHistorySchema = new Schema<IVisitedHistory>(
    {
        shortUrlId: {
            type: Schema.Types.ObjectId,
            ref: "Url",
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        deviceType: {
            type: String,
        },
        clickedTime: {
            type: Date,
        },
    },
    {
        timestamps: { createdAt: "clickedTime", updatedAt: false },
    }
);

const visitedHistory = model<IVisitedHistory>(
    "visitedHistory",
    visitedHistorySchema
);


export default visitedHistory;