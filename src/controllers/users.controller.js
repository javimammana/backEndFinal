import { userServices, cartServices, chatServices } from "../services/services.js";
import { createHash, isValidPassword, capitalize, createTokenPass, adminLoginJWT } from "../utils/utils.js";
import { EmailManager } from "../services/email.js";
import jwt from "jsonwebtoken";
import configObject from "../config/configEnv.js";

import mime from "mime";

const emailManager = new EmailManager();

function tokenGenerate (user) {
    const token = jwt.sign({
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        email: user.email,
        role: user.role,
        premium: user.role === "PREMIUM",
        cart: user.cart,
        favorite: user.favorite,
        team: user.team,
        purchases: user.purchases,
        img: user.img
    }, configObject.tokenKey , {expiresIn: "5m"});

    return token;
}


class UsersController {

    async createUser (req, res) {

        const {first_name, last_name, email, age, password, repassword} = req.body;

        try {
            const exist = await userServices.getUserByEmail({email: email});

            if (exist) {
                req.logger.warning("(CONTROLLER) - El correo ya esta registrado")
                return res.status(400).json(["El correo ya esta registrado"]);
            }

            if (password !== repassword) {
                req.logger.warning("(CONTROLLER) - Las contraseñas no son iguales")
                return res.status(400).json("Las contraseñas deben ser iguales")
            }

            const cart = await cartServices.createCart()

            let newUser = {
                first_name: capitalize(first_name),
                last_name: capitalize(last_name),
                email,
                age,
                password: createHash(password),
                cart: cart._id,
                login: "local",
                documents:[{name: "Profile", reference:"src/uploads/profiles/sinImg.png"}]
            }

            const user = await userServices.createUser(newUser);
            req.logger.info("(CONTROLLER) - Usuario creado");

            const token = tokenGenerate(user);

            res.cookie("PokeToken", token, {
                maxAge: 300000,
                httpOnly: true
            });

            // res.json(user)
            res.redirect("/products")
        } catch (error) {
            console.log(error)
            req.logger.error("(CONTROLLER) - Error al crear Usuario");
            res.status(500).json({error: error.message});
        }
    }

    async getAllUsers (req, res) {
        try {
            const users = await userServices.getUsers();
            req.logger.info("(CONTROLLER) - todos los usuarios buscados");
            res.json(users);
        } catch (error) {
            console.log(error)
            req.logger.error("(CONTROLLER) - Error al buscar Usuarios")
            res.status(500).json({error: error.message});
        }
    }

    async getUserById (req, res) {
        const { uid } = req.params;
        try {
            const user = await userServices.getUserById(uid);
            if (!user) {
                req.logger.info("(CONTROLLER) - El usuario no existe");
                res.json("El usuario no existe");
            }
            req.logger.info("(CONTROLLER) - Usuario buscado por ID");
            res.json(user);
        } catch (error) {
            console.log(error)
            req.logger.error("(CONTROLLER) - Error al buscar Usuarios")
            res.status(500).json({error: error.message});
        }
    }

    async deleteUser (req, res) {
        const { uid } = req.params;
        try {
            const user = await userServices.getUserById(uid);
            if (!user) {
                req.logger.info("(CONTROLLER) - El usuario no existe");
                res.json("El usuario no existe");
            }
            await emailManager.sendMailBaja(user.email, user.first_name);
            await cartServices.deleteCart(user.cart);
            await userServices.deleteUser(uid);
            req.logger.info("(CONTROLLER) - Usuario eliminado");
            res.json("Usuario eliminado");
        } catch (error) {
            console.log(error)
            req.logger.error("(CONTROLLER) - Error al eliminar Usuarios")
            res.status(500).json({error: error.message});
        }
    }

    async cambioRol (req, res) {
        const { uid } = req.params;

        try {
            const user = await userServices.getUserById(uid);

            if(!user) {
                return res.status(404).send("Usuario no encontrado")
            }

            if (user.role === "PREMIUM") {

                const docs = ["premium", "domicilio", "identificacion", "cuenta", "nopremium"]

                docs.forEach((doc) => {
                    const findIndex = user.documents.findIndex(element => element.name === doc);
                    user.documents.splice(findIndex, 1);
                })

                user.role = "USER"


                await userServices.updateUserById(uid, user);
                const userUpdate = await userServices.getUserById(uid);
                res.status(200).json(userUpdate);
                return
            }

            const cuenta = user.documents.find(element => element.name === "cuenta");
            const domicilio = user.documents.find(element => element.name === "domicilio");
            const identificacion = user.documents.find(element => element.name === "identificacion");

            if (identificacion && domicilio && cuenta ) {
                const findIndex = user.documents.findIndex(element => element.name === "premium");
                user.documents.splice(findIndex, 1);
                user.role = "PREMIUM"
                await userServices.updateUserById(uid, user);
                res.json(userServices);
                return

            }

            return res.status(400).send("Usuario con documentacion incompleta");



        } catch (error) {
            console.log(error)
            res.status(500).send("Error en el servidor al cambiar ROL");
        }
    }

