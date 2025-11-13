// B"H
// Manages generation and updates for all non-player entities.

import { HEBREW_LETTERS, PLANT_EMOJIS, ANIMAL_EMOJIS } from './constants.js';
import * as State from './state.js';
import { Particle } from './classes/Particle.js';

export function generateEntities(canvasWidth, cameraY) {
    const { entities, ascension } = {
        entities: State.getEntities(),
        ascension: State.getAscension()
    };
    
    const y_spawn = cameraY - 100;
    const difficulty = Math.min(10, 1 + ascension / 6000);

    // --- GAME BALANCE ADJUSTMENT ---
    // Reduced the base spawn probability from 0.3 to 0.15 to make the
    // beginning of the game more manageable and provide a smoother difficulty curve.
    if (Math.random() < 0.15 * difficulty) {
        const type = Math.random() < 0.5 ? 'chesed' : 'gevurah';
        const pattern = Math.random();
        if (pattern < 0.6) { // Stream
            const startX = Math.random() * canvasWidth;
            for (let i = 0; i < 4; i++) entities.push({ type: 'otiot', class: type, x: startX + (Math.random()-0.5)*200, y: y_spawn - i * 90, size: 35, letter: HEBREW_LETTERS[Math.floor(Math.random()*22)] });
        } else { // Alternating Wall
            const startType = Math.random() < 0.5 ? 'chesed' : 'gevurah';
            for (let i=0; i<5; i++) entities.push({ type: 'otiot', class: (i % 2 === 0) ? startType : (startType === 'chesed' ? 'gevurah' : 'chesed'), x: (canvasWidth / 5) * (i + 0.5), y: y_spawn, size: 40, letter: HEBREW_LETTERS[Math.floor(Math.random()*22)] });
        }
    }
    // Tzomeach (Plants)
    if (Math.random() < 0.05) entities.push({ type: 'tzomeach', x: Math.random()*canvasWidth, y: cameraY + window.innerHeight, size: 20, maxSize: 50+Math.random()*100, growthRate: 0.1, emoji: PLANT_EMOJIS[Math.floor(Math.random()*PLANT_EMOJIS.length)] });
    // Chai (Animals)
    if (Math.random() < 0.03 * difficulty) entities.push({ type: 'chai', x: Math.random()*canvasWidth, y: cameraY + window.innerHeight - 20, size: 30, vx: (Math.random()-0.5)*5, vy: -2 - Math.random()*3, emoji: ANIMAL_EMOJIS[Math.floor(Math.random()*ANIMAL_EMOJIS.length)] });
}

export function updateEntities(cameraY, cameraSpeed, canvasWidth, gameOverCallback) {
    const { player, entities, particles } = State;

    entities.forEach((e, i) => {
        if (e.y > cameraY + window.innerHeight + 100) { entities.splice(i, 1); return; }
        
        if (e.type === 'tzomeach') { e.y -= cameraSpeed; if (e.size < e.maxSize) e.size += e.growthRate; }
        if (e.type === 'chai') { e.y -= cameraSpeed; e.x += e.vx; e.y += e.vy; if (e.x < 0 || e.x > canvasWidth) e.vx *= -1; }

        const distSq = (player.x - e.x)**2 + (player.y - e.y)**2;
        const hitDist = player.isTikkun ? player.radius * 8 : player.radius;

        if (distSq < (hitDist + e.size)**2) {
            if (player.isTikkun) {
                State.updateAscension(10);
                for(let j=0; j<5; j++) particles.push(new Particle({x:e.x, y:e.y, color:'#FF0', size:Math.random()*2, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3, life:20}));
                if(e.emoji) particles.push(new Particle({x: e.x, y: e.y, text: e.emoji, color: '#FFF', size: e.size, vx: 0, vy: -2, life: 40}));
                entities.splice(i, 1);
            } else if (e.type === 'otiot') {
                if (e.class === player.attunement) {
                    if (e.class === player.lastHarvestClass) player.combo++; else player.combo = 1;
                    player.lastHarvestClass = e.class;
                    player.tikkun = Math.min(player.maxTikkun, player.tikkun + 2 + player.combo * 0.5);
                    State.updateAscension(player.combo);
                    const color = e.class === 'chesed' ? '#0AF' : '#F30';
                    for(let j=0; j<10; j++) particles.push(new Particle({x:e.x, y:e.y, color, size:Math.random()*3, vx:(Math.random()-0.5)*5, vy:(Math.random()-0.5)*5-cameraSpeed, life:30}));
                    entities.splice(i, 1);
                } else {
                    gameOverCallback();
                }
            }
        }
    });
}

export function updateParticles() {
    State.particles.forEach((p, i) => {
        p.update();
        if (p.life <= 0) State.particles.splice(i, 1);
    });
}

export function createGameOverParticles(x, y) {
    for (let j = 0; j < 300; j++) {
        State.particles.push(new Particle({ x, y, color: '#FFF', size: Math.random() * 3, vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25, life: 120, drag: 0.97 }));
    }
}