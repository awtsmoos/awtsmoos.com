// B"H

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME STATE & CORE VARS ---
let player, entities, particles, cameraY, gameState = 'waiting', time = 0;
let ascension = 0, bestAscension = localStorage.getItem('kavanahBestAscension') || 0;
let touchAnchor = null, controlVector = { x: 0, y: 0 };

// --- CONSTANTS ---
const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const PLANT_EMOJIS = ['🌳', '🌿', '🌾', '🌱', '🌷', '🌲'];
const ANIMAL_EMOJIS = ['🐅', '🐘', '🦅', '🐋', '🦍', '🐍'];

// --- UTILITY ---
const lerp = (a, b, t) => a + (b - a) * t;

// --- CLASSES ---
class Particle {
    constructor(config) {
        this.x = config.x; this.y = config.y; this.color = config.color; this.size = config.size;
        this.vx = config.vx; this.vy = config.vy; this.life = config.life; this.initialLife = this.life;
        this.drag = config.drag || 1; this.gravity = config.gravity || 0; this.text = config.text || null;
    }
    update() {
        this.vx *= this.drag; this.vy *= this.drag; this.vy += this.gravity;
        this.x += this.vx; this.y += this.vy; this.life--;
    }
    draw() {
        const alpha = Math.max(0, this.life / this.initialLife);
        ctx.globalAlpha = alpha;
        if (this.text) {
            ctx.font = `${this.size * (this.life/this.initialLife)}px Arial`;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y - cameraY);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y - cameraY, Math.max(0, this.size * (alpha)), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// --- INITIALIZATION ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameState !== 'playing') init();
}

function init() {
    player = {
        x: canvas.width / 2, y: canvas.height * 0.8, radius: 15, vx: 0, vy: 0,
        attunement: 'chesed', tikkun: 0, maxTikkun: 100, isTikkun: false, tikkunTimer: 0,
        combo: 0, lastHarvestClass: 'none'
    };
    entities = []; particles = []; ascension = 0; cameraY = 0; time = 0;
    gameState = 'waiting';
}

// --- ENTITY GENERATION ---
function generateEntities() {
    const y_spawn = cameraY - 100;
    const difficulty = Math.min(10, 1 + ascension / 6000);

    // Domem (Letters)
    if (Math.random() < 0.3 * difficulty) {
        const type = Math.random() < 0.5 ? 'chesed' : 'gevurah';
        const pattern = Math.random();
        if (pattern < 0.6) { // Stream
            const startX = Math.random() * canvas.width;
            for (let i = 0; i < 4; i++) entities.push({ type: 'otiot', class: type, x: startX + (Math.random()-0.5)*200, y: y_spawn - i * 90, size: 35, letter: HEBREW_LETTERS[Math.floor(Math.random()*22)] });
        } else { // Alternating Wall
            const startType = Math.random() < 0.5 ? 'chesed' : 'gevurah';
            for (let i=0; i<5; i++) entities.push({ type: 'otiot', class: (i % 2 === 0) ? startType : (startType === 'chesed' ? 'gevurah' : 'chesed'), x: (canvas.width / 5) * (i + 0.5), y: y_spawn, size: 40, letter: HEBREW_LETTERS[Math.floor(Math.random()*22)] });
        }
    }
    // Tzomeach (Plants)
    if (Math.random() < 0.05) entities.push({ type: 'tzomeach', x: Math.random()*canvas.width, y: cameraY + canvas.height, size: 20, maxSize: 50+Math.random()*100, growthRate: 0.1, emoji: PLANT_EMOJIS[Math.floor(Math.random()*PLANT_EMOJIS.length)] });
    // Chai (Animals)
    if (Math.random() < 0.03 * difficulty) entities.push({ type: 'chai', x: Math.random()*canvas.width, y: cameraY + canvas.height - 20, size: 30, vx: (Math.random()-0.5)*5, vy: -2 - Math.random()*3, emoji: ANIMAL_EMOJIS[Math.floor(Math.random()*ANIMAL_EMOJIS.length)] });
}

// --- DRAWING ---
function draw() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#010002';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -cameraY);
    
