import UserRepository from "../repositories/users.repository.js";
import ProductRepository from "../repositories/products.repository.js";
import CartRepository from "../repositories/carts.repository.js";
import TicketRepository from "../repositories/tickets.repository.js";
import ChatRepository from "../repositories/chat.repository.js";


export const userServices = new UserRepository();
export const productServices = new ProductRepository();
export const cartServices = new CartRepository();
export const ticketServices = new TicketRepository();
export const chatServices = new ChatRepository();