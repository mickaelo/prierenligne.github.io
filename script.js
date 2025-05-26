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
    
    let selectedDuration = 60; // 1 heure par défaut
    let startTime = 0;
    let animationFrameId = null;
    let isAnimating = false;
    let isUnlimited = false;
    let timer = null;

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