const supabase = require('../middleware/supabaseClient'); // Import Supabase client
const path = require('path'); // Untuk menangani ekstensi file gambar

// Fungsi untuk mengunggah gambar ke Supabase Storage
const uploadImageToStorage = async (picture, productName) => {
    const fileBuffer = picture.buffer;
    const fileName = `${productName}${path.extname(picture.originalname)}`; // Menyusun nama file dari produk dan ekstensi
    const filePath = `public/${fileName}`; // Menyimpan file di folder public

    // Upload gambar ke Supabase Storage
    const { data, error } = await supabase
        .storage
        .from('image') // Nama bucket storage yang telah Anda buat
        .upload(filePath, fileBuffer, {
            contentType: picture.mimetype, // Tipe konten berdasarkan file yang diupload
            upsert: true, // Jika file dengan nama yang sama ada, replace file tersebut
        });

    if (error) {
        throw new Error('Error uploading image to Supabase Storage: ' + error.message);
    }

    return fileName; // Mengembalikan nama file yang telah diupload
};

module.exports = { uploadImageToStorage }; // Pastikan fungsi diekspor dengan benar