
// B"H
(function() {
    /**
     * B"H
     * The Worker Chariot Test (Rectified).
     */
    window.MERKAVA_TESTS['worker_chariot'] = {
        name: "Test 6: Worker Chariot (Offscreen)",
        
        orchestrator: `// B"H - Main Thread Bridge
const canvas = document.getElementById('vm-canvas');
const offscreen = canvas.transferControlToOffscreen();

// Spawn the Divine Worker via the SDK's Proxy
const worker = new Worker('worker_logic.js');

// Send the canvas to the worker
worker.postMessage({ type: 'INIT', canvas: offscreen }, [offscreen]);

// Forward inputs
document.addEventListener('keydown', (e) => {
    worker.postMessage({ type: 'KEY', key: e.key, state: true });
});
document.addEventListener('keyup', (e) => {
    worker.postMessage({ type: 'KEY', key: e.key, state: false });
});

console.log("Main Thread: Offscreen Handover Complete.");`,

        workerSource: `// B"H - Worker-side Logic
let ctx, keys = {};
let player = { x: 200, y: 150, vx: 0, vy: 0 };
let particles = [];
let ignited = false;

self.onmessage = function(e) {
    const msg = e.data;
    if (msg.type === 'INIT') {
        ctx = msg.canvas.getContext('2d');
        console.log("Worker: Ignition.");
        ignited = true;
        requestAnimationFrame(loop);
    } else if (msg.type === 'KEY') {
        keys[msg.key] = msg.state;
    }
};

function loop() {
    // 1. Cosmic Void
    ctx.fillStyle = 'rgba(5, 5, 20, 0.15)';
    ctx.fillRect(0, 0, 400, 300);

    // 2. Physics
    if (keys.ArrowLeft || keys.a) player.vx -= 0.8;
    if (keys.ArrowRight || keys.d) player.vx += 0.8;
    if (keys.ArrowUp || keys.w) player.vy -= 0.8;
    if (keys.ArrowDown || keys.s) player.vy += 0.8;

    player.vx *= 0.92; player.vy *= 0.92;
    player.x += player.vx; player.y += player.vy;

    // Wrap
    if (player.x < 0) player.x = 400; if (player.x > 400) player.x = 0;
    if (player.y < 0) player.y = 300; if (player.y > 300) player.y = 0;

    // 3. Particles
    if (Math.abs(player.vx) + Math.abs(player.vy) > 0.5) {
        for(let i=0; i<2; i++) {
            particles.push({
                x: player.x, y: player.y,
                vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
                life: 1.0,
                hue: Math.random() * 60 + 180
            });
        }
    }

    // 4. Render Player (Glow)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#66fcf1';
    ctx.fillStyle = '#66fcf1';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 70%, ' + p.life + ')';
        ctx.fillRect(p.x-1.5, p.y-1.5, 3, 3);
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
                    if (url === 'worker_logic.js') return { code: self.workerSource };
                    return null;
                },
                hostAPI: { 0: tools.log }
            });
        }
    };
})();
