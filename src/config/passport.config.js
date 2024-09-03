import passport from "passport";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";
import { userServices, cartServices, chatServices } from "../services/services.js";
import configObject from "../config/configEnv.js";

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;


const initializePassport = () => {

    passport.use("jwt", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: configObject.tokenKey
    }, async (jwt_playLoad, done) => {
        try {
            return done (null, jwt_playLoad);
        } catch (error) {
            return done(error);
        }
    }))

    // login con GITHUB

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async(id, done) => {
        let user = await userServices.getUserById(id);
        done(null, user);
    })

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23lia8BR4hBVTjbQEr",
        clientSecret: "2407bac629f9822dc799b569946e94b6c91b04b0",
        callbackURL: `http://${configObject.url}/api/sessions/githubcallback`
    }, async (accessToken, refreshToken, profile, done) => {

        console.log(profile)
        try {

            let usuario = await userServices.getUserByEmail({email:profile.email})

            if (!usuario) {
                let cart = await cartServices.createCart();
                let userNvo = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: "",
                    email: profile._json.email,
                    password: "",
                    login: "github",
                    cart: cart._id
                }

                let result = await userServices.createUser(userNvo);
                done(null, result)
            } else {
                done (null, usuario);
            }
        } catch (error) {
            return done(error);
        }
    }))
}

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["PokeToken"]
    }
    return token;
}

export default initializePassport;