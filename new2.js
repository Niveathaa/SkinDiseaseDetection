const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const axios = require("axios");
const multer = require("multer"); // Import multer
const fs = require("fs");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

app.get("/", function (req, res) {
    res.render("home");
});

// Modify the route to use upload middleware for file upload
app.post("/home", upload.single("mypic"), async (req, res) => {
    try {
        const imageFile = req.file; // The uploaded image file
        const imageBase64 = await downloadImage(imageFile.path);

        const response = await axios({
            method: "POST",
            url: "https://classify.roboflow.com/skin-diseases-bkejc/3",
            params: {
                api_key: "M6oxJf5NekkCnMy2Vrx8"
            },
            data: imageBase64,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        console.log(response.data);
        // Handle the response data or send it to the client as needed
        res.send(response.data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
});

async function downloadImage(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (error, data) => {
            if (error) {
                reject(error);
                return;
            }

            const base64Image = Buffer.from(data).toString("base64");
            resolve(base64Image);
        });
    });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});
