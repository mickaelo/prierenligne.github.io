document.addEventListener('DOMContentLoaded', () => {
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
            
            const response = await fetch(`https://api.aelf.org/v1/messes/${formattedDate}/france`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received data:', data);
            
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
                            switch(lecture.type) {
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
            currentDate = getPreviousSunday();
            updateReadings(currentDate);
        });
        
        nextSundayBtn.addEventListener('click', () => {
            currentDate = getNextSunday();
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
            toggleReadingsBtn.textContent = '📖 Lectio divina';
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
                            switch(lecture.type) {
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
        if (parseFloat(btn.dataset.duration) === 60) {
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
            candle.style.transform = `scaleY(${newHeight/160})`;
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
}); 