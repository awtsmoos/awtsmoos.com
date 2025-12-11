//B"H
// modules/studio/particles.js
import { ctx } from './context.js';

// We maintain a global pool for performance, but customization is per-layer.
// Actually, for per-layer physics, we might need per-layer state.
// To keep it simple but functional: We will hash particles based on layer ID or just use a shared pool 
// but re-color/size them based on the current layer's config being drawn.
// This means all particles move the same way? No, that looks bad.
// Let's generate a unique seed offset for each layer call or use stateless procedural generation based on index.

const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";
const COUNT = 500;
const particles = [];

export function initParticles(w, h) {
    particles.length = 0;
    for(let i=0; i<COUNT; i++) {
        particles.push({
            x: Math.random(), // Normalized 0-1
            y: Math.random(),
            z: Math.random(),
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            angle: Math.random() * Math.PI * 2,
            speed: (Math.random() - 0.5) * 0.02,
            baseVx: (Math.random() - 0.5) * 0.01,
            baseVy: (Math.random() - 0.5) * 0.01,
            hue: Math.random() * 360
        });
    }
}

// Config defaults if missing
const DEFAULTS = {
    mode: 'float', colorMode: 'rainbow', color: '#fff', 
    count: 200, reactivity: 1.0, sizeBase: 20, waveIntensity: 80
};

export function drawParticles(g, w, h, time, config = {}) {
    const s = { ...DEFAULTS, ...config };
    const beat = ctx.bass * s.reactivity;
    
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    
    // We use the shared pool but apply transforms based on layer config
    // To make layers look different, we offset the iteration
    const seed = (s.count || 0) * 13; 
    
    const activeCount = Math.min(particles.length, s.count);
    
    for(let i=0; i<activeCount; i++) {
        // Scramble index access for variety between layers
        const idx = (i + seed) % particles.length;
        const p = particles[idx];
        
        let x, y, scale, color;
        
        // --- PHYSICS SIMULATION (Stateless / Time-based) ---
        // We calculate position based on time to avoid storing state per layer
        
        if (s.mode === 'float') {
            const energy = (i % 2 === 0) ? ctx.bass : ctx.mid;
            const speed = (energy * 5 * s.reactivity) + 0.2;
            
            // Time-based movement wrapped 0-1
            let dx = p.baseVx * time * 20 * speed;
            let dy = p.baseVy * time * 20 * speed;
            
            let px = (p.x + dx) % 1; if(px<0) px+=1;
            let py = (p.y + dy) % 1; if(py<0) py+=1;
            
            x = px * w;
            y = py * h;
            
            const size = s.sizeBase + (energy * 60 * s.reactivity);
            scale = size / 20;

        } else if (s.mode === 'circle') {
            const rBase = 200 + (beat * 100);
            const a = p.angle + (time * 0.5) + (p.speed * time * 10);
            const r = rBase + (Math.sin(a * 5) * s.waveIntensity * ctx.mid);
            x = w/2 + Math.cos(a) * r;
            y = h/2 + Math.sin(a) * r;
            scale = (s.sizeBase * (1 + beat)) / 20;
        } else {
            // Chaos / Random
            x = (p.x * w) + ((Math.random()-0.5) * beat * 50);
            y = (p.y * h) + ((Math.random()-0.5) * beat * 50);
            scale = s.sizeBase / 20;
        }

        // --- COLOR ---
        if (s.colorMode === 'rainbow') {
            const hue = (p.hue + time * 50) % 360;
            color = `hsl(${hue}, 100%, 60%)`;
        } else if (s.colorMode === 'velocity') {
            color = `hsl(${200 + (beat*160)}, 100%, 60%)`;
        } else {
            color = s.color;
        }

        g.save();
        g.translate(x, y);
        g.scale(scale, scale);
        g.fillStyle = color;
        g.fillText(p.char, 0, 0);
        g.restore();
    }
}