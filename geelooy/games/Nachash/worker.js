//B"H

importScripts('worker-helpers.js');

const state = {
    // Game state
    isRunning: false,
    isPaused: false,
    score: 0,
    // Canvas and rendering
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    pixelRatio: 1,
    // Game objects
    player: null,
    sparks: [],
    particles: [],
    drones: [],
    debris: [],
    wormholes: [],
    comet: null,
    // Timers and counters
    sparkTimer: 0,
    droneTimer: 0,
    debrisTimer: 0,
    wormholeTimer: 15000,
    cometTimer: 20000,
    // Settings
    skillValues: {},
    cosmicBg: '#02021a',
    chain: {
        count: 0,
        timer: 0,
        maxTime: 240
    }
};

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

self.onmessage = function(e) {
    console.log('[Worker] Message received:', e.data);
    const { type, ...data } = e.data;
    switch (type) {
        case 'init':
            init(data);
            break;
        case 'start':
            start(data);
            break;
        case 'resize':
            resize(data);
            break;
        case 'inputRot':
            if (state.player) state.player.turn(data.rotation * state.skillValues.turnRate);
            break;
        case 'inputUp':
             if (state.player) state.player.turning = 0;
            break;
        case 'togglePause':
            state.isPaused = !state.isPaused;
            if (state.isPaused === false) {
                gameLoop();
            }
            break;
    }
};

function init({ canvas, width, height, pixelRatio, initialSettings }) {
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    state.cosmicBg = initialSettings.cosmicBg;
    state.skillValues = initialSettings.skillValues;
    resize({ width, height, pixelRatio });
}

function resize({ width, height, pixelRatio }) {
    state.width = width;
    state.height = height;
    state.pixelRatio = pixelRatio;
    state.canvas.width = width * pixelRatio;
    state.canvas.height = height * pixelRatio;
    state.ctx.scale(pixelRatio, pixelRatio);
}

function start({ skillValues }) {
    state.skillValues = skillValues;
    state.score = 0;
    state.sparks = [];
    state.particles = [];
    state.drones = [];
    state.debris = [];
    state.wormholes = [];
    state.comet = null;

    state.player = new Player(state.width / 2, state.height / 2, state.skillValues.startLength);
    state.chain.maxTime = state.skillValues.chainTime;

    for(let i = 0; i < 15; i++) {
        spawnSpark();
    }
    for(let i = 0; i < 5; i++) {
        spawnDebris();
    }
    
    state.isRunning = true;
    state.isPaused = false;
    gameLoop();
}

function gameLoop() {
    if (!state.isRunning || state.isPaused) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    const { player, sparks, particles, drones, debris, wormholes, comet, width, height } = state;

    player.update();
    wrapPosition(player);

    // Update game objects
    particles.forEach(p => p.update());
    drones.forEach(d => { d.update(); wrapPosition(d); });
    debris.forEach(d => { d.update(); wrapPosition(d); });
    wormholes.forEach(w => w.update());
    if (comet) comet.update();

    // Collision detection
    checkCollisions();

    // Timers and spawning
    updateTimers();

    // Clean up dead particles
    state.particles = particles.filter(p => p.life > 0);
}

function draw() {
    const { ctx, width, height, player, sparks, particles, drones, debris, wormholes, comet } = state;

    // Dynamic Nebula Background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = state.cosmicBg;
    ctx.fillRect(0, 0, width, height);

    drawNebula(ctx, width, height);

    // Galactic Core
    drawGalacticCore(ctx, width / 2, height / 2);
    
    // Draw game objects
    wormholes.forEach(w => w.draw(ctx));
    debris.forEach(d => d.draw(ctx));
    sparks.forEach(s => s.draw(ctx));
    drones.forEach(d => d.draw(ctx));
    if (comet) comet.draw(ctx);
    player.draw(ctx);
    particles.forEach(p => p.draw(ctx));
}

function gameOver() {
    state.isRunning = false;
    self.postMessage({ type: 'gameover', finalScore: state.score });
}

function spawnSpark() {
    const spark = new Spark(
        Math.random() * state.width,
        Math.random() * state.height
    );
    state.sparks.push(spark);
}

function spawnDrone() {
    const edge = Math.floor(Math.random() * 4);
    let x, y, angle;
    switch(edge) {
        case 0: x = 0; y = Math.random() * state.height; angle = 0; break;
        case 1: x = state.width; y = Math.random() * state.height; angle = Math.PI; break;
        case 2: x = Math.random() * state.width; y = 0; angle = Math.PI / 2; break;
        case 3: x = Math.random() * state.width; y = state.height; angle = -Math.PI / 2; break;
    }
    state.drones.push(new Drone(x, y, angle));
}

