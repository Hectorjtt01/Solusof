// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDPUfGiWPJnCAwyOhTCduOoHRFMj2_eQD8",
  authDomain: "solusof-32a69.firebaseapp.com",
  projectId: "solusof-32a69",
  storageBucket: "solusof-32a69.appspot.com",
  messagingSenderId: "851917880194",
  appId: "1:851917880194:web:25f490a6d09abb8f446d9b",
  measurementId: "G-LR1FM9V1B3"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa Firestore
const db = firebase.firestore();

// Verificar autenticación del usuario
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // Usuario no autenticado, redirigir al login
    window.location.href = '/index.html';
  }
});
