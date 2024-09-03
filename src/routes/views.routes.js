import { Router } from "express";
import ViewController from "../controllers/view.controller.js";
import passport from "passport";
import { checkRole } from "../utils/utils.js";

const router = Router()
const viewController = new ViewController();

router.get("/", viewController.viewHome);

router.get("/login", viewController.viewLogin)
router.get("/register", viewController.viewRegister);
router.get("/resetPassword", viewController.viewResetPassword);
router.get("/sendMailReset", viewController.viewSendMailReset);
router.get("/chargePassword",viewController.viewChargePassword);
router.get("/restricted", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), viewController.viewNoAccess)

router.get("/products", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewProducts);
router.get("/product/:pid", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewProduct);


router.get("/carts", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewCart)
router.get("/carts/:tid/checkout", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewCheckOut);
router.get("/buys/:tid", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewBuys);

router.get("/profile", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), viewController.viewProfile);
router.get("/favorite", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewFavorite)
router.get("/team", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewTeam)
router.get("/realTimeProduct", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['ADMIN', 'PREMIUM']), viewController.viewRealTimeProduct);
router.get("/users", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['ADMIN']), viewController.viewUsers)
router.get("/sales/:tid", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['ADMIN']), viewController.viewSales)
router.get("/chats", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), viewController.viewChats)

export default router;