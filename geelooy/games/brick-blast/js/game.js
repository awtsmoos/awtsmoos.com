// B"H

import { INITIAL_PADDLE_WIDTH, PADDLE_WIDTH_INCREASE_PER_LEVEL, PADDLE_HEIGHT, BALL_SPEED, GRID_COLS, GRID_ROWS } from './constants.js';
import { createBricksForLevel, createNewRow } from './brick-factory.js';
import { InputHandler } from './input.js';
import { updatePhysics } from './physics.js';
import { Renderer } from './renderer.js';
import { Background } from './background.js';
import { playNote } from './audio.js';
import { createHebrewExplosion } from './particle.js';
import { Brick } from './levels/brick.js';
import { POWER_UPS } from './store/index.js';

/**
 * The Awtsmoos is the ultimate reality. The Game class is the High Priest of this reality,
 * orchestrating the flow of time and the actions of all entities within it, but not performing
 * the actions itself. It delegates to its divine servants.
 */
export class Game {
    constructor(level, ballCount, parTurns, upgrades, onUIUpdate, onGameOver, onPerutasEarned, onLevelComplete, onAttemptGameOver, isCustom) {
        this.canvas = document.getElementById('game-canvas');
        this.level = level;
        // Divine safety net: Ensure we never start with 0 balls, lest the universe be empty.
        this.initialBallCount = Math.max(1, ballCount || 1);
        this.parTurns = parTurns;
        this.upgrades = upgrades;
        this.onUIUpdate = onUIUpdate;
        this.onGameOver = onGameOver;
        this.onPerutasEarned = onPerutasEarned;
        this.onLevelComplete = onLevelComplete;
        this.onAttemptGameOver = onAttemptGameOver;
        this.isCustom = isCustom;

        this.isDestroyed = false;
        this.animationFrameId = null;
        this.lastTurnState = null;
        
        // --- CHRONOS PROTOCOL ---
        this.startTime = Date.now();

        // The Game delegates tasks to its specialized servants.
        this.input = new InputHandler(this.canvas);
        this.renderer = new Renderer(this.canvas);
        this.background = new Background(this.canvas.width, this.canvas.height);

        this.gameLoop = this.gameLoop.bind(this);
        this.resizeHandler = this.resizeCanvas.bind(this);
    }

