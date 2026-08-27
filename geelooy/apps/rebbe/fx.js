//B"H
// fx.js - Hyper-Visual Particle Engine

let canvas, ctx;
let particles = [];
const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";
const COLORS = ["#00f3ff", "#ff0055", "#00ff66", "#ffcc00", "#ffffff"];

export function initFX() {
    canvas = document.getElementById('fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    resize();
    window.addEventListener('resize', resize);
    
    // Global Click Listener
    window.addEventListener('mousedown', (e) => {
        explode(e.clientX, e.clientY);
    });

    // Touch support
    window.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
            explode(e.touches[i].clientX, e.touches[i].clientY);
        }
    });

    loop();
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function explode(x, y) {
    const count = 15 + Math.random() * 10;
    for (let i = 0; i < count; i++) {
        particles.push(createParticle(x, y));
    }
}

function createParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 8;
    return {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 10 + Math.random() * 24,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.03
    };
}

function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Composite for glowing effect
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= 0.96; // Shrink
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.font = `bold ${p.size}px 'Courier New'`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillText(p.char, p.x, p.y);
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
}