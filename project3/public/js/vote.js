window.onload = function () {
    console.log("Vote page loaded. Checking image statuses...");

    let cat1Img = document.getElementById("cat1-image");
    let cat2Img = document.getElementById("cat2-image");

    // Replace broken images with a fallback image
    cat1Img.onerror = function () {
        console.error("Error loading cat1 image:", cat1Img.src);
        cat1Img.src = "/images/fallback.jpg"; // Use a default placeholder image
    };

    cat2Img.onerror = function () {
        console.error("Error loading cat2 image:", cat2Img.src);
        cat2Img.src = "/images/fallback.jpg";
    };
};
