//B"H
// viz.js - EXTREME MODULAR 3D ENGINE

const CONFIG = {
    fov: 300,
    colors: ["#00f3ff", "#ff0055", "#00ff66", "#ffffff"]
};

const GLYPHS = "אבגדהוזחטיכלמנסעפצקרשת0123456789";

// --- CORE ENGINE ---

class Engine {
    constructor(canvas, dataProvider) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.dataProvider = dataProvider;
        this.width = 0;
        this.height = 0;
        this.cx = 0;
        this.cy = 0;
        this.active = false;
        this.scene = null;
        
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
    }

    getAudioData() {
        if(!this.dataProvider) return { bass: 0, mid: 0, treble: 0 };
        const data = this.dataProvider();
        if(!data || data.length === 0) return { bass: 0, mid: 0, treble: 0 };
        
        // Simple 3-band separation
        let b=0, m=0, t=0;
        // Bass: 0-5 (approx 0-400Hz)
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
        requestAnimationFrame(this.loop);

        const audio = this.getAudioData();
        
        // Post-Processing: Trail Effect
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.15)`; // High trail for "extreme" motion blur
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
    constructor(particleCount = 600) {
        super();
        this.count = particleCount;
        this.particles = [];
        this.width = 0;
        this.height = 0;
    }

    init(w, h) {
        this.width = w;
        this.height = h;
        this.particles = new Array(this.count).fill(0).map(() => this.spawn());
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    spawn() {
        // Spawn in a 3D box
        const spread = 2000;
        return {
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: Math.random() * 2000 + 100, // Depth
            char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            speed: 5 + Math.random() * 10,
            colorIdx: Math.floor(Math.random() * CONFIG.colors.length),
            size: 10 + Math.random() * 20
        };
    }

    update(audio) {
        // Global Audio Mods
        const speedMult = 1 + (audio.bass * 8); // Kicks make it fly
        const glitchX = (audio.mid > 0.4) ? (Math.random()-0.5) * 50 : 0; // Snares shift x
        
        for (let p of this.particles) {
            // Move towards camera
            p.z -= p.speed * speedMult;
            
            // "Rain" effect (Y down)
            p.y += (p.speed * 0.5) * speedMult;

            // Apply Glitch
            p.x += glitchX;

            // Cycle Chars
            if (Math.random() > 0.95) {
                p.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }

            // Reset if out of bounds (behind camera or too far down)
            if (p.z <= 1 || p.y > 1500) {
                const newP = this.spawn();
                p.x = newP.x;
                p.y = -1000; // Reset to top
                p.z = 2000;  // Reset to far away
                p.char = newP.char;
            }
        }
    }

    render(ctx, fov) {
        // Sort for transparency/occlusion (Painter's Algo)
        this.particles.sort((a, b) => b.z - a.z);

        for (let p of this.particles) {
            if (p.z <= 0) continue;

            const scale = fov / p.z;
            const x2d = p.x * scale;
            const y2d = p.y * scale;

            // Culling
            if (x2d < -this.width || x2d > this.width || y2d < -this.height || y2d > this.height) continue;

            // Depth Fog (Alpha)
            const alpha = Math.max(0, Math.min(1, (2000 - p.z) / 1000));
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = CONFIG.colors[p.colorIdx];
            ctx.font = `bold ${p.size * scale}px monospace`;
            
            // Glow for close particles
            if (p.z < 500) {
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
