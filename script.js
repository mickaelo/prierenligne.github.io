document.addEventListener('DOMContentLoaded', () => {
    // Récupération des coordonnées GPS et appel API geo.api.gouv.fr
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            console.log(`Position : lat=${lat}, lon=${lon}`);

            // Appel API geo.api.gouv.fr
            const corsProxy = 'https://proxy.cors.sh/';
            const url = `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=nom,code,codesPostaux,codeDepartement,codeRegion,population&format=json&geometry=centre`;

            try {
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Origin': window.location.origin,
                        'X-Requested-With': 'XMLHttpRequest',
                        'x-cors-api-key': 'temp_92957369b1b00d6853602cf2b344895a'
                    }
                });
                const data = await res.json();
                if (data && data.length > 0) {
                    const commune = data[0];
                    console.log("Informations de la commune :", commune);
                    // Vous pouvez utiliser ces informations comme vous le souhaitez
                    // Par exemple : commune.nom, commune.code, commune.codesPostaux, etc.
                } else {
                    console.log("Aucune commune trouvée");
                }
            } catch (e) {
                console.error("Erreur API :", e);
            }
        }, (err) => {
            console.error("Erreur géoloc :", err);
        }, { enableHighAccuracy: true });
    } else {
        console.log("Géolocalisation non supportée");
    }

    // Déclarations des constantes du chat
    const chatToggle = document.querySelector('.chat-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const chatClose = document.querySelector('.chat-close');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');

    // Variables pour le système anti-spam
    let lastMessageTime = 0;
    const MESSAGE_COOLDOWN = 3000; // 3 secondes entre chaque message
    let isWaitingForResponse = false;

    // if ("geolocation" in navigator) {
    //     navigator.geolocation.getCurrentPosition(async (pos) => {
    //         const lat = pos.coords.latitude;
    //         const lon = pos.coords.longitude;
    //         console.log(`Position : lat=${lat}, lon=${lon}`);

    //         // Appel API gov pour géocodage inverse
    //         const url = `https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lon}`;

    //         try {
    //             const res = await fetch(url);
    //             const data = await res.json();
    //             if (data.features && data.features.length > 0) {
    //                 const codePostal = data.features[0].properties.postcode;
    //                 console.log("Code postal :", codePostal);
    //             } else {
    //                 console.log("Aucun code postal trouvé");
    //             }
    //         } catch (e) {
    //             console.error("Erreur API :", e);
    //         }
    //     }, (err) => {
    //         console.error("Erreur géoloc :", err);
    //     }, { enableHighAccuracy: true });
    // } else {
    //     console.log("Géolocalisation non supportée");
    // }


    const candle = document.querySelector('.candle');
    const startButton = document.getElementById('startPrayer');
    const durationButtons = document.querySelectorAll('.duration-btn');
    const jesusIcon = document.querySelector('.jesus-icon');
    const flame = document.querySelector('.flame');
    const wick = document.querySelector('.wick');
    const wax = document.querySelector('.wax');
    const iconButtons = document.querySelectorAll('.icon-btn');
    const iconImage = document.querySelector('.jesus-icon img');
    const toggleReadingsBtn = document.querySelector('.toggle-readings');
    const closeReadingsBtn = document.querySelector('.close-readings');
    const readingsSection = document.querySelector('.readings');
    const prevSundayBtn = document.getElementById('prevSunday');
    const nextSundayBtn = document.getElementById('nextSunday');
    const todayBtn = document.getElementById('today');
    const toggleRosaryBtn = document.querySelector('.toggle-rosary');
    const closeRosaryBtn = document.querySelector('.close-rosary');
    const rosarySection = document.querySelector('.rosary');

    // Désactiver les boutons par défaut
    if (toggleReadingsBtn) {
        toggleReadingsBtn.classList.add('disabled');
    }
    if (toggleRosaryBtn) {
        toggleRosaryBtn.classList.add('disabled');
    }

    let currentDate = new Date();

    // Fonction pour obtenir le dimanche précédent
    function getPreviousSunday() {
        const today = new Date();
        const result = new Date(today);
        result.setDate(result.getDate() - result.getDay() - 7);
        return result;
    }

    // Fonction pour obtenir le dimanche suivant
    function getNextSunday() {
        const today = new Date();
        const result = new Date(today);
        result.setDate(result.getDate() + (7 - result.getDay()));
        return result;
    }

    // Fonction pour vérifier si la date est aujourd'hui
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    // Fonction pour vérifier si la date est le dimanche précédent
    function isPreviousSunday(date) {
        const prevSunday = getPreviousSunday();
        return date.getDate() === prevSunday.getDate() &&
            date.getMonth() === prevSunday.getMonth() &&
            date.getFullYear() === prevSunday.getFullYear();
    }

    // Fonction pour vérifier si la date est le dimanche suivant
    function isNextSunday(date) {
        const nextSunday = getNextSunday();
        return date.getDate() === nextSunday.getDate() &&
            date.getMonth() === nextSunday.getMonth() &&
            date.getFullYear() === nextSunday.getFullYear();
    }

    // Fonction pour mettre à jour l'état des boutons
    function updateButtonsState() {
        if (todayBtn) {
            todayBtn.disabled = isToday(currentDate);
        }

        if (prevSundayBtn && nextSundayBtn) {
            prevSundayBtn.disabled = isPreviousSunday(currentDate);
            nextSundayBtn.disabled = isNextSunday(currentDate);

            prevSundayBtn.classList.toggle('active', isPreviousSunday(currentDate));
            nextSundayBtn.classList.toggle('active', isNextSunday(currentDate));
        }
    }

    // Fonction pour formater la date en YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Fonction pour mettre à jour les lectures
    async function updateReadings(date) {
        try {
            const formattedDate = formatDate(date);
            console.log('Fetching readings for date:', formattedDate);

            // Mettre à jour l'affichage de la date
            const readingsDate = document.querySelector('.readings-date');
            if (readingsDate) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                readingsDate.textContent = date.toLocaleDateString('fr-FR', options);
            }

            const response = await fetch(`https://api.aelf.org/v1/messes/${formattedDate}/france`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received data:', data);

            // Afficher les informations liturgiques
            const liturgicalInfo = document.querySelector('.liturgical-info');
            if (liturgicalInfo && data.informations) {
                let infoContent = '';

                if (data.informations.ligne1) {
                    infoContent += `<p>${data.informations.ligne1}</p>`;
                }
                if (data.informations.fete) {
                    infoContent += `<p>${data.informations.fete}</p>`;
                }

                // N'afficher le conteneur que s'il y a du contenu
                if (infoContent) {
                    liturgicalInfo.innerHTML = infoContent;
                    liturgicalInfo.style.display = 'block';
                } else {
                    liturgicalInfo.style.display = 'none';
                }
            } else {
                liturgicalInfo.style.display = 'none';
            }

            if (data.messes && data.messes[0] && data.messes[0].lectures) {
                const lectures = data.messes[0].lectures;
                const readingElements = document.querySelectorAll('.reading');

                lectures.forEach((lecture, index) => {
                    if (index < readingElements.length) {
                        const readingElement = readingElements[index];
                        const referenceElement = readingElement.querySelector('.reference');
                        const textElement = readingElement.querySelector('.text');

                        const titleElement = readingElement.querySelector('h3');
                        if (titleElement) {
                            switch (lecture.type) {
                                case 'lecture_1':
                                    titleElement.textContent = 'Première lecture';
                                    break;
                                case 'lecture_2':
                                    titleElement.textContent = 'Deuxième lecture';
                                    break;
                                case 'psaume':
                                    titleElement.textContent = 'Psaume';
                                    break;
                                case 'evangile':
                                    titleElement.textContent = 'Évangile';
                                    break;
                                default:
                                    titleElement.textContent = lecture.type;
                            }
                        }

                        if (referenceElement) referenceElement.textContent = lecture.ref;
                        if (textElement) {
                            let content = '';
                            if (lecture.verset_evangile) {
                                content += lecture.verset_evangile;
                            }
                            if (lecture.refrain_psalmique) {
                                content += lecture.refrain_psalmique;
                            }
                            content += lecture.contenu;
                            textElement.innerHTML = content;
                        }
                        readingElement.style.display = 'block';
                    }
                });

                for (let i = lectures.length; i < readingElements.length; i++) {
                    readingElements[i].style.display = 'none';
                }

                updateButtonsState();
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des lectures:', error);
        }
    }

    // Gestion des boutons de navigation
    if (prevSundayBtn && nextSundayBtn && todayBtn) {
        prevSundayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateReadings(currentDate);
        });

        nextSundayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateReadings(currentDate);
        });

        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            updateReadings(currentDate);
        });
    }

    // Masquer les lectures par défaut
    if (readingsSection) {
        readingsSection.classList.add('hidden');
        if (toggleReadingsBtn) {
            toggleReadingsBtn.textContent = '📖 Lectio divina';
            toggleReadingsBtn.classList.add('disabled');
        }
    }

    // Gestion du toggle des lectures
    if (toggleReadingsBtn && readingsSection) {
        toggleReadingsBtn.addEventListener('click', () => {
            console.log('Toggle button clicked');
            readingsSection.classList.toggle('hidden');
            toggleReadingsBtn.textContent = '📖 Lectio divina';
            toggleReadingsBtn.classList.toggle('disabled', readingsSection.classList.contains('hidden'));
        });
    } else {
        console.error('Toggle button or readings section not found');
    }

    // Gestion du bouton de fermeture
    if (closeReadingsBtn && readingsSection) {
        closeReadingsBtn.addEventListener('click', () => {
            readingsSection.classList.add('hidden');
            if (toggleReadingsBtn) {
                toggleReadingsBtn.textContent = '📖 Lectio divina';
                toggleReadingsBtn.classList.add('disabled');
            }
        });
    }

    let selectedDuration = 10; // 10 minutes par défaut
    let startTime = 0;
    let animationFrameId = null;
    let isAnimating = false;
    let isUnlimited = false;
    let timer = null;

    // Fonction pour récupérer les lectures du jour
    async function fetchDailyReadings() {
        try {
            const today = new Date();
            const date = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
            console.log('Fetching readings for date:', date);

            const response = await fetch(`https://api.aelf.org/v1/messes/${date}/france`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received data:', data);

            // Afficher les informations liturgiques
            const liturgicalInfo = document.querySelector('.liturgical-info');
            if (liturgicalInfo && data.informations) {
                let infoContent = '';

                if (data.informations.ligne1) {
                    infoContent += `<p>${data.informations.ligne1}</p>`;
                }
                if (data.informations.fete) {
                    infoContent += `<p>${data.informations.fete}</p>`;
                }

                // N'afficher le conteneur que s'il y a du contenu
                if (infoContent) {
                    liturgicalInfo.innerHTML = infoContent;
                    liturgicalInfo.style.display = 'block';
                } else {
                    liturgicalInfo.style.display = 'none';
                }
            } else {
                liturgicalInfo.style.display = 'none';
            }

            // Vérifier si nous avons des lectures
            if (data.messes && data.messes[0] && data.messes[0].lectures) {
                const lectures = data.messes[0].lectures;

                // Récupérer tous les éléments de lecture
                const readingElements = document.querySelectorAll('.reading');

                // Afficher chaque lecture dans l'ordre
                lectures.forEach((lecture, index) => {
                    if (index < readingElements.length) {
                        const readingElement = readingElements[index];
                        const referenceElement = readingElement.querySelector('.reference');
                        const textElement = readingElement.querySelector('.text');

                        // Mettre à jour le titre de la section
                        const titleElement = readingElement.querySelector('h3');
                        if (titleElement) {
                            switch (lecture.type) {
                                case 'lecture_1':
                                    titleElement.textContent = 'Première lecture';
                                    break;
                                case 'lecture_2':
                                    titleElement.textContent = 'Deuxième lecture';
                                    break;
                                case 'psaume':
                                    titleElement.textContent = 'Psaume';
                                    break;
                                case 'evangile':
                                    titleElement.textContent = 'Évangile';
                                    break;
                                default:
                                    titleElement.textContent = lecture.type;
                            }
                        }

                        // Mettre à jour la référence et le contenu
                        if (referenceElement) referenceElement.textContent = lecture.ref;
                        if (textElement) {
                            let content = '';
                            if (lecture.verset_evangile) {
                                content += lecture.verset_evangile;
                            }
                            if (lecture.refrain_psalmique) {
                                content += lecture.refrain_psalmique;
                            }
                            content += lecture.contenu;
                            textElement.innerHTML = content;
                        }
                        readingElement.style.display = 'block';
                    }
                });

                // Masquer les sections non utilisées
                for (let i = lectures.length; i < readingElements.length; i++) {
                    readingElements[i].style.display = 'none';
                }
            } else {
                console.error('No readings found in the response');
                const readings = document.querySelectorAll('.reading');
                if (readings) {
                    readings.forEach(reading => {
                        const textElement = reading.querySelector('.text');
                        if (textElement) {
                            textElement.textContent = 'Les lectures ne sont pas disponibles pour le moment.';
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des lectures:', error);
            const readings = document.querySelectorAll('.reading');
            if (readings) {
                readings.forEach(reading => {
                    const textElement = reading.querySelector('.text');
                    if (textElement) {
                        textElement.textContent = 'Erreur lors du chargement des lectures. Veuillez réessayer plus tard.';
                    }
                });
            }
        }
    }

    // S'assurer que le DOM est complètement chargé avant d'appeler fetchDailyReadings
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchDailyReadings);
    } else {
        fetchDailyReadings();
    }

    // Sélectionner le bouton 1h par défaut
    durationButtons.forEach(btn => {
        if (parseFloat(btn.dataset.duration) === 10) {
            btn.classList.add('active');
        }
    });

    function updateTimer() {
        if (!isAnimating) return;

        const now = new Date().getTime();
        const elapsed = now - startTime;
        const remaining = selectedDuration * 60000 - elapsed;

        if (remaining <= 0) {
            endPrayer();
            return;
        }

        // Calcul du progrès de la fonte (0 à 1)
        const progress = 1 - (remaining / (selectedDuration * 60000));

        // Ne faire fondre la bougie que si la durée n'est pas illimitée
        if (!isUnlimited) {
            // Calcul de la nouvelle hauteur (de 160px à 5px)
            const newHeight = 160 - (progress * 155); // 155 = 160 - 5

            // Appliquer la transformation pour la fonte
            candle.style.transform = `scaleY(${newHeight / 160})`;
            candle.style.transformOrigin = 'bottom';

            // Ajouter l'effet de fonte
            wax.classList.add('melting');
        }

        // Ajuster la flamme
        const flameScale = 1 - (progress * 0.3);
        flame.style.transform = `translateX(-50%) scale(${flameScale})`;
        flame.style.opacity = 1 - (progress * 0.5);

        requestAnimationFrame(updateTimer);
    }

    function startPrayer() {
        if (isAnimating) return;

        isAnimating = true;
        startTime = new Date().getTime();
        isUnlimited = selectedDuration === 0;

        // Réinitialiser les transformations
        candle.classList.remove('extinguished');
        candle.style.transform = 'scaleY(1)';
        candle.style.transformOrigin = 'bottom';
        wax.classList.remove('melting');
        flame.style.transform = 'translateX(-50%) scale(1)';
        flame.style.opacity = '1';

        // Allumer la bougie
        flame.classList.add('lit');

        // On ne fait plus apparaître l'icône automatiquement
        // jesusIcon.classList.add('visible');

        startButton.disabled = true;

        animationFrameId = requestAnimationFrame(updateTimer);

        if (selectedDuration > 0) {
            timer = setTimeout(() => {
                endPrayer();
            }, selectedDuration * 60 * 1000);
        }
    }

    function endPrayer() {
        if (!isAnimating && selectedDuration > 0) return;

        startButton.disabled = false;
        candle.classList.remove('extinguished');
        flame.classList.remove('lit');
        wax.classList.remove('melting');

        flame.style.transform = 'translateX(-50%) scale(1)';
        flame.style.opacity = '0';

        isAnimating = false;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function updatePrayerDuration(newDuration) {
        if (!isAnimating) return;

        selectedDuration = newDuration;
        isUnlimited = newDuration === 0;

        // Réinitialiser le timer
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        // Mettre à jour le temps de début pour le nouveau calcul
        startTime = new Date().getTime();

        // Démarrer un nouveau timer si la durée n'est pas illimitée
        if (selectedDuration > 0) {
            timer = setTimeout(() => {
                endPrayer();
            }, selectedDuration * 60 * 1000);
        }
    }

    // Gestion des événements du bouton
    startButton.addEventListener('click', () => {
        if (startButton.disabled) {
            endPrayer();
        } else {
            startPrayer();
        }
    });

    durationButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const newDuration = parseFloat(btn.dataset.duration);
            durationButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (isAnimating) {
                updatePrayerDuration(newDuration);
            } else {
                selectedDuration = newDuration;
            }
        });
    });

    // Gestion du changement d'icône
    iconButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isCurrentlyActive = button.classList.contains('active');

            // Si l'icône est déjà active, on la désélectionne
            if (isCurrentlyActive) {
                button.classList.remove('active');
                iconImage.src = ''; // Enlever l'image
                jesusIcon.classList.remove('visible');
            } else {
                // Sinon, on désélectionne toutes les autres et on active celle-ci
                iconButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                iconImage.src = button.dataset.icon;
                // On affiche toujours l'icône, qu'il y ait une prière en cours ou non
                jesusIcon.classList.add('visible');
            }
        });
    });

    // Gestion du popin de contact
    const contactLink = document.querySelector('.contact-link');
    const contactPopup = document.querySelector('.contact-popup');
    const overlay = document.querySelector('.overlay');
    const closePopupBtn = document.querySelector('.close-popup');

    if (contactLink && contactPopup && overlay && closePopupBtn) {
        // Changer le texte du bouton
        contactLink.textContent = ' ? ';

        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            contactPopup.classList.add('visible');
            overlay.classList.add('visible');
        });

        const closePopup = () => {
            contactPopup.classList.remove('visible');
            overlay.classList.remove('visible');
        };

        closePopupBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
    }

    // Gestion du toggle du chapelet
    if (toggleRosaryBtn && rosarySection) {
        toggleRosaryBtn.addEventListener('click', () => {
            console.log('Toggle rosary button clicked');
            rosarySection.classList.toggle('visible');
            toggleRosaryBtn.textContent = rosarySection.classList.contains('visible') ? '✝️ Chapelet' : '✝️ Chapelet';
            toggleRosaryBtn.classList.toggle('disabled', !rosarySection.classList.contains('visible'));

            if (rosarySection.classList.contains('visible')) {
                fetchMysteryOfTheDay();
            }
        });
    }

    // Gestion du bouton de fermeture du chapelet
    if (closeRosaryBtn && rosarySection) {
        closeRosaryBtn.addEventListener('click', () => {
            rosarySection.classList.remove('visible');
            if (toggleRosaryBtn) {
                toggleRosaryBtn.textContent = '✝️ Chapelet';
                toggleRosaryBtn.classList.add('disabled');
            }
        });
    }

    // Gestion de la navigation des mystères
    const prevDayBtn = document.getElementById('prevDay');
    const nextDayBtn = document.getElementById('nextDay');
    const todayRosaryBtn = document.getElementById('todayRosary');
    let currentRosaryDate = new Date();

    function updateRosaryButtonsState() {
        const today = new Date();
        const isToday = currentRosaryDate.getDate() === today.getDate() &&
            currentRosaryDate.getMonth() === today.getMonth() &&
            currentRosaryDate.getFullYear() === today.getFullYear();

        if (todayRosaryBtn) {
            todayRosaryBtn.disabled = isToday;
        }

        if (prevDayBtn && nextDayBtn) {
            prevDayBtn.disabled = false;
            nextDayBtn.disabled = false;

            // Désactiver le bouton "Jour précédent" si on est au premier jour possible
            const firstPossibleDate = new Date();
            firstPossibleDate.setDate(firstPossibleDate.getDate() - 7);
            if (currentRosaryDate <= firstPossibleDate) {
                prevDayBtn.disabled = true;
            }

            // Désactiver le bouton "Jour suivant" si on est au dernier jour possible
            const lastPossibleDate = new Date();
            lastPossibleDate.setDate(lastPossibleDate.getDate() + 7);
            if (currentRosaryDate >= lastPossibleDate) {
                nextDayBtn.disabled = true;
            }
        }
    }

    if (prevDayBtn && nextDayBtn && todayRosaryBtn) {
        prevDayBtn.addEventListener('click', () => {
            currentRosaryDate.setDate(currentRosaryDate.getDate() - 1);
            fetchMysteryOfTheDay(currentRosaryDate);
            updateRosaryButtonsState();
        });

        nextDayBtn.addEventListener('click', () => {
            currentRosaryDate.setDate(currentRosaryDate.getDate() + 1);
            fetchMysteryOfTheDay(currentRosaryDate);
            updateRosaryButtonsState();
        });

        todayRosaryBtn.addEventListener('click', () => {
            currentRosaryDate = new Date();
            fetchMysteryOfTheDay(currentRosaryDate);
            updateRosaryButtonsState();
        });
    }

    // Fonction pour récupérer les méditations depuis le fichier JSON local
    async function fetchMeditations() {
        const meditations = config.mysteres;
        console.log(meditations)
        return meditations;
    }

    // Fonction pour vérifier si l'utilisateur peut envoyer un message
    function canSendMessage() {
        const now = Date.now();
        if (now - lastMessageTime < MESSAGE_COOLDOWN) {
            return false;
        }
        if (isWaitingForResponse) {
            return false;
        }
        return true;
    }

    // Fonction pour mettre à jour l'état du bouton d'envoi
    function updateSendButtonState() {
        const canSend = canSendMessage();
        sendButton.disabled = !canSend;
        sendButton.style.opacity = canSend ? '1' : '0.5';
        chatInput.disabled = !canSend;
    }

    // Fonction pour envoyer une question à l'API
    async function sendQuestion(question) {
        if (!canSendMessage()) return;

        try {
            lastMessageTime = Date.now();
            isWaitingForResponse = true;
            updateSendButtonState();

            // Afficher les points de chargement
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'message bot-message';
            loadingMessage.innerHTML = '<div class="loading-dove">...</div>';
            chatMessages.appendChild(loadingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const corsProxy = 'https://proxy.cors.sh/';
            const response = await fetch(corsProxy + 'https://categpt.chat/api/question', {
                method: 'POST',
                headers: {
                    'Origin': window.location.origin,
                    'X-Requested-With': 'XMLHttpRequest',
                    'x-cors-api-key': 'temp_92957369b1b00d6853602cf2b344895f',
                    'Content-Type': 'application/json',
                    'Authorization': config.API_KEY
                },
                body: JSON.stringify({ question, all_tokens: 500 })
            });

            // Supprimer les points de chargement
            loadingMessage.remove();

            if (!response.ok) {
                throw new Error('Erreur lors de la requête');
            }

            const data = await response.json();
            if (data.stat === 'ok') {
                addMessage(formatResponse(data));
            } else {
                addMessage('Désolé, je n\'ai pas pu traiter votre question. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Erreur:', error);
            addMessage('Désolé, une erreur est survenue. Veuillez réessayer plus tard.');
        } finally {
            isWaitingForResponse = false;
            updateSendButtonState();
        }
    }

    // Gestion des événements du chat
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('visible');
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.remove('visible');
    });

    sendButton.addEventListener('click', () => {
        const question = chatInput.value.trim();
        if (question && canSendMessage()) {
            addMessage(question, true);
            chatInput.value = '';
            sendQuestion(question);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const question = chatInput.value.trim();
            if (question && canSendMessage()) {
                addMessage(question, true);
                chatInput.value = '';
                sendQuestion(question);
            }
        }
    });

    // Mettre à jour l'état du bouton toutes les secondes
    setInterval(updateSendButtonState, 1000);

    // Modifier la fonction fetchMysteryOfTheDay pour accepter une date en paramètre
    async function fetchMysteryOfTheDay(date = new Date()) {
        try {
            // Afficher le loader
            const mysteryTitle = document.querySelector('.mystery-title');
            const mysteryText = document.querySelector('.mystery-text');

            if (mysteryTitle && mysteryText) {
                // Sauvegarder le contenu original
                const originalTitle = mysteryTitle.innerHTML;
                const originalText = mysteryText.innerHTML;

                // Afficher le loader
                mysteryTitle.innerHTML = '<div class="loader"></div>';
                mysteryText.innerHTML = '<div class="loader"></div>';
            }

            const dayOfWeek = date.getDay();

            let mysteryType;
            switch (dayOfWeek) {
                case 0: // Dimanche
                    mysteryType = 'glorieux'; // Quatrième chapelet
                    break;
                case 1: // Lundi
                    mysteryType = 'joyeux'; // Premier chapelet
                    break;
                case 2: // Mardi
                    mysteryType = 'douloureux'; // Troisième chapelet
                    break;
                case 3: // Mercredi
                    mysteryType = 'glorieux'; // Quatrième chapelet
                    break;
                case 4: // Jeudi
                    mysteryType = 'lumineux'; // Deuxième chapelet
                    break;
                case 5: // Vendredi
                    mysteryType = 'douloureux'; // Troisième chapelet
                    break;
                case 6: // Samedi
                    mysteryType = 'joyeux'; // Premier chapelet
                    break;
            }

            // Récupérer les mystères depuis config
            const mysteryList = config.mysteres.find(m => m.categorie === mysteryType)?.mysteres;

            if (!mysteryList) {
                throw new Error('Impossible de récupérer les mystères');
            }

            // Mettre à jour l'affichage avec les 5 mystères
            if (mysteryTitle && mysteryText) {
                // Ajouter l'indication du chapelet et la date
                let chapeletInfo = '';
                switch (mysteryType) {
                    case 'joyeux':
                        chapeletInfo = ' (Premier chapelet - Mystères joyeux)';
                        break;
                    case 'lumineux':
                        chapeletInfo = ' (Deuxième chapelet - Mystères lumineux)';
                        break;
                    case 'douloureux':
                        chapeletInfo = ' (Troisième chapelet - Mystères douloureux)';
                        break;
                    case 'glorieux':
                        chapeletInfo = ' (Quatrième chapelet - Mystères glorieux)';
                        break;
                }

                // Formater la date
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = date.toLocaleDateString('fr-FR', options);

                // Créer le contenu HTML pour les 5 mystères
                let mysteriesHTML = '';
                mysteryList.forEach((mystery, index) => {
                    mysteriesHTML += `
                        <div class="mystery-item">
                            <h4>${index + 1}${getOrdinalSuffix(index + 1)} dizaine - ${mystery.nom}</h4>
                            <p class="mystery-text">${mystery.meditation}</p>
                            <p class="meditation-text">Fruit : ${mystery.fruit}</p>
                        </div>
                    `;
                });

                // Mettre à jour le contenu
                mysteryTitle.innerHTML = `<h3>${mysteryType.charAt(0).toUpperCase() + mysteryType.slice(1)}</h3>
                    <p class="mystery-date">${formattedDate}</p>`;
                mysteryText.innerHTML = mysteriesHTML;
            }

            // Mettre à jour l'état des boutons
            updateRosaryButtonsState();

        } catch (error) {
            console.error('Erreur lors de la récupération du mystère:', error);
            // En cas d'erreur, restaurer le contenu original
            if (mysteryTitle && mysteryText) {
                mysteryTitle.innerHTML = originalTitle;
                mysteryText.innerHTML = originalText;
            }
        }
    }

    // Fonction utilitaire pour obtenir le suffixe ordinal en français
    function getOrdinalSuffix(num) {
        if (num === 1) return 'ère';
        return 'ème';
    }

    // Gestion de l'accordéon du chapelet
    const accordionHeader = document.querySelector('.accordion-header');
    const accordionContent = document.querySelector('.accordion-content');

    if (accordionHeader && accordionContent) {
        accordionHeader.addEventListener('click', () => {
            accordionHeader.classList.toggle('active');
            accordionContent.classList.toggle('active');
        });
    }

    // Fonction pour afficher un message dans le chat
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Fonction pour formater la réponse de l'API
    function formatResponse(response) {
        let formattedText = '';

        // Ajouter chaque partie de la réponse
        response.reponse.forEach(part => {
            switch (part.type) {
                case 'intro':
                    formattedText += `[Introduction]\n${part.text}\n\n`;
                    break;
                case 'bible':
                    formattedText += `[Bible]\n📖 ${part.text}\n\n`;
                    break;
                case 'peres':
                    formattedText += `[Pères de l'Église]\n👨‍🦳 ${part.text}\n\n`;
                    break;
                case 'magistere':
                    formattedText += `[Magistère]\n📚 ${part.text}\n\n`;
                    break;
                case 'papes':
                    formattedText += `[Papes]\n👑 ${part.text}\n\n`;
                    break;
                default:
                    formattedText += `${part.text}\n\n`;
            }
        });

        // Ajouter les références
        if (response.references && response.references.length > 0) {
            formattedText += '[Références]\n📚\n';
            response.references.forEach(ref => {
                formattedText += `- ${ref.description}\n`;
            });
        }

        return formattedText;
    }
}); 