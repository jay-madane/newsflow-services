import dotenv from "dotenv";
import connectToMongoDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: "./.env"
});

const port = process.env.PORT || 8000;

connectToMongoDB()
.then(() => {
    app.listen(port, () => {
        console.log(`⚙️  Server is running on port ${port}`);
    });
})
.catch((err) => {
    console.error("DB CONNECTION FAILED: ", err);
});