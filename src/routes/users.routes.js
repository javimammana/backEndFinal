import { Router } from "express";
import UsersController from "../controllers/users.controller.js";
import passport from "passport";
import { adminLoginJWT, adminCheckToken, checkRole } from "../utils/utils.js";


const router = Router()
const usersControllers = new UsersController();

router.post("/profile", passport.authenticate("jwt", {session: false, failureRedirect: "/api/users/tokenFalse"}), checkRole(["USER"]), usersControllers.profile);
router.get("/restricted", usersControllers.restricted);
router.get("/tokenFalse", usersControllers.tokenFalse);

router.get("/verifyToken", adminCheckToken, usersControllers.verifyToken)


router.post("/register", usersControllers.createUser);
router.get("/", usersControllers.getAllUsers);
router.get("/:uid", usersControllers.getUserById)
router.delete("/:uid", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['ADMIN']), usersControllers.deleteUser);


router.put("/premium/:uid", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['ADMIN']), usersControllers.cambioRol)

router.post("/resetPassword", usersControllers.resetPassword);
router.post("/requestPasswordReset", usersControllers.requestPasswordReset);

//   MULTER   //

import upload from "../middleware/multer.js";

router.post("/:id/documents", upload.fields([{ name: "identificacion" }, { name: "cuenta" }, { name: "domicilio" }, { name: "profile" }]), usersControllers.documentacion);
router.delete("/:uid/:doc", usersControllers.deleteDoc)
router.put("/:uid/getPremium", usersControllers.getPremium);
router.put("/:uid/noPremium", usersControllers.noPremium);

export default router;