//B"H
// viz.js - High Performance Hebrew Visualizer

const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";
let canvas, ctx;
let particles = [];
let width, height;
let isActive = false;
let isPaused = true; 
let dataProvider = null; // New data provider callback
let mouseX = 0, mouseY = 0;

const COLORS = [];
for(let i=0; i<360; i+=10) COLORS.push(`hsl(${i}, 100%, 50%)`);

class HebrewParticle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        this.baseSize = Math.random() * 20 + 10;
        this.size = this.baseSize;
        this.baseVx = (Math.random() - 0.5) * 2;
        this.baseVy = (Math.random() - 0.5) * 2;
        this.hue = Math.floor(Math.random() * 36); 
        this.isBass = Math.random() > 0.85; 
    }
    
    update(bass, mid) {
        // Base drift speed (always active, even when paused)
        const driftSpeed = 0.2;
        let vx = this.baseVx * driftSpeed;
        let vy = this.baseVy * driftSpeed;

        if (!isPaused) {
            // Audio reactive boosting
            const energy = this.isBass ? bass : mid;
            // Lower threshold for visual movement
            if (energy > 0.001) {
                const velocityScale = energy * (this.isBass ? 20 : 8); 
                vx += this.baseVx * velocityScale;
                vy += this.baseVy * velocityScale;
            }
            // Audio size reactivity
            this.size = this.baseSize + (energy * (this.isBass ? 80 : 30));
        } else {
             this.size = this.baseSize; // Reset size when paused
        }

        this.x += vx;
        this.y += vy;

        // Mouse Gravity
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 300) {
            const pull = isPaused ? 0.001 : (this.isBass ? bass : mid) * 0.02;
            this.x += dx * pull;
            this.y += dy * pull;
        }

        // Color Cycle
        if (!isPaused && bass > 0.8 && Math.random() > 0.9) {
             this.hue = (this.hue + 5) % 36;
        }

        // Hard Wrap
        if(this.x < -20) this.x = width + 20;
        else if(this.x > width + 20) this.x = -20;
        
        if(this.y < -20) this.y = height + 20;
        else if(this.y > height + 20) this.y = -20;
    }
    
    draw(ctx) {
        ctx.fillStyle = COLORS[this.hue]; 
        ctx.font = `${this.size | 0}px monospace`; 
        ctx.fillText(this.char, this.x | 0, this.y | 0);
    }
}

export function initViz(c, provider) {
    canvas = c;
    ctx = canvas.getContext('2d', { alpha: false }); 
    dataProvider = provider;
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    particles = new Array(400).fill(0).map(() => new HebrewParticle());
    
    isActive = true;
    requestAnimationFrame(loop);
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

export function setPaused(p) {
    isPaused = p;
}

function loop() {
    if (!isActive) return;
    requestAnimationFrame(loop);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    let bass = 0, mid = 0;
    
    // Poll data every frame for smoothness
    if (!isPaused && dataProvider) {
        const data = dataProvider();
        if (data) {
            bass = (data[0] + data[1] + data[2] + data[3] + data[4]) / 1275; 
            mid = (data[10] + data[20] + data[30]) / 765; 
            if (bass < 0.05) bass = 0;
            if (mid < 0.05) mid = 0;
            if (bass > 1) bass = 1;
        }
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const len = particles.length;
    for(let i=0; i<len; i++) {
        const p = particles[i];
        p.update(bass, mid);
        p.draw(ctx);
    }
    
    // Center Shapes
    if (!isPaused && bass > 0.1) {
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = (bass * 20) | 0;
        ctx.beginPath();
        const r = (bass * height * 0.4) | 0;
        ctx.arc(width/2, height/2, r, 0, 6.28); 
        ctx.stroke();
        
        ctx.strokeStyle = '#FF00FF';
        ctx.strokeRect((width/2 - r), (height/2 - r), r*2, r*2);
    }
}
