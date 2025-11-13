// B"H
// Manages generation and updates for all non-player entities.

import { HEBREW_LETTERS, PLANT_EMOJIS, ANIMAL_EMOJIS } from './constants.js';
import * as State from './state.js';
import { Particle } from './classes/Particle.js';

export function generateEntities(canvasWidth, cameraY) {
    const { entities, ascension } = State;
    const y_spawn = cameraY - 100;
    const difficulty = Math.min(10, 1 + ascension / 6000);

    // --- FEWER LETTERS: Reduced the spawn rate significantly ---
    if (Math.random() < 0.08 * difficulty) {
        entities.push({ 
            type: 'otiot', 
            x: Math.random() * canvasWidth, 
            y: y_spawn, 
            size: 40, 
            letter: HEBREW_LETTERS[Math.floor(Math.random()*22)],
            isSacred: false,
            sacredLife: 0
        });
    }
    
    if (Math.random() < 0.05) entities.push({ type: 'tzomeach', x: Math.random()*canvasWidth, y: cameraY + window.innerHeight, size: 20, maxSize: 50+Math.random()*100, growthRate: 0.1, emoji: PLANT_EMOJIS[Math.floor(Math.random()*PLANT_EMOJIS.length)] });
    if (Math.random() < 0.03 * difficulty) entities.push({ type: 'chai', x: Math.random()*canvasWidth, y: cameraY + window.innerHeight - 20, size: 30, vx: (Math.random()-0.5)*5, vy: -2 - Math.random()*3, emoji: ANIMAL_EMOJIS[Math.floor(Math.random()*ANIMAL_EMOJIS.length)] });
}

export function sanctifyRandomLetter() {
    const nonSacredLetters = State.getEntities().filter(e => e.type === 'otiot' && !e.isSacred);
    if (nonSacredLetters.length > 0) {
        const letterToSanctify = nonSacredLetters[Math.floor(Math.random() * nonSacredLetters.length)];
        letterToSanctify.isSacred = true;
        letterToSanctify.sacredLife = 350; // How long it stays glowing
    }
}

export function updateEntities(cameraY, cameraSpeed, canvasWidth, gameOverCallback) {
    const { player, entities, particles } = State;

    entities.forEach((e, i) => {
        if (e.y > cameraY + window.innerHeight + 100) { entities.splice(i, 1); return; }
        
        if (e.type === 'tzomeach') { e.y -= cameraSpeed; if (e.size < e.maxSize) e.size += e.growthRate; }
        if (e.type === 'chai') { e.y -= cameraSpeed; e.x += e.vx; e.y += e.vy; if (e.x < 0 || e.x > canvasWidth) e.vx *= -1; }
        if (e.type === 'otiot' && e.isSacred) {
            e.sacredLife--;
            if (e.sacredLife <= 0) e.isSacred = false;
        }

        const distSq = (player.x - e.x)**2 + (player.y - e.y)**2;
        const hitDist = player.radius;

        // --- COLLISION LOGIC CHANGE: More precise, circle-based hitboxes. ---
        if (distSq < (hitDist + e.size / 2)**2) {
            if (e.type === 'otiot') { // Check for letter type first
                if (e.isSacred) {
                    // SUCCESS: Player collected a SACRED letter.
                    player.combo++;
                    player.tikkun = Math.min(player.maxTikkun, player.tikkun + 5 + player.combo * 0.5);
                    State.updateAscension(player.combo * 2);
                    
                    // --- EXPLOSION for sacred letter ---
                    for(let j=0; j<60; j++) {
                        particles.push(new Particle({
                            x: e.x, y: e.y,
                            color: `hsl(${45 + Math.random()*15}, 100%, ${60 + Math.random()*40}%)`, // Shades of Gold/Yellow
                            size: Math.random() * 5 + 1,
                            vx: (Math.random() - 0.5) * 18,
                            vy: (Math.random() - 0.5) * 18 - cameraSpeed,
                            life: 70 + Math.random() * 30,
                            drag: 0.96,
                            gravity: 0.25
                        }));
                    }
                    entities.splice(i, 1);
                } else {
                    // --- FEEDBACK for non-sacred letter collision ---
                    // Provide a visual cue and reset combo, but don't remove letter.
                    player.combo = 0; 
                    for(let j=0; j<10; j++) {
                        particles.push(new Particle({
                            x: e.x, y: e.y,
                            color: '#444',
                            size: Math.random() * 2,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4 - cameraSpeed,
                            life: 30,
                            drag: 0.9,
                            gravity: 0.1
                        }));
                    }
                }
            } else if (e.type === 'chai' || e.type === 'tzomeach') {
                // GAME OVER: Hit an actual obstacle
                gameOverCallback();
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
        State.particles.push(new Particle({ x, y, color: '#F00', size: Math.random() * 3, vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25, life: 120, drag: 0.97 }));
    }
}