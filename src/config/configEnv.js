import dotenv from "dotenv";
import program from "../utils/commander.js";

const {mode} = program.opts();

dotenv.config({
    path: mode === "produccion" ? "./.env.produccion" : "./.env.desarrollo"
});

const configObject = {
    puerto: process.env.PUERTO,
    mongo_url: process.env.MONGO_URL,
    user: process.env.ADMIN_USER,
    pass: process.env.ADMIN_PASS,
    tokenKey: process.env.TOKEN,
    url: process.env.URL,
    mode: mode === "produccion" ? "produccion" : "desarrollo"
}

export default configObject;