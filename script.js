document.addEventListener('DOMContentLoaded', () => {
    // Récupération des coordonnées GPS et appel API geo.api.gouv.fr
    // if ("geolocation" in navigator) {
    //     navigator.geolocation.getCurrentPosition(async (pos) => {
    //         const lat = pos.coords.latitude;
    //         const lon = pos.coords.longitude;
    //         console.log(`Position : lat=${lat}, lon=${lon}`);

    //         // Appel API geo.api.gouv.fr
    //         const corsProxy = 'https://proxy.cors.sh/';
    //         const url = `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=nom,code,codesPostaux,codeDepartement,codeRegion,population&format=json&geometry=centre`;

    //         try {
    //             const res = await fetch(url, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Origin': window.location.origin,
    //                     'X-Requested-With': 'XMLHttpRequest',
    //                     'x-cors-api-key': 'temp_92957369b1b00d6853602cf2b344895a'
    //                 }
    //             });
    //             const data = await res.json();
    //             if (data && data.length > 0) {
    //                 const commune = data[0];
    //                 console.log("Informations de la commune :", commune);
    //                 // Vous pouvez utiliser ces informations comme vous le souhaitez
    //                 // Par exemple : commune.nom, commune.code, commune.codesPostaux, etc.
    //             } else {
    //                 console.log("Aucune commune trouvée");
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
    const horairesSection = document.querySelector('.messes-horaires');
    const prevSundayBtn = document.getElementById('prevSunday');
    const nextSundayBtn = document.getElementById('nextSunday');
    const todayBtn = document.getElementById('today');
    const toggleRosaryBtn = document.querySelector('.toggle-rosary');
    const closeRosaryBtn = document.querySelector('.close-rosary');
    const rosarySection = document.querySelector('.rosary');


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
        horairesSection.classList.add('hidden');

        if (toggleReadingsBtn) {
            toggleReadingsBtn.textContent = '📖 Lectio divina';
        }
    }

    // Gestion du toggle des lectures
    if (toggleReadingsBtn && readingsSection) {
        toggleReadingsBtn.addEventListener('click', () => {
            console.log('Toggle button clicked');
            readingsSection.classList.toggle('hidden');
            toggleReadingsBtn.textContent = '📖 Lectio divina';
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
                            <h4>${index + 1}${getMysterySuffix(index + 1)} mystère - ${mystery.nom}</h4>
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
    function getMysterySuffix(num) {
        if (num === 1) return 'er';
        return 'e';
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

    // Gestion du widget des messes
    const massesContainer = document.querySelector('.masses-container');
    const massesClose = document.querySelector('.masses-close');
    const massesList = document.querySelector('.masses-list');

    // Fonction pour récupérer les messes du jour
    async function fetchMasses() {
        try {
            const today = new Date();
            console.log('Fetching masses for date:', today);

            // Récupération des coordonnées GPS
            let commune = null;
            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
                    });

                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log(`Position : lat=${lat}, lon=${lon}`);

                    // Appel API geo.api.gouv.fr
                    const corsProxy = 'https://proxy.cors.sh/';
                    const url = `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=nom,code,codesPostaux,codeDepartement,codeRegion,population&format=json&geometry=centre`;

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
                        commune = data[0];
                        console.log("Informations de la commune :", commune);
                    }
                } catch (error) {
                    console.error("Erreur de géolocalisation :", error);
                }
            }

            // Appel à l'API des messes
            const response = await fetch('http://messes.info/horaires/SEMAINE?format=json&userkey=7J9pDzdshVLW5WQwmSf67m79Q3TY4YwkcBpir87Z9L73dWxw93ZrH927kAZ5g9M2');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received masses data:', data);

            // Afficher les messes
            if (massesList && data.listCelebrationTime) {
                massesList.innerHTML = '';

                // Trier les messes par date et heure
                const sortedMasses = data.listCelebrationTime.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time.replace('h', ':')}`);
                    const dateB = new Date(`${b.date}T${b.time.replace('h', ':')}`);
                    return dateA - dateB;
                });

                // Grouper les messes par date
                const massesByDate = {};
                sortedMasses.forEach(mass => {
                    if (!massesByDate[mass.date]) {
                        massesByDate[mass.date] = [];
                    }
                    massesByDate[mass.date].push(mass);
                });

                // Afficher les messes groupées par date
                Object.entries(massesByDate).forEach(([date, masses]) => {
                    const dateHeader = document.createElement('div');
                    dateHeader.className = 'mass-date-header';
                    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    });
                    dateHeader.textContent = formattedDate;
                    massesList.appendChild(dateHeader);

                    masses.forEach(mass => {
                        const massItem = document.createElement('div');
                        massItem.className = 'mass-item';

                        let content = '';

                        // Type de célébration
                        if (mass.celebrationTimeType) {
                            content += `<h4>${mass.celebrationTimeType === 'WEEKMASS' ? 'Messe' : mass.celebrationTimeType}</h4>`;
                        }

                        // Heure
                        if (mass.time) {
                            content += `<p class="time">${mass.time}</p>`;
                        }

                        // Église
                        if (mass.locality && mass.locality.name) {
                            content += `<p class="church">${mass.locality.name}</p>`;
                        }

                        // Adresse
                        if (mass.locality && mass.locality.address) {
                            content += `<p>${mass.locality.address}</p>`;
                        }

                        // Ville
                        if (mass.locality && mass.locality.city) {
                            content += `<p>${mass.locality.city}</p>`;
                        }

                        // Commentaire
                        if (mass.comment) {
                            content += `<p class="comment">${mass.comment}</p>`;
                        }

                        massItem.innerHTML = content;
                        massesList.appendChild(massItem);
                    });
                });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des messes:', error);
            if (massesList) {
                massesList.innerHTML = '<p>Impossible de charger les messes du jour. Veuillez réessayer plus tard.</p>';
            }
        }
    }

    const toggleMassBtn = document.querySelector('.toggle-mass');
    const closeMassLiturgieBtn = document.querySelector('.close-mass-liturgie');
    const massLiturgieSection = document.querySelector('.mass-liturgie');

    if (toggleMassBtn && massLiturgieSection) {
        toggleMassBtn.addEventListener('click', () => {
            // Toggle le volet Liturgie de la messe
            const isVisible = massLiturgieSection.classList.contains('visible');
            if (isVisible) {
                massLiturgieSection.classList.remove('visible');
            } else {
                // Fermer les autres volets
                if (readingsSection) readingsSection.classList.remove('visible');
                if (rosarySection) rosarySection.classList.remove('visible');
                massLiturgieSection.classList.add('visible');
            }
        });
    }
    if (closeMassLiturgieBtn && massLiturgieSection) {
        closeMassLiturgieBtn.addEventListener('click', () => {
            massLiturgieSection.classList.remove('visible');
        });
    }

    const toggleMessesBtn = document.querySelector('.toggle-messes');
    const closeMessesHorairesBtn = document.querySelector('.close-messes-horaires');
    const messesHorairesSection = document.querySelector('.messes-horaires');
    const messesHorairesContent = document.querySelector('.messes-horaires-content');

    if (toggleMessesBtn && messesHorairesSection) {

        toggleMessesBtn.addEventListener('click', () => {
            // Fermer les autres volets
            if (readingsSection) readingsSection.classList.remove('visible');
            if (rosarySection) rosarySection.classList.remove('visible');
            if (massLiturgieSection) massLiturgieSection.classList.remove('visible');
            messesHorairesSection.classList.toggle('hidden');
        });
    }
    if (closeMessesHorairesBtn && messesHorairesSection) {
        closeMessesHorairesBtn.addEventListener('click', () => {
            messesHorairesSection.classList.remove('visible');
        });
    }

    function parseHorairesMesses(html) {
        // Crée un DOM temporaire à partir du HTML complet
        const temp = document.createElement('div');
        // Si le HTML commence par <!DOCTYPE ou <html>, on extrait le <body>
        if (/<!DOCTYPE|<html/i.test(html)) {
            // Utilise DOMParser si dispo (navigateurs modernes)
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                temp.innerHTML = doc.body ? doc.body.innerHTML : html;
            } catch (e) {
                temp.innerHTML = html;
            }
        } else {
            temp.innerHTML = html;
        }

        // Cherche tous les articles horaires dans le DOM global
        const articles = temp.querySelectorAll('article[itemtype="http://schema.org/Event"]');
        if (!articles.length) return '<p>Aucune messe trouvée pour cette période.</p>';

        let result = '';
        articles.forEach(article => {
            const dateHeure = article.querySelector('h3')?.textContent?.trim() || '';
            const img = article.querySelector('img[itemprop="image"]');
            const imgHtml = img ? `<img src="${img.src}" alt="${img.alt || ''}" style="max-width:60px;max-height:60px;float:right;margin-left:1em;">` : '';
            const lieu = article.querySelector('h4 span[itemprop="name"]')?.textContent?.trim() || '';
            const ville = article.querySelector('h4 span[itemprop="addressLocality"]')?.textContent?.trim() || '';
            const type = article.querySelector('div[itemprop="description"]')?.textContent?.trim() || '';
            const adresse = article.querySelector('[itemprop="address"]')?.textContent?.trim() || '';
            result += `<div class="messe-horaire">
                <div class="horaire-header">
                    <strong>${dateHeure}</strong> ${imgHtml}
                </div>
                <div class="horaire-lieu">${lieu}${ville ? ' à ' + ville : ''}</div>
                <div class="horaire-type">${type}</div>
                <div class="horaire-adresse">${adresse}</div>
            </div>`;
        });
        return result;
    }

    async function loadHorairesMesses(ville = Null) {
        if (!messesHorairesContent) return;
        messesHorairesContent.innerHTML = '<p>Chargement des horaires...</p>';

        try {
            const ville = ville ? ville : await getVilleFromGeoloc();
            console.log('Ville détectée dans loadHorairesMesses :', ville);
            const response = await fetch(`/api/horaires-messes?ville=${encodeURIComponent(ville)}`);
            const data = await response.json();
            if (data.success) {
                const horairesHTML = data.html;
                messesHorairesContent.innerHTML = generateHorairesHTML(parseHorairesEtLieux(data.html[0] || data.html));
            } else {
                messesHorairesContent.innerHTML = '<p>Erreur lors du chargement des horaires : ' + (data.error || 'inconnue') + '</p>';
            }
        } catch (e) {
            messesHorairesContent.innerHTML = '<p>Erreur lors du chargement des horaires.</p>';
        }
    }

    // --- Scroll infini pour la liturgie de la messe ---
    // Exemple de découpage en sections (à compléter avec tout le texte)
    const liturgieSections = [
        `<section id="rites-initiaux"><h3>Rites initiaux</h3><div class="prayer-text prayer-fr">Lorsque le peuple est rassemblé, le prêtre s’avance vers l’autel avec les ministres, pendant le chant d’entrée...<br><strong>Au nom du Père, et du Fils, et du Saint-Esprit.</strong><br>R/ Amen.<br><br><strong>Salutation :</strong><br>La grâce de Jésus, le Christ, notre Seigneur, l’amour de Dieu le Père, et la communion de l’Esprit Saint, soient toujours avec vous.<br>R/ Et avec votre esprit.<br>...</div></section>`,
        `<section id="acte-penitentiel"><h3>Acte pénitentiel</h3><div class="prayer-text prayer-fr">Frères et sœurs, préparons-nous à célébrer le mystère de l’Eucharistie, en reconnaissant que nous avons péché...<br><strong>Je confesse à Dieu tout-puissant...</strong><br>...<br><strong>Que Dieu tout-puissant nous fasse miséricorde ; qu’il nous pardonne nos péchés et nous conduise à la vie éternelle.</strong><br>R/ Amen.<br>...</div></section>`,
        `<section id="kyrie"><h3>Kyrie</h3><div class="prayer-text prayer-fr">Kyrie eléison. R/ Kyrie eléison.<br>Seigneur, prends pitié.<br>Christe eléison. R/ Christe eléison.<br>Ô Christ, prends pitié.<br>...</div></section>`,
        `<section id="gloria"><h3>Gloria</h3><div class="prayer-text prayer-fr">Gloire à Dieu, au plus haut des cieux, et paix sur la terre aux hommes qu’il aime...<br>...<br><strong>Gloria in excelsis Deo...</strong><br>...</div></section>`,
        `<section id="collecte"><h3>Prière d'ouverture (Collecte)</h3><div class="prayer-text prayer-fr">Prions le Seigneur.<br>...<br>Par Jésus Christ, ton Fils, notre Seigneur, qui vit et règne avec toi dans l’unité du Saint-Esprit, Dieu, pour les siècles des siècles.<br>R/ Amen.<br>...</div></section>`
        // Ajoute ici toutes les autres sections du texte découpé !
    ];

    let loadedLiturgieSections = 0;
    const SECTIONS_PER_BATCH = 2; // nombre de sections à charger à chaque fois

    function loadNextLiturgieSections() {
        const container = document.querySelector('.mass-liturgie-content');
        if (!container) return;
        for (let i = 0; i < SECTIONS_PER_BATCH && loadedLiturgieSections < liturgieSections.length; i++, loadedLiturgieSections++) {
            container.insertAdjacentHTML('beforeend', liturgieSections[loadedLiturgieSections]);
        }
    }

    // Initialisation au premier affichage du volet
    if (massLiturgieSection) {
        massLiturgieSection.addEventListener('scroll', function () {
            const container = this.querySelector('.mass-liturgie-content');
            if (!container) return;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
                loadNextLiturgieSections();
            }
        });
        // Charger les premières sections au départ
        loadNextLiturgieSections();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const frBtn = document.getElementById('lang-fr');
    const latBtn = document.getElementById('lang-latin');
    if (!frBtn || !latBtn) return;

    frBtn.addEventListener('click', function () {
        document.querySelectorAll('.prayer-fr').forEach(e => e.style.display = '');
        document.querySelectorAll('.prayer-latin').forEach(e => e.style.display = 'none');
        frBtn.classList.add('active');
        latBtn.classList.remove('active');
    });

    latBtn.addEventListener('click', function () {
        document.querySelectorAll('.prayer-fr').forEach(e => e.style.display = 'none');
        document.querySelectorAll('.prayer-latin').forEach(e => e.style.display = '');
        latBtn.classList.add('active');
        frBtn.classList.remove('active');
    });
});

