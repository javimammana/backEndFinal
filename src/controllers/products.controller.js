import { productServices, userServices } from "../services/services.js";
import CustomError from "../services/errors/custom-error.js";
import { EErrors } from "../services/errors/enum.js";
import { infoErrorCode, infoErrorItem, infoErrorProducto } from "../services/errors/info.js";
import { EmailManager } from "../services/email.js";

import mime from "mime";

const emailManager = new EmailManager();


class ProductController {

    async createProduct (req, res, next) {

        const {title, description, price, code, stock, category} = req.body;

        try {
            if( !title || !description || !price || !code || !stock || !category ) {
                req.logger.fatal("(CONTROLLER) - El producto esta incompleto, no se procesa")
                res.json("Producto incompleto")
                throw CustomError.crearError({
                    nombre: "Producto Incompleto",
                    causa: infoErrorProducto({title, description, price, code, stock, category}),
                    mensaje: "Error al crear producto",
                    codigo: EErrors.TIPO_INVALIDO
                });
            };

            const prodCode = await productServices.getProductByCode({code: code});

            if (prodCode) {
                req.logger.error("(CONTROLLER) - El codigo de producto ya existe, no puede repetirse");
                res.json("CODE existente")
                throw CustomError.crearError({
                    nombre: "CODE existente",
                    causa: infoErrorCode(prodCode.code),
                    mensaje: "El codigo ingresado ya existe con otro producto",
                    codigo: EErrors.INFORMACION_REPETIDA
                });
            };

            const newProduct = {
                ...req.body,
                img: req.body.img || "sinImg.png"
            };

            const product = await productServices.createProduct(newProduct);
            req.logger.info("(CONTROLLER) - El producto se creo con exito");
            res.json(product);

        } catch (error) {
            res.status(400)
            next(error);
        }
    }

    async getProducts (req, res) {
        try {
            const products = await productServices.getProducts();
            res.json(products)
            return;
        } catch (error) {
            console.log(error)
            res.status(500).json({error: error.message});
        }
    }

    async getProductsPaginate (req, res) {
        try {

            const paguinacion = {
                ...req.query,
                limit: req.query.limit || 10,
                page: req.query.page || 1
            }

            const products = await productServices.getProductsPaginate(paguinacion);


            res.json({products,
                status:"success",
                payload: products.totalDocs,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}&&limit={{productos.limit}}&query={{query}}&sort={{sort}}` : null,
                nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}&&limit={{productos.limit}}&query={{query}}&sort={{sort}}` : null,
            })
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }

