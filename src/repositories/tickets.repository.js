import TicketDao from "../managers/dbMongo/tickets.dao.js";

const ticketRepository = new TicketDao();

class TicketRepository {

    async createTicket (cart) {
        try {
            const codeNumber = await ticketRepository.code();
            const cartBuy = {...cart, code: `${cart.code}${codeNumber}`, purchaser_datetime: new Date()}
            const ticket = await ticketRepository.createTicket(cartBuy);
            return ticket;
        } catch (error) {
            console.log ("(REPOSITORY) Error al crear Ticket");
            return false;
        }
    }

    async getTicketById(id) {
        try {
            const ticket = await ticketRepository.getTicket(id);
            return ticket;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Ticket por ID");
            return false;
        }
    }

    async getTickets() {
        try {
            const ticket = await ticketRepository.getAllTickets();
            return ticket;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar todos los Ticket");
            return false;
        }
    }

}

export default TicketRepository;