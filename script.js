// ==============================================
// CONFIGURATION
// ==============================================
// Ganti PIN di sini sesuai keinginan (harus berupa string)
const CORRECT_PIN = "060826"; 
const PIN_LENGTH = CORRECT_PIN.length;

// ==============================================
// MUSIC PLAYER LOGIC
// ==============================================
const bgMusic = document.getElementById('bg-music');

// ==============================================
// 1. PIN LOCK LOGIC
// ==============================================
let currentPin = "";
const pinScreen = document.getElementById('pin-screen');
const giftScreen = document.getElementById('gift-screen');
const mainScreen = document.getElementById('main-screen');
const pinContainer = document.querySelector('.pin-container');
const indicatorsContainer = document.getElementById('pin-indicators');
const numBtns = document.querySelectorAll('.num-btn[data-val]');
const delBtn = document.getElementById('del-btn');

// Initialize dot indicators based on PIN length
function initDots() {
    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < PIN_LENGTH; i++) {
        const dot = document.createElement('div');
        dot.classList.add('pin-dot');
        indicatorsContainer.appendChild(dot);
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < currentPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function checkPin() {
    if (currentPin === CORRECT_PIN) {
        // Correct PIN - Transition to main screen (Countdown Slide)
        setTimeout(() => {
            pinScreen.classList.remove('active');
            // Wait for fade out
            setTimeout(() => {
                pinScreen.classList.add('hidden');
                mainScreen.classList.remove('hidden');
                // Small delay to ensure display:block applies before opacity transition
                setTimeout(() => {
                    mainScreen.classList.add('active');
                }, 50);
            }, 800); 
        }, 300);
    } else {
        // Wrong PIN - Shake and reset
        pinContainer.classList.add('shake');
        setTimeout(() => {
            pinContainer.classList.remove('shake');
            currentPin = "";
            updateDots();
        }, 400); // match animation duration
    }
}

function handleNumClick(val) {
    if (currentPin.length < PIN_LENGTH) {
        currentPin += val;
        updateDots();
        
        if (currentPin.length === PIN_LENGTH) {
            checkPin();
        }
    }
}

function handleDelClick() {
    if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updateDots();
    }
}

// Event Listeners for Numpad
numBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handleNumClick(btn.getAttribute('data-val'));
    });
});

delBtn.addEventListener('click', handleDelClick);

// ==============================================
// 1.5 GIFT SCREEN LOGIC
// ==============================================
const giftBox = document.getElementById('gift-box');

function shootCustomConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Handle High DPI displays for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    // Pre-render emojis to offscreen canvases to heavily optimize performance
    const emojis = ['🌸', '🌷', '💐', '✨', '💖'];
    const preRenderedEmojis = emojis.map(emoji => {
        const c = document.createElement('canvas');
        c.width = 60;
        c.height = 60;
        const cCtx = c.getContext('2d');
        cCtx.font = "40px Arial";
        cCtx.textAlign = "center";
        cCtx.textBaseline = "middle";
        cCtx.fillText(emoji, 30, 35); // offset slightly for baseline
        return c;
    });

    let particles = [];
    
    // Create particles originating from center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 + 50; // slightly below center where the box is

    for (let i = 0; i < 120; i++) {
        particles.push({
            x: centerX,
            y: centerY,
            img: preRenderedEmojis[Math.floor(Math.random() * preRenderedEmojis.length)],
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.5) * 18 - 5, // bias upwards
            life: 1,
            decay: Math.random() * 0.008 + 0.006, // slower decay for longer life
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            size: Math.random() * 25 + 15
        });
    }

    let animationFrameId;

    function animateParticles() {
        // clear using scaled dimensions
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        let alive = false;
        
        for (let p of particles) {
            if (p.life > 0) {
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // slight gravity
                p.life -= p.decay;
                p.rotation += p.rotSpeed;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = p.life;
                // Draw the pre-rendered image instead of text for 60fps performance
                ctx.drawImage(p.img, -p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            }
        }
        
        if (alive) {
            animationFrameId = requestAnimationFrame(animateParticles);
        } else {
            document.body.removeChild(canvas);
        }
    }

    animateParticles();
}