function getVilleFromGeoloc() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`)
                        .then(res => res.json())
                        .then(data => {
                            const ville = data.address.village || data.address.town || data.address.city || data.address.municipality || data.address.county || 'Inconnu';
                            resolve(ville);
                        })
                        .catch(() => {
                            resolve('Inconnu');
                        });
                },
                err => {
                    resolve('Inconnu');
                },
                { timeout: 5000 }
            );
        } else {
            resolve('Inconnu');
        }
    });
}

// Détection mobile
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Fonction pour afficher le bouton de géoloc dans le panneau horaires
function showGeolocButton() {
    const horairesPanel = document.querySelector('.mass-times-panel');
    if (!horairesPanel) return;
    let geolocDiv = document.getElementById('geoloc-btn-container');
    if (!geolocDiv) {
        geolocDiv = document.createElement('div');
        geolocDiv.id = 'geoloc-btn-container';
        geolocDiv.style.margin = '1em 0';
        geolocDiv.innerHTML = `
      <button id="activate-geoloc-btn" style="padding:0.5em 1em;font-size:1em;">📍 Activer la géolocalisation</button>
      <div id="geoloc-explain" style="font-size:0.9em;color:#555;margin-top:0.5em;">Pour trouver les horaires de messe les plus proches de votre position, activez la géolocalisation.</div>
    `;
        horairesPanel.prepend(geolocDiv);
        document.getElementById('activate-geoloc-btn').onclick = function () {
            askForGeoloc();
        };
    }
}

function askForGeoloc() {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
    }
    document.getElementById('activate-geoloc-btn').disabled = true;
    document.getElementById('activate-geoloc-btn').innerText = 'Recherche en cours...';
    navigator.geolocation.getCurrentPosition(
        function (position) {
            // Appelle la fonction existante pour trouver la ville la plus proche et afficher les horaires
            fetchAndDisplayMassTimesByCoords(position.coords.latitude, position.coords.longitude);
            document.getElementById('geoloc-btn-container').remove();
        },
        function (error) {
            alert("Impossible d'obtenir la position : " + error.message);
            document.getElementById('activate-geoloc-btn').disabled = false;
            document.getElementById('activate-geoloc-btn').innerText = '📍 Activer la géolocalisation';
        }
    );
}

// À l'ouverture du panneau horaires, proposer la géoloc sur mobile
function onOpenMassTimesPanel() {
    // ... code existant pour afficher le panneau ...
    if (isMobileDevice()) {
        showGeolocButton();
    }
}

// Sélecteur de langue pour le chapelet uniquement
function setupRosaryLanguageSelector() {
    const rosary = document.querySelector('.rosary');
    if (!rosary) return;
    const langSelector = rosary.querySelector('.language-selector');
    if (!langSelector) return;
    const btnFr = langSelector.querySelector('#lang-fr');
    const btnLatin = langSelector.querySelector('#lang-latin');
    if (!btnFr || !btnLatin) return;
    btnFr.onclick = () => {
        btnFr.classList.add('active');
        btnLatin.classList.remove('active');
        rosary.querySelectorAll('.prayer-fr').forEach(e => e.style.display = 'block');
        rosary.querySelectorAll('.prayer-latin').forEach(e => e.style.display = 'none');
    };
    btnLatin.onclick = () => {
        btnLatin.classList.add('active');
        btnFr.classList.remove('active');
        rosary.querySelectorAll('.prayer-fr').forEach(e => e.style.display = 'none');
        rosary.querySelectorAll('.prayer-latin').forEach(e => e.style.display = 'block');
    };
}

// Appeler ce setup au chargement
setupRosaryLanguageSelector();

function formatHorairesText(rawText) {
    // Découpe par jour (ex: sam. 19 juil. 2025)
    const lines = rawText.split(/(?=\b(?:lun|mar|mer|jeu|ven|sam|dim)\.\s\d{1,2}\s\w+\.?\s\d{4})/g);
    let html = '';
    lines.forEach(block => {
        if (!block.trim()) return;
        // Date du jour
        const dateMatch = block.match(/^(?<date>\w+\.\s\d{1,2}\s\w+\.?\s\d{4})/);
        let date = dateMatch ? dateMatch.groups.date : '';
        let rest = block.replace(date, '').trim();
        if (date) {
            html += `<div class="horaire-jour"><strong>${date}</strong></div>`;
        }
        // Découpe chaque horaire (ex: 18h00 - Messe dominicale...)
        const horaires = rest.split(/(?=\d{1,2}h\d{2}\s*-\s*)/g);
        horaires.forEach(horaire => {
            if (!horaire.trim()) return;
            // On sépare l'heure, le type, le lieu, etc.
            const heureMatch = horaire.match(/^(?<heure>\d{1,2}h\d{2})\s*-\s*(?<type>[^\n]+?)(?=\d{5}|$)/);
            let heure = heureMatch ? heureMatch.groups.heure : '';
            let type = heureMatch ? heureMatch.groups.type.trim() : '';
            // Lieu (code postal + ville)
            const lieuMatch = horaire.match(/(\d{5})\s([A-ZÉÈÊÎÔÛÄÖÜ\- ]+)/);
            let lieu = lieuMatch ? `${lieuMatch[2].trim()} (${lieuMatch[1]})` : '';
            // Paroisse
            const paroisseMatch = horaire.match(/Communauté de paroisses\s*:\s*([\w\s\-']+)/);
            let paroisse = paroisseMatch ? paroisseMatch[1].trim() : '';
            // Intentions
            const intentionsMatch = horaire.match(/(?:Communauté de paroisses[\s\S]+?)([A-Z][^\n]+)(?=Horaires de la paroisse|Signalez une erreur|$)/);
            let intentions = intentionsMatch ? intentionsMatch[1].trim() : '';
            // Affichage
            html += `<div class="horaire-block">
        <div class="horaire-heure">${heure ? `<span class='heure'>${heure}</span>` : ''}</div>
        <div class="horaire-type">${type}</div>
        <div class="horaire-lieu">${lieu}</div>
        <div class="horaire-paroisse">${paroisse}</div>
        <div class="horaire-intentions">${intentions}</div>
      </div>`;
        });
        // Cas "Pas d'horaire disponible" ou "Afficher plus de lignes"
        if (/Pas d'horaire disponible|Afficher plus de lignes/.test(rest)) {
            html += `<div class="horaire-info">${rest.match(/Pas d'horaire disponible|Afficher plus de lignes/g).join('<br>')}</div>`;
        }
    });
    return html;
}

