// Firebase konfiguráció (az adatok helyettesítése a saját Firebase projekteddel)
const firebaseConfig = {
    apiKey: "AIzaSyBf02Y40jxiwLp_uP4pxnlqZfKHNj_B1D0",
    authDomain: "muvhazfoglalas.firebaseapp.com",
    databaseURL: "https://muvhazfoglalas-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "muvhazfoglalas",
    storageBucket: "muvhazfoglalas.appspot.com",
    messagingSenderId: "354422910423",
    appId: "1:354422910423:web:96d60d4176ac94a15a2f92",
    measurementId: "G-SSX59RJE0Q"
};

// Firebase inicializálása
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', function () {
    const googleLoginButton = document.getElementById('googleLoginBtn');

    // Google bejelentkezés gomb
    googleLoginButton.addEventListener('click', function () {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log('Google bejelentkezés sikeres:', result.user.displayName);
                // Átirányítás az index.html-re sikeres bejelentkezés után
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Google bejelentkezési hiba:', error.message);
            });
    });
});