function spawnDebris() {
    state.debris.push(new Debris(
        Math.random() * state.width,
        Math.random() * state.height
    ));
}

function spawnWormholes() {
    const { width, height } = state;
    const w1 = new Wormhole(Math.random() * width * 0.8 + width * 0.1, Math.random() * height * 0.8 + height * 0.1);
    const w2 = new Wormhole(Math.random() * width * 0.8 + width * 0.1, Math.random() * height * 0.8 + height * 0.1);
    w1.link(w2);
    w2.link(w1);
    state.wormholes = [w1, w2];
}

function spawnComet() {
    const { width, height } = state;
    const edge = Math.floor(Math.random() * 4);
    let x, y, angle;
    switch(edge) {
        case 0: x = -50; y = Math.random() * height; angle = Math.random() * Math.PI - Math.PI/2; break;
        case 1: x = width + 50; y = Math.random() * height; angle = Math.random() * Math.PI + Math.PI/2; break;
        case 2: x = Math.random() * width; y = -50; angle = Math.random() * Math.PI; break;
        case 3: x = Math.random() * width; y = height + 50; angle = -Math.random() * Math.PI; break;
    }
    state.comet = new Comet(x, y, angle);
    self.postMessage({ type: 'playSound', name: 'comet' });
}

function updateTimers() {
    state.sparkTimer++;
    if (state.sparkTimer > 100) {
        state.sparkTimer = 0;
        if (state.sparks.length < 30) spawnSpark();
    }

    state.droneTimer++;
    if(state.droneTimer > 500 && state.drones.length < 5) {
        state.droneTimer = 0;
        spawnDrone();
    }
    
    state.debrisTimer++;
    if(state.debrisTimer > 800 && state.debris.length < 10) {
        state.debrisTimer = 0;
        spawnDebris();
    }
    
    state.wormholeTimer -= 16;
    if(state.wormholeTimer <= 0) {
        spawnWormholes();
        state.wormholeTimer = 30000; // 30 seconds
    }
    if(state.wormholes.length > 0 && state.wormholes[0].life <= 0) {
        state.wormholes = [];
    }
    
    state.cometTimer -= 16;
    if(state.cometTimer <= 0) {
        spawnComet();
        state.cometTimer = 45000; // 45 seconds
    }
    if (state.comet && (state.comet.x < -100 || state.comet.x > state.width + 100 || state.comet.y < -100 || state.comet.y > state.height + 100)) {
        state.comet = null;
    }

    if (state.chain.timer > 0) {
        state.chain.timer--;
        if (state.chain.timer <= 0) {
            if (state.chain.count > 5) {
                 self.postMessage({ type: 'playSound', name: 'chainBreak' });
            }
            state.chain.count = 0;
        }
    }
    self.postMessage({ type: 'updateChain', chain: state.chain });
}

function checkCollisions() {
    const { player, sparks, drones, debris, wormholes, comet } = state;
    
    // Player head with sparks
    sparks.forEach((spark, index) => {
        if (getDistance(player.x, player.y, spark.x, spark.y) < player.size + spark.size) {
            state.sparks.splice(index, 1);
            const multiplier = 1 + Math.floor(state.chain.count / 5);
            state.score += 10 * multiplier;
            self.postMessage({ type: 'updateScore', score: state.score });
            self.postMessage({ type: 'playSound', name: 'collect', opts: { pitch: 880 + state.chain.count * 20 } });
            player.grow(1);
            state.chain.count++;
            state.chain.timer = state.chain.maxTime;
            
            // Hebrew letter particles
            for(let i = 0; i < 10; i++) {
                const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
                state.particles.push(new Particle(spark.x, spark.y, `hsl(${Math.random() * 360}, 100%, 75%)`, letter));
            }
        }
    });

    // Player head with drones and debris
    const obstacles = [...drones, ...debris.filter(d => d.size > 10)];
    obstacles.forEach(obs => {
        if (!player.isInvincible && getDistance(player.x, player.y, obs.x, obs.y) < player.size + obs.size) {
            gameOver();
        }
    });

    // Player body with itself
    if (!player.isInvincible && player.checkSelfCollision()) {
        gameOver();
    }
    
    // Player with wormholes
    wormholes.forEach(w => {
        if (getDistance(player.x, player.y, w.x, w.y) < w.radius && w.canTeleport) {
            w.teleport(player);
            self.postMessage({type: 'playSound', name: 'wormhole'});
        }
    });
    
    // Player with comet
    if (comet && getDistance(player.x, player.y, comet.x, comet.y) < player.size + 30) {
        player.activateCometBoost(state.skillValues.powerupDuration);
        state.comet = null;
        self.postMessage({type: 'playSound', name: 'powerup'});
    }
}
