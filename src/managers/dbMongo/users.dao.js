import UserModel from "../../models/user.model.js";

class UserDao {
    async createUser (data) {
        try {
            const user = await UserModel.create(data);
            return user;
        } catch (error) {
            console.log(error)
            throw new Error ("(DAO) Error al crear usuario");
        }
    }

    async getUsers () {
        try {
            const users = await UserModel.find();
            return users;
        } catch (error) {
            throw new Error ("(DAO) Error al buscar usuarios");
        }
    }

    async getUserById (id) {
        try {
            const user = await UserModel.findById(id);
            return user;
        } catch (error) {
            throw new Error ("(DAO) Error al buscar usuario por ID");
        }
    }

    async getUserByEmail (email) {
        try {
            const user = await UserModel.findOne(email);
            return user;
        } catch (error) {
            throw new Error ("(DAO) Error al buscar usuario por eMail");
        }
    }

    async updateUserById(id, data) {
        try {
            const user = await UserModel.findByIdAndUpdate(id, data, {new: true});
            return user;
        } catch (error) {
            throw new Error ("(DAO) Error al actualizar Usuario");
        }
    }

    async deleteUser (id) {
        try {
            const user = await UserModel.findByIdAndDelete(id);
            return user;
        } catch (error) {
            throw new Error ("(DAO) Error al eliminar Usuario");
        }
    }
}


export default UserDao;