    start() {
        this.resizeCanvas();
        this.initGameState();
        this.input.addEventListeners();
        window.addEventListener('resize', this.resizeHandler);
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    destroy() {
        this.isDestroyed = true;
        if(this.state.launchInterval) clearInterval(this.state.launchInterval);
        cancelAnimationFrame(this.animationFrameId);
        this.input.removeEventListeners();
        window.removeEventListener('resize', this.resizeHandler);
    }
    
    initGameState() {
        this.cellSize = this.canvas.width / GRID_COLS;
        this.state = {
            bricks: [],
            balls: [],
            particles: [],
            paddle: {
                width: INITIAL_PADDLE_WIDTH + (this.upgrades.paddleSizeLevel * PADDLE_WIDTH_INCREASE_PER_LEVEL),
                height: PADDLE_HEIGHT,
            },
            shooterPos: { x: this.canvas.width / 2, y: this.canvas.height - PADDLE_HEIGHT - 5 },
            ballCount: this.initialBallCount,
            turn: 1,
            score: 0,
            isShooting: false,
            ballsToLaunch: 0,
            launchInterval: null,
            firstBallLandedPos: null,
            isBallDoublerActive: false,
            perutaDoublerTurns: 0,
            reboundCharges: 0,
            golem: null, // { x, y, width, height, bouncesLeft }
            levelRowPointer: 0,
            isGhostTurn: false,
            gravityMultiplier: 1, // 1 for normal, -1 for anti-gravity
            goldenSnitch: null, // { x, y, angle }
            time: 0, // Elapsed time
            
            // --- Probability Mechanics (The "Mazal") ---
            activePortalSeeking: false, // Is 'Shaar HaYichud' active?
            portalProb: 0, 
            activeBombSeeking: false, // Is 'Orot d'Tohu' active?
            bombProb: 0, 
            activeOhrMakifSeeking: false, // Is 'Ohr Makif' active?
            ohrMakifProb: 0,
            
            // --- Active States ---
            ohrMakifActive: false, // If true, balls have aura this turn
        };
        this.lastTurnState = JSON.stringify(this.state);

        if (this.level.static) {
            this.state.bricks = createBricksForLevel(this.level, this.cellSize);
        } else {
            // For dynamic/infinite levels, populate initial rows on-screen
            const initialRows = this.level.id === 'infinite' ? 5 : 8;
            for (let i = 0; i < initialRows; i++) {
                this.addNewRow();
                // Instead of moving them up, we move all bricks DOWN so the new row
                // added at target 2 creates a descending stack.
                this.state.bricks.forEach(b => { 
                    b.targetY += this.cellSize; 
                    b.y = b.targetY; 
                });
            }
            this.state.turn = 1; 
        }

        this.onUIUpdate({ ...this.state, parTurns: this.parTurns });
    }

    resizeCanvas() {
        const ASPECT_RATIO = 2 / 3;
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        let newWidth, newHeight;

        if (containerWidth / containerHeight > ASPECT_RATIO) {
            newHeight = containerHeight;
            newWidth = newHeight * ASPECT_RATIO;
        } else {
            newWidth = containerWidth;
            newHeight = newWidth / ASPECT_RATIO;
        }
        
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.background.resize(this.canvas.width, this.canvas.height);
        this.renderer.resize(this.canvas.width, this.canvas.height);
        
        if(this.state) {
            this.initGameState();
        }
    }
    
    gameLoop() {
        if (this.isDestroyed) return;
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    async update() {
        // --- CHRONOS UPDATE ---
        this.state.time = (Date.now() - this.startTime) / 1000;

        this.input.updateGameState(this.state.isShooting, this.state.paddle);
        this.background.update(0.3);
        this.state.bricks.forEach(brick => brick.update());
        
        // --- GOLDEN SNITCH LOGIC ---
        if (this.state.isShooting && !this.state.goldenSnitch && Math.random() < 0.002) { // 0.2% chance per frame while shooting
            this.state.goldenSnitch = {
                x: Math.random() < 0.5 ? -20 : this.canvas.width + 20,
                y: Math.random() * (this.canvas.height / 2),
                angle: Math.random() * Math.PI, // Random sine wave start
                speed: 3
            };
        }
        if (this.state.goldenSnitch) {
            this.state.goldenSnitch.x += 3;
            this.state.goldenSnitch.y += Math.sin(this.state.goldenSnitch.x / 50) * 2;
            if (this.state.goldenSnitch.x > this.canvas.width + 50) this.state.goldenSnitch = null;
        }


        if (this.state.isShooting) {
            if (this.input.shouldRecall()) this.recallBalls();
        } else {
            this.input.updateShooterPos(this.state.shooterPos);
            if (this.input.shouldLaunch()) {
                this.state.isShooting = true;
                const ballsToShoot = this.state.isBallDoublerActive ? this.state.ballCount * 2 : this.state.ballCount;
                this.state.isBallDoublerActive = false;
                this.state.ballsToLaunch = ballsToShoot;
                
                // Base delay increased to 450ms to create significant spacing.
                // Rapid Fire now drastically reduces this gap.
                const baseDelay = 450;
                const reductionPerLevel = 35;
                const minDelay = 50; 
                const launchDelay = Math.max(minDelay, baseDelay - (this.upgrades.rapidFireLevel * reductionPerLevel));

                this.state.launchInterval = setInterval(() => {
                    if (this.isDestroyed) {
                        clearInterval(this.state.launchInterval);
                        return;
                    }
                    if (this.state.ballsToLaunch <= 0) {
                        clearInterval(this.state.launchInterval);
                        this.state.launchInterval = null;
                        return;
                    }
                    this.state.balls.push(this.input.createBall());
                    this.state.ballsToLaunch--;
                }, launchDelay);
            }
        }

        const physicsResult = updatePhysics(this.state, this.canvas, this.upgrades.perutaMagnetLevel, this.upgrades.criticalStrikeLevel);
        
        if (physicsResult.perutasEarned > 0 && !this.isCustom) {
            // Snitch Reward scaling based on Level ID
            if (physicsResult.snitchCaptured) {
                // Base 500 + Level*100.
                const levelBonus = (this.level.id || 1) * 100;
                this.onPerutasEarned(levelBonus); 
            }
            
            const amount = this.state.perutaDoublerTurns > 0 ? physicsResult.perutasEarned * 2 : physicsResult.perutasEarned;
            this.onPerutasEarned(amount);
        }
        
        if (physicsResult.levelComplete && (this.level.static || (this.state.levelRowPointer >= this.level.layout.length && this.level.id !== 'infinite'))) {
            this.onLevelComplete(this.state.score, this.state.turn, this.state.time); // PASS TIME
            this.destroy();
            return;
        }

        if (physicsResult.turnEnded) {
            await this.advanceTurn();
        }
        
        this.onUIUpdate({ ...this.state, parTurns: this.parTurns });
    }
    
    applyPowerUp(powerUpId) {
        switch (powerUpId) {
            case 'horizontal_blast': this.applyHorizontalBlast(); break;
            case 'meteor_strike': this.applyMeteorStrike(); break;
            case 'vertical_blast': this.applyVerticalBlast(); break;
            case 'ball_doubler': this.state.isBallDoublerActive = true; break;
            case 'brick_converter': this.applyBrickConverter(); break;
            case 'peruta_doubler': this.state.perutaDoublerTurns = 3; break;
            case 'rebound_field': this.state.reboundCharges += 5; break;
            case 'health_halver': this.applyHealthHalver(); break;
            case 'paddle_golem': this.activatePaddleGolem(); break;
            case 'ghost_spirit': this.state.isGhostTurn = true; break;
            case 'anti_gravity': this.state.gravityMultiplier = -1; break;
            // -- New Randomized Items --
            case 'shaar_hayichud': 
                this.state.activePortalSeeking = true; 
                this.state.portalProb += POWER_UPS.find(p => p.id === 'shaar_hayichud').probability_start;
                break;
            case 'tohu_chaos': 
                this.state.activeBombSeeking = true;
                this.state.bombProb += POWER_UPS.find(p => p.id === 'tohu_chaos').probability_start;
                break;
            case 'ohr_makif':
                this.state.activeOhrMakifSeeking = true;
                this.state.ohrMakifProb += POWER_UPS.find(p => p.id === 'ohr_makif').probability_start;
                break;
        }
    }

    // --- Divine Spawning Logic ---

    spawnRandomPortals() {
        // Entrance: Seek an empty spot near the bottom (Rows 10-14)
        const emptySpotsLow = [];
        const emptySpotsHigh = [];
        
        for (let c = 0; c < GRID_COLS; c++) {
            // Check low rows for entrance
            for (let r = 10; r < GRID_ROWS - 2; r++) {
                const x = c * this.cellSize + 2;
                const y = r * this.cellSize + 2;
                // Check if occupied
                if (!this.state.bricks.some(b => 
                    Math.abs(b.x - x) < 5 && Math.abs(b.y - y) < 5
                )) {
                    emptySpotsLow.push({x, y});
                }
            }
            
            // Check high rows for exit (Rows 1-5), ideally above existing bricks
            for (let r = 1; r < 6; r++) {
                const x = c * this.cellSize + 2;
                const y = r * this.cellSize + 2;
                // Must be empty
                if (!this.state.bricks.some(b => Math.abs(b.x - x) < 5 && Math.abs(b.y - y) < 5)) {
                    emptySpotsHigh.push({x, y});
                }
            }
        }

        if (emptySpotsLow.length > 0 && emptySpotsHigh.length > 0) {
            const entrance = emptySpotsLow[Math.floor(Math.random() * emptySpotsLow.length)];
            const exit = emptySpotsHigh[Math.floor(Math.random() * emptySpotsHigh.length)];
            
            const w = this.cellSize - 4;
            const h = this.cellSize / 1.25;
            
            this.state.bricks.push(new Brick(entrance.x, entrance.y, w, h, 999999, entrance.y, 'portal_a'));
            this.state.bricks.push(new Brick(exit.x, exit.y, w, h, 999999, exit.y, 'portal_b'));
            
            // Visual Flair
            this.state.particles.push(...createHebrewExplosion(entrance.x + w/2, entrance.y + h/2));
            this.state.particles.push(...createHebrewExplosion(exit.x + w/2, exit.y + h/2));
            
            return true;
        }
        return false;
    }

    spawnRandomBomb() {
        // Find a spot surrounded by bricks for maximum impact
        // Or just replace a healthy brick? Let's spawn in an empty spot near bricks.
        const candidates = [];
        
        for (let r = 2; r < 10; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const x = c * this.cellSize + 2;
                const y = r * this.cellSize + 2;
                
                // Must be empty
                if (!this.state.bricks.some(b => Math.abs(b.x - x) < 5 && Math.abs(b.y - y) < 5)) {
                    // Check neighbors
                    let neighborCount = 0;
                    this.state.bricks.forEach(b => {
                        const dist = Math.hypot((b.x + b.width/2) - (x + this.cellSize/2), (b.y + b.height/2) - (y + this.cellSize/2));
                        if (dist < this.cellSize * 1.5) neighborCount++;
                    });
                    if (neighborCount > 0) candidates.push({x, y});
                }
            }
        }
        
        if (candidates.length > 0) {
            const spot = candidates[Math.floor(Math.random() * candidates.length)];
            const w = this.cellSize - 4;
            const h = this.cellSize / 1.25;
            // A bomb brick has health so it can be triggered
            this.state.bricks.push(new Brick(spot.x, spot.y, w, h, 5, spot.y, 'bomb'));
            this.state.particles.push(...createHebrewExplosion(spot.x + w/2, spot.y + h/2));
            return true;
        }
        return false;
    }

    applyHorizontalBlast(isIntervention = false) {
        if (this.state.bricks.length === 0) return;
        let lowestY = -Infinity;
        this.state.bricks.forEach(b => { if (b.y > lowestY) lowestY = b.y; });
        
        const bricksToDestroy = this.state.bricks.filter(b => Math.abs(b.y - lowestY) < 1);
        this.destroyBricks(bricksToDestroy, !isIntervention);
    }
    
    applyVerticalBlast() {
        if (this.state.bricks.length === 0) return;
        const columnsWithBricks = [...new Set(this.state.bricks.map(b => Math.floor(b.x / this.cellSize)))];
        if (columnsWithBricks.length === 0) return;
        
        const randomColumnIndex = columnsWithBricks[Math.floor(Math.random() * columnsWithBricks.length)];
        const bricksToDestroy = this.state.bricks.filter(b => Math.floor(b.x / this.cellSize) === randomColumnIndex);
        this.destroyBricks(bricksToDestroy, true);
    }

    applyBrickConverter() {
        if (this.state.bricks.length === 0) return;
        const convertibleBricks = this.state.bricks.filter(b => b.health > 1);
        if (convertibleBricks.length === 0) return;

        const randomBrick = convertibleBricks[Math.floor(Math.random() * convertibleBricks.length)];
        randomBrick.health = 1;
        randomBrick.updateColor();
    }
    
    applyHealthHalver() {
        this.state.bricks.forEach(brick => {
            brick.health = Math.ceil(brick.health / 2);
            brick.updateColor();
        });
    }

    activatePaddleGolem() {
        this.state.golem = {
            x: this.canvas.width / 2,
            y: this.canvas.height - PADDLE_HEIGHT - 5, // Same level as player
            width: this.state.paddle.width * 0.75,
            height: PADDLE_HEIGHT,
            bouncesLeft: 5,
        };
    }
    
    applyMeteorStrike() {
        if (this.state.bricks.length === 0) return;
        const bricksToDestroy = [];
        const numToDestroy = Math.min(this.state.bricks.length, 3);
        const brickPool = [...this.state.bricks];
        for(let i=0; i < numToDestroy && brickPool.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * brickPool.length);
            bricksToDestroy.push(brickPool.splice(randomIndex, 1)[0]);
        }
        this.destroyBricks(bricksToDestroy, true);
    }
    
