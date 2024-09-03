const socket = io();

document.addEventListener('DOMContentLoaded', () => {
        const btnToggleMenu = document.getElementById('btnToggleMenu');
        const menu = document.getElementById('formRT');
    
        btnToggleMenu.addEventListener('click', () => {
            if (menu.style.display === 'none' || menu.style.display === '') {
                menu.style.display = 'block';
                btnToggleMenu.textContent = 'Cancelar'; 
            } else {
                menu.style.display = 'none';
                btnToggleMenu.textContent = 'Agregar Producto';
            }
        });
    });

const deleteItem = (id, owner) => {

    if (rol !== "ADMIN") {
        if (owner !== userOwner) {
            Toastify({
                text: "No podes Eliminar este producto",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                style: {
                    background: "linear-gradient(to right, #353434, #000)",
                    color: "#ebce0f",
                },
            }).showToast();
        }
    }
    
    const data = id;

    socket.emit("deleteProduct", data, rol, userOwner);
}

function updateButton (code, id, owner) {

    if (rol !== "ADMIN") {
        if (owner !== userOwner) {
            Toastify({
                text: "No podes Actualizar este producto",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                style: {
                    background: "linear-gradient(to right, #353434, #000)",
                    color: "#ebce0f",
                },
            }).showToast();
        }
    }

    const stockUp = document.getElementById("stockUpdate"+code).value;
    const priceUp = document.getElementById("priceUpdate"+code).value;
    const data = {
        stock: !stockUp ? "" : stockUp,
        price: !priceUp ? "" : Number(priceUp)
    }

    socket.emit("updateProduct", id, data, rol, userOwner);

    document.getElementById("buttons"+code).classList.remove("flex");
    document.getElementById("buttons"+code).classList.add("novisible");
    document.getElementById("loading"+code).classList.remove("novisible");
    document.getElementById("loading"+code).classList.add("flex");

}

function delImg (id, owner) {

    if (rol !== "ADMIN") {
        if (owner !== userOwner) {
            Toastify({
                text: "No podes Actualizar este producto",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                style: {
                    background: "linear-gradient(to right, #353434, #000)",
                    color: "#ebce0f",
                },
            }).showToast();
        }
    }

    socket.emit("delImg", id, rol, userOwner);
}




function capitalize(text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}


button.addEventListener("click", (e) => {
    e.preventDefault();
    const form = document.getElementById("formRTform");

    const title = document.querySelector("#title");
    const category = document.querySelector("#category");
    const description = document.querySelector("#description");
    const price = document.querySelector("#price");
    const code = document.querySelector("#code");
    const stock = document.querySelector("#stock");

    const newProduct = {
        title: capitalize(title.value),
        category: category.value.toUpperCase(),
        description: capitalize(description.value),
        price: Number(price.value).toFixed(2),
        code: code.value.toUpperCase(),
        stock: Number(stock.value),
        owner: userOwner,
    };
    socket.emit("addProduct", newProduct, rol, userOwner);

    form.reset();

});

socket.on("resultado", (data) => {
    Toastify({
        text: data,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #1c1c1c, #000)",
            color: "#e9ebec",
        },
    }).showToast();
});

socket.emit("user", rol, userOwner)

function update (code) {
    document.getElementById("item"+code).classList.add("novisible");
    document.getElementById("item"+code).classList.remove("flex");
    document.getElementById("update"+code).classList.remove("novisible");
    document.getElementById("update"+code).classList.add("flex");
}

function noUpdate (code) {
    document.getElementById("item"+code).classList.remove("novisible");
    document.getElementById("item"+code).classList.add("flex");
    document.getElementById("update"+code).classList.add("novisible");
    document.getElementById("update"+code).classList.remove("flex");
}

