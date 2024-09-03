import express from "express";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import addLogger from "./utils/logger.js";


// import cors from "cors";




import userRouter from "./routes/users.routes.js";
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.routes.js";
import sessionRouter from "./routes/sessions.routes.js";

import initializePassport from "./config/passport.config.js";

import manejadorError from "./middleware/error.js";



//base de datos
import "./dataBase.js";
import configObject from "./config/configEnv.js";


const app = express();
const PORT = configObject.puerto;

const claveCookie = "CamareroDesencamaronemelo";


//Middleware

// app.use(cors({
//     origin:'http://localhost:3000',
//     credentials: true
// }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(cookieParser(claveCookie));
app.use(session({
    secret: "secretClave",
    resave: true, //mantien activa la sesion frente a la inactividad del ususario
    saveUninitialized: true, //permite guardar sesion aun cuando este vacio
    store: MongoStore.create({
        mongoUrl: configObject.mongo_url,
        ttl: 60 * 5
    })
}));
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

//Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


//LOGER//
app.use(addLogger);

app.get("/loggerTest", (req, res) => {
    req.logger.debug("Mensaje DEBUG");  
    req.logger.http("Mensaje HTTP"); 
    req.logger.info("Mensaje INFO"); 
    req.logger.warning("Mensaje WARNING"); 
    req.logger.error("Mensaje ERROR"); 
    req.logger.fatal("Mensaje FATAL"); 

    res.send("Logs generados");
})


//Rutas
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/carts", cartRouter);


//Middleware de Errores
app.use(manejadorError);

//Servidor
const httpServer = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

//Socket
import SocketManager from "./sockets/socketManager.js";
new SocketManager(httpServer);