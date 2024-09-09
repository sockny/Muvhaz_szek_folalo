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


/* Particle.js konfiguráció */
particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 80, // Részecskék száma
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff" // Részecskék színe
        },
        "shape": {
            "type": "circle", // Részecskék formája
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 5,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});
