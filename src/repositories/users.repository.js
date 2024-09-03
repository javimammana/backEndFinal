import UserDao from "../managers/dbMongo/users.dao.js";
import { DTO } from "../utils/utils.js";

const userDao = new UserDao();

class UserRepository {

    async createUser (data) {
        try {
            const newUser = await userDao.createUser(data);
            const user = DTO(newUser)
            return user;
        } catch (error) {
            console.log ("(REPOSITORY) Error al crear Usuario");
            return false;
        }
    }

    async getUsers () {
        try {
            const allUsers = await userDao.getUsers();
            const users = allUsers.map((user) => DTO(user));
            return users;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Usuarios");
            return false;
        }
    }

    async getUserById (id) {
        try {
            const getUser = await userDao.getUserById(id);
            const user = DTO(getUser);
            return user;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Usuario por ID");
            return false;
        }
    }

    async getUserByEmail (email) {
        try {
            const getUser = await userDao.getUserByEmail(email);
            const user = DTO(getUser);
            return user;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Usuario por EMAIL");
            return false;
        }
    }

    async getUserByCID (cid) {
        try {
            const getUser = await userDao.getUserByEmail(cid);
            const user = DTO(getUser);
            return user;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Usuario por EMAIL");
            return false;
        }
    }

    async getUserByEmailRP (email) {
        try {
            const user = await userDao.getUserByEmail(email);
            return user;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Usuario por EMAIL");
            return false;
        }
    }

    async updateUserById (id, data) {
        try {
            const userUpdate = await userDao.updateUserById(id, data);
            const user = DTO(userUpdate);
            return user;
        } catch (error) {
            
        }
    }

    async deleteUser (id) {
        try {
            const user = await userDao.deleteUser(id);
            return user;
        } catch (error) {
            console.log ("(REPOSITORY) Error al buscar Eliminar usuario");
            return false;
        }
    }
}



export default UserRepository;