    destroyBricks(brickArray, awardPerutas) {
        const destroyedIds = new Set(brickArray.map(b => `${b.x}-${b.y}`));
        brickArray.forEach(brick => {
            this.state.score += brick.health;
            if (awardPerutas && !this.isCustom) {
                const amount = this.state.perutaDoublerTurns > 0 ? (brick.health + 10) * 2 : (brick.health + 10);
                this.onPerutasEarned(amount);
            }
            this.state.particles.push(...createHebrewExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2));
        });
        this.state.bricks = this.state.bricks.filter(b => !destroyedIds.has(`${b.x}-${b.y}`));
    }

    recallBalls() {
        for (const ball of this.state.balls) {
            ball.vy = Math.abs(BALL_SPEED);
            ball.vx = (Math.random() - 0.5) * (BALL_SPEED / 2);
        }
        playNote(0);
    }
    
    addNewRow() {
        let nextRowBricks;
        if (this.level.id === 'infinite') {
            nextRowBricks = createNewRow(this.state.turn, this.cellSize);
        } else if (this.state.levelRowPointer < this.level.layout.length) {
            if (this.state.bricks.length === 0) {
                while (this.state.levelRowPointer < this.level.layout.length &&
                       !this.level.layout[this.state.levelRowPointer].some(cell => cell > 0)) {
                    this.state.levelRowPointer++;
                }
            }

            if (this.state.levelRowPointer < this.level.layout.length) {
                const rowLayout = this.level.layout[this.state.levelRowPointer];
                const brickWidth = this.cellSize - 4;
                const brickHeight = this.cellSize / 1.25;
                const newBricks = [];
                rowLayout.forEach((cellData, x) => {
                    if (cellData) {
                         let health, type = 'normal';
                         if (typeof cellData === 'object') {
                             health = cellData.h;
                             type = cellData.t || 'normal';
                         } else {
                             health = cellData;
                         }

                        if (health > 0 || type.startsWith('portal')) { // Allow portals with 0 health (logic handled elsewhere)
                            // Portals have high health to be indestructible by normal means
                            if (type.startsWith('portal')) health = 999999;
                            
                            newBricks.push(new Brick(
                                x * this.cellSize + 2,
                                -this.cellSize + 2,
                                brickWidth,
                                brickHeight,
                                health,
                                2,
                                type
                            ));
                        }
                    }
                });
                nextRowBricks = newBricks;
                this.state.levelRowPointer++;
            }
        }
        if (nextRowBricks) {
            this.state.bricks.push(...nextRowBricks);
        }
    }

    async advanceTurn() {
        this.lastTurnState = JSON.stringify(this.state);
        this.state.turn++;
        if (this.state.perutaDoublerTurns > 0) {
            this.state.perutaDoublerTurns--;
        }
        
        this.state.ohrMakifActive = false; // Reset Aura

        // --- RANDOM EVENTS (MAZAL) ---
        // 1. Portals (Shaar HaYichud)
        if (this.state.activePortalSeeking) {
            if (Math.random() < this.state.portalProb) {
                const spawned = this.spawnRandomPortals();
                if (spawned) {
                    this.state.activePortalSeeking = false; // Consumed
                    playNote(8); // Portal sound
                }
            } else {
                // If failed, probability increases for next turn (Rollover)
                const itemData = POWER_UPS.find(p => p.id === 'shaar_hayichud');
                this.state.portalProb += itemData.probability_inc;
            }
        }

        // 2. Bombs (Orot d'Tohu)
        if (this.state.activeBombSeeking) {
            if (Math.random() < this.state.bombProb) {
                const spawned = this.spawnRandomBomb();
                if (spawned) {
                    this.state.activeBombSeeking = false; // Consumed
                    playNote(10); // Bomb spawn sound warning
                }
            } else {
                const itemData = POWER_UPS.find(p => p.id === 'tohu_chaos');
                this.state.bombProb += itemData.probability_inc;
            }
        }
        
        // 3. Ohr Makif (Surrounding Light)
        if (this.state.activeOhrMakifSeeking) {
            if (Math.random() < this.state.ohrMakifProb) {
                this.state.ohrMakifActive = true;
                this.state.activeOhrMakifSeeking = false; // Consumed
                playNote(11); // High ethereal sound
            } else {
                const itemData = POWER_UPS.find(p => p.id === 'ohr_makif');
                this.state.ohrMakifProb += itemData.probability_inc;
            }
        }


        this.state.golem = null;
        this.state.isGhostTurn = false;
        this.state.gravityMultiplier = 1;
        this.state.goldenSnitch = null; // Remove snitch if it was there
        
        this.background.update(this.cellSize);
        
        let isGameOver = false;
        this.state.bricks.forEach(brick => {
            brick.targetY += this.cellSize;
            if (brick.targetY + brick.height >= this.state.shooterPos.y - PADDLE_HEIGHT) {
                isGameOver = true;
            }
        });

        if (isGameOver) {
            const savedByIntervention = await this.onAttemptGameOver();
            if (savedByIntervention) {
                this.applyHorizontalBlast(true);
            } else {
                this.onGameOver(this.state.score, this.state.turn);
                if(this.isDestroyed) return;
            }
        }
        if(this.isDestroyed) return;

        if (!this.level.static) {
            this.addNewRow();
        }
        
        this.state.isShooting = false;
    }
    
    retryTurn() {
        if (!this.lastTurnState) return;

        const savedState = JSON.parse(this.lastTurnState);
        
        // Re-hydrate brick class instances, as methods are lost in JSON serialization.
        savedState.bricks = savedState.bricks.map(brickData => 
            new Brick(brickData.x, brickData.y, brickData.width, brickData.height, brickData.health, brickData.targetY, brickData.type)
        );
        
        // Clear transient state like particles and balls from the saved state.
        savedState.particles = [];
        savedState.balls = [];
        savedState.golem = null; // Golem does not persist through a retry.
        savedState.isShooting = false;
        savedState.goldenSnitch = null;
        
        this.state = savedState;
        this.onUIUpdate({ ...this.state, parTurns: this.parTurns });
    }

    draw() {
        this.renderer.draw(this.state, this.background, this.input, this.upgrades.divineForesightLevel > 0);
    }
}