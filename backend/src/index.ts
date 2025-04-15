import * as dotenv from "dotenv";
import connectDB from "./db";
import app from "./app";

dotenv.config({
    path: ".env",
});

const PORT = process.env.PORT || 3000;
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(
                `DataBase successful Connected & Server is running on port http://localhost:${PORT}`
            );
        });
    })
    .catch(() => {
        console.error(`DataBase connection faild `);
    });
