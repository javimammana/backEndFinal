import multer from "multer";
import mime from "mime";
import fs from 'fs';
import path from 'path';

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { id } = req.params;
        let destinationFolder; 
        switch(file.fieldname) {
            case "profile": 
                destinationFolder = `./src/public/img/profile/${id}`;
                break; 
            case "products": 
                destinationFolder = `./src/public/img/products`;
                break; 
            case "identificacion": 
                destinationFolder = `./src/uploads/documents/${id}`
                break; 
            case "cuenta": 
                destinationFolder = `./src/uploads/documents/${id}`
                break; 
            case "domicilio": 
                destinationFolder = `./src/uploads/documents/${id}`
        }

        ensureDirectoryExists(destinationFolder);

        cb(null, destinationFolder); 
    }, 
    filename: (req, file, cb) => {
        const { id } = req.params;
        let name;
        switch(file.fieldname) {
            case "profile": 
                name = `${id}.${mime.getExtension(file.mimetype)}`;
                break; 
            case "products": 
                name = `${id}.${mime.getExtension(file.mimetype)}`;
                break; 
            case "identificacion": 
                name = file.originalname;
                break; 
            case "cuenta": 
                name = file.originalname;
                break; 
            case "domicilio": 
                name = file.originalname
        }
        cb(null, name); 
    }
})

const upload = multer({storage:storage}); 

export default upload