import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, path.resolve('uploads/images'));
        } else {
            cb(null, path.resolve('uploads/videos'));
        }
    },
    filename: (req: any, file: any, cb: any) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

export { upload }