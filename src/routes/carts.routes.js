import { Router } from "express";
import CartController from "../controllers/carts.controller.js";
import passport from "passport";
import { checkRole } from "../utils/utils.js";

const router = Router();
const cartController = new CartController();

router.get("/:cid", cartController.getcartById);
router.post("/:cid/product/:pid/:page", cartController.addProductCart);
router.put("/:cid", cartController.updateCart);
router.put("/:cid/product/:pid", cartController.updateProductCart);
router.delete("/:cid", cartController.clearCart);
router.delete("/:cid/product/:pid", cartController.deleteProductCart);
router.post("/:cid/purchase", passport.authenticate("jwt", {session: false, failureRedirect: "/login"}), checkRole(['USER', 'PREMIUM']), cartController.checkOut);



export default router;