const TARGET_EVENT_DATE = new Date('2025-12-25T17:00:00');
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyA1GJXtlTU38EUJc33sVBdjq17uK_dPcAI",
  authDomain: "t7di-wtn.firebaseapp.com",
  databaseURL: "https://t7di-wtn-default-rtdb.firebaseio.com",
  projectId: "t7di-wtn",
  storageBucket: "t7di-wtn.firebasestorage.app",
  messagingSenderId: "156578457028",
  appId: "1:156578457028:web:33164036f0fa1b1066b091",
  measurementId: "G-DC212XC47M"
};

const app = initializeApp(firebaseConfig);

let analytics;
try { analytics = getAnalytics(app); } catch (err) {}

const auth = getAuth(app);

const CLOUDINARY_CONFIG = {
  cloud_name: "dh2ullgpr",
  api_key: "153646991219522",
  api_secret: "7fuwyj0vHvUPY3WsYH5zkEnpgDM",
};


export async function uploadToCloudinary(file, folder = "uploads") {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); 
  formData.append("api_key", CLOUDINARY_CONFIG.api_key);
  formData.append("timestamp", Math.floor(Date.now() / 1000));
  formData.append(
    "signature",
    await generateSignature({
      timestamp: Math.floor(Date.now() / 1000),
      folder,
    })
  );

  formData.append("folder", folder);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}


async function generateSignature(params) {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&") + CLOUDINARY_CONFIG.api_secret;

  return sha1(toSign);
}

async function sha1(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const hash = await crypto.subtle.digest("SHA-1", data);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export {
  app,
  analytics,
  auth,
  signInWithEmailAndPassword,
  signOut,
};
