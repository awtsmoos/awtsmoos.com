// B"H
// Manages the collection of all non-player entities.

import { HEBREW_LETTERS, PLANT_EMOJIS, ANIMAL_EMOJIS } from './constants.js';
import * as State from './state.js';
import { Otiot, Tzomeach, Chai } from './classes/Entity.js';
import { Particle } from './classes/Particle.js';

// --- Entity Generation ---

export function generateEntities(canvasWidth, cameraY) {
    const { entities, ascension } = State;
    const y_spawn = cameraY - 100;
    const difficulty = Math.min(10, 1 + ascension / 6000);

    // Spawn letters
    if (Math.random() < 0.08 * difficulty) {
        entities.push(new Otiot({ 
            x: Math.random() * canvasWidth, 
            y: y_spawn, 
            size: 40, 
            letter: HEBREW_LETTERS[Math.floor(Math.random() * 22)]
        }));
    }
    
    // Spawn plants
    if (Math.random() < 0.05) {
        entities.push(new Tzomeach({ 
            x: Math.random() * canvasWidth, 
            y: cameraY + window.innerHeight, 
            size: 40,
            height: 10,
            maxHeight: 50 + Math.random() * 100, 
            growthRate: 0.1, 
            emoji: PLANT_EMOJIS[Math.floor(Math.random() * PLANT_EMOJIS.length)] 
        }));
    }

    // Spawn animals
    if (Math.random() < 0.03 * difficulty) {
        entities.push(new Chai({
            x: Math.random() * canvasWidth,
            y: cameraY + window.innerHeight - 20,
            size: 30,
            vx: (Math.random() - 0.5) * 4 + 1, // Ensure they always have some horizontal speed
            vy: -2 - Math.random() * 3,
            emoji: ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)]
        }));
    }
}

// --- Main Update Loop ---

export function updateEntities(cameraY, cameraSpeed, canvasWidth, gameOverCallback) {
    const { player, entities, particles } = State;

    // Loop backwards to allow for safe removal of entities
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        
        entity.update(cameraSpeed, particles, player, canvasWidth);

        if (entity.collidesWith(player)) {
            handleCollision(entity, player, particles, cameraSpeed, gameOverCallback);
        }

        // Remove entities that are marked for removal or are off-screen
        if (entity.toRemove || entity.y > cameraY + window.innerHeight + 100) {
            entities.splice(i, 1);
        }
    }
}

// --- Collision Handling ---

function handleCollision(entity, player, particles, cameraSpeed, gameOverCallback) {
    if (entity.type === 'otiot') {
        // --- CORE FIX: Only sacred letters have a collision effect ---
        if (entity.isSacred) {
            player.combo++;
            player.tikkun = Math.min(player.maxTikkun, player.tikkun + 5 + player.combo * 0.5);
            State.updateAscension(player.combo * 2);
            createExplosion(entity.x, entity.y, cameraSpeed, particles);
            entity.toRemove = true; // Mark for removal
        }
        // Non-sacred letters now do absolutely nothing upon collision. This removes the gray particles and the lag.
    } else if (entity.type === 'chai' || entity.type === 'tzomeach') {
        gameOverCallback();
    }
}

// --- Particle Effects ---

function createExplosion(x, y, cameraSpeed, particles) {
    for (let j = 0; j < 60; j++) {
        particles.push(new Particle({
            x, y,
            color: `hsl(${45 + Math.random()*15}, 100%, ${60 + Math.random()*40}%)`,
            size: Math.random() * 5 + 1,
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.5) * 18 - cameraSpeed,
            life: 70 + Math.random() * 30,
            drag: 0.96,
            gravity: 0.25
        }));
    }
}

// --- Global Entity Functions ---

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