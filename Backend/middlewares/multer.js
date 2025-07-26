import Multer from 'multer';

const multer = (specialRoutes = []) => (req, res, next) => {
    const upload = Multer({ storage: Multer.memoryStorage() });

    if (specialRoutes.some(spRoute => req.path.includes(spRoute))) {
        return upload.single('profilePicture')(req, res, next);
    }

    if (req.path.includes('/lectures')) {
        return upload.array('lectureFiles', 10)(req, res, next); // Allow up to 10 files
    }

    if (req.path.includes('/students')) {
        return upload.array('studentImages', 10)(req, res, next); // Allow up to 10 files
    }

    return upload.any()(req, res, next);
};

export default multer;