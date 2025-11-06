//B"H

import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_PATH, TOWER_TYPES, ENEMY_TYPES } from './config.js';
import Tower from './tower.js';
import Enemy from './enemy.js';
import WaveManager from './wave.js';
import { setupUI } from './ui.js';

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.path = ENEMY_PATH;
        
        this.perutas = 200;
        this.health = 20;
        
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.ghostTower = null; // For placement preview
        
        this.waveManager = new WaveManager(this);
        this.isGameOver = false;

        // UI elements
        this.perutasDisplay = document.getElementById('perutas');
        this.healthDisplay = document.getElementById('health');
        this.waveDisplay = document.getElementById('wave');
        this.modal = document.getElementById('in-game-modal');
        this.modalContent = document.getElementById('modal-content');
    }

    // --- Game State Management ---
    start() {
        setupUI(this);
        this.updateUI();
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.isGameOver) {
            this.drawGameOver();
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPath();
        
        this.updateAndDrawTowers();
        this.updateAndDrawEnemies();
        this.updateAndDrawProjectiles();
        this.drawGhostTower();

        // Show selected tower range permanently
        if(this.selectedTower) this.drawTowerRange(this.selectedTower);

        this.waveManager.update();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startNextWave() {
        if (this.isGameOver || this.waveManager.isWaveActive) return;
        this.waveManager.startNextWave();
        document.getElementById('start-wave').style.display = 'none';
        this.hideModal();
    }
    
    // (waveComplete, takeDamage, etc. methods remain the same)
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


    // --- Tower Management ---
    addTower(gridX, gridY, type) {
        const cost = TOWER_TYPES[type].cost;
        if (this.perutas >= cost) {
            const x = gridX * TILE_SIZE + TILE_SIZE / 2;
            const y = gridY * TILE_SIZE + TILE_SIZE / 2;
            this.towers.push(new Tower(x, y, type));
            this.perutas -= cost;
            
            // Deselect tower type after purchase
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
            const upgradeSuccess = this.selectedTower.upgrade(stat);
            if (upgradeSuccess) {
                 this.perutas -= cost;
                 this.updateUI();
                 this.showUpgradeModal(this.selectedTower); // Refresh modal content
            }
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


    // --- Modal Management ---
    showConfirmationModal(gridX, gridY, type) {
        const x = gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;
        this.modal.style.left = `${x}px`;
        this.modal.style.top = `${y}px`;

        this.modalContent.innerHTML = `
            <h5>Confirm Placement</h5>
            <div class="button-group">
                <button id="confirm-place-btn" class="modal-btn-confirm">Confirm</button>
                <button id="cancel-place-btn" class="modal-btn-cancel">Cancel</button>
            </div>
        `;
        this.modal.classList.remove('hidden');
        
        document.getElementById('confirm-place-btn').onclick = () => this.addTower(gridX, gridY, type);
        document.getElementById('cancel-place-btn').onclick = () => this.hideModal();
    }

    showUpgradeModal(tower) {
        this.modal.style.left = `${tower.x}px`;
        this.modal.style.top = `${tower.y}px`;

        const config = TOWER_TYPES[tower.type];
        const sellValue = Math.floor(tower.cost / 2) /* + half of upgrade costs */; // simplified for brevity
        const dmgCost = config.upgradeCost.damage * tower.damageLevel;
        const spdCost = config.upgradeCost.speed * tower.speedLevel;
        const rngCost = config.upgradeCost.range * tower.rangeLevel;

        this.modalContent.innerHTML = `
            <h5>${tower.type.toUpperCase()} Tower</h5>
            <div class="stats-grid">
                <span>Damage:</span><span>${tower.damage.toFixed(0)}</span>
                <span>Speed:</span><span>${(1000 / (tower.fireRate * (1000/60))).toFixed(2)}/s</span>
                <span>Range:</span><span>${(tower.range / TILE_SIZE).toFixed(1)}</span>
            </div>
            <div class="button-group-vertical">
                <button id="modal-upgrade-damage">⚡ Damage (${dmgCost}💰)</button>
                <button id="modal-upgrade-speed">⏩ Speed (${spdCost}💰)</button>
                <button id="modal-upgrade-range" ${tower.range >= tower.maxRange ? 'disabled' : ''}>🎯 Range (${rngCost}💰)</button>
                <button id="modal-sell" class="modal-btn-sell">Sell (+${sellValue}💰)</button>
            </div>
        `;
        this.modal.classList.remove('hidden');

        document.getElementById('modal-upgrade-damage').onclick = () => this.upgradeSelectedTower('damage');
        document.getElementById('modal-upgrade-speed').onclick = () => this.upgradeSelectedTower('speed');
        document.getElementById('modal-upgrade-range').onclick = () => this.upgradeSelectedTower('range');
        document.getElementById('modal-sell').onclick = () => this.sellSelectedTower();
    }
    
    hideModal() {
        this.modal.classList.add('hidden');
    }

    // --- Drawing Methods ---
    drawTowerRange(tower) {
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.stroke();
    }

    drawGhostTower() {
        if (!this.ghostTower) return;
        
        // Draw range first
        this.ctx.beginPath();
        this.ctx.arc(this.ghostTower.x, this.ghostTower.y, this.ghostTower.range, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ghostTower.isValid ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        this.ctx.fill();

        // Draw tower
        this.ctx.globalAlpha = 0.6;
        this.ctx.font = `${TILE_SIZE * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.ghostTower.emoji, this.ghostTower.x, this.ghostTower.y);
        this.ctx.globalAlpha = 1.0;
    }
    
    // (Other drawing and update methods like drawPath, updateAndDrawTowers, etc. remain mostly the same)
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
            enemy.update();
            enemy.draw(this.ctx);

            if (enemy.pathIndex >= this.path.length - 1) {
                this.enemies.splice(i, 1);
                this.takeDamage();
            }
        }
    }
    
    updateAndDrawProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update();
            p.draw(this.ctx);

            if (p.target) {
                const dist = Math.hypot(p.x - p.target.x, p.y - p.target.y);
                if (dist < 10) {
                    p.target.takeDamage(p.damage);
                    if (p.target.health <= 0) {
                        this.perutas += p.target.perutaValue;
                        if(p.target.children) {
                            const enemyConfig = ENEMY_TYPES[p.target.children.type];
                            for(let j=0; j < p.target.children.count; j++) {
                                const child = new Enemy(enemyConfig, 1);
                                child.x = p.target.x + (Math.random() - 0.5) * 20;
                                child.y = p.target.y + (Math.random() - 0.5) * 20;
                                child.pathIndex = p.target.pathIndex;
                                this.enemies.push(child);
                            }
                        }
                        this.enemies = this.enemies.filter(e => e !== p.target);
                        this.updateUI();
                    }
                    this.projectiles.splice(i, 1);
                }
            } else if (!p.target || p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`You reached wave ${this.waveManager.waveNumber}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    updateUI() {
        this.perutasDisplay.textContent = this.perutas;
        this.healthDisplay.textContent = this.health;
    }
    
    updateWaveDisplay(waveNumber) {
        this.waveDisplay.textContent = waveNumber;
    }
}

// Initialize the game
const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
game.start();