socket.on("listProducts", (data) => {
    const logProduct = document.querySelector("#listProducts");
    let listProducts = "";
    let products = data;
    const sinStock = [];
    const stockBajo = [];
    const conStock = [];
    for (prod of products) {
        if (prod.stock == 0) {
            sinStock.push(prod);
        } else if (prod.stock > 0 && prod.stock < 10) {
            stockBajo.push(prod);
        } else {
            conStock.push(prod);
        }
    }

    sinStock.forEach((element) => {
        listProducts += `<div id="item${element.code}" class="borderRT ss flex w100">
                            <div class="imgRT">
                                <img class="" src="img/products/${element.img}">
                            </div>
                            <div class="flex w100 between marginRT">
                                <div class="flex between w100 marginRT">
                                    <div class="">
                                        <h3>${element.title}</h3>
                                        <div>
                                            <p>Categoria: ${element.category}</p>
                                            <p>${element.description}</p>
                                        </div>
                                    </div>
                                    <div class="">
                                        <p>Codigo: ${element.code}  -  Stock: ${element.stock}</p>
                                        <p>$ ${element.price.toFixed(2)}.-</p>
                                    </div>
                                </div>
                                <div class="flex colum">
                                    <button class="btn btnRT btnWARNIG" onClick="update('${element.code}')">Modificar</button>
                                    <button class="btn btnRT btnRED" onClick="deleteItem('${element._id}', '${element.owner}')">Borrar</button>
                                </div>
                            </div>
                        </div>


                        <div id="update${element.code}" class="borderRT ss colum w100 novisible">
                            <div class="w100 flex">
                                <div class="imgRT">
                                    <img class="" src="img/products/${element.img}">
                                </div>
                                <div class="flex w100 between">
                                    <div class="flex w100 between marginRT">
                                        <div class="w40">
                                            <div>
                                                <h3>${element.title}</h3>
                                                <p>Codigo: ${element.code}</p>
                                            </div>
                                            <div>
                                                <p>Categoria: ${element.category}</p>
                                                <p>${element.description}</p>
                                            </div>
                                        </div>
                                        <div class="w60">
                                            <p>Stock: <input type="number" placeholder="Tu stock actual es: ${element.stock}" name="stockUpdate${element.code}" id="stockUpdate${element.code}"></p>
                                            <p>Precio $ <input type="number" placeholder="Tu precio actual es: ${element.price.toFixed(2)}" name="priceUpdate${element.code}" id="priceUpdate${element.code}"></p>

                                            <form action="/api/products/${element._id}/documents" method="POST" class="borderRTI" enctype="multipart/form-data">
                                                <div class="">
                                                    <div class="">
                                                        <p>Agrega una imagen a tu producto</p>
                                                        <input class="w100" type="file" name="products" required>
                                                        <button class="btn btnRT btnGREY" type="submit">Enviar!</button>
                                                    </div>
                                                </div>
                                            </form>
                                            <button class="btn btnRT btnRED" onClick="delImg('${element._id}', '${element.owner}')">Eliminar Imagen</button>

                                        </div>
                                    </div>
                                    <div class="flex colum" id="buttons${element.code}">
                                        <button class="btn btnRT btnGREY" onClick="noUpdate('${element.code}')">Cancelar</button>
                                        <button class="btn btnRT btnWARNIG" onClick="updateButton('${element.code}', '${element._id}', '${element.owner}')">Actualizar</button>
                                    </div>
                                </div>
                            </div>
                            <div class="w100 loading novisible" id="loading${element.code}">
                                <h3>ACTUALIZANDO...</h3>
                            </div>
                        </div>
                        
                        `;
    })

    stockBajo.forEach((element) => {
        listProducts += `<div id="item${element.code}" class="borderRT sb flex w100">
                            <div class="imgRT">
                                <img class="" src="img/products/${element.img}">
                            </div>
                            <div class="flex w100 between marginRT">
                                <div class="flex between w100 marginRT">
                                    <div class="">
                                        <h3>${element.title}</h3>
                                        <div>
                                            <p>Categoria: ${element.category}</p>
                                            <p>${element.description}</p>
                                        </div>
                                    </div>
                                    <div class="">
                                        <p>Codigo: ${element.code}  -  Stock: ${element.stock}</p>
                                        <p>$ ${element.price.toFixed(2)}.-</p>
                                    </div>
                                </div>
                                <div class="flex colum">
                                    <button class="btn btnRT btnWARNIG" onClick="update('${element.code}')">Modificar</button>
                                    <button class="btn btnRT btnRED" onClick="deleteItem('${element._id}', '${element.owner}')">Borrar</button>
                                </div>
                            </div>
                        </div>


                        <div id="update${element.code}" class="borderRT sb colum w100 novisible">
                            <div class="w100 flex">
                                <div class="imgRT">
                                    <img class="" src="img/products/${element.img}">
                                </div>
                                <div class="flex w100 between">
                                    <div class="flex w100 between marginRT">
                                        <div class="w40">
                                            <div>
                                                <h3>${element.title}</h3>
                                                <p>Codigo: ${element.code}</p>
                                            </div>
                                            <div>
                                                <p>Categoria: ${element.category}</p>
                                                <p>${element.description}</p>
                                            </div>
                                        </div>
                                        <div class="w60">
                                            <p>Stock: <input type="number" placeholder="Tu stock actual es: ${element.stock}" name="stockUpdate${element.code}" id="stockUpdate${element.code}"></p>
                                            <p>Precio $ <input type="number" placeholder="Tu precio actual es: ${element.price.toFixed(2)}" name="priceUpdate${element.code}" id="priceUpdate${element.code}"></p>

                                            <form action="/api/products/${element._id}/documents" method="POST" class="borderRTI" enctype="multipart/form-data">
                                                <div class="">
                                                    <div class="">
                                                        <p>Agrega una imagen a tu producto</p>
                                                        <input class="w100" type="file" name="products" required>
                                                        <button class="btn btnRT brtGREY" type="submit">Enviar!</button>
                                                    </div>
                                                </div>
                                            </form>
                                            <button class="btn btnRT btnRED" onClick="delImg('${element._id}', '${element.owner}')">Eliminar Imagen</button>

                                        </div>
                                    </div>
                                    <div class="flex colum" id="buttons${element.code}">
                                        <button class="btn btnRT btnGREY" onClick="noUpdate('${element.code}')">Cancelar</button>
                                        <button class="btn btnRT btnWARNIG" onClick="updateButton('${element.code}', '${element._id}', '${element.owner}')">Actualizar</button>
                                    </div>
                                </div>
                            </div>
                            <div class="w100 loading novisible" id="loading${element.code}">
                                <h3>ACTUALIZANDO...</h3>
                            </div>
                        </div>
                        
                        `;
    })

    conStock.forEach((element) => {
        listProducts += `<div id="item${element.code}" class="borderRT cs flex w100">
                            <div class="imgRT">
                                <img class="" src="img/products/${element.img}">
                            </div>
                            <div class="flex w100 between marginRT">
                                <div class="flex between w100 marginRT">
                                    <div class="">
                                        <h3>${element.title}</h3>
                                        <div>
                                            <p>Categoria: ${element.category}</p>
                                            <p>${element.description}</p>
                                        </div>
                                    </div>
                                    <div class="">
                                        <p>Codigo: ${element.code}  -  Stock: ${element.stock}</p>
                                        <p>$ ${element.price.toFixed(2)}.-</p>
                                    </div>
                                </div>
                                <div class="flex colum">
                                    <button class="btn btnRT btnWARNIG" onClick="update('${element.code}')">Modificar</button>
                                    <button class="btn btnRT btnRED" onClick="deleteItem('${element._id}', '${element.owner}')">Borrar</button>
                                </div>
                            </div>
                        </div>


                        <div id="update${element.code}" class="borderRT cs colum w100 novisible">
                            <div class="w100 flex">
                                <div class="imgRT">
                                    <img class="" src="img/products/${element.img}">
                                </div>
                                <div class="flex w100 between">
                                    <div class="flex w100 between marginRT">
                                        <div class="w40">
                                            <div>
                                                <h3>${element.title}</h3>
                                                <p>Codigo: ${element.code}</p>
                                            </div>
                                            <div>
                                                <p>Categoria: ${element.category}</p>
                                                <p>${element.description}</p>
                                            </div>
                                        </div>
                                        <div class="w60">
                                            <p>Stock: <input type="number" placeholder="Tu stock actual es: ${element.stock}" name="stockUpdate${element.code}" id="stockUpdate${element.code}"></p>
                                            <p>Precio $ <input type="number" placeholder="Tu precio actual es: ${element.price.toFixed(2)}" name="priceUpdate${element.code}" id="priceUpdate${element.code}"></p>

                                            <form action="/api/products/${element._id}/documents" method="POST" class="borderRTI" enctype="multipart/form-data">
                                                <div class="">
                                                    <div class="">
                                                        <p>Agrega una imagen a tu producto</p>
                                                        <input class="w100" type="file" name="products" required>
                                                        <button class="btn btnRT btnGREY" type="submit">Enviar!</button>
                                                    </div>
                                                </div>
                                            </form>
                                            <button class="btn btnRT btnRED" onClick="delImg('${element._id}', '${element.owner}')">Eliminar Imagen</button>

                                        </div>
                                    </div>
                                    <div class="flex colum" id="buttons${element.code}">
                                        <button class="btn btnRT btnGREY" onClick="noUpdate('${element.code}')">Cancelar</button>
                                        <button class="btn btnRT btnWARNIG" onClick="updateButton('${element.code}', '${element._id}', '${element.owner}')">Actualizar</button>
                                    </div>
                                </div>
                            </div>
                            <div class="w100 loading novisible" id="loading${element.code}">
                                <h3>ACTUALIZANDO...</h3>
                            </div>
                        </div>
                        
                        `;
    })



    logProduct.innerHTML = listProducts;
})

