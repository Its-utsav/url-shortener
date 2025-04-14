import express from "express";

const app = express();

app.get("/", (req, res) => {
    return res.json({
        msg: "lol",
    });
});
export default app;
