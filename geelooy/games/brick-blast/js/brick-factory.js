// B"H

import { Brick } from './levels/brick.js';
import { GRID_COLS } from './constants.js';

/**
 * The Brick Factory is a divine workshop where the vessels of the game world are forged.
 * It translates abstract blueprints into tangible, living bricks.
 */


/**
 * From a divine blueprint (a level layout), this function materializes the bricks into the world.
 * @param {import('./level-loader.js').Level} level The divine blueprint for the level.
 * @param {number} cellSize The fundamental unit of space in our world.
 * @returns {Array<Brick>} An array of brick objects, the newly created inhabitants of our world.
 */
export function createBricksForLevel(level, cellSize) {
    const bricks = [];
    const brickWidth = cellSize - 4;
    // Bricks are given a generous height to properly contain their sacred inscriptions.
    const brickHeight = cellSize / 1.25; 

    level.layout.forEach((row, y) => {
        row.forEach((cellData, x) => {
            if (cellData) {
                let health, type = 'normal';
                
                if (typeof cellData === 'object') {
                    health = cellData.h;
                    type = cellData.t || 'normal';
                } else {
                    health = cellData;
                }

                if (health > 0) {
                    const finalHealth = Math.ceil(health);
                    const brickY = y * cellSize + 2;
                    bricks.push(new Brick(
                        x * cellSize + 2,
                        brickY,
                        brickWidth,
                        brickHeight,
                        finalHealth,
                        brickY, // targetY is the same as initial Y for the first set
                        type
                    ));
                }
            }
        });
    });
    return bricks;
}

/**
 * Forges a new row of bricks to descend from the heavens at the start of a new turn in infinite mode.
 * @param {number} turn The current turn, used to scale the life force of the new creations.
 * @param {number} cellSize The fundamental unit of space in our world.
 * @returns {Array<Brick>} An array of new brick objects, poised to enter the world.
 */
export function createNewRow(turn, cellSize) {
    const bricks = [];
    const brickWidth = cellSize - 4;
    const brickHeight = cellSize / 1.25;
    
    // B"H - Divine Guarantee: Ensure at least one brick in every new row
    let hasBrick = false;
    const newRowLayout = Array(GRID_COLS).fill(null).map((_, index) => {
        const rand = Math.random();
        // 70% chance of a brick, OR if it's the last cell and we have nothing yet
        if (rand < 0.7 || (!hasBrick && index === GRID_COLS - 1)) {
            hasBrick = true;
            // 5% chance of a bomb, 2% chance of a Prism
            const typeRand = Math.random();
            if (typeRand < 0.05) return { h: 10, t: 'bomb' };
            if (typeRand < 0.07) return { h: 1, t: 'prism' }; // Prism chance adjusted slightly
            return 1; 
        }
        return null;
    });

    newRowLayout.forEach((val, x) => {
        if (val) {
            let health, type = 'normal';
            if (typeof val === 'object') {
                health = val.t === 'prism' ? 1 : Math.ceil(turn * 0.5); // Prisms are fragile
                type = val.t;
            } else {
                health = Math.ceil(turn * (Math.random() * 0.5 + 0.75));
            }

            const startY = -cellSize; // Start above the screen
            const targetY = 2; // Target the first row position
            bricks.push(new Brick(
                x * cellSize + 2,
                startY,
                brickWidth,
                brickHeight,
                health,
                targetY,
                type
            ));
        }
    });
    return bricks;
}