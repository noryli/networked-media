const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();

// Function to reset the user's daily vote count
const resetDailyVotes = (req) => {
    let today = new Date().toISOString().slice(0, 10); // Get today's date (YYYY-MM-DD)
    
    // If it's a new day, reset vote count
    if (req.session.lastVoteDate !== today) {
        req.session.voteCount = 0;
        req.session.lastVoteDate = today;
    }
};



// Set up EJS
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Enable session tracking
app.use(
    session({
        secret: "catoutfitcontest",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    })
);

const catsFile = path.join(__dirname, "data", "cats.json");
const themeFile = path.join(__dirname, "data", "theme.json");

// Ensure data folder and JSON file exist
if (!fs.existsSync("data")) {
    fs.mkdirSync("data", { recursive: true });
}
if (!fs.existsSync(catsFile)) {
    fs.writeFileSync(catsFile, "[]", "utf8");
}
if (!fs.existsSync(themeFile)) {
    fs.writeFileSync(themeFile, JSON.stringify({ lastUpdated: 0, theme: "" }), "utf8");
}

// List of Themes (Every week, one is randomly selected)
const themes = [
    "Cutest Outfit", "Adorable Cat Fashion", "Teddy Bear Look",
    "Little Gentlecat & Ladycat", "Fairy Tale Princess & Knight",
    "Royal Cat Kingdom", "Superhero Meow", "Anime Character Cosplay",
    "Rainbow Meow Look", "Black & White Elegance", "Pastel Dream Fashion",
    "Tropical Summer Look", "Autumn Cozy Style", "Winter Wonderland Outfit",
    "Preppy School Look", "Hip-Hop Street Style", "Halloween Spooky Fashion",
    "Christmas Elf Cat", "Lunar New Year Fortune Cat", "Cherry Blossom Festival Look",
    "Funniest Cat Outfit", "Human-Inspired Fashion", "Unexpected Style Challenge",
    "Career Cat: Doctor, Chef, Pilot, etc.", "Most Unique Fashion Look"
];

// Function to read cat data
const readCatsData = () => JSON.parse(fs.readFileSync(catsFile, "utf8"));

// Function to reset cat data
const clearCatsData = () => {
    fs.writeFileSync(catsFile, "[]", "utf8");
};

const getCurrentTheme = () => {
    // Check if the file is empty or corrupted
    if (!fs.existsSync(themeFile) || fs.readFileSync(themeFile, "utf8").trim() === "") {
        //  Initialize theme.json with a default theme
        fs.writeFileSync(themeFile, JSON.stringify({ lastUpdated: 0, theme: "Cutest Outfit" }), "utf8");
    }

    let themeData = JSON.parse(fs.readFileSync(themeFile, "utf8"));
    let currentWeek = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)); 

    if (themeData.lastUpdated !== currentWeek) {
        // Pick a new random theme
        const newTheme = themes[Math.floor(Math.random() * themes.length)];
        themeData = { lastUpdated: currentWeek, theme: newTheme };
        fs.writeFileSync(themeFile, JSON.stringify(themeData, null, 2));
    }

    return themeData.theme;
};

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: "public/uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Landing Page Route
app.get("/", (req, res) => {
    res.render("landing", { cssFile: "landing.css" });
});

// Voting Page - Prevents Repeated Cats Until All Have Been Seen
app.get("/vote", (req, res) => {
    let cats = readCatsData();
    if (cats.length < 2) return res.send("Not enough cats for voting!");

    // Reset votes daily for the user
    resetDailyVotes(req);

    // Check if user has exceeded daily vote limit
    if (req.session.voteCount >= 10) {
        return res.render("vote", { voteLimitReached: true, cat1: null, cat2: null, todayTheme: getCurrentTheme(), cssFile: "vote.css" });
    }

    // Initialize session tracking as an array
    if (!req.session.seenCats) {
        req.session.seenCats = [];
    }

    // Get remaining cats that haven't been seen
    let remainingCats = cats.filter((cat) => !req.session.seenCats.includes(cat.id));

    // If all cats have been seen, reset session tracking
    if (remainingCats.length < 2) {
        req.session.seenCats = [];
        remainingCats = cats; // Restart from full list
    }

    // Shuffle and select two unique cats
    remainingCats.sort(() => 0.5 - Math.random());
    const [cat1, cat2] = remainingCats.slice(0, 2);

    // Add selected cats to session tracking
    req.session.seenCats.push(cat1.id);
    req.session.seenCats.push(cat2.id);

    res.render("vote", { voteLimitReached: false, cat1, cat2, todayTheme: getCurrentTheme(), cssFile: "vote.css" });
});

// Vote for a cat & refresh new pair
app.post("/vote/:id", (req, res) => {
    let cats = readCatsData();
    let cat = cats.find((c) => c.id == req.params.id);
    if (cat) {
        cat.likes += 1;
        fs.writeFileSync(catsFile, JSON.stringify(cats, null, 2));
    }

    // Increment vote count for the user
    if (!req.session.voteCount) {
        req.session.voteCount = 0;
    }
    req.session.voteCount += 1;

    res.redirect("/vote");
});
// Start server
app.listen(5557, () => {
    console.log(`Server is live at http://127.0.0.1:5557}`);
});