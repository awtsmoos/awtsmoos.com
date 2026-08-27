//B"H
// viz.js - EXTREME MODULAR 3D ENGINE (OPTIMIZED)

const CONFIG = {
    fov: 300,
    colors: ["#00f3ff", "#ff0055", "#00ff66", "#ffffff"]
};

const GLYPHS = "אבגדהוזחטיכלמנסעפצקרשת0123456789";
const IS_MOBILE = window.innerWidth < 768;

// --- CORE ENGINE ---

class Engine {
    constructor(canvas, dataProvider) {
        this.canvas = canvas;
        // Alpha false for performance
        this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        this.dataProvider = dataProvider;
        this.width = 0;
        this.height = 0;
        this.cx = 0;
        this.cy = 0;
        this.active = false;
        this.scene = null;
        this.reqId = null;
        
        // Bindings
        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);
        
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.cx = this.width / 2;
        this.cy = this.height / 2;
        if(this.scene) this.scene.resize(this.width, this.height);
    }

    mount(scene) {
        this.scene = scene;
        this.scene.init(this.width, this.height);
    }

    start() {
        if(this.active) return;
        this.active = true;
        this.loop();
    }

    stop() {
        this.active = false;
        if(this.reqId) cancelAnimationFrame(this.reqId);
    }

    getAudioData() {
        if(!this.dataProvider) return { bass: 0, mid: 0, treble: 0 };
        const data = this.dataProvider(); // Returns Uint8Array (Reused)
        if(!data || data.length === 0) return { bass: 0, mid: 0, treble: 0 };
        
        // Simple 3-band separation without allocating new arrays
        let b=0, m=0, t=0;
        // Bass: 0-5
        for(let i=0; i<5; i++) b+=data[i];
        // Mid: 5-20
        for(let i=5; i<20; i++) m+=data[i];
        // Treble: 20+
        for(let i=20; i<50; i++) t+=data[i];
        
        return {
            bass: (b/5)/255,
            mid: (m/15)/255,
            treble: (t/30)/255
        };
    }

    loop() {
        if(!this.active) return;
        this.reqId = requestAnimationFrame(this.loop);

        const audio = this.getAudioData();
        
        // Optimized Clear/Trail
        // Only draw semi-transparent rect every frame on desktop
        // On mobile, maybe every other frame or opaque clear?
        // High trail is expensive due to overdraw, but looks cool.
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
        this.ctx.fillRect(0, 0, this.width, this.height);

        if(this.scene) {
            this.ctx.save();
            this.ctx.translate(this.cx, this.cy);
            this.scene.update(audio);
            this.scene.render(this.ctx, CONFIG.fov);
            this.ctx.restore();
        }
    }
}

// --- SCENE GRAPH ---

class Scene {
    init(w, h) {}
    resize(w, h) {}
    update(audio) {}
    render(ctx, fov) {}
}

class MatrixStormScene extends Scene {
    constructor() {
        super();
        // Reduce particle count on mobile to save GPU/CPU
        this.count = IS_MOBILE ? 100 : 500;
        this.particles = [];
        this.width = 0;
        this.height = 0;
    }

    init(w, h) {
        this.width = w;
        this.height = h;
        // Pre-allocate particles
        this.particles = new Array(this.count).fill(0).map(() => this.createParticle());
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    createParticle() {
        const spread = 2000;
        return {
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: Math.random() * 2000 + 100,
            char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            speed: 5 + Math.random() * 10,
            colorIdx: Math.floor(Math.random() * CONFIG.colors.length),
            size: 10 + Math.random() * 20
        };
    }

    resetParticle(p) {
        const spread = 2000;
        p.x = (Math.random() - 0.5) * spread;
        p.y = -1000; // Top
        p.z = 2000;  // Far
        p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        // Keep size/speed variance or reset? Resetting is fine.
        p.speed = 5 + Math.random() * 10;
        p.colorIdx = Math.floor(Math.random() * CONFIG.colors.length);
    }

    update(audio) {
        const speedMult = 1 + (audio.bass * 8); 
        const glitchX = (audio.mid > 0.4) ? (Math.random()-0.5) * 50 : 0;
        
        for (let i = 0; i < this.count; i++) {
            const p = this.particles[i];
            
            p.z -= p.speed * speedMult;
            p.y += (p.speed * 0.5) * speedMult;
            p.x += glitchX;

            // Change char occasionally without allocation
            if (Math.random() > 0.98) {
                p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }

            if (p.z <= 1 || p.y > 1500) {
                this.resetParticle(p);
            }
        }
    }

    render(ctx, fov) {
        // Optimization: Don't sort every frame if possible, but for 3D depth effect sorting is needed.
        // Array.sort is fast enough for 100-500 elements.
        this.particles.sort((a, b) => b.z - a.z);

        // Cache color strings
        const colors = CONFIG.colors;

        for (let i = 0; i < this.count; i++) {
            const p = this.particles[i];
            if (p.z <= 0) continue;

            const scale = fov / p.z;
            const x2d = p.x * scale;
            const y2d = p.y * scale;

            // Culling (Simple Box)
            if (x2d < -this.width || x2d > this.width || y2d < -this.height || y2d > this.height) continue;

            // Depth Fog
            // Use integer steps for opacity to reduce state changes? No, float is fine.
            let alpha = (2000 - p.z) / 1000;
            if (alpha < 0) alpha = 0; 
            if (alpha > 1) alpha = 1;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors[p.colorIdx];
            
            // Font size bucketing could help, but scale is continuous.
            // Using template literals creates strings. 
            // Optimization: Just set it.
            ctx.font = `bold ${Math.floor(p.size * scale)}px monospace`;
            
            // Disable shadow blur on mobile for performance
            if (!IS_MOBILE && p.z < 500) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fillText(p.char, x2d, y2d);
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

// --- EXPORTS ---

let engine = null;

export function initViz(canvas, dataProvider) {
    if (engine) engine.stop();
    engine = new Engine(canvas, dataProvider);
    engine.mount(new MatrixStormScene());
    engine.start();
}

export function pauseViz() { if(engine) engine.stop(); }
export function resumeViz() { if(engine) engine.start(); }