    async requestPasswordReset (req, res) {

        const { email } = req.body;
        try {

            const user = await userServices.getUserByEmail({email: email});

            if (!user) {
                return res.status (404).send("Usuario no encontrado");
            }

            const token = createTokenPass();

            user.resetToken = {
                token: token,
                tried: 0,
                expire: new Date(Date.now() + 3600000)
            }

            await userServices.updateUserById(user._id, user);

            await emailManager.sendMailReset(email, user.first_name, token);

            res.redirect("/sendMailReset");


        } catch (error) {
            res.status(500).send("Error Interno del servidor al enviar token" + error);
        }
    }

    async resetPassword(req, res) {
        const {email, password, token} = req.body;

        try {
            
            const user = await userServices.getUserByEmailRP({email: email});

            if (!user) {
                return res.render("chargePassword", {
                    error: "Usuario no existe",
                    title: "Restablecimiento de Contraseña",
                })
            }

            if (user.resetToken.tried > 3) {
                await userServices.updateUserById(user._id, {resetToken: {}})
                return res.render ("blockPassword", {
                    error: "Token invalido o caduco",
                    title: "Restablecimiento de Contraseña",
                })
            }

            if (!user.resetToken || user.resetToken.token !== token) {
                user.resetToken.tried = user.resetToken.tried+1
                await userServices.updateUserById(user._id, user)
                return res.render ("chargePassword", {
                    error: "Token invalido o caduco",
                    title: "Restablecimiento de Contraseña",
                })
            }

            const now = new Date();
            if (now > user.resetToken.expire) {
                user.resetToken.tried = user.resetToken.tried+1
                await userServices.updateUserById(user._id, user)
                return res.render ("chargePassword", {
                    error: "Token invalido o caduco",
                    title: "Restablecimiento de Contraseña",
                })
            }

            if (isValidPassword(password, user)) {
                user.resetToken.tried = user.resetToken.tried+1
                await userServices.updateUserById(user._id, user)
                return res.render ("chargePassword", {
                    error: "La nueva contraseña no es valida",
                    title: "Restablecimiento de Contraseña",
                })
            }

            user.password = createHash(password);

            user.resetToken = {};
            user.blocked = {
                status: false,
                tried: 3
            }

            await userServices.updateUserById(user._id, user);

            return res.redirect ("/login");

        } catch (error) {
            res.status(500).render("passwordChange", {
                error: "Error del servidor"
            })
        }
    }

    async loginUser (req, res) {
        const {email, password} = req.body;
        try {
            const user = await userServices.getUserByEmailRP({email: email});
            if (!user) {
                req.logger.error("(CRONTOLLER) - Usuario o contraseña incorrectos U.-");
                return res.render ("login", {
                    error: "Usuario o contraseña invalidos",
                    title: "Login"
                })
                return done(null, false);
            }

            if (user.blocked.status === true) {
                req.logger.error("(CRONTOLLER) - Usuario Bloqueado.-");
                return res.render ("login", {
                    error: "Usuario Bloqueado, restablece la clave para desbloquear usuario",
                    title: "Login"
                })
                return done(null, false);
            }

            if (!isValidPassword(password, user)) {
                user.blocked.tried--
                if (user.blocked.tried === 0) {
                    user.blocked.status = true
                }
                await userServices.updateUserById(user._id, user);
                req.logger.error("(CRONTOLLER) - Usuario o contraseña incorrectos P.-");
                return res.render ("login", {
                    error: "Usuario o contraseña invalidos",
                    title: "Login"
                })
                return done(null, false);
            }

            let imgProfile = user.documents.find((profile) => profile.name === "Profile");

            // console.log(imgProfile.reference)

            req.logger.info("(CONTROLLER) - Usuario Logueado OK");

            const token = tokenGenerate(user);

            res.cookie("PokeToken", token, {
                maxAge: 300000,
                httpOnly: true
            });

            await userServices.updateUserById(user._id, {last_connection: new Date()});

            // console.log(token);
            res.redirect("/products")

        } catch (error) {
            res.status(400).json(["Usuario y/o contraseña incorrecto"]);
        }
    }

    async logoutUser (req, res) {
        try {
            if (req.user) {
                await userServices.updateUserById(req.user._id, {last_connection: new Date()})
            }

            res.clearCookie("PokeToken");
            res.clearCookie("prm")
            req.logger.info("(CONTROLLER) - Cierre de sesion exitoso");
            res.redirect("/login");
        } catch (error) {
            req.logger.error("(CONTROLLER) - Error al desloguar usuario");
            res.status(500).json({error: error.message});
            res.redirect("/login");
        }
    }

