let oceanPalette = [
    "#00B4D8", "#0096C7", "#0077B6", "#023E8A", "#03045E", "#00122D"
];

let waveAmplitude = 0; 
let targetAmplitude = 0; 
let baseAmplitude = 0; 
let wavePhase = 0; 
let lastTime = "";
let waveDecay = 0.9; 
let waveSpeed = 0.1; 
let waveMoveSpeed = 0.02; 

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    const backgroundMusic = document.getElementById("background-music");
    backgroundMusic.play().catch(error => {
        console.log("loading music fail");
    });
}

function draw() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes; 

    let bgColor;
    if (totalMinutes >= 1260 || totalMinutes < 300) { 
        bgColor = color("#000515");
    } else if (totalMinutes >= 300 && totalMinutes < 420) {
        const progress = map(totalMinutes, 300, 420, 0, 1);
        bgColor = lerpColor(color("#000515"), color("#1E3A8A"), progress); 
    } else if (totalMinutes >= 420 && totalMinutes < 480) { 
        const progress = map(totalMinutes, 420, 480, 0, 1);
    } else if (totalMinutes >= 480 && totalMinutes < 660) { 
        bgColor = color("#87CEEB"); 
    } else if (totalMinutes >= 660 && totalMinutes < 720) {
        const progress = map(totalMinutes, 660, 720, 0, 1);
        bgColor = lerpColor(color("#87CEEB"), color("#BCE6F7"), progress); 
    } else if (totalMinutes >= 720 && totalMinutes < 780) {
        const progress = map(totalMinutes, 720, 780, 0, 1);
        bgColor = lerpColor(color("#BCE6F7"), color("#87CEEB"), progress); 
    } else if (totalMinutes >= 780 && totalMinutes < 1020) {
        bgColor = color("#87CEEB"); 
    } else if (totalMinutes >= 1020 && totalMinutes < 1260) { 
        const progress = map(totalMinutes, 1020, 1260, 0, 1);
        bgColor = lerpColor(color("#87CEEB"), color("#000515"), progress); 
    }

    background(bgColor); 


    drawTimeScale(bgColor);


    waveAmplitude += (targetAmplitude - waveAmplitude) * waveSpeed;


    const waveBaseHeight = map(totalMinutes, 0, 1440, height, 0); 


    const waveLayers = Math.floor(minutes / 10) + 1; 

    for (let i = 0; i < waveLayers; i++) {
        const colorWithAlpha = color(oceanPalette[i % oceanPalette.length]);
        colorWithAlpha.setAlpha(178); 
        fill(colorWithAlpha);
        noStroke();
        drawWave(waveBaseHeight + i * 10, i * 0.1 + wavePhase);
    }

    wavePhase += waveMoveSpeed; 

    if (targetAmplitude === baseAmplitude) {
        waveAmplitude *= waveDecay;
    }
}


function drawTimeScale(bgColor) {
    const scaleWidth = 80; 
    const hourHeight = height / 24;
    stroke(255);
    strokeWeight(1); 
    textSize(16); 
    textAlign(RIGHT, CENTER); 

    const bgBrightness = brightness(bgColor); 
    const textColor = bgBrightness > 128 ? color(0) : color(255); 
    fill(textColor); 

    for (let i = 0; i < 24; i++) {
        const y = height - (i * hourHeight);
        line(scaleWidth, y, scaleWidth + 10, y); 
        const romanNumeral = toRoman(i);
        text(romanNumeral, scaleWidth - 10, y); 
    }
}

function toRoman(num) {
    if (num === 0) return "";
    const romanNumerals = [
        ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], 
        ["X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"], 
        ["C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"], 
        ["M", "MM", "MMM"] 
    ];
    let result = "";
    let digitIndex = 0;

    while (num > 0) {
        const digit = num % 10;
        if (digit !== 0) {
            result = romanNumerals[digitIndex][digit - 1] + result;
        }
        num = Math.floor(num / 10);
        digitIndex++;
    }
    return result;
}

function drawWave(maxHeight, phaseOffset) {
    beginShape();
    for (let x = 80; x <= width; x += 2) { 
        let angle = (x * 0.01) + phaseOffset;
        const y = maxHeight + waveAmplitude * sin(angle);
        vertex(x, y);
    }
    vertex(width, height);
    vertex(80, height); 
    endShape(CLOSE);
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    const newTime = `${hours}:${minutes}:${seconds}`;

    if (lastTime === "") {
        lastTime = newTime;
        return;
    }

    if (newTime !== lastTime) {
        let amplitudeIncrease = 0; 

        const lastSeconds = parseInt(lastTime.split(":")[2], 10);
        const currentSeconds = parseInt(seconds, 10);
        const lastMinutes = parseInt(lastTime.split(":")[1], 10);
        const currentMinutes = parseInt(minutes, 10);
        const lastHours = parseInt(lastTime.split(":")[0], 10);
        const currentHours = parseInt(hours, 10);

        if (currentSeconds % 10 !== lastSeconds % 10) {
            amplitudeIncrease += 10; 
        }
        if (Math.floor(currentSeconds / 10) !== Math.floor(lastSeconds / 10)) {
            amplitudeIncrease += 20; 
        }
        if (currentMinutes % 10 !== lastMinutes % 10) {
            amplitudeIncrease += 30;
        }
        if (Math.floor(currentMinutes / 10) !== Math.floor(lastMinutes / 10)) {
            amplitudeIncrease += 50; 
        }
        if (currentHours % 10 !== lastHours % 10) {
            amplitudeIncrease += 70; 
        }
        if (Math.floor(currentHours / 10) !== Math.floor(lastHours / 10)) {
            amplitudeIncrease += 90;
        }

        targetAmplitude = amplitudeIncrease;

        setTimeout(() => {
            targetAmplitude = baseAmplitude; 
        }, 500);
    }

    lastTime = newTime;
}

setInterval(updateClock, 1000);
updateClock();

window.addEventListener("load", function() {
    const backgroundMusic = document.getElementById("background-music");
    const soundToggle = document.getElementById("sound-toggle");

    backgroundMusic.muted = true;

    soundToggle.addEventListener("click", function() {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            backgroundMusic.play();
            soundToggle.textContent = "Mute"; 
        } else {
            backgroundMusic.muted = true;
            soundToggle.textContent = "Play BGM"; 
        }
    });
});