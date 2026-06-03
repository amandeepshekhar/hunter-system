import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBd6cHZv_KW78FeOIp4909OfSNb0ew1-Vs",
  authDomain:
    "arise-protocol.firebaseapp.com",
  projectId: "arise-protocol",
  storageBucket:
    "arise-protocol.firebasestorage.app",
  messagingSenderId:
    "252996270226",
  appId:
    "1:252996270226:web:5ec77cda4d8e0aee560e4b",
};

const app =
  initializeApp(firebaseConfig);

export const auth =
  getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

export default app;