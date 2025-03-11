const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Ensure static files (CSS, JS) are accessible

// Enable session tracking to prevent duplicate voting on the same cats
app.use(
    session({
        secret: "catoutfitcontest",
        resave: false,
        saveUninitialized: true,
    })
);

const catsFile = path.join(__dirname, "data", "cats.json");
const themeFile = path.join(__dirname, "data", "theme.json");

// Ensure "data" directory and JSON files exist
if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
if (!fs.existsSync(catsFile)) fs.writeFileSync(catsFile, "[]", "utf8");
if (!fs.existsSync(themeFile)) fs.writeFileSync(themeFile, JSON.stringify({ lastUpdated: 0, theme: "Cutest Outfit" }), "utf8");

// Read cat data and filter out missing image files
const readCatsData = () => {
    let cats = JSON.parse(fs.readFileSync(catsFile, "utf8"));
    cats = cats.filter(cat => fs.existsSync(path.join(__dirname, "public", cat.image)));
    fs.writeFileSync(catsFile, JSON.stringify(cats, null, 2));
    return cats;
};

// Weekly outfit theme rotation
const themes = [
    "Cutest Outfit", "Teddy Bear Look", "Fairy Tale Princess & Knight",
    "Superhero Meow", "Pastel Dream Fashion", "Winter Wonderland Outfit",
    "Hip-Hop Street Style", "Halloween Spooky Fashion", "Christmas Elf Cat"
];

// Get the current weekly theme (updates every Monday)
const getCurrentTheme = () => {
    let themeData = JSON.parse(fs.readFileSync(themeFile, "utf8"));
    let currentWeek = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));

    if (themeData.lastUpdated !== currentWeek) {
        // Select a random new theme for this week
        const newTheme = themes[Math.floor(Math.random() * themes.length)];
        themeData = { lastUpdated: currentWeek, theme: newTheme };
        fs.writeFileSync(themeFile, JSON.stringify(themeData, null, 2));
    }
    return themeData.theme;
};

// Configure file upload settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "public/uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ** Landing Page **
app.get("/", (req, res) => {
    res.render("landing", { cssFile: "landing.css" });
});

// ** Home Page **
app.get("/home", (req, res) => {
    const cats = readCatsData();
    const topCats = cats.sort((a, b) => b.likes - a.likes).slice(0, 3);
    res.render("index", { topCats, todayTheme: getCurrentTheme(), cssFile: "home.css" });
});

// ** Upload Page **
app.get("/upload", (req, res) => {
    res.render("upload", { cssFile: "upload.css" });
});

// Handle cat photo uploads
app.post("/upload", upload.single("photo"), (req, res) => {
    let cats = readCatsData();
    const newCat = {
        id: Date.now(),
        name: req.body.name,
        description: req.body.description || "",
        image: "/uploads/" + req.file.filename,
        likes: 0,
    };
    cats.push(newCat);
    fs.writeFileSync(catsFile, JSON.stringify(cats, null, 2));
    res.redirect("/home");
});

// ** Voting Page - Prevents the same cat from appearing twice in a row **
app.get("/vote", (req, res) => {
    let cats = readCatsData();
    if (cats.length < 2) return res.send("Not enough cats for voting!");

    // Initialize session tracking for seen cats
    if (!req.session.seenCats) req.session.seenCats = [];

    // Filter out already seen cats
    let remainingCats = cats.filter(cat => !req.session.seenCats.includes(cat.id));

    // If all cats have been seen, reset the session tracking
    if (remainingCats.length < 2) {
        req.session.seenCats = [];
        remainingCats = cats;
    }

    // Randomly select two unique cats for voting
    remainingCats.sort(() => 0.5 - Math.random());
    const [cat1, cat2] = remainingCats.slice(0, 2);

    // Track selected cats to prevent repeats
    req.session.seenCats.push(cat1.id, cat2.id);

    res.render("vote", { cat1, cat2, todayTheme: getCurrentTheme(), cssFile: "vote.css" });
});

// ** Handle voting submission **
app.post("/vote/:id", (req, res) => {
    let cats = readCatsData();
    let cat = cats.find(c => c.id == req.params.id);
    if (cat) {
        cat.likes += 1;
        fs.writeFileSync(catsFile, JSON.stringify(cats, null, 2));
    }
    res.redirect("/vote");
});

// ** Leaderboard Page **
app.get("/leaderboard", (req, res) => {
    let cats = readCatsData();
    cats.sort((a, b) => b.likes - a.likes);
    res.render("leaderboard", { cats, cssFile: "leaderboard.css" });
});

// Start server
app.listen(5558, () => {
    console.log(`Server is live at http://127.0.0.1:5558}`);
});



