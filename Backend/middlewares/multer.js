const Multer = require('multer');

const multer = (specialRoutes = []) => (req, res, next) => {
    const upload = Multer({ storage: Multer.memoryStorage() });
    if (specialRoutes.some(spRoute => req.path.includes(spRoute))) {
        return upload.single('profilePicture')(req, res, next);
    }
    return upload.any()(req, res, next);
};

module.exports = multer;