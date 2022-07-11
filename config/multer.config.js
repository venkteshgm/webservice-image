const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({storage: storage});
// const upload = multer({})

module.exports = upload;