giftBox.addEventListener('click', () => {
    // Only allow clicking once
    if (giftBox.classList.contains('vibrating') || giftBox.classList.contains('explode')) return;

    // 1. Built up moment: Vibrate
    giftBox.classList.add('vibrating');
    
    // 2. Explode after 500ms
    setTimeout(() => {
        giftBox.classList.remove('vibrating');
        giftBox.classList.add('explode');
        document.querySelector('.gift-bottom-text').style.opacity = '0';
        document.querySelector('.gift-top-text').style.opacity = '0';
        
        // Shoot custom flower confetti
        shootCustomConfetti();

        // 3. Transition to main screen after 3 seconds (to enjoy the flowers)
        setTimeout(() => {
            giftScreen.classList.remove('active');
            setTimeout(() => {
                giftScreen.classList.add('hidden');
                
                // Advance to Slide 1 (Hero) 
                slides[0].classList.remove('active');
                slides[0].classList.add('hidden');
                currentSlideIndex = 1;
                slides[currentSlideIndex].classList.remove('hidden');
                
                mainScreen.classList.remove('hidden');
                setTimeout(() => {
                    mainScreen.classList.add('active');
                    slides[currentSlideIndex].classList.add('active');
                    
                    // Start button fill animation for the active slide
                    animateSlideButton(currentSlideIndex);

                    // Start typewriter effect if moving to slide 2
                    if (currentSlideIndex === 2) {
                        startTypewriter();
                    }
                }, 50);
            }, 800);
        }, 3000);
    }, 500);
});

// ==============================================
// 2. MAIN SCREEN LOGIC (SLIDES)
// ==============================================
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide-section');
const nextBtns = document.querySelectorAll('.next-btn');

function goToNextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        // Hide current slide
        const currentSlide = slides[currentSlideIndex];
        currentSlide.classList.remove('active');
        setTimeout(() => {
            currentSlide.classList.add('hidden');
            
            // Show next slide
            currentSlideIndex++;
            const nextSlide = slides[currentSlideIndex];
            nextSlide.classList.remove('hidden');
            setTimeout(() => {
                nextSlide.classList.add('active');
                
                // Music auto-play logic
                if (currentSlideIndex === 3) {
                    bgMusic.play().catch(e => console.log("Audio play failed:", e));
                } else if (currentSlideIndex === 5) {
                    bgMusic.pause();
                }

                // Animate button if present
                animateSlideButton(currentSlideIndex);
                
                // Start typewriter effect if moving to slide 2
                if (currentSlideIndex === 2) {
                    startTypewriter();
                }

                // Start final hero typewriter if moving to slide 6
                if (currentSlideIndex === 6) {
                    startFinalTypewriter();
                }
            }, 50);
        }, 800);
    }
}

function animateSlideButton(index) {
    // For slide 2 (Typewriter), the button animation is handled inside startTypewriter() when it finishes typing.
    if (index === 2) return;
    
    const slide = slides[index];
    if (!slide) return;
    
    const btn = slide.querySelector('.btn-pink-fill.locked');
    if (btn) {
        setTimeout(() => {
            btn.classList.add('filling');
            setTimeout(() => {
                btn.classList.add('filled');
                btn.classList.remove('locked');
            }, 3000); // Match CSS 3s transition
        }, 100);
    }
}

nextBtns.forEach(btn => {
    btn.addEventListener('click', goToNextSlide);
});

// BUKA HADIAHNYA button logic
const openGiftBtn = document.getElementById('open-gift-btn');
if (openGiftBtn) {
    openGiftBtn.addEventListener('click', () => {
        // Hide main screen, show gift screen
        mainScreen.classList.remove('active');
        setTimeout(() => {
            mainScreen.classList.add('hidden');
            giftScreen.classList.remove('hidden');
            setTimeout(() => {
                giftScreen.classList.add('active');
            }, 50);
        }, 800);
    });
}

