// B"H
// B"H

const GEMATRIA_VALUES = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 
    'צ': 90, 'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
};
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('score');
        this.livesEl = document.getElementById('lives');
        this.levelEl = document.getElementById('level');
        this.messageEl = document.getElementById('message');

        this.canvas.width = MAZE_WIDTH * TILE_SIZE;
        this.canvas.height = MAZE_HEIGHT * TILE_SIZE;

        this.input = new InputHandler();
        this.lastFrameTime = 0;
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.setupLevel();
    }

    setupLevel() {
        this.maze = generateFullMaze(MAZE_WIDTH, MAZE_HEIGHT);
        this.letters = [];
        this.tanyas = [];
        let letterIndex = 0;

        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                if (this.maze[y][x] === 0) {
                    this.letters.push({ x, y, char: ALEPH_BET[letterIndex % ALEPH_BET.length] });
                    letterIndex++;
                }
            }
        }

        this.tanyas.push({ x: 1, y: 1 });
        this.tanyas.push({ x: MAZE_WIDTH - 2, y: 1 });
        this.tanyas.push({ x: 1, y: MAZE_HEIGHT - 2 });
        this.tanyas.push({ x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 });
        this.tanyas.forEach(t => this.letters = this.letters.filter(l => !(l.x === t.x && l.y === t.y)));
        
        this.neshama = new Neshama(1, 1, NESHAMA_SPEED);
        this.klipot = KLIPOT_CONFIG.map(cfg => new Klipah(cfg.startTile.x, cfg.startTile.y, KLIPAH_SPEED, cfg.color));
        
        this.updateUI();
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(currentTime) {
        if (this.lastFrameTime === 0) this.lastFrameTime = currentTime;
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        const safeDeltaTime = Math.min(deltaTime, 0.1);
        this.updateNeshama(safeDeltaTime);
        this.klipot.forEach(klipah => this.updateKlipah(klipah, safeDeltaTime));
        this.checkCollisions();
        this.neshama.updateAnimation();
        this.checkPowerUpTimer();
    }

    updateNeshama(deltaTime) {
        this.moveEntity(this.neshama, this.input.nextDirection, deltaTime);
    }

    updateKlipah(klipah, deltaTime) {
        if (klipah.isAtTileCenter(deltaTime)) {
            this.updateKlipahAI(klipah);
        }
        this.moveEntity(klipah, klipah.direction, deltaTime);
    }
    
    updateKlipahAI(klipah) {
        const possibleDirections = [];
        const { x: dirX, y: dirY } = klipah.direction;
        
        if (!this.isWall(klipah.tileX + 1, klipah.tileY) && dirX !== -1) possibleDirections.push({ x: 1, y: 0 });
        if (!this.isWall(klipah.tileX - 1, klipah.tileY) && dirX !== 1) possibleDirections.push({ x: -1, y: 0 });
        if (!this.isWall(klipah.tileX, klipah.tileY + 1) && dirY !== -1) possibleDirections.push({ x: 0, y: 1 });
        if (!this.isWall(klipah.tileX, klipah.tileY - 1) && dirY !== 1) possibleDirections.push({ x: 0, y: -1 });

        if (possibleDirections.length > 0) {
            let bestDirection;
            if (klipah.isVulnerable) {
                bestDirection = this.getFleeDirection(klipah, possibleDirections);
            } else {
                bestDirection = this.getChaseDirection(klipah, possibleDirections);
            }
            klipah.direction = bestDirection;
        } else if (dirX !== 0 || dirY !== 0) {
            klipah.direction = { x: -dirX, y: -dirY };
        } else {
             if (!this.isWall(klipah.tileX + 1, klipah.tileY)) klipah.direction = { x: 1, y: 0 };
        }
    }

    isWall(x, y) {
        const tunnelY = Math.floor(MAZE_HEIGHT / 2);
        if (y === tunnelY && (x < 0 || x >= MAZE_WIDTH)) return false;
        if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return true;
        return this.maze[y][x] === 1;
    }
    
    
    
    // B"H

    moveEntity(entity, intendedDirection, deltaTime) {
        const tunnelY = Math.floor(MAZE_HEIGHT / 2);
        if (entity.tileY === tunnelY) {
            if (entity.px > MAZE_WIDTH * TILE_SIZE) entity.px = -TILE_SIZE + 1;
            if (entity.px < -TILE_SIZE) entity.px = MAZE_WIDTH * TILE_SIZE - 1;
        }

        // --- Decision Logic ---
        // At a tile center, we can make a decision about which way to go next.
        // We now pass deltaTime to the check to use our new dynamic buffer.
        if (entity.isAtTileCenter(deltaTime)) {
            // Snap to the grid to correct any minor floating point errors.
            entity.px = entity.tileX * TILE_SIZE;
            entity.py = entity.tileY * TILE_SIZE;

            // PRIORITY 1: Check if the INTENDED direction is a valid path.
            if (!this.isWall(entity.tileX + intendedDirection.x, entity.tileY + intendedDirection.y)) {
                entity.direction = { ...intendedDirection };
            }
            // PRIORITY 2: If not, check if we can continue in our CURRENT direction.
            else if (!this.isWall(entity.tileX + entity.direction.x, entity.tileY + entity.direction.y)) {
                // Do nothing; allow the entity to continue on its current path.
            }
            // PRIORITY 3: If both paths are blocked, we must stop.
            else {
                entity.direction = { x: 0, y: 0 };
            }
        }
        
        // Anti-drift logic: ensures movement is locked to the grid axis.
        if (entity.direction.x !== 0) { // Moving horizontally
            entity.py = entity.tileY * TILE_SIZE;
        } else if (entity.direction.y !== 0) { // Moving vertically
            entity.px = entity.tileX * TILE_SIZE;
        }
        
        // Apply movement based on the final direction
        entity.px += entity.direction.x * entity.speed * deltaTime;
        entity.py += entity.direction.y * entity.speed * deltaTime;

        // Update tile position based on new pixel coordinates
        entity.tileX = Math.floor((entity.px + TILE_SIZE / 2) / TILE_SIZE);
        entity.tileY = Math.floor((entity.py + TILE_SIZE / 2) / TILE_SIZE);
    }



    getChaseDirection(klipah, directions) {
        let bestDir = directions[Math.floor(Math.random() * directions.length)];
        let minDistance = Infinity;
        for (const dir of directions) {
            const dist = Math.hypot((klipah.tileX + dir.x) - this.neshama.tileX, (klipah.tileY + dir.y) - this.neshama.tileY);
            if (dist < minDistance) {
                minDistance = dist;
                bestDir = dir;
            }
        }
        return bestDir;
    }

    getFleeDirection(klipah, directions) {
        let bestDir = directions[0];
        let maxDistance = -1;
        const fleeTarget = {x: this.neshama.tileX < MAZE_WIDTH / 2 ? MAZE_WIDTH : 0, y: this.neshama.tileY < MAZE_HEIGHT / 2 ? MAZE_HEIGHT : 0};
        for (const dir of directions) {
            const dist = Math.hypot((klipah.tileX + dir.x) - fleeTarget.x, (klipah.tileY + dir.y) - fleeTarget.y);
            if (dist > maxDistance) {
                maxDistance = dist;
                bestDir = dir;
            }
        }
        return bestDir;
    }

    // B"H

    checkCollisions() {
        const { tileX, tileY } = this.neshama;

        // ** THE CHANGE IS HERE **
        // Check for letter collision and add score based on Gematria.
        this.letters = this.letters.filter(l => {
            if (l.x === tileX && l.y === tileY) {
                // Look up the letter's value in our new map. Default to 10 if not found.
                this.score += GEMATRIA_VALUES[l.char] || 10; 
                this.updateUI(); 
                return false;
            } 
            return true;
        });

        // Check for Tanya collision
        this.tanyas = this.tanyas.filter(t => {
            if (t.x === tileX && t.y === tileY) {
                this.score += 50; 
                this.powerUpNeshama(); 
                return false;
            } 
            return true;
        });

        // Check for Klipah collision
        this.klipot.forEach(k => {
            if (k.tileX === tileX && k.tileY === tileY) {
                if (k.isVulnerable) {
                    this.score += 200; 
                    this.updateUI(); 
                    this.resetKlipah(k);
                } else if(!this.invincible) { 
                    this.handleLifeLost(); 
                }
            }
        });
        
        // Check for level completion
        if (this.letters.length === 0) {
            this.level++; 
            this.showMessage(`Level ${this.level}`); 
            this.setupLevel();
        }
    }

    powerUpNeshama() {
        this.neshama.isPoweredUp = true;
        this.neshama.powerUpTimer = Date.now() + NESHAMA_POWERUP_DURATION;
        this.klipot.forEach(k => k.isVulnerable = true);
    }
    
    checkPowerUpTimer() {
        if (this.neshama.isPoweredUp && Date.now() > this.neshama.powerUpTimer) {
            this.neshama.isPoweredUp = false;
            this.klipot.forEach(k => k.isVulnerable = false);
        }
    }
    
    resetKlipah(klipah) {
        const config = KLIPOT_CONFIG.find(c => c.color === klipah.color);
        klipah.tileX = config.startTile.x;
        klipah.tileY = config.startTile.y;
        klipah.px = klipah.tileX * TILE_SIZE;
        klipah.py = klipah.tileY * TILE_SIZE;
        klipah.isVulnerable = false;
        klipah.direction = {x: 0, y: 0};
    }

    handleLifeLost() {
        this.lives--;
        this.updateUI();
        this.invincible = true;

        if (this.lives <= 0) {
            this.showMessage("Game Over", false); 
            this.resetGame();
        } else {
            this.showMessage("-1 Life");
            this.neshama = new Neshama(1, 1, NESHAMA_SPEED);
            this.klipot.forEach(k => this.resetKlipah(k));
            this.input.direction = { x: 0, y: 0 };
            this.input.nextDirection = { x: 0, y: 0 };
        }

        setTimeout(() => { this.invincible = false; }, 2000);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMaze();
        this.drawCollectibles(this.tanyas, 'gold', TILE_SIZE / 3);
        this.drawLetters();
        if(!this.invincible || Date.now() % 200 < 100) {
            this.neshama.draw(this.ctx);
        }
        this.klipot.forEach(k => k.draw(this.ctx));
    }

    drawMaze() {
        for (let y = 0; y < MAZE_HEIGHT; y++) {
            for (let x = 0; x < MAZE_WIDTH; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillStyle = 'blue';
                    this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
    drawCollectibles(items, color, size) {
        this.ctx.fillStyle = color;
        items.forEach(item => {
            this.ctx.beginPath();
            this.ctx.arc(item.x * TILE_SIZE + TILE_SIZE / 2, item.y * TILE_SIZE + TILE_SIZE / 2, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    drawLetters() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${TILE_SIZE * 0.7}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.letters.forEach(letter => {
            this.ctx.fillText(letter.char, letter.x * TILE_SIZE + TILE_SIZE / 2, letter.y * TILE_SIZE + TILE_SIZE / 2 + 2);
        });
    }
    updateUI() {
        this.scoreEl.textContent = this.score;
        this.livesEl.textContent = this.lives;
        this.levelEl.textContent = this.level;
    }
    showMessage(text, temporary = true) {
        this.messageEl.textContent = text;
        this.messageEl.style.display = 'block';
        if (temporary) {
            setTimeout(() => { this.messageEl.style.display = 'none'; }, 1500);
        }
    }
}

const game = new Game();
game.start();