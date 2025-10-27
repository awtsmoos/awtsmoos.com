//B"H
//main.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = Math.min(window.innerWidth, 450);
canvas.height = window.innerHeight;

// --- ASSETS ---
const EMOJIS = {
    player: Array.from("🔥")[0],
    spark: Array.from("✨")[0],
    shatter: Array.from("💥")[0],
    stable: Array.from("🟫")[0],
    moving: Array.from("🟦")[0],
    breakable: Array.from("🟥")[0],
    bountiful: Array.from("🤍")[0],
    klippot: Array.from("👹🕷️💀"),
    shofar: Array.from("🐏")[0],
    magenDavid: Array.from("✡️")[0],
    backgroundChars: Array.from("אשהומי✦✡✨"),
    hebrewChars: Array.from("אבגדהוזחטיכלמנסעפצקרשת"),
    einSof: Array.from("☀️")[0] // Surprise Feature 1
};

// --- CONFIG & PHYSICS ---
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;
const PLAYER_HALF_WIDTH = PLAYER_WIDTH / 2;
const PLAYER_HALF_HEIGHT = PLAYER_HEIGHT / 2;
const GRAVITY = 0.25;
const JUMP_FORCE = -11;
const BOUNTIFUL_JUMP_FORCE = -18;
const SHOFAR_JUMP_FORCE = -22;
const ENEMY_BOUNCE_FORCE = -9;
const PLATFORM_HEIGHT = 20;
const PLATFORM_WIDTH = 85;
const MAX_BG_PARTICLES = 70;

// --- GAME STATE ---
let player, platforms = [],
    enemies = [],
    powerups = [],
    sparks = [],
    backgroundParticles = [],
    trailParticles = [];
let score = 0,
    highScore = 0,
    cameraY = 0;
let gameState = 'start',
    worldLevel = 0,
    frameCount = 0;
let gematriaCombo = 0; // Surprise Feature 3
let einSofActive = false,
    einSofTimer = 0; // Surprise Feature 1

const WORLD_THRESHOLDS = [75, 200, 400];
const WORLD_COLORS = ['#1a0d00', '#001a1a', '#1a001a', '#333333'];

// --- CONTROLS ---
function handleMove(e) {
    if (gameState !== 'playing') return;
    let currentX = e.touches ? e.touches[0].clientX : e.clientX;
    player.targetCx = currentX - (window.innerWidth - canvas.width) / 2;
}
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'playing') startGame();
    else handleMove(e);
});
canvas.addEventListener('touchstart', (e) => {
    if (gameState !== 'playing') startGame();
    else handleMove(e);
});

