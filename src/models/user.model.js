import mongoose from "mongoose";

const schema = new mongoose.Schema({
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        index: true,
        unique: true
    },
    blocked: {
        tried: {
            type: Number,
            default: 3
        },
        status: {
        type: Boolean,
        default: false
        }
    },
    password: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true
    },

    role: {
        type: String,
        enum: ["ADMIN", "USER", "PREMIUM"],
        default: "USER"
    },

    resetToken: {
        token: String,
        tried: Number,
        expire: Date
    },

    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts" 
    },

    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages" 
    },

    favorite: { type: Array, default: [] },

    purchases: [{
        purchasesId: { type: mongoose.Schema.Types.ObjectId, ref: "tickets" },
        code: { type: String, required: true, default: 1 },
        }],

    team: { type: Array, 'default': [] },

    login: { type: String },

    documents: [{
        name: String,
        file: String,
        reference: String
    }], 

    img: {
        type: String,
        default: "sinImg.png"
    },

    last_connection: {
        type: Date, 
        default: Date.now
    },

    register_date: {
        type: Date, 
        default: Date.now
    },
    
})

const UserModel = mongoose.model("users", schema);

export default UserModel;