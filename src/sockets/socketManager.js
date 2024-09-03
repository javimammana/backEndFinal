import { Server } from "socket.io";
import ProductController from "../controllers/products.controller.js";
import ChatController from "../controllers/chat.controller.js";
// import { chatServices } from "../services/services.js";

const productController = new ProductController();
const chatController = new ChatController();

class SocketManager {

    constructor(httpServer) {
        this.io = new Server(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {

        this.io.on("connection", async (socket) => {
            console.log("Un usuario entro al administrador de productos");

            async function get (rol, userOwner) {
                const getProducts = await productController.getProductsRT();

                if (rol !== "ADMIN") {
                    const productsOwner = getProducts.filter(item => item.owner === userOwner);
                    return socket.emit("listProducts", productsOwner)
                }

                return socket.emit("listProducts", getProducts)
            }

            function res (resultado) {
                socket.emit("resultado", resultado);
            }

            socket.on("user", async (rol, userOwner) => {
                get(rol, userOwner);
            })

            socket.on("addProduct", async (product, rol, userOwner) => {
                const newProduct = await productController.addProductRT(product)
                newProduct ? res("Producto creado") : res("Error al crear producto");
                get(rol, userOwner);
            })

            socket.on("deleteProduct", async (id, rol, userOwner) => {
                await productController.deleteProductRT(id);
                res("Producto Eliminado");
                get(rol, userOwner);
            })

            socket.on("updateProduct", async (id, data, rol, userOwner) => {
                const udProd = await productController.updateProductRT(id, data);
                udProd ? res("Producto Actualizado") : res("Error al actualizar producto");
                get(rol, userOwner);
            })

            socket.on("delImg", async (id, rol, userOwner) => {
                const udProd = await productController.delImgRT(id);
                udProd ? res("Imagen Eliminada") : res("Error al eliminar imagen");
                get(rol, userOwner);
            })

            // CHAT!!!

            const messages = await chatController.getAllMessages();
            console.log("Nuevo usuario conectado al CHAT");

            socket.on("message", async (data) => {
                // console.log(data);
                await chatController.sendMessage(data);
                const messages = await chatController.getAllMessages();
                socket.emit("messages", messages);
            });

            socket.on("inicio", async (data) => {
                const messages = await chatController.getAllMessages();
                socket.emit("messages", messages);
                socket.broadcast.emit("connected", data);
            });

            socket.emit("messages", messages);

        })
    }
}

export default SocketManager;