    async getProductById (req, res) {
        const { pid } = req.params;
        try {
            let product = await productServices.getProductById(pid);
            res.json(product); 

        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }

    async updateProduct (req, res, next) {
        const { pid } = req.params;
        const {title, description, price, stock, category} = req.body;

        try {
            const product = await productServices.getProductById(pid);

            if (!product) {
                req.logger.fatal("(CONTROLLER) - El producto no existe");
                throw CustomError.crearError({
                    nombre: "Producto inexistente",
                    causa: infoErrorItem(pid),
                    mensaje: "El prodcuto no existe",
                    codigo: EErrors.ITEM_INVALIDO
                });
            }

            const code = product.code

            if( !title || !description || !price || !code || !stock || !category ) {
                req.logger.fatal("(CONTROLLER) - Datos de producto para actualizar incompletos");
                throw CustomError.crearError({
                    nombre: "Producto Incompleto",
                    causa: infoErrorProducto({title, description, price, code, stock, category}),
                    mensaje: "Error al crear producto",
                    codigo: EErrors.TIPO_INVALIDO
                });
            } 

            const updateProduct = {
                ...req.body,
                code: code,
                img: req.body.img || "sinImg.png"
            };

            const productUpdate = await productServices.updateProduct(pid, updateProduct);
            req.logger.info("(CONTROLLER) - El producto de actualizo de manera exitosa")
            res.json(productUpdate);
        } catch (error) {
            req.logger.error("(CONTROLLER) - Error al actualizar producto")
            next(error);
        }
    }

    async deleteProduct (req, res) {
        const { pid } = req.params;
        try {
            await productServices.deleteProduct(pid);
            req.logger.info("(CONTROLLER) - El producto se elimino correctamente");
            res.json ({message: "Producto eliminado"});
        } catch (error) {
            req.logger.error("(CONTROLLER) - Error al eliminar producto")
            res.status(500).json({error: error.message});
        }
    }

    async notifyProducto (req, res) {
        const { pid, uid, page } = req.params;

        try {
            const product = await productServices.getProductById(pid);

            if (!product) {
                req.logger.fatal("(CONTROLLER) - El producto no existe");
                res.status(404).send("Producto no encontrado")
                throw CustomError.crearError({
                    nombre: "Producto inexistente",
                    causa: infoErrorItem(pid),
                    mensaje: "El prodcuto no existe",
                    codigo: EErrors.ITEM_INVALIDO
                });
            }

            if (product.stock !== 0) {
                req.logger.fatal("(CONTROLLER) - El producto tiene stock");
                res.json(product);
            }

            if (product.owner === uid) {
                req.logger.fatal("(CONTROLLER) - No podemos notificar stock de tus productos");
                res.json(product);
            }


            if (!product.notify.includes(uid)) {
                product.notify.push(uid);
                await productServices.updateProduct(pid, product);
            }

            req.logger.info("(CONTROLLER) - Se agrego usuario para ser notificado de stock");
            // res.json("Se agrega usuario para ser notificado")
            res.redirect(`/${page}`)
            // res.json("Se notificara de Stock")

        } catch (error) {
            req.logger.error("(CONTROLLER) - Error al cargar notificacion de producto")
            res.status(500).json({error: error.message});
        }
    }

    async favoriteProduct (req, res) {
        const { pid, uid, page } = req.params;

        try {
            console.log("producto" + pid);
            console.log("usuario" + uid)
            const user = await userServices.getUserByEmail({email: uid});
            if(!user) {
                return res.status(404).send("Usuario no encontrado")
            }

            const exist = user.favorite.find(item => item === pid);
            if (exist) {
                user.favorite.splice(user.favorite.indexOf(exist),1);
            } else {
                user.favorite.push(pid);
            }

            await userServices.updateUserById(user._id, user);

            const userNvo = await userServices.getUserByEmail({email: uid});

            // console.log(userNvo)

            req.logger.info("(CONTROLLER) - Se agrego producto a favoritos");
            // res.json("Se agrega producto a favorito")
            res.redirect(`/${page}`)
            // res.json("Se agrega a favoritos")
        } catch (error) {
            req.logger.error("(CONTROLLER) - Error al marcar favorito el producto")
            res.status(500).json({error: error.message});
        }
    }

    //REAL TIME PRODUCTS

    async getProductsRT () {
        try {
            const products = await productServices.getProducts();
            return products;
        } catch (error) {
            console.log(error)
            throw new Error ("(CONTROLLER) Error al obtener productosRealTime");
        }
    }

    async addProductRT (product) {
        try {
            const prod = await productServices.createProduct(product);
            return prod;
        } catch (error) {
            console.log(error)
            throw new Error ("(CONTROLLER) Error al crear productoRealTime");
        }
    }

    async deleteProductRT (id) {
        try {
            const prod = await productServices.deleteProduct(id);
            return prod;
        } catch (error) {
            console.log(error)
            throw new Error ("(CONTROLLER) Error al eliminar productoRealTime");
        }
    }

    async updateProductRT (id, data) {
        try {
            let { stock, price } = data;
            const prod = await productServices.getProductById(id);

            if (!stock) stock = prod.stock;
            if (!price) price = prod.price;

            const newProd = {
                ...prod._doc,
                stock: stock,
                price: price
            }

            if (prod.stock === 0 && newProd.stock > 0) {
                for (let mail of prod.notify) {
                    let usuario = await userServices.getUserByEmail({email: mail});
                    await emailManager.sendMailStock(mail, usuario.first_name, newProd);
                }
                newProd.notify = [];
            }

            const upProd = await productServices.updateProduct(id, newProd);

            return upProd;

        } catch (error) {
            console.log(error)
            throw new Error ("(CONTROLLER) Error al actualizar productoRealTime");
        }
    }

    async documentacion (req, res) {

        const { id } = req.params;
        const uploadedDocuments = req.files;
    
        try {
            const prod = await productServices.getProductById(id);
            console.log(prod)
    
            if (!prod) {
                return res.status(404).send("Producto no encontrado");
            }
    
            if (uploadedDocuments) {
    
                if (uploadedDocuments.products) {
                    const file = uploadedDocuments.products[0];
                    prod.img = file.filename
                }
    
            }
    
            await productServices.updateProduct(id, prod);
    
            res.redirect("/realTimeProduct")
    
            
        } catch (error) {
            console.log(error);
            res.status(500).send("Error al cargar Documentos")
        }
    }

    async delImgRT (id) {

        try {
            const prod = await productServices.updateProduct(id, {img: "sinImg.png"});
            return prod;
            
        } catch (error) {
            console.log(error)
            throw new Error ("(CONTROLLER) Error al actualizar productoRealTime");
        }
    }
    

}

export default ProductController;