// Countdown Timer
function initCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    const remainingEl = document.getElementById('cd-remaining');
    const btn = document.getElementById('open-gift-btn');
    const btnText = btn.querySelector('.btn-text');
    const msgTop = document.getElementById('cd-msg-top');
    
    let countdownInterval;
    let isUnlocked = false;

    // Simulate 5 seconds for DEV testing so you can see the animation
    let testTime = 5; 

    function updateCountdown() {
        const now = new Date();
        // Target: 15 September 2026 00:00 WIB (GMT+7)
        const targetDate = new Date("2026-09-15T00:00:00+07:00");

        let diffTime = targetDate - now;

        // DEV_MODE bypass to see animation immediately
        if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
            diffTime = testTime * 1000;
            if (testTime >= 0) testTime--;
        }

        if (diffTime <= 0) {
            diffTime = 0;
            clearInterval(countdownInterval);
            
            // Trigger Button Unlock Animation ONLY ONCE
            if (!isUnlocked && btn) {
                isUnlocked = true;
                btn.classList.add('filling');
                if (msgTop) msgTop.textContent = "WAKTUNYA TIBA! 💖";
                
                setTimeout(() => {
                    btn.classList.remove('locked', 'filling');
                    if (btnText) btnText.textContent = "BUKA HADIAHNYA 🎁";
                }, 3000); // 3 seconds fill animation
            }
        }

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

        // Add leading zero
        if (daysEl) daysEl.textContent = days < 10 ? '0' + days : days;
        if (hoursEl) hoursEl.textContent = hours < 10 ? '0' + hours : hours;
        if (minutesEl) minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
        if (secondsEl) secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
        
        if (remainingEl) {
            remainingEl.textContent = `${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`;
        }
    }

    // Update initially
    updateCountdown();
    // Update every second
    countdownInterval = setInterval(updateCountdown, 1000);
}

// ==============================================
// 3. STARRY BACKGROUND (CANVAS)
// ==============================================
const starsCanvas = document.getElementById('stars-bg');
const starsCtx = starsCanvas.getContext('2d');
let starsArray = [];
let fallingHearts = [];
let preRenderedHeart;

function initStars() {
    const dpr = window.devicePixelRatio || 1;
    starsCanvas.width = window.innerWidth * dpr;
    starsCanvas.height = window.innerHeight * dpr;
    starsCtx.scale(dpr, dpr);

    // Pre-render heart for performance
    if (!preRenderedHeart) {
        preRenderedHeart = document.createElement('canvas');
        preRenderedHeart.width = 40;
        preRenderedHeart.height = 40;
        const hctx = preRenderedHeart.getContext('2d');
        
        hctx.beginPath();
        hctx.moveTo(20, 15);
        hctx.bezierCurveTo(20, 10, 10, 10, 10, 15);
        hctx.bezierCurveTo(10, 25, 20, 25, 20, 35);
        hctx.bezierCurveTo(20, 25, 30, 25, 30, 15);
        hctx.bezierCurveTo(30, 10, 20, 10, 20, 15);
        hctx.fillStyle = '#ffb3c1'; // Soft pink
        hctx.fill();
    }

    starsArray = [];
    fallingHearts = [];
    
    // Adjust star count based on screen size
    const numStars = Math.floor((window.innerWidth * window.innerHeight) / 2500);
    const numHearts = Math.floor((window.innerWidth * window.innerHeight) / 20000); // fewer hearts

    for (let i = 0; i < numStars; i++) {
        starsArray.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random(),
            speed: (Math.random() * 0.02) + 0.005,
            growing: Math.random() > 0.5
        });
    }

    for (let i = 0; i < numHearts; i++) {
        fallingHearts.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 10 + 8,
            speedY: Math.random() * 0.5 + 0.3,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayAmount: Math.random() * 20 + 10,
            opacity: Math.random() * 0.4 + 0.1,
            offset: Math.random() * Math.PI * 2
        });
    }
}

