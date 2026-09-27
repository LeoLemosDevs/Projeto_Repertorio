import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Cole aqui as configurações do seu projeto do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCiL16V6U8lK0K84QXns4B-V-rsO9wx9hc",
  authDomain: "repertorio-815d8.firebaseapp.com",
  projectId: "repertorio-815d8",
  storageBucket: "repertorio-815d8.firebasestorage.app",
  messagingSenderId: "1002273490689",
  appId: "1:1002273490689:web:b79f6b4d7526a55e02fd00",
  measurementId: "G-MV3704VEGR"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o banco de dados Firestore
export const db = getFirestore(app);
