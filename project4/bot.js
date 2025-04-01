import 'dotenv/config';
import Mastodon from 'mastodon-api';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import cron from 'node-cron'; 

// Initialize Mastodon client
const M = new Mastodon({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  timeout_ms: 60 * 1000,
  api_url: 'https://networked-media.itp.io/api/v1/',
});

// Random cat quotes
const catTexts = [
  "Did you smile today?",
  "Keep going, I'm with you! – Amen 🐱",
  "Don't be sad. Here's a cat hug.",
  "Meow meow! Stay positive!",
  "One cat a day keeps the stress away!",
  "You are loved – Amen 🐾",
  "Life is better with a cat around.",
  "Take a nap. Wake up fabulous. 😽",
  "Paws and breathe. Everything's okay.",
  "You're purrr-fect just the way you are.",
  "Sending you soft cat vibes 🐾",
  "Cat naps fix everything.",
  "A cat's purr is the world's best medicine.",
  "Meow means 'I love you' in cat language.",
  "Even bad days are better with whiskers.",
  "Don't worry. The cat believes in you!",
  "Stretch. Yawn. Relax. Repeat.",
  "You deserve a cozy blanket and a cat nap.",
  "Whiskers make everything better.",
  "Pet a cat. Heal your soul.",
  "Trust your instincts—like a cat would.",
  "You're doing great. Just ask a cat.",
  "Cuddle more, stress less.",
  "Be mysterious. Be majestic. Be like a cat.",
  "No thoughts. Just paws.",
  "Quietly judging, but with love. 😼",
];

// Pick a random quote
function getRandomText() {
  return catTexts[Math.floor(Math.random() * catTexts.length)];
}

// Main bot logic
async function postCatWithText() {
  const catText = getRandomText();
  const catUrl = `https://cataas.com/cat/says/${encodeURIComponent(catText)}?position=center&font=Impact&fontSize=50&fontColor=%23fff`;

  try {
    console.log('📡 Fetching image from:', catUrl);
    const res = await fetch(catUrl);

    if (!res.ok) {
      throw new Error(`Cataas responded with status ${res.status}`);
    }

    const buffer = await res.buffer();
    const filename = path.join(process.cwd(), 'cat.jpg');

    await sharp(buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toFile(filename);

    const media = await M.post('media', {
      file: fs.createReadStream(filename),
      description: `Cat says: "${catText}"`,
    });

    const status = await M.post('statuses', {
      status: `🐱 Cat says: "${catText}"`,
      media_ids: [media.data.id],
    });

    console.log('Cat post uploaded successfully!');
    console.log(`View it here: ${status.data.url}`);
  } catch (err) {
    console.error('Something went wrong:\n', err.message);
  }
}

// Post a at meme at 12am
cron.schedule('0 0 * * *', () => {
  console.log("🌙 It's midnight — time to post a cat!");
  postCatWithText();
});

// Send a post 
postCatWithText();
