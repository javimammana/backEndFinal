import mongoose from "mongoose";

import configObject from "./config/configEnv.js";

mongoose.connect(configObject.mongo_url)
    .then(() => console.log ("Conectado a la POKEBASE!"))
    .catch((error) => console.log("Error en la conexion", error))