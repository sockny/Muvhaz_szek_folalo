document.addEventListener('DOMContentLoaded', function () {
    const leftSeatsContainer = document.getElementById('leftSeats');
    const rightSeatsContainer = document.getElementById('rightSeats');
    const reservationModal = document.getElementById('reservationModal');
    const reservationForm = document.getElementById('reservationForm');
    //const closeModalBtn = document.querySelector('.close-btn');
    const closeModalBtn = document.getElementById("closeReservationBtn")
    const performanceSelect = document.getElementById('performanceSelect');
    //const addPerformanceBtn = document.getElementById('addPerformanceBtn');
    const performanceForm = document.getElementById('performanceForm');
    const addPerformanceForm = document.getElementById('addPerformanceForm'); // Form az előadáshoz


    //---------------------Ellenorzesek-------------------------------

    // Az oldal betöltése után biztosítjuk, hogy minden modal rejtve van
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none'; // Rejtett állapot
    });

    //----------------------------------------------------------------

    // Foglalások tárolása előadásonként
    const performances = {};
    let currentPerformance = null; // Az aktuálisan kiválasztott előadás

    // Modal megjelenítése
    function openModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.classList.remove('hidden'); // Eltávolítja a 'hidden' osztályt, ha a modal létezik
            modal.style.display = 'flex'; // Modal megjelenítése
        } else {
            console.error('Modal elem nem található');
        }

        // Jegytípus állapot frissítése
        const ticketType = document.getElementById('ticketType');
        const performanceSelection = document.getElementById('performancesCheckboxesWrapper');

        if (!ticketType || !performanceSelection) {
            console.error('Néhány elem nem található a DOM-ban.');
            return;
        }

        if (ticketType.value === 'bérlet') {
            performanceSelection.classList.remove('hidden'); // Előadások megjelenítése
            const performancesCheckboxes = document.getElementById('performancesCheckboxes');

            if (performancesCheckboxes) {
                performancesCheckboxes.innerHTML = ''; // Korábbi checkboxok törlése

                // Elérhető előadások checkboxokkal való feltöltése
                for (let key in performances) {
                    const performance = performances[key];
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = key;
                    checkbox.value = key;

                    const label = document.createElement('label');
                    label.htmlFor = key;
                    label.textContent = `${performance.name} (${performance.date})`;

                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(label);
                    performancesCheckboxes.appendChild(checkboxContainer);
                }
            } else {
                console.error('performancesCheckboxes elem nem található.');
            }
        } else {
            performanceSelection.classList.add('hidden'); // Előadások elrejtése
        }
    }


    // Modal bezárása
    function closeModal() {
        reservationModal.classList.add('hidden');
        reservationModal.style.display = 'none'; // Modal elrejtése

    }



    document.getElementById('deletePerformanceBtn').addEventListener('click', function () {
        const selectedPerformance = document.getElementById('performanceSelect').value;


        if (!selectedPerformance) {
            alert('Kérlek, válassz előadást a törléshez!');
            return;
        }

        const confirmDelete = confirm('Biztosan törölni szeretnéd az előadást?');
        if (!confirmDelete) {
            return; // Ha a felhasználó nem szeretné törölni, kilépünk
        }

        // Előadás törlésének logikája
        firebase.database().ref('performances/' + selectedPerformance).remove()
            .then(() => {
                console.log('Előadás sikeresen törölve a Firebase-ből.');

                // Töröljük a helyi performances objektumból is
                delete performances[selectedPerformance];

                // Frissítjük az előadás választót
                updatePerformanceSelect();
            })
            .catch((error) => {
                console.error('Hiba történt az előadás törlésekor:', error);
            });
    });

    // Szék kattintásának kezelése
    /*tClick(event) {
        const seatDiv = event.target;
        const side = seatDiv.dataset.side;
        const row = seatDiv.dataset.row;
        const seat = seatDiv.dataset.seat;

        const seatKey = `${side}-${row}-${seat}`;

        // Ellenőrizzük, van-e már törlés gomb és ha igen, eltávolítjuk
        const existingDeleteButton = reservationForm.querySelector('.delete-btn');
        if (existingDeleteButton) {
            existingDeleteButton.remove();
        }

        if (currentPerformance && performances[currentPerformance].reservations[seatKey]) {
            // Ha a szék már foglalt, töltsük be a foglalás részleteit a modalba
            const reservation = performances[currentPerformance].reservations[seatKey];
            document.getElementById('reservationName').value = reservation.name;
            document.getElementById('ticketType').value = reservation.ticketType;

            openModal();

            // A mentés most már frissíteni fogja az adatokat
            reservationForm.onsubmit = function (e) {
                e.preventDefault();
                const name = document.getElementById('reservationName').value;
                const ticketType = document.getElementById('ticketType').value;


                if (ticketType === 'bérlet') {
                    // Kiválasztott előadások begyűjtése a checkboxokból
                    const selectedPerformances = Array.from(document.querySelectorAll('#performancesCheckboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

                    // Lefoglaljuk a széket a kiválasztott előadásokon
                    selectedPerformances.forEach(performanceKey => {
                        const performance = performances[performanceKey];
                        if (!performance.reservations) {
                            performance.reservations = {}; // Ha nincs foglalás, hozzuk létre az üres objektumot
                        }

                        // Ellenőrizzük, hogy van-e már foglalás erre a székre az adott előadáson
                        if (!performance.reservations[seatKey]) {
                            performance.reservations[seatKey] = {
                                name: name,
                                ticketType: 'bérlet'
                            };

                            // Ha az aktuális előadás az egyik kiválasztott, frissítjük a széket
                            if (performanceKey === currentPerformance) {
                                seatDiv.classList.add('reserved');
                            }
                        } else {
                            alert(`A(z) ${performance.name} előadáson a szék már foglalt!`);
                        }
                    });
                } else {
                    // Normál jegy foglalás logikája
                    performances[currentPerformance].reservations[seatKey] = {
                        name: name,
                        ticketType: ticketType
                    };

                    seatDiv.classList.add('occupied');
                }
                const reservationData = {
                    name: name,
                    ticketType: ticketType
                };


                saveReservation(seatKey, reservationData);
                closeModal();
                reservationForm.reset(); // Modal mezők törlése a bezárás után
            };



            // Törlés gomb hozzáadása
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Foglalás törlése';
            deleteButton.classList.add('delete-btn');
            deleteButton.style.backgroundColor = '#f44336';
            deleteButton.style.color = 'white';
            reservationForm.appendChild(deleteButton);

            deleteButton.addEventListener('click', function () {
                delete performances[currentPerformance].reservations[seatKey];
                seatDiv.classList.remove('reserved', 'occupied');
                closeModal();
                reservationForm.reset();
                deleteButton.remove(); // Törlés gomb eltávolítása
            });
        } else if (currentPerformance) {
            // Ha a szék üres, akkor foglalás hozzáadása
            openModal();

            reservationForm.onsubmit = function (e) {
                e.preventDefault();
                const name = document.getElementById('reservationName').value;
                const ticketType = document.getElementById('ticketType').value;

                performances[currentPerformance].reservations[seatKey] = {
                    name: name,
                    ticketType: ticketType
                };

                seatDiv.classList.add(ticketType === 'bérlet' ? 'reserved' : 'occupied');

                closeModal();
                reservationForm.reset();
            };
        } else {
            alert('Kérlek, válassz előadást!');
        }
    }*/
    function handleSeatClick(event) {
        openReservationModal();
        const seatDiv = event.target;
        const side = seatDiv.dataset.side;
        const row = seatDiv.dataset.row;
        const seat = seatDiv.dataset.seat;

        const seatKey = `${side}-${row}-${seat}`;

        // Ellenőrizzük, hogy van-e már törlés gomb és ha igen, eltávolítjuk
        const existingDeleteButton = reservationForm.querySelector('.delete-btn');
        if (existingDeleteButton) {
            existingDeleteButton.remove();
        }



        // Alapértelmezés: "Sima jegy" kiválasztása és előadások elrejtése
        document.getElementById('ticketType').value = 'sima';
        document.getElementById('performancesCheckboxesWrapper').style.display = 'none';

        // Jegytípus váltásának kezelése
        document.getElementById('ticketType').addEventListener('change', function () {
            const ticketType = this.value;

            const performanceSelection = document.getElementById('performancesCheckboxesWrapper');
            const performancesCheckboxes = document.getElementById('performancesCheckboxes');

            // Ellenőrizzük, hogy az elemek léteznek-e
            if (!performanceSelection || !performancesCheckboxes) {
                console.error('Az előadások kiválasztásának konténere vagy a checkboxok nem találhatók.');
                return;
            }

            // Ha "bérlet" a kiválasztott jegytípus
            if (ticketType === 'bérlet') {
                performanceSelection.style.display = 'block'; // Előadások megjelenítése
                performancesCheckboxes.innerHTML = ''; // Korábbi checkboxok törlése

                // Elérhető előadások listájának feltöltése checkboxokkal
                for (let key in performances) {
                    const performance = performances[key];
                    console.log('Előadás hozzáadása:', performance);

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = key;
                    checkbox.value = key;

                    const label = document.createElement('label');
                    label.htmlFor = key;
                    label.textContent = `${performance.name} (${performance.date})`;

                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(label);
                    performancesCheckboxes.appendChild(checkboxContainer);
                }

            } else {
                performanceSelection.style.display = 'none'; // Előadások elrejtése, ha nem "bérlet"
            }
        });





        //openModal();


        // Ellenőrizzük, hogy létezik-e a kiválasztott előadás és a foglalás
        if (currentPerformance && performances[currentPerformance] && performances[currentPerformance].reservations && performances[currentPerformance].reservations[seatKey]) {
            // Ha a szék már foglalt, töltsük be a foglalás részleteit a modalba
            const reservation = performances[currentPerformance].reservations[seatKey];
            document.getElementById('reservationName').value = reservation.name;
            document.getElementById('ticketType').value = reservation.ticketType;
        } else {
            // Ha nincs foglalás, hagyjuk üresen a mezőket
            document.getElementById('reservationName').value = '';
            document.getElementById('ticketType').value = 'sima'; // Alapértelmezett: sima jegy
        }


        // A mentés most már frissíteni fogja az adatokat
        reservationForm.onsubmit = function (e) {
            e.preventDefault();

            const selectedPerformance = document.getElementById('performanceSelect').value;
            if (!selectedPerformance) {
                alert('Kérlek, válassz előadást a foglaláshoz!');
                return;
            }

            const name = document.getElementById('reservationName').value;
            const ticketType = document.getElementById('ticketType').value;



            if (ticketType === 'bérlet') {
                const berletId = generateUUID(); // Egyedi bérlet azonosító generálása

                // Kiválasztott előadások begyűjtése a checkboxokból
                const selectedPerformances = Array.from(document.querySelectorAll('#performancesCheckboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);

                let allSeatsAvailable = true; // Ellenőrizzük, hogy minden hely elérhető-e

                // Ellenőrizzük, hogy a kiválasztott előadások egyikében sem foglalt a szék
                selectedPerformances.forEach(performanceKey => {
                    const performance = performances[performanceKey];
                    if (performance.reservations && performance.reservations[seatKey]) {
                        allSeatsAvailable = false; // Ha már foglalt egy hely
                        alert(`A(z) ${performance.name} előadáson a szék már foglalt!`);
                    }
                });

                if (allSeatsAvailable) {
                    selectedPerformances.forEach(performanceKey => {
                        const performance = performances[performanceKey];
                        if (!performance.reservations) {
                            performance.reservations = {}; // Ha nincs foglalás, hozzuk létre az üres objektumot
                        }

                        // Foglalás hozzáadása a helyi performances objektumhoz egyedi bérlet azonosítóval
                        performance.reservations[seatKey] = {
                            name: name,
                            ticketType: 'bérlet',
                            berletId: berletId // Bérlet egyedi azonosító
                        };

                        // Frissítjük a széket, ha az aktuális előadás az egyik kiválasztott
                        if (performanceKey === currentPerformance) {
                            seatDiv.classList.add('reserved');
                        }
                    });

                    // Most mentjük a Firebase-be az összes frissített előadást
                    selectedPerformances.forEach(performanceKey => {
                        const performance = performances[performanceKey];
                        firebase.database().ref('performances/' + performanceKey + '/reservations/' + seatKey).set(performance.reservations[seatKey])
                            .then(() => {
                                console.log(`Foglalás mentése a(z) ${performanceKey} előadásra sikeres.`);
                            })
                            .catch(error => {
                                console.error(`Hiba történt a foglalás mentésekor a(z) ${performanceKey} előadásra:`, error);
                            });
                    });
                }
            } else {
                // Normál jegy foglalás logikája
                if (!performances[currentPerformance].reservations) {
                    performances[currentPerformance].reservations = {}; // Ha nincs foglalás, hozzuk létre az üres objektumot
                }

                performances[currentPerformance].reservations[seatKey] = {
                    name: name,
                    ticketType: ticketType
                };

                seatDiv.classList.add('occupied');

                /*// Foglalás mentése a Firebase-be
                firebase.database().ref('performances/' + currentPerformance + '/reservations/' + seatKey).set({
                    name: name,
                    ticketType: ticketType
                }).then(() => {
                    console.log(`Foglalás mentése ${currentPerformance} előadásra sikeres.`);
                }).catch(error => {
                    console.error('Hiba történt a foglalás mentésekor:', error);
                });*/
                // Szék stílusának frissítése
                seatDiv.classList.add(ticketType === 'bérlet' ? 'reserved' : 'occupied');

                // Foglalás mentése Firebase-be
                saveReservation(currentPerformance, seatKey, { name, ticketType });

            }

            closeModal();
            reservationForm.reset(); // Modal mezők törlése a bezárás után
        };


        // Törlés gomb hozzáadása
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Foglalás törlése';
        deleteButton.classList.add('delete-btn');
        deleteButton.style.backgroundColor = '#f44336';
        deleteButton.style.color = 'white';
        reservationForm.appendChild(deleteButton);

        deleteButton.addEventListener('click', function () {
            const confirmDelete = confirm('Biztosan törölni szeretnéd a foglalást?');
            if (!confirmDelete) {
                return; // Ha a felhasználó nem szeretné törölni, kilépünk
            }

            // Töröljük a foglalást a helyi performances objektumból
            delete performances[currentPerformance].reservations[seatKey];

            // Töröljük a foglalást a Firebase adatbázisból is
            firebase.database().ref('performances/' + currentPerformance + '/reservations/' + seatKey).remove()
                .then(() => {
                    console.log('Foglalás sikeresen törölve a Firebase-ből.');
                })
                .catch((error) => {
                    console.error('Hiba történt a foglalás törlésekor:', error);
                });

            // Frissítjük a szék kinézetét és bezárjuk a modal-t
            seatDiv.classList.remove('reserved', 'occupied');
            closeModal();
            reservationForm.reset();
            deleteButton.remove(); // Törlés gomb eltávolítása
        });



        function updatePerformanceSelect() {
            const performanceSelect = document.getElementById('performanceSelect');
            performanceSelect.innerHTML = '<option value="">Válassz előadást...</option>'; // Alapértelmezett elem

            // Frissítjük az előadás választót az új performances objektum alapján
            for (let key in performances) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = performances[key].name;
                performanceSelect.appendChild(option);
            }
        }




    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }








    // Foglalási modal elemek (meglévő modal)
    //const reservationModal = document.getElementById('reservationModal');
    const closeReservationModalBtn = document.querySelector('.close-btn'); // Foglalási modal bezárása
    //const reservationForm = document.getElementById('reservationForm');

    // Előadás hozzáadása modal elemek (új modal)
    const addPerformanceModal = document.getElementById('addPerformanceModal');
    const openAddPerformanceModalBtn = document.getElementById('openAddPerformanceModal');
    const closeAddPerformanceModalBtn = document.getElementById('closeAddPerformanceModal');
    //const addPerformanceForm = document.getElementById('addPerformanceForm');

    // Modal megnyitása foglaláshoz
    openAddPerformanceModalBtn.addEventListener('click', function () {
        addPerformanceModal.style.display = 'flex';
    });

    // Modal bezárása foglaláshoz
    closeAddPerformanceModalBtn.addEventListener('click', function () {
        addPerformanceModal.style.display = 'none';
    });

    // Modal bezárása ha kívülre kattintunk (foglalási modal esetében)
    window.addEventListener('click', function (event) {
        if (event.target === reservationModal) {
            reservationModal.style.display = 'none';
        } else if (event.target === addPerformanceModal) {
            addPerformanceModal.style.display = 'none';
        }
    });

    // Előadás hozzáadása form kezelése
    addPerformanceForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const performanceName = document.getElementById('performanceName').value;
        const performanceDate = document.getElementById('performanceDate').value;
        const performancePrice = document.getElementById('performancePrice').value;
        const performanceNotes = document.getElementById('performanceNotes').value;

        const year = new Date(performanceDate).getFullYear();

        if (year.toString().length !== 4) {
            alert('Kérlek, érvényes 4 számjegyű évszámot adj meg!');
            e.preventDefault(); // Megakadályozza az űrlap elküldését
        }

        if (performanceName && performanceDate) {
            const performanceKey = `${performanceName}-${performanceDate}`;

            // Új előadás hozzáadása a helyi objektumba
            performances[performanceKey] = {
                name: performanceName,
                date: performanceDate,
                price: performancePrice,
                notes: performanceNotes,
                reservations: {}
            };

            // Firebase mentés
            firebase.database().ref('performances/' + performanceKey).set(performances[performanceKey])
                .then(() => {
                    console.log('Előadás sikeresen elmentve Firebase-be.');
                })
                .catch((error) => {
                    console.error('Hiba történt az előadás mentésekor:', error);
                });

            // Hozzáadjuk a kiválasztóhoz
            const option = document.createElement('option');
            option.value = performanceKey;
            option.innerText = `${performanceName} (${performanceDate})`;
            performanceSelect.appendChild(option);

            // Form resetelése és modal bezárása
            addPerformanceForm.reset();
            addPerformanceModal.style.display = 'none';
        } else {
            alert('Kérlek, add meg az előadás nevét és dátumát!');
        }
    });





    function renderSeats() {
        // Kiürítjük az előző székeket és sor számokat
        leftSeatsContainer.innerHTML = '';
        rightSeatsContainer.innerHTML = '';
        const leftRowNumbersContainer = document.getElementById('leftRowNumbers');
        const rightRowNumbersContainer = document.getElementById('rightRowNumbers');
        leftRowNumbersContainer.innerHTML = '';
        rightRowNumbersContainer.innerHTML = '';

        const rows = 14;
        const seatsPerRow = 10;

        firebase.database().ref('performances/' + currentPerformance + '/reservations').once('value')
            .then((snapshot) => {
                console.log(snapshot.val())
                const reservations = snapshot.val() || {};

                for (let row = 1; row <= rows; row++) {
                    // Sor szám hozzáadása bal oldalon
                    // Sor szám hozzáadása bal oldalon
                    const leftRowNumberBox = document.createElement('div');
                    leftRowNumberBox.classList.add('row-number-box');
                    leftRowNumberBox.dataset.row = row; // Adat attribútum hozzáadása a sorszámokhoz
                    leftRowNumberBox.innerText = row;
                    leftRowNumbersContainer.appendChild(leftRowNumberBox);

                    // Sor szám hozzáadása jobb oldalon
                    const rightRowNumberBox = document.createElement('div');
                    rightRowNumberBox.classList.add('row-number-box');
                    rightRowNumberBox.dataset.row = row; // Adat attribútum hozzáadása a sorszámokhoz
                    rightRowNumberBox.innerText = row;
                    rightRowNumbersContainer.appendChild(rightRowNumberBox);

                    // Bal oldal székek
                    for (let seat = 1; seat <= seatsPerRow; seat++) {
                        const seatDiv = document.createElement('div');
                        seatDiv.classList.add('seat');
                        seatDiv.dataset.side = 'left';
                        seatDiv.dataset.row = row;
                        seatDiv.dataset.seat = seat;

                        // Az első két sorban az 1. szék hiányzik
                        if ((row === 1 || row === 2) && seat === 1) {
                            seatDiv.classList.add('hidden');
                        }

                        seatDiv.innerText = (row === 1 || row === 2) && seat > 1 ? `${seat - 1}` : `${seat}`;
                        //seatDiv.innerText = (row === 1 || row === 2) && seat > 1 ? `${row}-${seat - 1}` : `${row}-${seat}`;

                        // 13. és 14. sor első 4 széke nem foglalható
                        if ((row === 13 || row === 14) && seat <= 4) {
                            seatDiv.classList.add('unavailable');
                            seatDiv.innerText = `X`;
                        }

                        const seatKey = `left-${row}-${seat}`;
                        if (reservations[seatKey]) {
                            const reservation = reservations[seatKey];
                            seatDiv.classList.add(reservation.ticketType === 'bérlet' ? 'reserved' : 'occupied');
                            console.log("seat: " + seatKey + "szín: " + reservation.ticketType)
                        } else {
                            if (seatDiv.classList.contains('reserved')) {
                                seatDiv.classList.remove('reserved');
                                console.log("seat: " + seatKey + ", Reserved tag removed!")
                            }
                            
                            // Ellenőrizzük, hogy a seatDiv tartalmazza-e az 'occupied' osztályt, és eltávolítjuk, ha igen
                            if (seatDiv.classList.contains('occupied')) {
                                seatDiv.classList.remove('occupied');
                                console.log("seat: " + seatKey + ", Occupied tag removed!")
                               
                            }

                        }

                        seatDiv.addEventListener('click', handleSeatClick);
                        leftSeatsContainer.appendChild(seatDiv);
                    }

                    // Jobb oldal székek
                    for (let seat = 10; seat > 0; seat--) {
                        const seatDiv = document.createElement('div');
                        seatDiv.classList.add('seat');
                        seatDiv.dataset.side = 'right';
                        seatDiv.dataset.row = row;
                        seatDiv.dataset.seat = seat;

                        // Az első két sorban az 1. szék hiányzik
                        if ((row === 1 || row === 2) && seat === 1) {
                            seatDiv.classList.add('hidden');
                        }

                        seatDiv.innerText = (row === 1 || row === 2) && seat <= 10 ? `${seat - 1}` : `${seat}`;
                        //seatDiv.innerText = (row === 1 || row === 2) && seat > 1 ? `${row}-${seat - 1}` : `${row}-${seat}`;

                        //seatDiv.innerText = `${row}-${seat}`;
                        //seatDiv.innerText = `${seat}`;

                        const seatKey = `right-${row}-${seat}`;
                        if (reservations[seatKey]) {
                            const reservation = reservations[seatKey];
                            seatDiv.classList.add(reservation.ticketType === 'bérlet' ? 'reserved' : 'occupied');
                            console.log("seat: " + seatKey + "szín: " + reservation.ticketType)
                        } else {
                            if (seatDiv.classList.contains('reserved')) {
                                seatDiv.classList.remove('reserved');
                                console.log("seat: " + seatKey + ", Reserved tag removed!")
                            }
                            
                            // Ellenőrizzük, hogy a seatDiv tartalmazza-e az 'occupied' osztályt, és eltávolítjuk, ha igen
                            if (seatDiv.classList.contains('occupied')) {
                                seatDiv.classList.remove('occupied');
                                console.log("seat: " + seatKey + ", Occupied tag removed!")
                               
                            }

                        }

                        seatDiv.addEventListener('click', handleSeatClick);
                        rightSeatsContainer.appendChild(seatDiv);
                    }
                }
            })
            .catch((error) => {
                console.error('Hiba történt a foglalások betöltésekor:', error);
            })
            .finally(() => {

                seatRendered();
            });
    }
    function seatRendered() {

        document.querySelectorAll('.seat').forEach(seat => {
            seat.addEventListener('mouseenter', handleMouseEnter);
            seat.addEventListener('mouseleave', handleMouseLeave);
        });


    }



    function handleMouseEnter(event) {
        const hoveredSeat = event.target;
        const row = hoveredSeat.dataset.row;

        // Az adott sor székjeit hangsúlyosabbá tesszük
        document.querySelectorAll(`.seat[data-row='${row}']`).forEach(seat => {
            seat.classList.add('highlighted');
        });

        // Az adott sor sorszámait is hangsúlyosabbá tesszük
        document.querySelectorAll(`.row-number-box[data-row='${row}']`).forEach(numberBox => {
            numberBox.classList.add('highlighted');
        });

        // Az összes többi sor székét elhalványítjuk
        document.querySelectorAll(`.seat:not([data-row='${row}'])`).forEach(seat => {
            seat.classList.add('faded');
        });

        // Az összes többi sor sorszámait is elhalványítjuk
        document.querySelectorAll(`.row-number-box:not([data-row='${row}'])`).forEach(numberBox => {
            numberBox.classList.add('faded');
        });
    }

    function handleMouseLeave(event) {
        const row = event.target.dataset.row;

        // Eltávolítjuk a kiemelést az adott sorról
        document.querySelectorAll(`.seat[data-row='${row}']`).forEach(seat => {
            seat.classList.remove('highlighted');
        });

        // Eltávolítjuk a kiemelést az adott sor sorszámáról
        document.querySelectorAll(`.row-number-box[data-row='${row}']`).forEach(numberBox => {
            numberBox.classList.remove('highlighted');
        });

        // Eltávolítjuk az elhalványítást az összes székről
        document.querySelectorAll('.seat').forEach(seat => {
            seat.classList.remove('faded');
        });

        // Eltávolítjuk az elhalványítást az összes sorszámról
        document.querySelectorAll('.row-number-box').forEach(numberBox => {
            numberBox.classList.remove('faded');
        });
    }









    // Előadás kiválasztásának kezelése
    performanceSelect.addEventListener('change', function () {
        currentPerformance = performanceSelect.value;
        if (currentPerformance) {
            renderSeats(); // Frissítsük a székeket
        }
    });



    // Modal bezárásának kezelése
    closeModalBtn.addEventListener('click', closeModal);


    function saveReservation(performanceKey, seatKey, reservationData) {
        // Mentés a Firebase adatbázisba az adott előadás részeként
        firebase.database().ref('performances/' + performanceKey + '/reservations/' + seatKey).set(reservationData)
            .then(() => {
                console.log('Foglalás sikeresen elmentve Firebase-be.');
            })
            .catch((error) => {
                console.error('Hiba történt a foglalás mentésekor:', error);
            });
    }

    function loadReservations() {
        firebase.database().ref('reservations').once('value')
            .then((snapshot) => {
                const reservations = snapshot.val();
                // Foglalások betöltése az alkalmazásba
                console.log(reservations);
            })
            .catch((error) => {
                console.error('Hiba a foglalások betöltésekor:', error);
            });
    }



    function loadPerformances() {
        firebase.database().ref('performances').once('value')
            .then((snapshot) => {
                const performancesData = snapshot.val();
                if (performancesData) {
                    Object.assign(performances, performancesData);
                    updatePerformanceSelect();
                }
            })
            .catch((error) => {
                console.error('Hiba az előadások betöltésekor:', error);
            });
    }

    function updatePerformanceSelect() {
        performanceSelect.innerHTML = '<option value="">Válassz előadást...</option>';
        for (let key in performances) {
            const option = document.createElement('option');
            option.value = key;
            option.innerText = `${performances[key].name} (${performances[key].date})`;
            performanceSelect.appendChild(option);
        }
    }

    function deletePerformance(performanceKey) {
        firebase.database().ref('performances/' + performanceKey).remove()
            .then(() => {
                console.log('Előadás és a hozzátartozó foglalások törölve.');
            })
            .catch((error) => {
                console.error('Hiba történt az előadás törlésekor:', error);
            });
    }

    // Oldal betöltésekor adat betöltése
    window.addEventListener('load', function () {
        //loadData();
        loadPerformances(); // Előadások betöltése
        loadReservations();
        //renderSeats(); // Betöltött adatok alapján frissítjük a székeket
    });

    function openReservationModal() {
        const selectedPerformance = document.getElementById('performanceSelect').value;

        if (!selectedPerformance) {
            alert('Kérlek, válassz előadást a foglaláshoz!');
            return;
        }

        const reservationModal = document.getElementById('reservationModal');
        if (reservationModal) {
            reservationModal.classList.remove('hidden');
            reservationModal.style.display = 'flex'; // Modal megjelenítése

        } else {
            console.error('Foglalás modal nem található.');
        }
    }

    // Bérletek modal megnyitása
    /*document.getElementById('showBerletTableBtn').addEventListener('click', function () {
        document.getElementById('berletTableModal').style.display = 'block';
    });*/

    // Bérletek modal bezárása
    document.getElementById('closeBerletTableModal').addEventListener('click', function () {
        document.getElementById('berletTableModal').style.display = 'none';
    });

    document.getElementById('showBerletTableBtn').addEventListener('click', function () {
        const berletTableBody = document.getElementById('berletTable').querySelector('tbody');
        berletTableBody.innerHTML = ''; // Clear table

        const berletDetails = {}; // Collect bérlet details

        // Iterate over performances to collect bérlet information
        for (let performanceKey in performances) {
            const performance = performances[performanceKey];
            if (performance.reservations) {
                for (let seatKey in performance.reservations) {
                    const reservation = performance.reservations[seatKey];
                    if (reservation.ticketType === 'bérlet') {
                        const berletId = reservation.berletId;

                        // Initialize bérlet if not already done
                        if (!berletDetails[berletId]) {
                            berletDetails[berletId] = {
                                name: reservation.name,
                                performances: [],
                                seat: seatKey // Record seat
                            };
                        }

                        // Add performances to bérlet
                        berletDetails[berletId].performances.push(performance.name);
                    }
                }
            }
        }

        // Populate the table with bérlet details
        for (let berletId in berletDetails) {
            const berlet = berletDetails[berletId];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${berlet.name}</td>
                <td>${berlet.performances.join(', ')}</td>
                <td>${berlet.seat}</td>
            `;
            berletTableBody.appendChild(row);
        }

        // Show the modal
        document.getElementById('berletTableModal').style.display = 'block';
    });





    // Modal bezárása
    document.getElementById('closeBerletTableModal').addEventListener('click', function () {
        document.getElementById('berletTableModal').style.display = 'none';
    });



    // Székek megjelenítése a DOM-ba
    renderSeats();

    document.getElementById('logoutBtn').addEventListener('click', function () {
        firebase.auth().signOut().then(() => {
            console.log('Sikeres kijelentkezés');
            // Átirányítás a bejelentkezési oldalra
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Hiba történt a kijelentkezés során:', error.message);
        });
    });

    function handlePerfomaceDetails() {
        const performanceDetailsModal = document.getElementById('performanceDetailsModal');
        const closePerformanceDetailsModal = document.getElementById('closePerformanceDetailsModal');
        const showPerformanceDetailsBtn = document.getElementById('showPerformanceDetailsBtn');
        const performanceSelect = document.getElementById('performanceSelect');

        // Modal bezárás
        closePerformanceDetailsModal.addEventListener('click', function () {
            performanceDetailsModal.style.display = 'none';
        });

        // Gomb engedélyezése, ha kiválasztottak egy előadást
        performanceSelect.addEventListener('change', function () {
            const selectedPerformance = this.value;
            showPerformanceDetailsBtn.disabled = !selectedPerformance;
        });

        // Előadás részleteinek megtekintése gomb kattintásra
        showPerformanceDetailsBtn.addEventListener('click', function () {
            const selectedPerformance = performanceSelect.value;
            if (selectedPerformance) {
                openPerformanceDetails(selectedPerformance);
            }
        });

        // Modal megnyitása előadás részleteihez
        function openPerformanceDetails(performanceKey) {
            const performance = performances[performanceKey];
            if (performance) {
                document.getElementById('performanceNameDetails').innerText = performance.name;
                document.getElementById('performanceDateDetails').innerText = performance.date;
                document.getElementById('performancePriceDetails').innerText = performance.price;
                document.getElementById('performanceNotesDetails').innerText = performance.notes || 'Nincs megjegyzés';

                performanceDetailsModal.style.display = 'flex';
            }
        }
    }
    handlePerfomaceDetails();

});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log('Bejelentkezve: ', user.email);
        // További logika, ha be van jelentkezve a felhasználó
    } else {
        console.log('Nincs bejelentkezve');
        // Ha nincs bejelentkezve, átirányítjuk a bejelentkezési oldalra
        window.location.href = 'login.html';
    }
});



function exportToPDF() {
    const currentPerformance = document.getElementById("performanceSelect").value;

    if (!currentPerformance) {
        alert("Kérlek válassz előadást!")
        return;
    }
    // Foglalások és elfoglalt helyek összegyűjtése
    const occupiedSeats = [];
    const rows = 14;
    const seatsPerRow = 10;

    // Példaként használjuk a reservations adatstruktúrát, ami tartalmazza a foglalásokat
    firebase.database().ref('performances/' + currentPerformance + '/reservations').once('value')
        .then((snapshot) => {
            const reservations = snapshot.val() || {};
            for (let row = 1; row <= rows; row++) {
                for (let seat = 1; seat <= seatsPerRow; seat++) {
                    const leftSeatKey = `left-${row}-${seat}`;
                    const rightSeatKey = `right-${row}-${seat}`;

                    if (reservations[leftSeatKey]) {
                        occupiedSeats.push({
                            side: 'Bal oldal',
                            row: row,
                            seat: seat,
                            name: reservations[leftSeatKey].name,
                            ticketType: reservations[leftSeatKey].ticketType
                        });
                    }

                    if (reservations[rightSeatKey]) {
                        occupiedSeats.push({
                            side: 'Jobb oldal',
                            row: row,
                            seat: seat,
                            name: reservations[rightSeatKey].name,
                            ticketType: reservations[rightSeatKey].ticketType
                        });
                    }
                }
            }

            // PDF generálása
            generatePDF(occupiedSeats);
        })
        .catch((error) => {
            console.error('Hiba történt a foglalások betöltésekor:', error);
        });
}

function generatePDF(occupiedSeats) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Előadás neve és mentés dátuma
    const performanceName = document.getElementById("performanceSelect").options[document.getElementById("performanceSelect").selectedIndex].text;
    const cleanPerformanceName = replaceAccents(performanceName.replace(/\s+/g, '_')); // Szóközök helyettesítése aláhúzással és ékezetek cseréje
    const currentDate = new Date().toLocaleDateString(); // Mentés dátuma

    // Címsor
    doc.setFontSize(18);
    doc.text(replaceAccents('Elfoglalt helyek és foglalási adatok'), 10, 10);

    // Előadás neve és dátum hozzáadása
    doc.setFontSize(14);
    doc.text(`Elöadás: ${replaceAccents(performanceName)}`, 10, 20);  // Előadás neve cserélt karakterekkel
    doc.text(`Exportálás dátuma: ${currentDate}`, 10, 30);  // Mentés dátuma

    // Táblázat fejléc
    doc.setFontSize(12);
    doc.text('Oldal', 10, 40);
    doc.text('Sor', 40, 40);
    doc.text('Szék', 60, 40);
    doc.text('Név', 80, 40);
    doc.text('Jegytípus', 130, 40);

    let yPosition = 50; // Kezdő pozíció a sorokhoz

    occupiedSeats.forEach((seat, index) => {
        doc.text(replaceAccents(seat.side), 10, yPosition);
        doc.text(seat.row.toString(), 40, yPosition);
        doc.text(seat.seat.toString(), 60, yPosition);
        doc.text(replaceAccents(seat.name), 80, yPosition);
        doc.text(replaceAccents(seat.ticketType), 130, yPosition);

        yPosition += 10;
        if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
        }
    });

    // PDF mentése az előadás nevével és dátummal
    doc.save(`foglalasi-adatok_${cleanPerformanceName}_${currentDate}.pdf`);
}

function replaceAccents(text) {
    /**const accentMap = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o',
        'ú': 'u', 'ü': 'u', 'ű': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O',
        'Ú': 'U', 'Ü': 'U', 'Ű': 'U'
    };*/
    const accentMap = {
        'ő': 'ö', 'ű': 'u',
        'Ő': 'Ö',
        'Ű': 'U'
    };


    return text.split('').map(char => accentMap[char] || char).join('');
}

