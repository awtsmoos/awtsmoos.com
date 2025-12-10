//B"H
// modules/studio/particles.js
import { ctx } from './context.js';
import state from '../state.js';

const CHARS = "אבגדהוזחטיכלמנסעפצקרשת";
const particles = [];

export function initParticles(w, h) {
    particles.length = 0;
    const count = 300; // Reduce count slightly for performance on weak devices
    for(let i=0; i<count; i++) {
        particles.push(createParticle(w, h, i));
    }
}

function createParticle(w, h, index) {
    return {
        id: index,
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(), 
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 200 + 50,
        speed: (Math.random() - 0.5) * 0.02,
        baseSize: 10 + Math.random() * 30,
        hue: Math.random() * 360
    };
}

export function drawParticles(w, h, time) {
    const s = state.studioParticleSettings;
    if(s.enabled === false) return; 

    const g = ctx.g;
    const beat = ctx.bass * s.reactivity; 
    
    const globalRot = time * s.rotationSpeed || (time * 0.1);

    g.textAlign = 'center';
    g.textBaseline = 'middle';
    
    // OPTIMIZATION: Set base font once. We will scale coordinates instead of changing font size string.
    // Changing g.font string forces re-rasterization logic in browser which is slow.
    g.font = 'bold 20px monospace'; 

    const activeCount = Math.min(particles.length, s.count);
    
    for(let i=0; i<activeCount; i++) {
        const p = particles[i];
        
        let x, y, color;
        
        // --- POSITION ---
        if (s.mode === 'circle') {
            const r = p.radius + (beat * 100); 
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
            if(p.x < -50) p.x = w+50; if(p.x > w+50) p.x = -50;
            if(p.y < -50) p.y = h+50; if(p.y > h+50) p.y = -50;
            x = p.x; y = p.y;
        }

        // --- SIZE & COLOR ---
        // Target size relative to base 20px
        const targetSize = p.baseSize * (1 + beat * 2);
        const scale = targetSize / 20; 

        if (s.colorMode === 'rainbow') {
            color = `hsl(${(p.hue + time*50)%360}, 100%, 60%)`;
        } else if (s.colorMode === 'velocity') {
            color = `hsl(${200 + (beat*160)}, 100%, 60%)`;
        } else {
            color = s.color || '#ffffff';
        }

        // Draw with Transform for performance
        g.save();
        g.translate(x, y);
        g.scale(scale, scale);
        g.fillStyle = color;
        g.fillText(p.char, 0, 0);
        g.restore();
    }
    
    // Waveform
    if(s.mode === 'circle' && ctx.bass > 0.1) {
        g.beginPath();
        g.strokeStyle = s.color || '#ffffff';
        g.lineWidth = 2;
        g.globalAlpha = 0.3;
        const radius = 100 + (beat * 50);
        // Reduce vertex count for performance
        for(let i=0; i<=50; i++) {
            const a = (i/50) * Math.PI * 2;
            const r = radius + (Math.sin(i*10 + time*5) * ctx.mid * s.waveIntensity);
            g.lineTo(w/2 + Math.cos(a)*r, h/2 + Math.sin(a)*r);
        }
        g.closePath();
        g.stroke();
        g.globalAlpha = 1.0;
    }
}