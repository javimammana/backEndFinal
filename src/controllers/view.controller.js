import { productServices, userServices, cartServices, ticketServices, chatServices } from "../services/services.js";

class ViewController {

    async viewHome (req, res) {

        let user = req.user;

        try {
            if (user) {
            res.render("home", {
                title: `Bienvenido ${user.first_name}`,
                user
            });
            } else {
                res.render("home", {
                    title: "Home"
                });
            }

        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar Home"});
        }

    }

    async viewLogin (req, res) {

        try {
            res.render("login", {
                title: "Ingresa a nuestro sistema",
            });
        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar LoginPage"});
        }
    }

    async viewRegister (req, res) {

        try {
            res.render("register", {
                title: "Registrate en nuestro sistema",
            });
        } catch (error) {
            
        }
    }

    async viewResetPassword (req, res) {
        try {
            res.render("resetPassword", {
                title: "Restablecimiento de Contraseña"
            })
        } catch (error) {
            res.status(500).json({error: "Error del servidor al Renderizar Restablecimeinto de Contraseña"});
        }
    }

    async viewSendMailReset (req, res) {
        try {
            res.render("sendMailReset", {
                title: "Restablecimiento de Contraseña"
            })
        } catch (error) {
            res.status(500).json({error: "Error del servidor al Renderizar Restablecimeinto de Contraseña"});
        }
    }

    async viewChargePassword (req, res) {
        try {
            res.render("chargePassword", {
                title: "Restablecimiento de Contraseña",
            })
        } catch (error) {
            res.status(500).json({error: "Error del servidor al Renderizar Restablecimeinto de Contraseña"});
        }
    }

    async viewNoAccess (req, res) {
        const user = req.user;

        try {
            res.render("noAccess", {
                title: "Sin permiso para esta area",
                user
            })
        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar Restricted"});
        }
    }

    async viewProfile (req, res) {
        const user = req.user;

        let docs;
        let id;
        if(user.role !== "ADMIN") {
        const findUser = await userServices.getUserByEmail({email:user.email});

        const cuenta = findUser.documents.find(element => element.name === "cuenta");
        const domicilio = findUser.documents.find(element => element.name === "domicilio");
        const identificacion = findUser.documents.find(element => element.name === "identificacion");
        const getPremium = findUser.documents.find(element => element.name === "premium");
        const noPremium = findUser.documents.find(element => element.name === "nopremium");
        
        docs = {
            premium: user.role === "PREMIUM" ? true : false,
            cuenta: cuenta ? cuenta.file : false,
            domicilio: domicilio ? domicilio.file : false,
            identificacion: identificacion ? identificacion.file : false,
            completo: cuenta && domicilio && identificacion ? true : false,
            getPremium: getPremium ? true : false,
            noPremium: noPremium ? true : false
        }

        id = findUser._id;

        }
        try {
            res.render("profile", {
                title: `perfile de ${user.first_name}`,
                user,
                id,
                docs
            })
        } catch (error) {
            
        }
    }

    async viewProducts (req, res) {

        const user = req.user;

        try {

            const pag = {
                ...req.query,
                limit: req.query.limit || 10,
                page: req.query.page || 1
            }

            const limit = pag.limit;
            const filtro = pag.query;
            const sort = pag.sort;

            const products = await productServices.getProductsPaginate(pag);

            const userFav = await userServices.getUserByEmail({email: user.email});

            let elementos = products.docs.map(prod => {
                const correctPrice = {
                    ...prod.toObject(),
                    price: prod.price.toFixed(2),
                    notifyUser: prod.notify.includes(user.email),
                    favorite: userFav.favorite.includes(prod._id)
                };
                return correctPrice;
            });

            const pages = []

            if (products.totalPages != 1) {
                for (let i = 1; i <= products.totalPages; i++) {
                    pages.push({page: i, limit: limit, filtro: filtro, sort: sort, pageNow: i == products.page ? true : false });
                }
            }

            res.render("products", {
                title: "Productos",
                products,
                elementos,
                pages,
                sort,
                filtro,
                user
            });
        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar ProductsPage"});
        }
    }

