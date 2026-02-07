import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfWdhjF79TBjUtGt7f3oyGtY0nJdEKOAE",
  authDomain: "gemini3hackathon-47bf6.firebaseapp.com",
  projectId: "gemini3hackathon-47bf6",
  storageBucket: "gemini3hackathon-47bf6.firebasestorage.app",
  messagingSenderId: "919414872074",
  appId: "1:919414872074:web:51828acf238a70c020e7f3",
  measurementId: "G-22E1M36RYQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function signInGoogleAndGetIdToken(): Promise<string> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return await result.user.getIdToken();
}

export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
}
