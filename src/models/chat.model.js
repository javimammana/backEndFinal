import { Schema, model } from "mongoose";

const chatSchema = new Schema ({
    user: {type:String},
    msg: {type: String},
});

const ChatModel = model("messages", chatSchema);

export { ChatModel };