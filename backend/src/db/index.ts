import mongoose, { Error } from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: "url-shortner",
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(`Error: ${error.message}`); // handle different kind of errors
        }
        process.exit(1);
    }
};

export default connectDB;