// --- GAME OBJECTS ---
class Player {
    /* ... Unchanged ... */
    constructor() {
        this.cx = canvas.width / 2;
        this.cy = canvas.height - 100;
        this.targetCx = this.cx;
        this.vy = JUMP_FORCE;
        this.emoji = EMOJIS.player;
        this.shielded = false;
        this.prevCx = this.cx;
        this.prevCy = this.cy;
        this.squash = 1;
        this.visualWidth = PLAYER_WIDTH;
        this.visualHeight = PLAYER_HEIGHT;
    }
    update() {
        this.prevCx = this.cx;
        this.prevCy = this.cy;
        if (!einSofActive) {
            this.vy += GRAVITY;
            
        }
        this.cx += (this.targetCx - this.cx) * 0.5;
        
        this.cy += this.vy;
        if (this.cx > canvas.width + PLAYER_HALF_WIDTH) this.cx = 0 - PLAYER_HALF_WIDTH;
        else if (this.cx < 0 - PLAYER_HALF_WIDTH) this.cx = canvas.width + PLAYER_HALF_WIDTH;
        this.squash = Math.min(1, this.squash + 0.05);
        this.visualWidth = PLAYER_WIDTH * (2 - this.squash);
        this.visualHeight = PLAYER_HEIGHT * this.squash;
    }
    draw() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        if (einSofActive) {
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 30;
        } else {
            ctx.shadowColor = 'rgba(255, 180, 0, 0.7)';
            ctx.shadowBlur = 10 + (Math.sin(frameCount * 0.1) * 5);
        }
        ctx.font = `${this.visualHeight}px Arial`;
        ctx.fillText(this.emoji, this.cx, this.cy);
        ctx.restore();
        if (this.shielded) {
            ctx.font = `${this.visualHeight * 2}px Arial`;
            ctx.globalAlpha = 0.3;
            ctx.fillText(EMOJIS.magenDavid, this.cx, this.cy + this.visualHeight / 2);
            ctx.globalAlpha = 1.0;
        }
    }
}
class BackgroundParticle {
    /* ... Unchanged ... */
    constructor() {
        this.respawn(true);
    }
    respawn(isInitial) {
        this.parallaxFactor = 0.2 + Math.random() * 0.8;
        this.x = Math.random() * canvas.width;
        this.y = isInitial ? Math.random() * canvas.height : -20;
        this.vy = this.parallaxFactor * 1.5;
        this.char = EMOJIS.backgroundChars[Math.floor(Math.random() * EMOJIS.backgroundChars.length)];
        this.size = 10 + Math.random() * 15;
        this.opacityPhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.01 + Math.random() * 0.03;
    }
    update(cameraVelY) {
        this.y += this.vy + cameraVelY;
        this.opacityPhase += this.twinkleSpeed;
        if (this.y > canvas.height + 20) this.respawn(false);
    }
    draw() {
        const baseOpacity = this.parallaxFactor * 0.6;
        const twinkle = Math.sin(this.opacityPhase) * 0.3;
        ctx.globalAlpha = Math.max(0, baseOpacity + twinkle);
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.char, this.x, this.y);
    }
}
class Platform {
    /* ... Unchanged ... */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = PLATFORM_WIDTH;
        this.height = PLATFORM_HEIGHT;
        this.type = type;
        this.emoji = EMOJIS[type];
        this.dx = this.type === 'moving' ? (Math.random() < 0.5 ? 1 : -1) * (1 + worldLevel * 0.5) : 0;
    }
    update() {
        if (this.type === 'moving') {
            this.x += this.dx;
            if (this.x < 0 || this.x + this.width > canvas.width) this.dx *= -1;
        }
    }
    draw() {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = `${this.height}px Arial`;
        ctx.fillText(this.emoji.repeat(4), this.x, this.y + this.height);
    }
}
class Enemy {
    /* ... Unchanged ... */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.emoji = EMOJIS.klippot[Math.floor(Math.random() * EMOJIS.klippot.length)];
        this.originX = x;
        this.patrolRange = 30 + Math.random() * 20;
        this.dx = (Math.random() < 0.5 ? 0.5 : -0.5) * (1 + worldLevel * 0.3);
    }
    update() {
        this.x += this.dx;
        if (this.x < this.originX - this.patrolRange || this.x > this.originX + this.patrolRange) {
            this.dx *= -1;
        }
    }
    draw() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.emoji, this.x, this.y);
    }
}
class Powerup {
    /* ... Unchanged ... */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.emoji = EMOJIS[type];
        this.size = 30;
    }
    draw() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.emoji, this.x, this.y);
    }
}
class Particle {
    /* ... Unchanged ... */
    constructor(x, y, emoji, life = 60, vx = 0, vy = 0, gravity = 0) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.life = life;
        this.initialLife = life;
        this.vx = vx;
        this.vy = vy;
        this.gravity = gravity;
    }
    update() {
        this.life--;
        this.vx *= 0.99;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
    }
    draw() {
        ctx.globalAlpha = (this.life / this.initialLife) ** 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `20px Arial`;
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

// --- CORE LOGIC ---
function startGame() {
    score = 0;
    cameraY = 0;
    frameCount = 0;
    gameState = 'playing';
    worldLevel = 0;
    highScore = localStorage.getItem('einSofAscentHighScore') || 0;
    player = new Player();
    platforms = [];
    enemies = [];
    powerups = [];
    sparks = [];
    trailParticles = [];
    backgroundParticles = [];
    for (let i = 0; i < MAX_BG_PARTICLES; i++) {
        backgroundParticles.push(new BackgroundParticle());
    }
    let startX = canvas.width / 2 - PLATFORM_WIDTH / 2;
    for (let i = 0; i < 15; i++) {
        platforms.push(new Platform(startX, canvas.height - 50 - i * 60, 'stable'));
    }
    platforms[0].y = player.cy + 80;
    gematriaCombo = 0;
    einSofActive = false;
    console.clear();
    console.log("SOUNDSCAPE: Playing 'asiyah_hum.mp3'");
}

// **THE PROVABLY FAIR PLATFORM GENERATION ENGINE**
let nextPlatformMustBeStable = false;

function generatePlatforms() {
    let highestPlatformY = platforms.length > 0 ? platforms[platforms.length - 1].y : canvas.height;
    while (highestPlatformY > cameraY - 100) {
        const lastPlatform = platforms[platforms.length - 1];

        // 1. Calculate the physics-based reachable zone
        const maxJumpHeight = (JUMP_FORCE ** 2) / (2 * GRAVITY);
        const maxVerticalGap = maxJumpHeight * 0.78; // Can't be the absolute apex
        const minVerticalGap = 40;
        let y = highestPlatformY - (minVerticalGap + Math.random() * (maxVerticalGap - minVerticalGap));

        const timeToApex = -JUMP_FORCE / GRAVITY;
        const timeToFallBack = Math.sqrt((highestPlatformY - y + maxJumpHeight) / (0.5 * GRAVITY));
        const maxHorizontalReach = canvas.width / 2 * (timeToApex + timeToFallBack) / 30; // Heuristic based on screen width

        // 2. Generate a position within this fair zone
        let x = lastPlatform.x + (Math.random() - 0.5) * maxHorizontalReach * 1.5;
        x = Math.max(10, Math.min(x, canvas.width - PLATFORM_WIDTH - 10));

        let type = 'stable',
            rand = Math.random();
        if (nextPlatformMustBeStable) {
            type = 'stable'; // Force stable platform after a breakable one
            y = highestPlatformY - (minVerticalGap + Math.random() * 20); // Make it an easy jump
            nextPlatformMustBeStable = false;
        } else {
            if (rand < 0.12 + worldLevel * 0.04) type = 'moving';
            if (rand > 0.90 - worldLevel * 0.04) {
                type = 'breakable';
                nextPlatformMustBeStable = true; // Set the flag for the next iteration
            }
            if (rand > 0.97 - worldLevel * 0.01) type = 'bountiful';
        }

        platforms.push(new Platform(x, y, type));
        // Add powerups, making Ein Sof very rare
        if (type === 'stable') {
            const powerupRand = Math.random();
            if (powerupRand < 0.015 && score > 50) { // Ein Sof is rare and appears later
                powerups.push(new Powerup(x + PLATFORM_WIDTH / 2, y - 15, 'einSof'));
            } else if (powerupRand < 0.07) {
                powerups.push(new Powerup(x + PLATFORM_WIDTH / 2, y - 15, Math.random() < 0.5 ? 'shofar' : 'magenDavid'));
            } else if (Math.random() < 0.15 + worldLevel * 0.05) {
                enemies.push(new Enemy(x + PLATFORM_WIDTH / 2, y - 15));
            }
        }
        highestPlatformY = y;
    }
}

function gameOver() {
    gameState = 'gameOver';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('einSofAscentHighScore', highScore);
    }
}

