import fs from 'fs';
import multer from "multer";
import path from 'path'

const storage = multer.memoryStorage()

export const memoryStorage = multer({ storage: storage })

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // const mediaType = getMediaType(file.originalname);

    const dest = path.join('uploads/');

    // Check if directory exists, if not, create it
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true }); // recursive ensures all nested directories are created
    }

    cb(null, dest); // set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`); // set the filename to the original filename
  },
});
// export const multerUpload = multer({ dest: 'uploads/' })


export const multerUpload = multer({
  storage: localStorage,
  // limits: {
  //   fileSize: 2 * 1024 * 1024 * 1024  // Set file size limit to 2GB
  // }
});


// export const multerUpload = multer({
//   storage: storage,
//   limits: { fileSize: 10485760 }, // set the file size limit to 1MB
// });

// const s3Storage = multerS3({
//   s3: s3,
//   bucket: "nftempo",
//   acl: "public-read",
//   metadata: function (req, file, cb) {
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: function (req, file, cb) {
//     cb(
//       null,
//       `${!IN_PROD ? "tmp/" : ""}${file.fieldname}/${Date.now()}-${
//         file.originalname
//       }`
//     );
//   },
// });

// export const multerUpload = multer({
//   storage: s3Storage,
//   limits: { fileSize: 20485760 }, // set the file size limit to 10MB
// });



// import fs from 'fs';
// import path from 'path';
// import multer from 'multer';

// const STORAGE_LOCATION = './uploads'; // Replace with your desired storage location

// const localStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = path.join(STORAGE_LOCATION, file.fieldname);

//     // Check if directory exists, if not then create it
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     cb(null, dir); // set the destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // set the filename to the original filename
//   },
// });

// export const multerUpload = multer({ storage: localStorage });




// function computeFileHash(filePath: string) {
//   const fileContent = fs.readFileSync(filePath);
//   return crypto.createHash('md5').update(fileContent).digest('hex');
// }

// const localStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const mediaType = getMediaType(file.originalname);

//     const dest = path.join(STORAGE_LOCATION, mediaType);

//     // Check if directory exists, if not, create it
//     if (!fs.existsSync(dest)) {
//       fs.mkdirSync(dest, { recursive: true }); // recursive ensures all nested directories are created
//     }

//     cb(null, dest); // set the destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     let finalName = file.originalname;
//     //refactor file name;

//     const mediaType = getMediaType(file.originalname);

//     const existingFilePath = path.join(STORAGE_LOCATION, mediaType, finalName);
//     if (fs.existsSync(existingFilePath)) {
//       const uploadedFilePath = file.path; // Temp path where multer stores the uploaded file
//       const uploadedFileHash = computeFileHash(uploadedFilePath);
//       const existingFileHash = computeFileHash(existingFilePath);

//       if (uploadedFileHash === existingFileHash) {
//         // File is a duplicate
//         return cb(null, finalName); // Use the existing filename
//       } else {
//         // File has the same name but different content
//         const baseName = path.basename(finalName, path.extname(finalName));
//         const extension = path.extname(finalName);
//         let counter = 1;
//         finalName = `${baseName}_${counter}${extension}`;
//         while (fs.existsSync(path.join(STORAGE_LOCATION, mediaType, finalName))) {
//           counter++;
//           finalName = `${baseName}_${counter}${extension}`;
//         }
//       }
//     }

//     cb(null, `${finalName}`); // set the filename to the original filename
//     //  cb(null, `${Date.now()}-${file.originalname}`); // set the filename to the original filename

//   },
// });


// Hashing on Client-Side:

// Before uploading, compute the hash of the file content on the client-side.
// Send this hash along with the file during the upload.
// On the server, check if a file with this hash already exists. If it does, you can skip the upload or handle it accordingly.
// Use memoryStorage with Multer:

// Store the uploaded file in memory.
// Compute the hash from the file buffer.
// Check against existing files' hashes. If the same hash is found, it means the content is duplicate.
// Be cautious with this method as it can be memory-intensive for large files.
// Temporary Storage:

// Save the uploaded file to a temporary location first.
// Compute its hash and check against existing files.
// If it's a duplicate, you can delete the temporary file or overwrite the existing one based on your requirements.
// Database of Hashes:

// Whenever a file is uploaded, compute its hash and store it in a database.
// For subsequent uploads, compute the hash and check against the database.
// This way, you can quickly check if the same content has been uploaded before.
// Hash During Streaming:

// As the file is being uploaded and streamed to your server, compute its hash on-the-fly.
// Once the stream ends, you will have the hash which can be checked against existing file hashes.