import mongoose, { Error } from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: "url-shortner",
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: unknown) {
        if (error instanceof mongoose.Error) {
            console.error(`Error from mongoose: ${error.message}`);
        } else if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }
};

export default connectDB;