    async viewProduct (req, res) {
        const user = req.user;
        const { pid } = req.params;


        try {

            const prod = await productServices.getProductById(pid);
            const userFav = await userServices.getUserByEmail({email: user.email});

            const product = {
                ...prod.toObject(),
                price: prod.price.toFixed(2),
                notifyUser: prod.notify.includes(user.email),
                favorite: userFav.favorite.includes(prod._id)
            };
            
            res.render("product", {
                title: `${product.title}`,
                product,
                user
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Error del servicor al Renderizar ProductsPage"});
        }
    }

    async viewCart (req, res) {
        const user = req.user;
        

        try{

            let cart = await cartServices.getCartById(user.cart);

            const cartTotal = cart.products.map(inCart => {
                const totalProd = {
                    ...inCart,
                    totalPrice: (inCart.quantity * inCart.product.price).toFixed(2),
                    }
                    console.log(totalProd)
                return totalProd
            })

            const sinStock = [];
            const enStock = [];
            for (let prod of cartTotal) {
                prod.quantity <= prod.product.stock ? enStock.push(prod) : sinStock.push(prod);
            }

            const totalFinal = cartTotal.reduce((acumulador, elemento) => acumulador + Number(elemento.totalPrice), 0).toFixed(2);

            res.render("cart", {
                title: "Carrito",
                cart,
                sinStock,
                enStock,
                totalFinal,
                user
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Error del servicor al Renderizar CartPage"});
        }
    }

    async viewFavorite (req, res) {
        const user = req.user;

        try {

            const userFind = await userServices.getUserByEmail({email: user.email})

            const favor = [];
    
            for  (const fav of userFind.favorite) {
                favor.push(await productServices.getProductById(fav))
            }

            const favorites = favor.map((fav) => {
                const prodFav = {
                    ...fav._doc,
                    favorite: true
                }
                return prodFav;
            })

            res.render("favorite", {
                title: `Productos favoritos de ${user.first_name}`,
                user,
                favorites
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Error del servicor al Renderizar FavoritePage"});
        }
    }

    async viewTeam (req, res) {
        const user = req.user;


        try {
            res.render("team", {
                title: `Elegi tu equipo!`,
                user
            })
        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar TeamPage"});
        }
    }

    async viewUsers (req, res) {
        const user = req.user;

        const users = await userServices.getUsers()

        let usuarios = users.map(us => {

            const getPremium = us.documents.find(element => element.name === "premium");
            const noPremium = us.documents.find(element => element.name === "nopremium");

            const dateNow = new Date();

            const tiempoDesconectado = dateNow - us.last_connection;
            const totalTiempo = tiempoDesconectado/(1000*60*60*60*24);
            

            const findUser = {
                ...us,
                noConnect: totalTiempo > 48, 
                getPremium: getPremium ? true : false,
                premium: us.role === "PREMIUM" ? true : false,
                noPremium: noPremium ? true: false
            };
            return findUser;
        });

        try {
            res.render("users", {
                title: "Administrador de usuarios.-",
                user,
                usuarios
            })
        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar AdminUsersPage"});
        }
    }

    async viewRealTimeProduct (req, res) {

        const user = req.user;

        try {
            res.render("realTimeProduct", {
                title: "Administrador de Productos",
                user
            })
        } catch (error) {
            res.status(500).json({error: "Error del servicor al Renderizar ProductsPage"});
        }
    }

    async viewCheckOut (req, res) {

        const { tid } = req.params;
        try {

            const user = req.user;

            const searchBuy = await ticketServices.getTicketById(tid);

            const totalProdBuy = searchBuy.products.map(inBuy => {
                const totalProd = {
                    ...inBuy,
                    totalPrice: (inBuy.quantity * inBuy.price).toFixed(2),
                    }
                return totalProd;
            })

            const buy = {
                ...searchBuy,
                products: totalProdBuy
            }

            let cart = await cartServices.getCartById(user.cart);

            res.render("checkout", {
                title: `Detalle de Compra`,
                user,
                buy,
                cart
            });

        } catch (error) {
            res.status(500).json({error: "Error del servidor al Renderizar Compra" + error});
        }
    }

    async viewBuys (req, res) {
        try {
            const user = req.user
            const { tid } = req.params;
            const findUser = await userServices.getUserByEmail({email: user.email});

            if (!findUser.purchases) {
                const ticket = false;
                const buysUser = false;

                res.render("buys", {
                    title: 'Mis compras',
                    user,
                    buysUser,
                    ticket
                })
                return;
            }

        
            const buysUser = findUser.purchases.map(buy => {
                const buys = {
                    purchasesId: buy.purchasesId,
                    code: buy.code
                }
                return buys;
            });

            let ticketSearch = tid == "tid" ? await ticketServices.getTicketById(findUser.purchases[0].purchasesId) : await ticketServices.getTicketById(tid);

            const ticketTotalprice = ticketSearch.products.map(prod => {
                const totalProd = {
                    ...prod,
                    totalPrice: (prod.quantity * prod.price).toFixed(2)
                }
                return totalProd;
            })

            const ticket = {
                ...ticketSearch,
                products: ticketTotalprice
            }

            console.log(buysUser)
            console.log(ticket)

            res.render("buys", {
                title: "Mis compras",
                user,
                buysUser,
                ticket
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Error del servidor al Renderizar Panel de compras" + error});
        }
    }

    async viewSales (req, res) {
        
        const user = req.user;

        const { tid } = req.params;

        const tic = await ticketServices.getTickets();

        if (tic.length === 0) {
            res.render("sales", {
                title:"Administrador de Ventas",
                user,
                tickets: false,
                ticket: false
            })
            return
        }

        const tickets = tic.map(ticket => {
            const tick = {
                id: ticket._id,
                code: ticket.code,
                purchaser: ticket.purchaser
            }
            return tick
        })

        let ticketSearch = tid == "tid" ? await ticketServices.getTicketById(tic[0]._id) : await ticketServices.getTicketById(tid);

        const ticketTotalprice = ticketSearch.products.map(prod => {
            const totalProd = {
                ...prod,
                totalPrice: (prod.quantity * prod.price).toFixed(2)
            }
            return totalProd;
        })

        const ticket = {
            ...ticketSearch,
            products: ticketTotalprice
        }

        try {
            

            res.render("sales", {
                title:"Administrador de Ventas",
                user,
                tickets,
                ticket
            })
        } catch (error) {
            res.status(500).json({error: "Error del servidor al Renderizar Panel de ventas" + error});
        }
    }

    async viewChats (req, res) {
        const user = req.user;

        try {
            
            res.render("chat", {
                title:"Administrador de Chats",
                user
            })

        } catch (error) {
            res.status(500).json({error: "Error del servidor al Renderizar Panel de Chats" + error});
        }
    }

}



export default ViewController;