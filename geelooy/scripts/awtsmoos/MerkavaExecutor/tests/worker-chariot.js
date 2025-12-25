
// B"H
(function() {
    /**
     * B"H
     * The Worker Chariot Test.
     * This orchestrator demonstrates the separation of Input (Main Thread) 
     * and Logic/Rendering (Worker Thread).
     */
    window.MERKAVA_TESTS['worker_chariot'] = {
        name: "Test 6: Worker Chariot (Offscreen)",
        
        // --- THE MAIN THREAD LOGIC ---
        orchestrator: `// B"H - Main Thread Bridge
const canvas = document.getElementById('vm-canvas');
const offscreen = canvas.transferControlToOffscreen();

// Spawn the Divine Worker
const worker = new Worker('worker_logic.js');

// Send the canvas to the worker
worker.postMessage({ type: 'INIT', canvas: offscreen }, [offscreen]);

// Forward inputs to the worker
document.addEventListener('keydown', (e) => {
    worker.postMessage({ type: 'KEY', key: e.key, state: true });
});
document.addEventListener('keyup', (e) => {
    worker.postMessage({ type: 'KEY', key: e.key, state: false });
});

console.log("Main Thread: Bridge Established.");`,

        // --- THE WORKER THREAD LOGIC ---
        // (This will be provided via the importResolver)
        workerSource: `// B"H - Worker-side Logic
let ctx, keys = {};
let player = { x: 200, y: 150, vx: 0, vy: 0 };
let particles = [];

self.onmessage = function(e) {
    const msg = e.data;
    if (msg.type === 'INIT') {
        ctx = msg.canvas.getContext('2d');
        console.log("Worker: Canvas Received. Ignition.");
        requestAnimationFrame(loop);
    } else if (msg.type === 'KEY') {
        keys[msg.key] = msg.state;
    }
};

function loop() {
    // 1. Clear with Trail
    ctx.fillStyle = 'rgba(5, 5, 15, 0.2)';
    ctx.fillRect(0, 0, 400, 300);

    // 2. Update Player
    if (keys.ArrowLeft || keys.a) player.vx -= 0.5;
    if (keys.ArrowRight || keys.d) player.vx += 0.5;
    if (keys.ArrowUp || keys.w) player.vy -= 0.5;
    if (keys.ArrowDown || keys.s) player.vy += 0.5;

    player.vx *= 0.95; player.vy *= 0.95;
    player.x += player.vx; player.y += player.vy;

    // Boundary Wrap
    if (player.x < 0) player.x = 400; if (player.x > 400) player.x = 0;
    if (player.y < 0) player.y = 300; if (player.y > 300) player.y = 0;

    // 3. Emanate Particles on velocity
    if (Math.abs(player.vx) + Math.abs(player.vy) > 1) {
        particles.push({
            x: player.x, y: player.y,
            vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
            life: 1.0
        });
    }

    // 4. Render Player
    ctx.fillStyle = '#66fcf1';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 8, 0, Math.PI*2);
    ctx.fill();

    // 5. Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.fillStyle = 'rgba(255, 107, 107, ' + p.life + ')';
        ctx.fillRect(p.x-1, p.y-1, 2, 2);
    }

    requestAnimationFrame(loop);
}
`,

        async run(Merkava, tools) {
            const self = this;
            return Merkava.run(this.orchestrator, {
                context: {
                    document: window.document,
                    console: { log: tools.log }
                },
                importResolver: async (url) => {
                    if (url === 'worker_logic.js') {
                        return { code: self.workerSource };
                    }
                    return null;
                },
                hostAPI: { 0: tools.log }
            });
        }
    };
})();
