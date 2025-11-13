// B"H
// Manages the collection of all non-player entities.

import { HEBREW_LETTERS, PLANT_EMOJIS, ANIMAL_EMOJIS } from './constants.js';
import * as State from './state.js';
import { Otiot, Tzomeach, Chai } from './classes/Entity.js';
import { Particle } from './classes/Particle.js';

export function generateEntities(canvasWidth, cameraY) {
    const { entities, ascension, getGroundY } = State;
    const y_spawn = cameraY - 100;
    // --- DIFFICULTY: Steeper difficulty curve and higher cap ---
    const difficulty = Math.min(15, 1 + ascension / 800); 
    const groundY = getGroundY();

    // --- Always spawn Otiot (Domem) ---
    if (Math.random() < 0.1 * difficulty) { // Increased letter spawn to keep game possible
        entities.push(new Otiot({ 
            x: Math.random() * canvasWidth, 
            y: y_spawn, 
            size: 60,
            letter: HEBREW_LETTERS[Math.floor(Math.random() * 22)]
        }));
    }
    
    // --- Spawn Tzomeach (Plants) ---
    if (Math.random() < 0.015 * difficulty) {
        entities.push(new Tzomeach({ 
            x: Math.random() * canvasWidth, 
            y: groundY, 
            size: 60,
            height: 10,
            maxHeight: 80 + Math.random() * 150, 
            growthRate: 0.15, 
            emoji: PLANT_EMOJIS[Math.floor(Math.random() * PLANT_EMOJIS.length)] 
        }));
    }

    // --- Spawn Chai (Animals) ---
    if (Math.random() < 0.008 * difficulty) {
        entities.push(new Chai({
            x: Math.random() * canvasWidth,
            y: groundY - 10, 
            size: 50,
            vx: (Math.random() - 0.5) * 5 + 1,
            vy: -3 - Math.random() * 4,
            emoji: ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)]
        }));
    }
}


export function updateEntities(cameraY, cameraSpeed, canvasWidth, gameOverCallback) {
    const { player, entities, particles } = State;

    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        
        entity.update(cameraSpeed, particles, player, canvasWidth);

        if (entity.collidesWith(player)) {
            handleCollision(entity, player, particles, cameraSpeed, gameOverCallback);
        }

        if (entity.toRemove || entity.y > cameraY + window.innerHeight + 200 || entity.y < cameraY - 200) {
            entities.splice(i, 1);
        }
    }
}

function handleCollision(entity, player, particles, cameraSpeed, gameOverCallback) {
    if (entity.type === 'otiot') {
        if (entity.isSacred || player.isTikkun) {
            player.combo++;
            player.tikkun = Math.min(player.maxTikkun, player.tikkun + 5 + player.combo * 0.5);
            State.updateAscension(player.combo * 2);
            createExplosion(entity.x, entity.y, cameraSpeed, particles, `hsl(${45 + Math.random()*15}, 100%, ${60 + Math.random()*40}%)`);
            entity.toRemove = true;
        }
    } else if (entity.type === 'chai' || entity.type === 'tzomeach') {
        if (player.isTikkun) {
            // --- GAMEPLAY: Tikkun destroys enemies ---
            createExplosion(entity.x, entity.y, cameraSpeed, particles, '#ff8000'); // Orange explosion for enemies
            entity.toRemove = true;
        } else {
             gameOverCallback();
        }
    }
}

function createExplosion(x, y, cameraSpeed, particles, color) {
    for (let j = 0; j < 25; j++) {
        particles.push(new Particle({
            x, y,
            color: color,
            size: Math.random() * 5 + 1,
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.5) * 18 - cameraSpeed,
            life: 70 + Math.random() * 30,
            drag: 0.96,
            gravity: 0.25
        }));
    }
}

export function sanctifyRandomLetter() {
    const nonSacredLetters = State.getEntities().filter(e => e.type === 'otiot' && !e.isSacred);
    if (nonSacredLetters.length > 0) {
        const letterToSanctify = nonSacredLetters[Math.floor(Math.random() * nonSacredLetters.length)];
        letterToSanctify.sanctify();
    }
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