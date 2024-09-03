import { Router } from "express";
import ProductController from "../controllers/products.controller.js";

const router = Router();
const productController = new ProductController();

router.get("/", productController.getProductsPaginate);
router.get("/:pid", productController.getProductById);
router.post("/", productController.createProduct);
router.post("/:pid/notify/:uid/:page", productController.notifyProducto);
router.post("/:pid/favorite/:uid/:page", productController.favoriteProduct);
router.put("/:pid", productController.updateProduct);
router.delete("/:pid", productController.deleteProduct);

import upload from "../middleware/multer.js";
router.post("/:id/documents", upload.fields([{ name: "products" }]), productController.documentacion);


export default router;