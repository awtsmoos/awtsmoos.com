//B"H
// modules/studio/particles.js
import { ctx } from './context.js';
import state from '../state.js';

const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";
const particles = [];

export function initParticles(w, h) {
    particles.length = 0;
    const count = 500; // Max pool
    for(let i=0; i<count; i++) {
        particles.push(createParticle(w, h, i));
    }
}

function createParticle(w, h, index) {
    return {
        id: index,
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(), // Depth
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 200 + 50, // For circle mode
        speed: (Math.random() - 0.5) * 0.02,
        baseSize: 10 + Math.random() * 30,
        hue: Math.random() * 360
    };
}

export function drawParticles(w, h, time) {
    const s = state.studioParticleSettings;
    if(!s.enabled) return;

    const g = ctx.g;
    const beat = ctx.bass * s.reactivity; // 0.0 to 1.0 approx
    
    // Global Rotation
    const globalRot = time * s.rotationSpeed;

    g.textAlign = 'center';
    g.textBaseline = 'middle';

    const activeCount = Math.min(particles.length, s.count);
    
    for(let i=0; i<activeCount; i++) {
        const p = particles[i];
        
        let x, y, size, color;
        
        // --- POSITION LOGIC ---
        if (s.mode === 'circle') {
            // Pulse radius with beat
            const r = p.radius + (beat * 100); 
            // Sine wave distortion based on angle
            const wave = Math.sin(p.angle * 5 + time * 2) * (s.waveIntensity * ctx.mid);
            const rFinal = r + wave;
            
            const a = p.angle + globalRot + (p.speed * time * 10);
            
            x = w/2 + Math.cos(a) * rFinal;
            y = h/2 + Math.sin(a) * rFinal;
            
        } else if (s.mode === 'spiral') {
             const r = (p.id * 0.5) + (beat * 50);
             const a = p.angle + globalRot + (p.id * 0.1);
             x = w/2 + Math.cos(a) * r;
             y = h/2 + Math.sin(a) * r;

        } else { // Random
            p.x += Math.cos(p.angle) * (1 + beat * 5);
            p.y += Math.sin(p.angle) * (1 + beat * 5);
            // Wrap
            if(p.x < -50) p.x = w+50; if(p.x > w+50) p.x = -50;
            if(p.y < -50) p.y = h+50; if(p.y > h+50) p.y = -50;
            x = p.x; y = p.y;
        }

        // --- SIZE LOGIC ---
        size = p.baseSize * (1 + beat * 2);

        // --- COLOR LOGIC ---
        if (s.colorMode === 'rainbow') {
            color = `hsl(${(p.hue + time*50)%360}, 100%, 60%)`;
        } else if (s.colorMode === 'velocity') {
            color = `hsl(${200 + (beat*160)}, 100%, 60%)`;
        } else {
            // Static / Base
            color = s.baseColor;
            // Opacity based on Z
            g.globalAlpha = 0.5 + (beat * 0.5);
        }

        g.fillStyle = color;
        g.font = `bold ${size}px monospace`;
        g.fillText(p.char, x, y);
        g.globalAlpha = 1.0;
    }
    
    // Optional Central Waveform Visualization
    if(s.mode === 'circle' && ctx.bass > 0.1) {
        g.beginPath();
        g.strokeStyle = s.baseColor;
        g.lineWidth = 2;
        g.globalAlpha = 0.3;
        const radius = 100 + (beat * 50);
        for(let i=0; i<=100; i++) {
            const a = (i/100) * Math.PI * 2;
            const wave = (ctx.waveform[i*2] - 128) * (s.waveIntensity/50);
            const r = radius + wave;
            g.lineTo(w/2 + Math.cos(a)*r, h/2 + Math.sin(a)*r);
        }
        g.closePath();
        g.stroke();
        g.globalAlpha = 1.0;
    }
}