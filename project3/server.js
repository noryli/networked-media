const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); 

// Use session to track user data
app.use(session({
    secret: "catoutfitcontest",
    resave: false,
    saveUninitialized: true,
}));

// Define data file paths
const catsFile = path.join(__dirname, "data", "cats.json");
const themeFile = path.join(__dirname, "data", "theme.json");

// Ensure "data" directory and files exist
if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
if (!fs.existsSync(catsFile)) fs.writeFileSync(catsFile, "[]", "utf8");
if (!fs.existsSync(themeFile)) fs.writeFileSync(themeFile, JSON.stringify({ lastUpdated: 0, theme: "Cutest Outfit" }), "utf8");

// Read cat data
function readCatsData() {
    try {
        let cats = JSON.parse(fs.readFileSync(catsFile, "utf8"));
        return cats.filter(cat => fs.existsSync(path.join(__dirname, "public", cat.image))); // Filter out missing images
    } catch (error) {
        console.error("Error reading cat data:", error);
        return [];
    }
}

// Get current week number
Date.prototype.getWeekNumber = function () {
    const startOfYear = new Date(this.getFullYear(), 0, 1);
    const pastDaysOfYear = (this - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

const themes = [
    "Cutest Outfit", "Teddy Bear Look", "Fairy Tale Princess & Knight",
    "Superhero Meow", "Pastel Dream Fashion", "Winter Wonderland Outfit",
    "Hip-Hop Street Style", "Halloween Spooky Fashion", "Christmas Elf Cat"
];

// Get current theme
function getCurrentTheme() {
    let themeData;
    try {
        themeData = JSON.parse(fs.readFileSync(themeFile, "utf8"));
    } catch (error) {
        console.error("Error reading theme data:", error);
        themeData = { lastUpdated: 0, theme: "Cutest Outfit" };
    }

    const currentWeek = new Date().getWeekNumber();
    if (themeData.lastUpdated !== currentWeek) {
        themeData = { lastUpdated: currentWeek, theme: themes[Math.floor(Math.random() * themes.length)] };
        fs.writeFileSync(themeFile, JSON.stringify(themeData, null, 2));
    }
    return themeData.theme;
}

// Configure file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "public/uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => res.render("landing"));

app.get("/home", (req, res) => {
    const cats = readCatsData().sort((a, b) => b.likes - a.likes).slice(0, 3);
    res.render("index", { topCats: cats, todayTheme: getCurrentTheme() });
});

app.get("/upload", (req, res) => res.render("upload"));

// Handle cat photo upload
app.post("/upload", upload.single("photo"), (req, res) => {
    let cats = readCatsData();
    cats.push({
        id: Date.now(),
        name: req.body.name,
        description: req.body.description || "",
        image: `/uploads/${req.file.filename}`,
        likes: 0,
    });
    fs.writeFileSync(catsFile, JSON.stringify(cats, null, 2));
    res.redirect("/home");
});

// Voting page
app.get("/vote", (req, res) => {
    let cats = readCatsData();
    if (cats.length < 2) return res.render("vote", { cat1: null, cat2: null, todayTheme: getCurrentTheme() });

    req.session.seenCats = req.session.seenCats?.slice(-50) || [];
    let remainingCats = cats.filter(cat => !req.session.seenCats.includes(cat.id));
    if (remainingCats.length < 2) {
        req.session.seenCats = [];
        remainingCats = cats;
    }

    // Select two random cats
    let randomIndexes = [];
    while (randomIndexes.length < 2) {
        let rand = Math.floor(Math.random() * remainingCats.length);
        if (!randomIndexes.includes(rand)) randomIndexes.push(rand);
    }
    const [cat1, cat2] = [remainingCats[randomIndexes[0]], remainingCats[randomIndexes[1]]];

    req.session.seenCats.push(cat1.id, cat2.id);
    res.render("vote", { cat1, cat2, todayTheme: getCurrentTheme() });
});

// Handle voting
app.post("/vote/:id", (req, res) => {
    let cats = readCatsData();
    let cat = cats.find(c => c.id == req.params.id);
    if (cat) {
        cat.likes += 1;
        fs.writeFileSync(catsFile, JSON.stringify(cats, null, 2));
    }
    res.redirect("/vote");
});

// Leaderboard page
app.get("/leaderboard", (req, res) => {
    let cats = readCatsData().sort((a, b) => b.likes - a.likes);
    res.render("leaderboard", { cats });
});

app.listen(5558, () => console.log(`Server running at http://127.0.0.1:5558`));