    async tokenJWT (req, res) {
        let user = req.user;
        tokenGenerate(user);
        res.json(user);
    }

    async profile (req, res) {

        const user = req.user;
        // res.send();
        return res.json(`Usuario ${req.user.first_name} ${req.user.last_name}`)
    }

    async tokenFalse (req, res) {
        res.send("No estas logueado")
    }

    async restricted (req, res) {
        res.send("No tenes permiso para esta area")
    }

    async verifyToken (req, res) {

        const { PokeToken } = req.cookies;

        if (!PokeToken) return res.status(401).json({ message: "No autorizado" });
        jwt.verify(PokeToken, configObject.tokenKey, async (err, user) => {
            if(err) return res.status(401).json({ message: "No autorizado" });

            const userFound = await userServices.getUserByEmail({email: user.email});

            if (!userFound) return res.status(401).json({ message: "No autorizado" });

            return res.json(user)
        })
    }

    async documentacion (req, res) {

        const { id } = req.params;
        const uploadedDocuments = req.files;
    
        try {
            const user = await userServices.getUserById(id);
    
            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }
    
            if (uploadedDocuments) {
                
                if (uploadedDocuments.identificacion) {
    
                    const file = uploadedDocuments.identificacion[0];
    
                    const newFile = {
                        name: file.fieldname,
                        file: file.originalname,
                        reference: file.path
                    }
    
                    const findIndex = user.documents.findIndex(element => element.name === "identificacion");
    
                    if (findIndex === -1) {
                        user.documents.push(newFile);
                    } else {
                        user.documents[findIndex] = newFile;
                    }
                }
    
                if (uploadedDocuments.cuenta) {
    
                    const file = uploadedDocuments.cuenta[0];
    
                    const newFile = {
                        name: file.fieldname,
                        file: file.originalname,
                        reference: file.path
                    }
    
                    const findIndex = user.documents.findIndex(element => element.name === "cuenta");
    
                    if (findIndex === -1) {
                        user.documents.push(newFile);
                    } else {
                        user.documents[findIndex] = newFile;
                    }
                }
    
                if (uploadedDocuments.domicilio) {
                    const file = uploadedDocuments.domicilio[0];
    
                    const newFile = {
                        name: file.fieldname,
                        file: file.originalname,
                        reference: file.path
                    }
    
                    const findIndex = user.documents.findIndex(element => element.name === "domicilio");
    
                    if (findIndex === -1) {
                        user.documents.push(newFile);
                    } else {
                        user.documents[findIndex] = newFile;
                    }
                }
    
                if (uploadedDocuments.profile) {
    
                    let aux = uploadedDocuments.profile.find((img) => img.fieldname === "profile")
    
                    let resultado = user.documents.find((profile) => profile.name === "Profile");
    
                    resultado.reference = `src/uploads/profiles/${uid}.${mime.getExtension(aux.mimetype)}`;
                    
                    user.documents.splice(user.documents.indexOf(resultado), 1, resultado);
                }
    
            }
    
            await userServices.updateUserById(id, {documents: user.documents})
    
            res.redirect("/profile")
    
            
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al cargar Documentos")
        }
    }

    async deleteDoc (req, res) {
        const {uid, doc} = req.params

        try {
            const user = await userServices.getUserById(uid)

            console.log(user)

            const findIndex = user.documents.findIndex(element => element.name === doc);

            user.documents.splice(findIndex, 1);

            const getPremium = user.documents.findIndex(element => element.name === "premium");
            if (getPremium) {
                user.documents.splice(getPremium, 1);
            }
            

            await userServices.updateUserById(uid, user);

            res.status(200).send("Documento eliminado")
            
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al borrar Documento")
        }
    }

    async getPremium (req, res) {
        const {uid} = req.params;

        try {
            
            const user = await userServices.getUserById(uid);

            user.documents.push({name:"premium"})

            await userServices.updateUserById(uid, user);

            res.status(200).send("Se registro el pedido para cambio a Premium")

        } catch (error) {
            console.log(error);
            res.status(500).send("Error al Solicitar PREMIUM")
        }
    }

    async noPremium (req, res) {
        const {uid} = req.params;

        try {
            
            const user = await userServices.getUserById(uid);

            user.documents.push({name:"nopremium"})

            await userServices.updateUserById(uid, user);

            res.status(200).send("Se registro el pedido para cambio a USUARIO")

        } catch (error) {
            console.log(error);
            res.status(500).send("Error al Solicitar PREMIUM")
        }
    }

}


export default UsersController;