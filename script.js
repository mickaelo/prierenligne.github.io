document.addEventListener('DOMContentLoaded', () => {
    const candle = document.querySelector('.candle');
    const startButton = document.getElementById('startPrayer');
    const durationButtons = document.querySelectorAll('.duration-btn');
    const jesusIcon = document.querySelector('.jesus-icon');
    const flame = document.querySelector('.flame');
    const iconButtons = document.querySelectorAll('.icon-btn');
    const iconImage = document.querySelector('.jesus-icon img');
    let timeLeft = 5 * 60;
    let selectedDuration = 5;
    let totalDuration = 5 * 60;
    let startTime = 0;
    let animationFrameId = null;
    let isAnimating = false;
    let isUnlimited = false;
    let timer = null;

    function updateTimer(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        const remainingTime = isUnlimited ? totalDuration : Math.max(0, totalDuration - elapsed);
        
        const progress = remainingTime / totalDuration;
        
        const candleScale = 0.3 + (progress * 0.7);
        const flameScale = 0.6 + (progress * 0.4);
        const flameOpacity = 0.5 + (progress * 0.5);

        // Mise à jour de la fumée en fonction de la fonte
        const smokeElements = candle.querySelectorAll('.smoke span');
        smokeElements.forEach((smoke, index) => {
            const baseSize = 45 + (index * 5);
            const meltingSize = baseSize * (1 + (1 - progress));
            smoke.style.width = `${meltingSize}px`;
            smoke.style.height = `${meltingSize}px`;
            
            const smokeOpacity = 0.3 + (progress * 0.7);
            smoke.style.opacity = smokeOpacity;
        });

        candle.style.transform = `scaleY(${candleScale})`;
        flame.style.transform = `translateX(-50%) scale(${flameScale})`;
        flame.style.opacity = flameOpacity;

        if (!isUnlimited && remainingTime <= 0) {
            cancelAnimationFrame(animationFrameId);
            candle.classList.add('extinguished');
            jesusIcon.classList.remove('visible');
            startButton.disabled = false;
            durationButtons.forEach(btn => btn.disabled = false);
            isAnimating = false;
        } else {
            animationFrameId = requestAnimationFrame(updateTimer);
        }
    }

    function startPrayer() {
        if (isAnimating) return;
        
        isAnimating = true;
        startTime = 0;
        timeLeft = Math.round(selectedDuration * 60);
        totalDuration = Math.round(selectedDuration * 60);
        isUnlimited = selectedDuration === 0;
        
        candle.classList.remove('extinguished');
        candle.style.transform = 'scaleY(1)';
        
        // Allumer la bougie
        flame.classList.add('lit');
        flame.style.transform = 'translateX(-50%) scale(1)';
        flame.style.opacity = '1';
        
        // Afficher l'icône de Jésus
        jesusIcon.classList.add('visible');
        
        startButton.disabled = true;
        durationButtons.forEach(btn => btn.disabled = true);
        
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
        flame.style.transform = 'translateX(-50%) scale(1)';
        flame.style.opacity = '0';
        candle.style.transform = 'scaleY(1)';
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

    function selectDuration(duration) {
        if (isAnimating) return;
        
        selectedDuration = duration;
        totalDuration = Math.round(duration * 60);
        timeLeft = Math.round(duration * 60);
        isUnlimited = duration === 0;
        
        durationButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.duration) === duration) {
                btn.classList.add('active');
            }
        });
        
        candle.classList.remove('extinguished');
        candle.style.transform = 'scaleY(1)';
        const flame = candle.querySelector('.flame');
        flame.style.transform = 'translateX(-50%) scale(1)';
        flame.style.opacity = '1';
        
        // Réinitialiser la fumée
        const smokeElements = candle.querySelectorAll('.smoke span');
        smokeElements.forEach(smoke => {
            smoke.style.width = '';
            smoke.style.height = '';
            smoke.style.opacity = '';
        });
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
            if (!startButton.disabled) {
                durationButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDuration = parseInt(btn.dataset.duration);
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