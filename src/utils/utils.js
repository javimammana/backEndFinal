import bcrypt from "bcrypt";
import configObject from "../config/configEnv.js";
import jwt from "jsonwebtoken";

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (password, user) => bcrypt.compareSync(password, user.password);


export const checkRole = (roles) => async (req, res, next) => {
    const user = req.user;

    if (![].concat(roles).includes(user.role)) {
        console.log("no continua")
        return res.status(403).redirect("/restricted");
    }
    // res.status(200).json(user);
    next()
}

export function capitalize (text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}

export function DTO (user) {
    const { password, ...userWithoutPassword } = user._doc;
    return userWithoutPassword;
}

export function createTokenPass() {
    let token = Math.floor(100000 + Math.random() * 900000);
    return token.toString();
}

const admin = {
    email: configObject.user,
    password: configObject.pass
};

export function adminLoginJWT (req, res, next) {
    const {email, password} = req.body;
    if (email === admin.email) {
        if (password === admin.password) {

            const token = jwt.sign({
                first_name: "Poke",
                last_name: "Master",
                email: admin.email,
                role: "ADMIN",
                admin: true,
                img: "sinImg.png"
            }, configObject.tokenKey, {expiresIn: "10m"});
    
            res.cookie("PokeToken", token, {
                maxAge: 600000,
                httpOnly: true
            });

            req.logger.info("(CONTROLLER) - Usuario Logueado OK");
            return res.redirect("/realTimeProduct")
        
        } else { 
            return res.render ("login", {
                error: "Usuario o contraseña invalidos",
                title: "Login"
            })
        }
    }
    next();
}

export function adminCheckToken (req, res, next) {

    const { PokeToken } = req.cookies;

    if (!PokeToken) return res.status(401).json({ message: "No autorizado" });

    jwt.verify(PokeToken, configObject.tokenKey, async (err, user) => {
        if(err) return res.status(401).json({ message: "No autorizado" });

        const userFound = user.email === configObject.user;

        if (userFound) {
            return res.json(user)
        } else {
            next()
        }
    })

    // next()
}

