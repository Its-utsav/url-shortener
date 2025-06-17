import express from "express";
import expressuseraget from "express-useragent";
import cookieParser from "cookie-parser";
import logger from "./utils/Logger";
const app = express();

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(
    express.urlencoded({
        limit: "16kb",
        extended: true,
    })
);
app.use(logger);
app.use(cookieParser());

app.use(expressuseraget.express());
app.set("trust proxy", true);

import userRoutes from "./routes/user.routes";
import urlRoutes from "./routes/url.routes";
import globalErrorHandler from "./utils/globalErrorHandler";

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/urls", urlRoutes);

// Global Error Handling middelware
app.use(globalErrorHandler);
export default app;