function update() {
    if (gameState !== 'playing') return;
    const prevCameraY = cameraY;
    frameCount++;
    player.update();

    // Surprise Feature 1: Ein Sof state logic
    if (einSofActive) {
        player.vy = -10; // Controlled ascent
        player.emoji = EMOJIS.spark;
        einSofTimer--;
        if (einSofTimer <= 0) {
            einSofActive = false;
            player.emoji = EMOJIS.player;
            player.vy = 0; // Prevent huge downward velocity after it ends
        }
    } else {
        enemies.forEach(e => e.update());
    }

    if (player.cy < cameraY + canvas.height / 2) cameraY = player.cy - canvas.height / 2;
    const cameraVelY = (cameraY - prevCameraY);
    backgroundParticles.forEach(p => p.update(cameraVelY * -1)); // Move opposite to camera
    generatePlatforms();

    if (frameCount % 4 === 0) trailParticles.push(new Particle(player.cx, player.cy, EMOJIS.spark, 20));
    [...trailParticles, ...sparks].forEach((p, i, arr) => {
        p.update();
        if (p.life <= 0) arr.splice(i, 1);
    });

    if (!einSofActive) {
        platforms.forEach((p, index) => {
            /* Unchanged and correct collision */
            p.update();
            if (player.vy <= 0) return;
            const feetWereAbove = player.prevCy + PLAYER_HALF_HEIGHT <= p.y;
            const feetAreNowBelow = player.cy + PLAYER_HALF_HEIGHT >= p.y;
            if (!feetWereAbove || !feetAreNowBelow) return;
            const verticalTravel = (player.cy + PLAYER_HALF_HEIGHT) - (player.prevCy + PLAYER_HALF_HEIGHT);
            if (verticalTravel <= 0) return;
            const t = (p.y - (player.prevCy + PLAYER_HALF_HEIGHT)) / verticalTravel;
            const horizontalTravel = player.cx - player.prevCx;
            const collisionCx = player.prevCx + (horizontalTravel * t);
            if (collisionCx - PLAYER_HALF_WIDTH < p.x + p.width && collisionCx + PLAYER_HALF_WIDTH > p.x) {
                gematriaCombo = 0;
                if (p.type === 'breakable') {
                    platforms.splice(index, 1);
                    sparks.push(new Particle(p.x + p.width / 2, p.y, EMOJIS.shatter));
                } else {
                    player.cy = p.y - PLAYER_HALF_HEIGHT;
                    player.vy = p.type === 'bountiful' ? BOUNTIFUL_JUMP_FORCE : JUMP_FORCE;
                    player.squash = 0.5;
                }
            }
        });
        enemies.forEach((enemy, index) => {
            const isFallingOnEnemy = player.vy > 0 && Math.abs(player.cx - enemy.x) < PLAYER_HALF_WIDTH + enemy.size / 2 && player.cy + PLAYER_HALF_HEIGHT >= enemy.y - enemy.size / 2 && player.prevCy + PLAYER_HALF_HEIGHT <= enemy.y - enemy.size / 2;
            if (isFallingOnEnemy) {
                player.vy = ENEMY_BOUNCE_FORCE;
                player.squash = 0.5;
                score += 5;
                gematriaCombo++;
                if (gematriaCombo >= 3) {
                    score += 25;
                    for (let i = 0; i < 20; i++) {
                        const vx = (Math.random() - 0.5) * 8;
                        const vy = -3 + (Math.random() - 0.5) * 6;
                        sparks.push(new Particle(player.cx, player.cy, EMOJIS.hebrewChars[i % EMOJIS.hebrewChars.length], 100, vx, vy, 0.1));
                    }
                    gematriaCombo = 0;
                }
                for (let i = 0; i < 10; i++) {
                    const vx = (Math.random() - 0.5) * 5;
                    const vy = -2 + (Math.random() - 0.5) * 4;
                    const char = EMOJIS.hebrewChars[Math.floor(Math.random() * EMOJIS.hebrewChars.length)];
                    sparks.push(new Particle(enemy.x, enemy.y, char, 80 + Math.random() * 20, vx, vy, 0.08));
                }
                enemies.splice(index, 1);
            } else {
                const checkCollision = Math.abs(player.cx - enemy.x) < PLAYER_HALF_WIDTH + enemy.size / 2 && Math.abs(player.cy - enemy.y) < PLAYER_HALF_HEIGHT + enemy.size / 2;
                if (checkCollision) {
                    if (player.shielded) {
                        score++;
                        sparks.push(new Particle(enemy.x, enemy.y, EMOJIS.spark));
                        enemies.splice(index, 1);
                        player.shielded = false;
                    } else {
                        gameOver();
                    }
                }
            }
        });
        powerups.forEach((powerup, index) => {
            const checkCollision = Math.abs(player.cx - powerup.x) < PLAYER_HALF_WIDTH + powerup.size / 2 && Math.abs(player.cy - powerup.y) < PLAYER_HALF_HEIGHT + powerup.size / 2;
            if (checkCollision) {
                if (powerup.type === 'einSof') {
                    einSofActive = true;
                    einSofTimer = 120;
                    sparks.push(new Particle(player.cx, player.cy, "✨", 120));
                } else if (powerup.type === 'shofar') {
                    player.vy = SHOFAR_JUMP_FORCE;
                    player.squash = 0.5;
                } else if (powerup.type === 'magenDavid') {
                    player.shielded = true;
                    setTimeout(() => {
                        player.shielded = false;
                    }, 8000);
                }
                powerups.splice(index, 1);
            }
        });
    }

    const newScore = Math.max(0, Math.floor(Math.abs(cameraY / 50)));
    if (newScore > score) score = newScore;
    const oldWorldLevel = worldLevel;
    if (worldLevel < WORLD_THRESHOLDS.length && score > WORLD_THRESHOLDS[worldLevel]) {
        worldLevel++;
        // Surprise Feature 2: Dynamic Soundscape Logic
        if (worldLevel > oldWorldLevel) {
            const worldNames = ["Yetzirah", "Beriah", "Atzilut"];
            console.log(`SOUNDSCAPE: Fading in '${worldNames[worldLevel-1].toLowerCase()}_layer.mp3'`);
        }
    }
    platforms = platforms.filter(p => p.y < cameraY + canvas.height + 100);
    enemies = enemies.filter(e => e.y < cameraY + canvas.height + 100);
    powerups = powerups.filter(p => p.y < cameraY + canvas.height + 100);
    if (player.cy - PLAYER_HALF_HEIGHT > cameraY + canvas.height) gameOver();
}