function animateStars() {
    starsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let star of starsArray) {
        // Update opacity for twinkle effect
        if (star.growing) {
            star.opacity += star.speed;
            if (star.opacity >= 1) {
                star.opacity = 1;
                star.growing = false;
            }
        } else {
            star.opacity -= star.speed;
            if (star.opacity <= 0.1) {
                star.opacity = 0.1;
                star.growing = true;
            }
        }

        // Draw star
        starsCtx.beginPath();
        starsCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        starsCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        starsCtx.fill();
    }

    const time = Date.now();
    for (let heart of fallingHearts) {
        heart.y += heart.speedY;
        
        // Reset to top if it falls off screen
        if (heart.y > window.innerHeight + heart.size) {
            heart.y = -heart.size;
            heart.x = Math.random() * window.innerWidth;
        }

        const sway = Math.sin(time * heart.swaySpeed / 10 + heart.offset) * heart.swayAmount;
        
        starsCtx.save();
        starsCtx.globalAlpha = heart.opacity;
        starsCtx.drawImage(preRenderedHeart, heart.x + sway, heart.y, heart.size, heart.size);
        starsCtx.restore();
    }

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);


// ==============================================
// 4. REPLAY BUTTON LOGIC
// ==============================================
const replayBtn = document.getElementById('replay-btn');

replayBtn.addEventListener('click', () => {
    // Sembunyikan main screen
    mainScreen.classList.remove('active');
    
    setTimeout(() => {
        mainScreen.classList.add('hidden');
        
        // Reset Slide Index
        slides.forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        currentSlideIndex = 0;
        slides[0].classList.remove('hidden');
        slides[0].classList.add('active');

        // Reset music
        bgMusic.pause();
        bgMusic.currentTime = 0;

        // Reset kado
        giftBox.classList.remove('open', 'explode');
        giftScreen.classList.add('hidden');
        document.querySelector('.gift-top-text').style.opacity = '1';
        document.querySelector('.gift-bottom-text').style.opacity = '1';

        // Reset button states
        const readLetterBtn = document.getElementById('read-letter-btn');
        if (readLetterBtn) {
            readLetterBtn.classList.remove('filling', 'filled');
        }

        // Tampilkan layar PIN kembali
        pinScreen.classList.remove('hidden');
        setTimeout(() => {
            pinScreen.classList.add('active');
            
            // Reset input PIN
            currentPin = "";
            updateDots();
        }, 50);
        
    }, 800);
});

// Initialize everything on load
const DEV_MODE = false; // SET TO FALSE BEFORE PUBLISHING!