function parseHorairesEtLieux(bigString) {
    let cleanedText = bigString
        .replace(/Horaires de la paroisse\s*Signalez une erreur/g, '')
        .replace(/Pas d'horaire disponible/g, '')
        .replace(/Afficher plus de lignes/g, '');

    const dayAbbr = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    const dayPattern = `(?:${dayAbbr.join('|')})\\. \\d{1,2} [a-zéû]{3,4}\\.?(?: \\d{4})?`;
    cleanedText = cleanedText.replace(new RegExp(`(${dayPattern})`, 'gi'), '\n$1');

    const dateBlocks = cleanedText.split(/\n(?=(?:lun|mar|mer|jeu|ven|sam|dim)\. \d{1,2} [a-zéû]{3,4}\.? ?\d{0,4})/i);

    const result = [];

    const regexHoraireLieu = /(\d{1,2}h\d{2}\s+-\s+Messe [^0-9\n]+?)\s+(.+?\d{5}\s+[A-ZÉÈÊÎÔÛÄÖÜ\- ]+)/g;

    for (const block of dateBlocks) {
        if (!block.trim()) continue;

        const dateMatch = block.match(/^((?:lun|mar|mer|jeu|ven|sam|dim)\. \d{1,2} [a-zéû]{3,4}\.? ?\d{0,4})/i);
        const date = dateMatch ? dateMatch[1].trim() : null;
        if (!date) continue;

        const horairesBlock = block.replace(date, '').trim();

        let match;
        while ((match = regexHoraireLieu.exec(horairesBlock)) !== null) {
            const horaire = match[1].trim();
            const lieu = match[2].trim();
            result.push({ date, horaire, lieu });
        }
    }

    return result;
}

function generateHorairesHTML(horairesList) {
    // Regrouper par date
    const groupedByDate = horairesList.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    let html = '';

    // Pour chaque date, afficher la date en titre et la liste des horaires
    for (const date of Object.keys(groupedByDate)) {
        html += `<h3>${date}</h3><ul>`;
        groupedByDate[date].forEach(item => {
            html += `<li><span class="messe-heure"><strong>${item.horaire}</strong></span><br><span class="messe-lieu">${item.lieu}</span></li>`;
        });
        html += '</ul>';
    }

    return html;
}

function showMessesHorairesPanel() {
    const panel = document.querySelector('.messes-horaires');
    if (!panel) return;
    panel.style.display = 'block';
    const content = panel.querySelector('.messes-horaires-content');
    if (!content) return;
    // Affiche le choix géoloc ou ville
    content.innerHTML = `
    <div class="messes-horaires-choix" style="display:flex;align-items:center;gap:1em;margin-bottom:1.5em;justify-content:center;">
      <button id="btn-geoloc-messes" class="nav-btn">📍 Utiliser ma position</button>
      <span>ou</span>
      <input id="input-ville-messes" type="text" placeholder="Ville ou village" style="padding:0.5em; border-radius:5px; border:1px solid #ccc; width: 160px;">
      <button id="btn-valider-ville-messes" class="nav-btn">Valider</button>
    </div>
    <div class="messes-horaires-result"></div>
  `;
    // Ajout suggestions sous l'input
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'ville-suggestions';
    suggestionsDiv.style.position = 'absolute';
    suggestionsDiv.style.left = '0';
    suggestionsDiv.style.right = '0';
    suggestionsDiv.style.zIndex = '100';
    content.querySelector('#input-ville-messes').parentNode.style.position = 'relative';
    content.querySelector('#input-ville-messes').parentNode.appendChild(suggestionsDiv);

    let lastQuery = '';
    let suggestionsVisible = false;
    let selectedVilleData = null;
    let currentFetchController = null;
    let debounceTimeout = null; // ✅ Déclaration au début
    content.querySelector('#input-ville-messes').addEventListener('input', async function () {
        const query = content.querySelector('#input-ville-messes').value.trim();
        
        // Reset sélection
        selectedVilleData = null;

        // Si trop court → reset suggestions
        if (query.length < 2) {
            suggestionsDiv.innerHTML = '';
            suggestionsVisible = false;
            if (currentFetchController) {
                currentFetchController.abort();
                currentFetchController = null;
            }
            return;
        }

        // Si même requête déjà affichée
        if (query === lastQuery && suggestionsVisible) return;

        // Stocker la requête courante
        lastQuery = query;

        // Annuler le fetch précédent immédiatement
        if (currentFetchController) {
            currentFetchController.abort();
            currentFetchController = null;
        }

        // Clear le debounce précédent
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Lancer un nouveau debounce
        debounceTimeout = setTimeout(() => {
            currentFetchController = new AbortController();

            (async () => {
                // Appel API Nominatim
                const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&countrycodes=fr&format=json&limit=5`;
                let data = [];
                try {
                    const resp = await fetch(url, { headers: { 'Accept-Language': 'fr' }, signal: currentFetchController.signal });
                    data = await resp.json();
                } catch (e) {
                    if (e.name === 'AbortError') return;
                    suggestionsDiv.innerHTML = '';
                    suggestionsVisible = false;
                    return;
                }

                suggestionsDiv.innerHTML = '';
                data.forEach(place => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'ville-suggestion-item';
                    suggestion.textContent = place.display_name;
                    suggestion.style.padding = '0.5em 1em';
                    suggestion.style.cursor = 'pointer';

                    suggestion.onclick = () => {
                        inputVille.value = place.display_name;
                        selectedVilleData = place; // On stocke l'objet suggestion
                        suggestionsDiv.innerHTML = '';
                        suggestionsVisible = false;

                        // Extraction du nom de ville et du code postal (département)
                        const display = place.display_name;
                        const villeMatch = display.match(/^([^,]+)/);
                        const codePostalMatch = display.match(/(\d{5})/);
                        let villeNom = villeMatch ? villeMatch[1].trim() : '';
                        let codePostal2 = codePostalMatch ? codePostalMatch[1].slice(0, 2) : '';

                        selectedVilleData.villeNom = villeNom;
                        selectedVilleData.codePostal2 = codePostal2;
                        console.log('Ville extraite:', villeNom, 'Département:', codePostal2);
                    };

                    suggestionsDiv.appendChild(suggestion);
                });

                suggestionsVisible = true;
            })();

        }, 300); // ← délai debounce en ms (ici 300 ms, à ajuster si tu veux)

    });
    // Fermer suggestions si clic ailleurs ou perte de focus
    document.addEventListener('click', function (e) {
        if (!suggestionsDiv.contains(e.target) && e.target !== content.querySelector('#input-ville-messes')) {
            suggestionsDiv.innerHTML = '';
            suggestionsVisible = false;
        }
    });
    content.querySelector('#input-ville-messes').addEventListener('blur', function () {
        setTimeout(() => {
            if (!document.activeElement.classList.contains('ville-suggestion-item')) {
                suggestionsDiv.innerHTML = '';
                suggestionsVisible = false;
            }
        }, 200);
    });
    // Gestion des boutons
    const btnGeoloc = content.querySelector('#btn-geoloc-messes');
    const btnValider = content.querySelector('#btn-valider-ville-messes');
    const inputVille = content.querySelector('#input-ville-messes');
    const resultDiv = content.querySelector('.messes-horaires-result');

    btnGeoloc.onclick = async () => {
        resultDiv.innerHTML = '<p>Recherche de votre position...</p>';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async pos => {
                const { latitude, longitude } = pos.coords;
                // Reverse geocode pour trouver la ville
                const ville = await getCityFromCoords(latitude, longitude);
                if (ville) {
                    resultDiv.innerHTML = '<p>Recherche des horaires pour ' + ville + '...</p>';
                    await afficherHorairesPourVille(ville, resultDiv);
                    if (typeof loadHorairesMesses === 'function') {
                        loadHorairesMesses(ville);
                    }
                } else {
                    resultDiv.innerHTML = '<p>Ville non trouvée à partir de votre position.</p>';
                }
            }, err => {
                resultDiv.innerHTML = '<p>Erreur de géolocalisation.</p>';
            });
        } else {
            resultDiv.innerHTML = '<p>Géolocalisation non supportée.</p>';
        }
    };

    btnValider.onclick = async () => {
        let ville = inputVille.value.trim();
        let codePostal2 = '';
        let villeNom = '';
        let queryString = '';
        // Si une suggestion a été choisie et correspond à l'input
        if (selectedVilleData && inputVille.value === selectedVilleData.display_name) {
            villeNom = selectedVilleData.villeNom || '';
            codePostal2 = selectedVilleData.codePostal2 || '';
        } else {
            // Sinon, on tente d'extraire manuellement
            const villeMatch = ville.match(/^([^,]+)/);
            const codePostalMatch = ville.match(/(\d{5})/);
            villeNom = villeMatch ? villeMatch[1].trim() : ville;
            codePostal2 = codePostalMatch ? codePostalMatch[1].slice(0, 2) : '';
        }
        // Normalisation : minuscules, accents retirés, espaces -> %20
        function normalizeVille(str) {
            return str
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9 ]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }
        let villeNorm = normalizeVille(villeNom);
        if (codePostal2) {
            queryString = `.fr%20${codePostal2}%20${villeNorm.replace(/ /g, '%20')}`;
        } else {
            queryString = villeNorm.replace(/ /g, '%20');
        }
        console.log('Ville:', villeNom, 'Département:', codePostal2, 'Query:', queryString);
        if (!villeNorm) {
            resultDiv.innerHTML = '<p>Veuillez entrer un nom de ville ou village.</p>';
            return;
        }
        resultDiv.innerHTML = '<p>Recherche des horaires pour ' + villeNom + (codePostal2 ? ' (' + codePostal2 + ')' : '') + '...</p>';
        await afficherHorairesPourVille(queryString, resultDiv);
        if (typeof loadHorairesMesses === 'function') {
            loadHorairesMesses(queryString);
        }
    };
}

async function getCityFromCoords(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const resp = await fetch(url);
        const data = await resp.json();
        return data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || '';
    } catch {
        return '';
    }
}

async function afficherHorairesPourVille(ville, resultDiv) {
    try {
        const response = await fetch(`/api/horaires-messes?ville=${encodeURIComponent(ville)}`);
        const data = await response.json();
        if (data.success) {
            console.log(data.html[0])
            resultDiv.innerHTML = generateHorairesHTML(parseHorairesEtLieux(data.html[0] || data.html));
        } else {
            resultDiv.innerHTML = '<p>Erreur lors du chargement des horaires : ' + (data.error || 'inconnue') + '</p>';
        }
    } catch (e) {
        resultDiv.innerHTML = '<p>Erreur lors de la récupération des horaires.</p>';
    }
}

// Appelle showMessesHorairesPanel() à l'ouverture du panneau horaires des messes
// Par exemple, dans le gestionnaire d'événement du bouton "⛪ Horaires des messes"
document.querySelector('.toggle-messes')?.addEventListener('click', showMessesHorairesPanel);

// Gestion fermeture du panneau horaires des messes
const closeMessesHorairesBtn = document.querySelector('.close-messes-horaires');
if (closeMessesHorairesBtn) {
  closeMessesHorairesBtn.addEventListener('click', () => {
    const panel = document.querySelector('.messes-horaires');
    if (panel) {
      panel.classList.remove('visible');
      panel.style.visibility = 'hidden';
      panel.style.transform = 'translateX(-100%)';
    }
  });
}
