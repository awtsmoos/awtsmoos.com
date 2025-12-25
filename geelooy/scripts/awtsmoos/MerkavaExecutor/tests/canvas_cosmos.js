
// B"H
(function() {
    window.MERKAVA_TESTS['canvas_cosmos'] = {
        name: "Test 4: Cosmic Interaction (2D)",
        orchestrator: `// B"H - Interactive Player & Particles (Logging Engaged)
const canvas = document.getElementById('vm-canvas');
const ctx = canvas.getContext('2d');
const particles = [];

let player = { x: 200, y: 150, size: 20, color: '#66fcf1' };

player.render = function() {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    ctx.shadowBlur = 0;
};

// 2. Input Management
let keys = {};
document.addEventListener('keydown', (e) => { 
    console.log("KeyDown Captured:", e.key);
    keys[e.key] = true; 
});
document.addEventListener('keyup', (e) => { 
    keys[e.key] = false; 
});

// 3. Click to Emanate
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    console.log("Click Event Captured at:", mx, my);
    
    for(let i=0; i<10; i++) {
        particles.push({
            x: mx, y: my,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0
        });
    }
});

// 4. The Animation Loop
let frameCount = 0;
function loop() {
    frameCount++;
    if (frameCount % 60 === 0) {
        console.log("Loop Heartbeat - Active Particles:", particles.length);
    }

    ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update & Render Player
    let moved = false;
    if (keys.ArrowLeft || keys.a) { player.x -= 3; moved = true; }
    if (keys.ArrowRight || keys.d) { player.x += 3; moved = true; }
    if (keys.ArrowUp || keys.w) { player.y -= 3; moved = true; }
    if (keys.ArrowDown || keys.s) { player.y += 3; moved = true; }
    
    if (moved && frameCount % 10 === 0) {
        console.log("Player Moving to:", Math.floor(player.x), Math.floor(player.y));
    }

    player.render();

    // Update & Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.fillStyle = 'rgba(69, 162, 158, ' + p.life + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(loop);
}

console.log("B\\"H - Cosmic Interaction Engine Ignited.");
requestAnimationFrame(loop);`,
        
        async run(Merkava, tools) {
            return Merkava.run(this.orchestrator, {
                context: { 
                    document: window.document,
                    console: { log: tools.log }
                },
                hostAPI: { 0: tools.log }
            });
        }
    };
})();
