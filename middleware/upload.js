const multer = require('multer');
const storage = multer.memoryStorage(); // Gunakan memoryStorage agar file di-upload langsung ke buffer
const upload = multer({ storage: storage }).single('picture'); // Ambil file dari field 'picture'

module.exports = upload;
