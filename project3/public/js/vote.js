window.onload = function () {
    console.log("Vote page loaded. Checking image statuses...");

    let cat1Img = document.getElementById("cat1-image");
    let cat2Img = document.getElementById("cat2-image");

};

function submitVote(catId) {
    fetch(`/vote/${catId}`, { method: "POST" })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url; 
            }
        });
}