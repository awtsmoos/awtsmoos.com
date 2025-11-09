//B"H

import { TILE_SIZE, TOWER_TYPES, ENEMY_TYPES, MAPS } from './config.js';
import Tower from './tower.js';
import Enemy from './enemy.js';
import WaveManager from './wave.js';
import { setupUI } from './ui.js';
import { GroundEffect, LetterParticle } from './effects.js';

// --- Global State ---
let game = null;

// --- DOM Elements (will be assigned on page load) ---
let mainMenu, mapSelectionContainer, gameWrapper, gameOverScreen, canvas;

class Game {
    constructor(canvas, mapConfig) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = mapConfig;
        
        this.canvas.width = mapConfig.gridWidth * TILE_SIZE;
        this.canvas.height = mapConfig.gridHeight * TILE_SIZE;

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.groundEffects = [];
        this.particles = [];
        this.eventMessages = [];
        this.path = this.map.path;
        
        this.perutas = 200;
        this.health = 500; // Increased for better playability
        
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.ghostTower = null;
        
        this.waveManager = new WaveManager(this);
        this.isGameOver = false;
        this.animationFrameId = null;

        // UI elements
        this.perutasDisplay = document.getElementById('perutas');
        this.healthDisplay = document.getElementById('health');
        this.waveDisplay = document.getElementById('wave');
        this.modal = document.getElementById('in-game-modal');
        this.modalContent = document.getElementById('modal-content');
        this.finalWaveDisplay = document.getElementById('final-wave');
    }

    start() {
        this.reset();
        setupUI(this);
        this.updateUI();
        this.gameLoop();
    }
    
    reset() {
        this.isGameOver = false;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.groundEffects = [];
        this.particles = [];
        this.perutas = 200;
        this.health = 50; // Increased for better playability
        this.waveManager = new WaveManager(this);
        this.selectedTower = null;
        this.selectedTowerType = null;
        this.ghostTower = null;

        gameOverScreen.classList.add('hidden');
        this.hideModal();
        document.getElementById('start-wave').style.display = 'block';

        this.updateUI();
        this.updateWaveDisplay(0);
    }
    
    gameLoop() {
        if (this.isGameOver) {
            cancelAnimationFrame(this.animationFrameId);
            this.showGameOver();
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPath();
        
        this.updateAndDrawTowers();
        this.updateAndDrawEnemies();
        this.updateAndDrawProjectiles();
        this.updateAndDrawGroundEffects();
        this.updateAndDrawParticles();
        this.drawGhostTower();
        this.updateAndDrawEventMessages();

        if(this.selectedTower) this.drawTowerRange(this.selectedTower);

        this.waveManager.update();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    startNextWave() {
        if (this.isGameOver || this.waveManager.isWaveActive) return;
        this.waveManager.startNextWave();
        document.getElementById('start-wave').style.display = 'none';
        this.hideModal();
    }
    
    waveComplete() {
        this.perutas += 100 + this.waveManager.waveNumber * 10;
        this.updateUI();
        document.getElementById('start-wave').style.display = 'block';
    }

    takeDamage(amount = 1) {
        this.health -= amount;
        this.updateUI();
        if (this.health <= 0) {
            this.health = 0;
            this.isGameOver = true;
        }
    }

    showGameOver() {
        this.finalWaveDisplay.textContent = this.waveManager.waveNumber;
        gameOverScreen.classList.remove('hidden');
    }

    addTower(gridX, gridY, type) {
        const cost = TOWER_TYPES[type].cost;
        if (this.perutas >= cost) {
            const x = gridX * TILE_SIZE + TILE_SIZE / 2;
            const y = gridY * TILE_SIZE + TILE_SIZE / 2;
            this.towers.push(new Tower(x, y, type));
            this.perutas -= cost;
            
            this.selectedTowerType = null;
            this.ghostTower = null;
            document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
            
            this.updateUI();
        }
        this.hideModal();
    }
    
    getTowerAt(x, y) {
        for (const tower of this.towers) {
            if (Math.hypot(tower.x - x, tower.y - y) < TILE_SIZE / 2) {
                return tower;
            }
        }
        return null;
    }
    
    upgradeSelectedTower(stat) {
        if (!this.selectedTower) return;
        
        const config = TOWER_TYPES[this.selectedTower.type];
        let cost = 0;
        if (stat === 'damage') cost = config.upgradeCost.damage * (this.selectedTower.damageLevel);
        if (stat === 'speed') cost = config.upgradeCost.speed * (this.selectedTower.speedLevel);
        if (stat === 'range') cost = config.upgradeCost.range * (this.selectedTower.rangeLevel);

        if (this.perutas >= cost) {
            this.selectedTower.upgrade(stat);
            this.perutas -= cost;
            this.updateUI();
            this.showUpgradeModal(this.selectedTower);
        }
    }
    
    sellSelectedTower() {
        if (!this.selectedTower) return;
        
        let sellValue = Math.floor(this.selectedTower.cost / 2);
        const config = TOWER_TYPES[this.selectedTower.type];
        for(let i=1; i < this.selectedTower.damageLevel; i++) sellValue += Math.floor((config.upgradeCost.damage * i) / 2);
        for(let i=1; i < this.selectedTower.speedLevel; i++) sellValue += Math.floor((config.upgradeCost.speed * i) / 2);
        for(let i=1; i < this.selectedTower.rangeLevel; i++) sellValue += Math.floor((config.upgradeCost.range * i) / 2);
        
        this.perutas += sellValue;
        this.towers = this.towers.filter(t => t !== this.selectedTower);
        this.selectedTower = null;
        this.updateUI();
        this.hideModal();
    }

    handleProjectileHit(p, enemy, projectileIndex) {
        if (enemy.health <= 0) return;
    
        enemy.takeDamage(p.damage);
        if (p.slowFactor) enemy.applySlow(p.slowFactor, p.slowDuration);
    
        if (p.splashRadius) {
            this.enemies.forEach(otherEnemy => {
                if (otherEnemy !== enemy && otherEnemy.health > 0) {
                    const dist = Math.hypot(p.x - otherEnemy.x, p.y - otherEnemy.y);
                    if (dist < p.splashRadius) {
                        const splashDamage = p.damage * (1 - dist / p.splashRadius);
                        otherEnemy.takeDamage(splashDamage);
                    }
                }
            });
        }
        
        if (p.type === 'ground_aoe') {
            const newEffect = new GroundEffect(p.x, p.y, p.aoeRadius, p.aoeDuration, p.damage, 60);
            this.groundEffects.push(newEffect);
            this.projectiles.splice(projectileIndex, 1);
        } else if (p.type === 'chaining' && p.chainCount > 1) {
            p.chainCount--;
            p.damage *= 0.7; // Damage fall-off
            p.hitEnemies.push(enemy);
            let nextTarget = null;
            let closestDist = Infinity;
    
            this.enemies.forEach(potentialTarget => {
                if (potentialTarget.health > 0 && !p.hitEnemies.includes(potentialTarget)) {
                    const dist = Math.hypot(enemy.x - potentialTarget.x, enemy.y - potentialTarget.y);
                    if (dist < p.chainRange && dist < closestDist) {
                        closestDist = dist;
                        nextTarget = potentialTarget;
                    }
                }
            });
    
            if (nextTarget) p.target = nextTarget;
            else this.projectiles.splice(projectileIndex, 1);
        } else if (p.type === 'piercing') {
            p.pierceLimit--;
            p.hitEnemies.push(enemy);
            if (p.pierceLimit <= 0) this.projectiles.splice(projectileIndex, 1);
        } else {
            this.projectiles.splice(projectileIndex, 1);
        }
    
        if (enemy.health <= 0) {
            this.perutas += enemy.perutaValue;
            this.showEventMessage(`+${enemy.perutaValue}💰`, enemy);
            this.createLetterExplosion(enemy.x, enemy.y);
            
            if (enemy.children) {
                const enemyConfig = ENEMY_TYPES[enemy.children.type];
                for (let j = 0; j < enemy.children.count; j++) {
                    const child = new Enemy(enemyConfig, 1, this.path);
                    child.x = enemy.x + (Math.random() - 0.5) * 20;
                    child.y = enemy.y + (Math.random() - 0.5) * 20;
                    child.pathIndex = enemy.pathIndex;
                    this.enemies.push(child);
                }
            }
            this.enemies = this.enemies.filter(e => e !== enemy);
            this.updateUI();
        }
    }
    
    updateAndDrawProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (!p) continue;

            p.update();
            p.draw(this.ctx);

            for (const enemy of this.enemies) {
                if (enemy.health > 0 && !p.hitEnemies.includes(enemy)) {
                    const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
                    if (dist < TILE_SIZE / 2) {
                        this.handleProjectileHit(p, enemy, i);
                        if (p.type !== 'piercing' && p.type !== 'chaining') break;
                    }
                }
            }
            
            if (p && (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height)) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    createLetterExplosion(x, y) {
        const letters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
        const particleCount = 7 + Math.floor(Math.random() * 5); // 7 to 11 particles
        for (let i = 0; i < particleCount; i++) {
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            this.particles.push(new LetterParticle(x, y, randomLetter));
        }
    }

    updateAndDrawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.draw(this.ctx);
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateAndDrawGroundEffects() {
        for (let i = this.groundEffects.length - 1; i >= 0; i--) {
            const effect = this.groundEffects[i];
            effect.update(this.enemies);
            effect.draw(this.ctx);
            if (effect.duration <= 0) {
                this.groundEffects.splice(i, 1);
            }
        }
    }

    showModalAt(canvasX, canvasY, htmlContent) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = rect.width / this.canvas.width;
        
        const modalX = rect.left + (canvasX * scale) + (TILE_SIZE * scale / 2);
        const modalY = rect.top + (canvasY * scale);

        this.modal.style.left = `${modalX}px`;
        this.modal.style.top = `${modalY}px`;
        this.modal.style.transform = `translate(-50%, 0)`;

        this.modalContent.innerHTML = htmlContent;
        this.modal.classList.remove('hidden');
    }

    showConfirmationModal(gridX, gridY, type) {
        const x = gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;
        const html = `
            <h5>Confirm ${type}?</h5>
            <div class="button-group">
                <button id="confirm-place-btn" class="modal-btn-confirm">Place</button>
                <button id="cancel-place-btn" class="modal-btn-cancel">Cancel</button>
            </div>
        `;
        this.showModalAt(x, y - TILE_SIZE, html);
        
        document.getElementById('confirm-place-btn').onclick = () => this.addTower(gridX, gridY, type);
        document.getElementById('cancel-place-btn').onclick = () => this.hideModal();
    }

    showUpgradeModal(tower) {
        this.selectedTower = tower;
        this.selectedTowerType = null;
        const config = TOWER_TYPES[tower.type];
        
        let sellValue = Math.floor(tower.cost / 2);
        for(let i=1; i < tower.damageLevel; i++) sellValue += Math.floor((config.upgradeCost.damage * i) / 2);
        for(let i=1; i < tower.speedLevel; i++) sellValue += Math.floor((config.upgradeCost.speed * i) / 2);
        for(let i=1; i < tower.rangeLevel; i++) sellValue += Math.floor((config.upgradeCost.range * i) / 2);

        const dmgCost = config.upgradeCost.damage * tower.damageLevel;
        const spdCost = config.upgradeCost.speed * tower.speedLevel;
        const rngCost = config.upgradeCost.range * tower.rangeLevel;

        const html = `
            <h5>${tower.type.toUpperCase()} Tower ${config.emoji}</h5>
            <div class="stats-grid">
                <span>Damage:</span><span>${tower.damage.toFixed(0)}</span>
                <span>Speed:</span><span>${(60 / tower.fireRate).toFixed(2)}/s</span>
                <span>Range:</span><span>${(tower.range / TILE_SIZE).toFixed(1)}</span>
            </div>
            <div class="button-group-vertical">
                <button id="modal-upgrade-damage">⚡ Damage (${dmgCost}💰)</button>
                <button id="modal-upgrade-speed">⏩ Speed (${spdCost}💰)</button>
                <button id="modal-upgrade-range" ${tower.range >= tower.maxRange ? 'disabled' : ''}>🎯 Range (${rngCost}💰)</button>
                <button id="modal-sell" class="modal-btn-sell">Sell (+${sellValue}💰)</button>
            </div>
        `;
        
        this.showModalAt(tower.x, tower.y, html);

        document.getElementById('modal-upgrade-damage').onclick = () => this.upgradeSelectedTower('damage');
        document.getElementById('modal-upgrade-speed').onclick = () => this.upgradeSelectedTower('speed');
        document.getElementById('modal-upgrade-range').onclick = () => this.upgradeSelectedTower('range');
        document.getElementById('modal-sell').onclick = () => this.sellSelectedTower();
    }
    
    hideModal() {
        this.modal.classList.add('hidden');
    }

    showEventMessage(text, position) {
        this.eventMessages.push({ text, x: position.x, y: position.y, life: 60 });
    }
    
    updateAndDrawEventMessages() {
        for (let i = this.eventMessages.length - 1; i >= 0; i--) {
            const msg = this.eventMessages[i];
            msg.life--;
            msg.y -= 0.5;

            if (msg.life <= 0) {
                this.eventMessages.splice(i, 1);
            } else {
                this.ctx.globalAlpha = msg.life / 60;
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(msg.text, msg.x, msg.y);
                this.ctx.globalAlpha = 1.0;
            }
        }
    }
    
    drawPath() {
        this.ctx.strokeStyle = '#6c8a5d';
        this.ctx.lineWidth = TILE_SIZE;
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x * TILE_SIZE, this.path[0].y * TILE_SIZE);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x * TILE_SIZE, this.path[i].y * TILE_SIZE);
        }
        this.ctx.stroke();
    }
    
    updateAndDrawTowers() {
        this.towers.forEach(tower => {
            tower.update(this.enemies, this.projectiles);
            tower.draw(this.ctx);
        });
    }
    
    updateAndDrawEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.enemies);
            enemy.draw(this.ctx);

            if (enemy.pathIndex >= this.path.length - 1) {
                this.enemies.splice(i, 1);
                this.takeDamage();
            }
        }
    }

    drawTowerRange(tower) {
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fill();
    }

    drawGhostTower() {
        if (!this.ghostTower) return;
        this.ctx.beginPath();
        this.ctx.arc(this.ghostTower.x, this.ghostTower.y, this.ghostTower.range, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ghostTower.isValid ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        this.ctx.fill();
        this.ctx.globalAlpha = 0.6;
        this.ctx.font = `${TILE_SIZE * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.ghostTower.emoji, this.ghostTower.x, this.ghostTower.y);
        this.ctx.globalAlpha = 1.0;
    }

    updateUI() {
        this.perutasDisplay.textContent = this.perutas;
        this.healthDisplay.textContent = this.health;
    }
    
    updateWaveDisplay(waveNumber) {
        this.waveDisplay.textContent = waveNumber;
    }
}

function initializeMainMenu() {
    mapSelectionContainer.innerHTML = '';
    for (const mapKey in MAPS) {
        const map = MAPS[mapKey];
        const button = document.createElement('button');
        button.classList.add('map-button');
        button.textContent = map.name;
        button.onclick = () => startGame(map);
        mapSelectionContainer.appendChild(button);
    }
}

function startGame(mapConfig) {
    mainMenu.classList.add('hidden');
    gameWrapper.classList.remove('hidden');
    if (game) cancelAnimationFrame(game.animationFrameId);
    game = new Game(canvas, mapConfig);
    game.start();
}

function returnToMainMenu() {
    if (game) {
        cancelAnimationFrame(game.animationFrameId);
        game = null;
    }
    gameWrapper.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}

window.onload = () => {
    mainMenu = document.getElementById('main-menu');
    mapSelectionContainer = document.getElementById('map-selection-container');
    gameWrapper = document.getElementById('game-wrapper');
    gameOverScreen = document.getElementById('game-over-screen');
    canvas = document.getElementById('gameCanvas');

    initializeMainMenu();
    
    document.getElementById('restart-button').onclick = () => {
        if (game) startGame(game.map);
    };
    document.getElementById('main-menu-button').onclick = returnToMainMenu;
};