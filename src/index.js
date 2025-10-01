import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
})


const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(PORT, (req, res) => {
      console.log(`Server is running on PORT: ${PORT}`);
      console.log(`URL : http://localhost:${PORT}`);
    })
  })
  .catch((err) => {
    console.log("Mongo Connection err. ", err);
    process.exit(1);
  })







