import express from "express";
import expressuseraget from "express-useragent";
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

app.use(expressuseraget.express());
app.set("trust proxy", true);

import userRoutes from "./routes/user.routes";
import urlRoutes from "./routes/url.routes";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/url", urlRoutes);

export default app;
