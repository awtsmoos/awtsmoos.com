
// B"H
(function() {
    /**
     * B"H
     * Test 7: The Celestial Attractor.
     * Stresses: ESM import/export, Worker importScripts, and OffscreenCanvas coordination.
     */
    window.MERKAVA_TESTS['module_chaos_game'] = {
        name: "Test 7: Celestial Attractor (Module Stress)",
        
        orchestrator: `// B"H - Main Orchestrator
import { CONSTANTS } from 'constants.js';

console.log("Main Thread: Importing Celestial Laws...");
const canvas = document.getElementById('vm-canvas');
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker('worker_logic.js');
worker.postMessage({ 
    type: 'INIT', 
    canvas: offscreen, 
    color: CONSTANTS.THEME_COLOR 
}, [offscreen]);

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    worker.postMessage({ 
        type: 'ATTRACTOR', 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
    });
});

console.log("Main: Celestial Attractor Active.");`,

        constantsSource: `// B"H - Shared Constants Module
export const CONSTANTS = {
    PARTICLE_COUNT: 200,
    THEME_COLOR: '#66fcf1',
    GRAVITY: 0.05,
    FRICTION: 0.98
};`,

        physicsSource: `// B"H - Physics Engine Module
import { CONSTANTS } from 'constants.js';

export class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
    }
    update(attractor) {
        if (attractor) {
            const dx = attractor.x - this.x;
            const dy = attractor.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy) + 0.1;
            this.vx += (dx / dist) * CONSTANTS.GRAVITY;
            this.vy += (dy / dist) * CONSTANTS.GRAVITY;
        }
        this.vx *= CONSTANTS.FRICTION;
        this.vy *= CONSTANTS.FRICTION;
        this.x += this.vx;
        this.y += this.vy;
    }
}`,

        workerSource: `// B"H - Worker Logic using importScripts for modularity
importScripts('constants.js', 'physics_module.js');

let ctx, themeColor;
let particles = [];
let attractor = null;

self.onmessage = function(e) {
    const msg = e.data;
    if (msg.type === 'INIT') {
        ctx = msg.canvas.getContext('2d');
        themeColor = msg.color;
        // Accessing classes imported via importScripts
        const { Particle } = exports; 
        const { CONSTANTS } = exports;
        for(let i=0; i<CONSTANTS.PARTICLE_COUNT; i++) {
            particles.push(new Particle(200, 150));
        }
        console.log("Worker: Celestial System Ignited.");
        requestAnimationFrame(loop);
    } else if (msg.type === 'ATTRACTOR') {
        attractor = { x: msg.x, y: msg.y };
    }
};

function loop() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
    ctx.fillRect(0, 0, 400, 300);
    
    ctx.fillStyle = themeColor;
    for (let p of particles) {
        p.update(attractor);
        ctx.fillRect(p.x, p.y, 2, 2);
    }
    
    if (attractor) {
        ctx.strokeStyle = themeColor;
        ctx.beginPath();
        ctx.arc(attractor.x, attractor.y, 10, 0, Math.PI*2);
        ctx.stroke();
    }

    requestAnimationFrame(loop);
}`,

        async run(Merkava, tools) {
            const self = this;
            return Merkava.run(this.orchestrator, {
                context: {
                    document: window.document,
                    console: { log: tools.log }
                },
                importResolver: async (url) => {
                    switch(url) {
                        case 'constants.js': return { code: self.constantsSource };
                        case 'physics_module.js': return { code: self.physicsSource };
                        case 'worker_logic.js': return { code: self.workerSource };
                        default: return null;
                    }
                },
                hostAPI: { 0: tools.log }
            });
        }
    };
})();