    // Ha'Aretz (The Earth)
    const groundY = cameraY + canvas.height;
    ctx.fillStyle = '#4A3B2A';
    ctx.fillRect(0, groundY - 20, canvas.width, 20);

    entities.forEach(e => {
        ctx.shadowBlur = 30; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (e.type === 'otiot') {
            const color = e.class === 'chesed' ? '#0AF' : '#F30';
            ctx.fillStyle = color; ctx.shadowColor = color;
            ctx.font = `${e.size}px "Times New Roman"`;
            ctx.fillText(e.letter, e.x, e.y);
        } else {
            ctx.font = `${e.size}px Arial`; ctx.shadowColor = '#000';
            ctx.fillText(e.emoji, e.x, e.y);
        }
    });
    
    particles.forEach(p => p.draw());

    if (gameState === 'playing') {
        const attuneColor = player.attunement === 'chesed' ? '#0CF' : '#F50';
        const finalColor = player.isTikkun ? '#FFF' : attuneColor;
        ctx.fillStyle = finalColor; ctx.shadowColor = finalColor; ctx.shadowBlur = 50;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
        if(player.isTikkun) {
            ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * (8 + Math.sin(time/5)*3), 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.restore();
    
    if (touchAnchor) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(touchAnchor.x, touchAnchor.y, 20, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(touchAnchor.x, touchAnchor.y); ctx.lineTo(touchAnchor.x + controlVector.x, touchAnchor.y + controlVector.y); ctx.stroke();
    }
    drawUI();
}

function drawUI() {
    const btnSize = Math.min(100, canvas.width * 0.12);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#F30'; ctx.fillRect(0, canvas.height - btnSize, btnSize, btnSize);
    ctx.fillStyle = '#0AF'; ctx.fillRect(canvas.width - btnSize, canvas.height - btnSize, btnSize, btnSize);
    if (player.tikkun >= player.maxTikkun) {
        ctx.fillStyle = `hsl(${time*2 % 360}, 100%, 70%)`; 
        ctx.fillRect(canvas.width/2 - btnSize/2, canvas.height - btnSize, btnSize, btnSize);
    }
    ctx.globalAlpha = 1;

    ctx.font = '3vh "Courier New", monospace'; ctx.fillStyle = '#FFF';
    if (gameState === 'waiting') {
        ctx.textAlign = 'center';
        ctx.fillText("B\"H", canvas.width/2, canvas.height/2 - 40);
        ctx.fillText("Focus your KAVANAH. Begin the ascent.", canvas.width/2, canvas.height/2);
    }
    ctx.textAlign = 'left'; ctx.fillText(`ASCENSION: ${Math.floor(ascension)}`, 20, 40);
    ctx.textAlign = 'right'; ctx.fillText(`PEAK: ${Math.floor(bestAscension)}`, canvas.width - 20, 40);
    ctx.textAlign = 'center'; ctx.font = '2.5vh "Times New Roman"'; ctx.fillText('ב״ה', canvas.width / 2, 40);
    if (player.combo > 2) {
        ctx.font = `${Math.min(15, 3 + player.combo * 0.5)}vh "Courier New"`;
        ctx.fillStyle = `hsla(${180 + player.combo*5}, 100%, 70%, 0.8)`;
        ctx.fillText(`x${player.combo}`, player.x, player.y - cameraY - 60);
    }
}

// --- UPDATE ---
function update() {
    time++;
    if(gameState !== 'playing') return;

    const cameraSpeed = 2 + ascension / 8000;
    cameraY -= cameraSpeed;
    ascension += cameraSpeed * 0.1;

    // Player Movement
    let targetVx = 0, targetVy = 0;
    if (touchAnchor) {
        const maxControlDist = 150;
        const dist = Math.hypot(controlVector.x, controlVector.y);
        if (dist > 10) {
            const clampedDist = Math.min(dist, maxControlDist);
            const angle = Math.atan2(controlVector.y, controlVector.x);
            const maxSpeed = 12;
            targetVx = Math.cos(angle) * (clampedDist / maxControlDist) * maxSpeed;
            targetVy = Math.sin(angle) * (clampedDist / maxControlDist) * maxSpeed;
        }
    }
    player.vx = lerp(player.vx, targetVx, 0.08);
    player.vy = lerp(player.vy, targetVy, 0.08);
    player.x += player.vx; player.y += player.vy;
    player.y = Math.min(player.y, cameraY + canvas.height - player.radius);
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));

