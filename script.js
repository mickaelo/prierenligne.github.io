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
    
    let selectedDuration = 0.167; // 10 secondes par défaut
    let startTime = 0;
    let animationFrameId = null;
    let isAnimating = false;
    let isUnlimited = false;
    let timer = null;

    // Sélectionner le bouton 10s par défaut
    durationButtons.forEach(btn => {
        if (parseFloat(btn.dataset.duration) === 0.167) {
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
        
        // Ajustement de la hauteur du cierge
        const candleScale = 1 - (progress * 0.7);
        
        // Appliquer la transformation au cierge entier
        candle.style.transform = `scaleY(${candleScale})`;
        
        // Ajuster la flamme
        const flameScale = 1 - (progress * 0.3);
        flame.style.transform = `translateX(-50%) scale(${flameScale})`;
        flame.style.opacity = 1 - (progress * 0.5);
        
        // Ajuster la mèche
        const wickScale = 1 - (progress * 0.7);
        wick.style.transform = `translateX(-50%) scaleY(${wickScale})`;
        
        // Ajuster la cire
        const waxScale = 1 - (progress * 0.7);
        wax.style.transform = `scaleY(${waxScale})`;
        
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
        flame.style.transform = 'translateX(-50%) scale(1)';
        wick.style.transform = 'translateX(-50%) scaleY(1)';
        wax.style.transform = 'scaleY(1)';
        
        // Allumer la bougie
        flame.classList.add('lit');
        flame.style.opacity = '1';
        
        // Afficher l'icône de Jésus
        jesusIcon.classList.add('visible');
        
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
        jesusIcon.classList.remove('visible');
        flame.classList.remove('lit');
        
        // Réinitialiser toutes les transformations
        candle.style.transform = 'scaleY(1)';
        flame.style.transform = 'translateX(-50%) scale(1)';
        flame.style.opacity = '0';
        wick.style.transform = 'translateX(-50%) scaleY(1)';
        wax.style.transform = 'scaleY(1)';
        
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
            iconButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            iconImage.src = button.dataset.icon;
        });
    });
}); 