function draw() {
    ctx.fillStyle = WORLD_COLORS[worldLevel];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    backgroundParticles.forEach(p => p.draw());
    ctx.globalAlpha = 1.0;
    ctx.save();
    ctx.translate(0, -cameraY);
    trailParticles.forEach(p => p.draw());
    platforms.forEach(p => p.draw());
    enemies.forEach(e => e.draw());
    powerups.forEach(p => p.draw());
    if (player) player.draw();
    sparks.forEach(s => s.draw());
    ctx.restore();

    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${EMOJIS.spark} ${score}`, 10, 30);
    const worldNames = ["Asiyah (Action)", "Yetzirah (Formation)", "Beriah (Creation)", "Atzilut (Emanation)"];
    ctx.textAlign = 'right';
    ctx.fillText(worldNames[worldLevel], canvas.width - 10, 30);

    if (gameState === 'start') drawOverlay("Ein Sof Ascent", "Tap or Click to Begin", "Ascend through the Four Worlds.");
    else if (gameState === 'gameOver') drawOverlay("A descent is for the purpose", "of a greater ascent.", `Sparks Redeemed: ${score}`, `High Score: ${highScore}`, "Tap to try again.");
}

function drawOverlay(...lines) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let y = canvas.height / 2 - (lines.length / 2 * 40);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(lines[0], canvas.width / 2, y);
    y += 50;
    ctx.font = '20px sans-serif';
    for (let i = 1; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width / 2, y);
        y += 30;
    }
}

gameLoop();

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}