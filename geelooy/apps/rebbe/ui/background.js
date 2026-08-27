//B"H
// ui/background.js

let isPaused = false;
let animationFrameId = null;

export function initBackgroundEffect() {
    let canvas = document.getElementById('matrix-bg');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'matrix-bg';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.15';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת';
    const fontSize = 16;
    const columns = width / fontSize;
    const drops = [];
    for (let i = 0; i < columns; i++) drops[i] = 1;

    function draw() {
        if (isPaused) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#0ff';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        animationFrameId = requestAnimationFrame(draw);
    }
    
    // Handle Resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    draw();
}

export function pauseBackground() {
    isPaused = true;
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
}

export function resumeBackground() {
    if(isPaused) {
        isPaused = false;
        initBackgroundEffect(); // Restart loop logic (it handles existing canvas)
    }
}