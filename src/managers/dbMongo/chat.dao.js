import { ChatModel } from "../../models/chat.model.js";

class ChatDao {

    async getAllMessages() {
        const chats = await ChatModel.find();
        return chats;
    }

    async sendMessage(data) {
        const mensaje = await ChatModel.create(data);
        return mensaje;
    }

}

export default ChatDao;