window.addEventListener('DOMContentLoaded', () => {
    initDots();
    initCountdown();
    initStars();
    animateStars();
    
    if (DEV_MODE) {
        // Bypass PIN and Gift screens
        pinScreen.classList.remove('active');
        pinScreen.classList.add('hidden');
        giftScreen.classList.remove('active');
        giftScreen.classList.add('hidden');
        
        mainScreen.classList.remove('hidden');
        mainScreen.classList.add('active');
    }
});
// Typewriter effect function
let typeWriterTimeout;
function startTypewriter() {
    const textElement = document.getElementById('typewriter-text');
    const nextBtn = document.getElementById('hero-next-btn');
    if (!textElement) return;

    textElement.innerHTML = '';
    if(nextBtn) nextBtn.style.opacity = '0';
    
    const textToType = "HAPPY BIRTHDAY SAYANGKUU🫶🏻💗<br><br>selamat unlocked 18 tahunnn yaa cantik wkwk, udah tua aja nih cintakuuu.<br>semoga hal baik selalu beriringan denganmu. teruslah tumbuh, melangkah maju, dan meraih impian-impianmu. aku akan melihatmu berproses dari jarak jauh, menjadi saksi dari setiap perjuangan dan pencapaianmu.<br><br>meski tak selalu hadir di dekatmu, aku akan selalu mendukungmu dengan doa dan harapan terbaik. ketika kamu merasa cape atau ragu, ingatlah bahwa ada seseorang yang selalu ada dan percaya padamu, yang selalu bangga dengan setiap langkahmu, baik itu besar maupun kecil.<br><br>aku akan selalu menjadi orang yang paling bangga dengan setiap prosesmu, dengan setiap keberhasilan dan bahkan kegagalanmu. karena bagiku, melihatmu berusaha dan tumbuh adalah kebahagiaan tersendiri. Teruslah melangkah, aku akan selalu mendukungmu, meski dari kejauhan.<br><br>terimakasih telah lahir didunia ini sayang., kalau kamu mencariku aku selalu ada buatmu sayangku. jangan lupa percaya diri, ya? kamu sangat layak bagiku. Selamanya. <i>Princess Kesayangankuu😍</i><br><br>live well, i always pray for u here and of course. i always support whatever choice u make, as long its good for u beloved💗.";
    let i = 0;
    let isTag = false;
    let currentHtml = '';
    
    clearTimeout(typeWriterTimeout);

    function type() {
        if (i < textToType.length) {
            let char = textToType.charAt(i);
            
            if (char === '<') isTag = true;
            
            currentHtml += char;
            textElement.innerHTML = currentHtml + '<span class="typewriter-cursor"></span>';
            i++;
            
            if (isTag) {
                if (char === '>') isTag = false;
                type(); // Skip delay for HTML tags
            } else {
                typeWriterTimeout = setTimeout(type, 60); // Typing speed
            }
        } else {
            textElement.innerHTML = currentHtml + '<span class="typewriter-cursor"></span>';
            nextBtn.style.opacity = '1';
            
            // Start fill animation for typewriter slide
            setTimeout(() => {
                nextBtn.classList.add('filling');
                setTimeout(() => {
                    nextBtn.classList.add('filled');
                    nextBtn.classList.remove('locked');
                }, 3000); // 3s
            }, 100);
        }
    }
    
    // Add small delay before starting to wait for slide transition
    typeWriterTimeout = setTimeout(type, 1000);
}

// Final Hero Typewriter effect function
let finalTypeWriterTimeout;
function startFinalTypewriter() {
    const titleEl = document.querySelector('#slide-6 .hero-title');
    const preTitleEl = document.querySelector('#slide-6 .hero-pretitle');
    if (!titleEl) return;

    clearTimeout(finalTypeWriterTimeout);
    
    const text1 = "Winaa Sayangkuu Cintakuu";
    const text2 = "With All My Love";
    
    titleEl.innerHTML = '';
    if (preTitleEl) preTitleEl.style.opacity = '1';
    
    let i = 0;
    
    // Phase 1: Type text1
    function typeText1() {
        if (i < text1.length) {
            titleEl.innerHTML = text1.substring(0, i + 1) + '<span class="typewriter-cursor"></span>';
            i++;
            finalTypeWriterTimeout = setTimeout(typeText1, 100);
        } else {
            // Wait 5 seconds
            finalTypeWriterTimeout = setTimeout(eraseText1, 5000);
        }
    }
    
    // Phase 2: Erase text1
    function eraseText1() {
        if (i > 0) {
            titleEl.innerHTML = text1.substring(0, i - 1) + '<span class="typewriter-cursor"></span>';
            i--;
            finalTypeWriterTimeout = setTimeout(eraseText1, 50);
        } else {
            // Fade out pretitle
            if (preTitleEl) {
                preTitleEl.style.transition = "opacity 0.5s";
                preTitleEl.style.opacity = '0';
            }
            setTimeout(typeText2, 500);
        }
    }
    
    // Phase 3: Type text2
    function typeText2() {
        if (i < text2.length) {
            titleEl.innerHTML = text2.substring(0, i + 1) + '<span class="typewriter-cursor"></span>';
            i++;
            finalTypeWriterTimeout = setTimeout(typeText2, 100);
        } else {
            titleEl.innerHTML = text2 + '<span class="typewriter-cursor"></span>';
        }
    }
    
    finalTypeWriterTimeout = setTimeout(typeText1, 1000);
}