    if(player.isTikkun && player.tikkunTimer > 0) player.tikkunTimer--; else player.isTikkun = false;

    generateEntities();

    entities.forEach((e, i) => {
        if(e.y > cameraY + canvas.height + 100) { entities.splice(i, 1); return; }
        
        if (e.type === 'tzomeach') { e.y -= cameraSpeed; if(e.size < e.maxSize) e.size += e.growthRate; }
        if (e.type === 'chai') { e.y -= cameraSpeed; e.x += e.vx; e.y += e.vy; if(e.x<0||e.x>canvas.width)e.vx*=-1; }

        const distSq = (player.x - e.x)**2 + (player.y - e.y)**2;
        const hitDist = player.isTikkun ? player.radius*8 : player.radius;
        if(distSq < (hitDist + e.size)**2) {
            if (player.isTikkun) {
                 ascension += 10;
                 for(let j=0; j<5; j++) particles.push(new Particle({x:e.x, y:e.y, color:'#FF0', size:Math.random()*2, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3, life:20}));
                 if(e.emoji) particles.push(new Particle({x: e.x, y: e.y, text: e.emoji, color: '#FFF', size: e.size, vx: 0, vy: -2, life: 40}));
                 entities.splice(i, 1);
            } else if (e.type === 'otiot') {
                if(e.class === player.attunement) {
                    if(e.class === player.lastHarvestClass) player.combo++; else player.combo = 1;
                    player.lastHarvestClass = e.class;
                    player.tikkun = Math.min(player.maxTikkun, player.tikkun + 2 + player.combo * 0.5);
                    ascension += player.combo;
                    const color = e.class === 'chesed' ? '#0AF' : '#F30';
                    for(let j=0; j<10; j++) particles.push(new Particle({x:e.x, y:e.y, color, size:Math.random()*3, vx:(Math.random()-0.5)*5, vy:(Math.random()-0.5)*5-cameraSpeed, life:30}));
                    entities.splice(i, 1);
                } else {
                    gameOver();
                }
            } else if (e.type === 'chai' || e.type === 'tzomeach') {
                gameOver();
            }
        }
    });
    particles.forEach((p,i) => { p.update(); if(p.life <= 0) particles.splice(i, 1); });
}

function gameOver() {
    if(gameState !== 'playing') return;
    gameState = 'gameOver';
    if(ascension > bestAscension) { bestAscension = ascension; localStorage.setItem('kavanahBestAscension', bestAscension); }
    for(let j=0; j<300; j++) particles.push(new Particle({x:player.x, y:player.y, color:'#FFF', size:Math.random()*3, vx:(Math.random()-0.5)*25, vy:(Math.random()-0.5)*25, life:120, drag: 0.97}));
    setTimeout(init, 2000);
}

// --- CONTROLS ---
canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if(gameState === 'waiting' || gameState === 'gameOver') { init(); gameState = 'playing'; return; }
    const btnSize = Math.min(100, canvas.width * 0.12);
    const x = e.clientX, y = e.clientY;

    if (y > canvas.height - btnSize) { // Button area
        if (x < btnSize) { player.attunement = 'gevurah'; player.combo = 0; }
        else if (x > canvas.width - btnSize) { player.attunement = 'chesed'; player.combo = 0; }
        else if (player.tikkun >= player.maxTikkun && x > canvas.width/2 - btnSize/2 && x < canvas.width/2 + btnSize/2) {
             player.isTikkun = true; player.tikkunTimer = 400; player.tikkun = 0;
        }
    } else { // Movement area
        touchAnchor = { x, y };
        controlVector = { x: 0, y: 0 };
    }
});
canvas.addEventListener('pointermove', e => { e.preventDefault(); if (touchAnchor) { controlVector = { x: e.clientX - touchAnchor.x, y: e.clientY - touchAnchor.y }; } });
window.addEventListener('pointerup', () => { touchAnchor = null; });

// --- GAME LOOP ---
function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

// --- START ---
window.addEventListener('resize', resizeCanvas);
init();
gameLoop();