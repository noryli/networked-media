window.onload = function () {
    console.log("Leaderboard page loaded.");

    function checkImage(id) {
        let img = document.getElementById(id);
        img.onerror = function () {
            console.error("Error loading image:", img.src);
            img.src = "/images/fallback.jpg"; // Use a default placeholder image
        };
    }

    checkImage("cat-first");
    checkImage("cat-second");
    checkImage("cat-third");
};
