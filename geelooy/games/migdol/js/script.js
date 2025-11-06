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
        
        this.waveManager = new WaveManager(this);
        this.isGameOver = false;

        this.perutasDisplay = document.getElementById('perutas');
        this.healthDisplay = document.getElementById('health');
        this.waveDisplay = document.getElementById('wave');
        this.upgradePanel = document.getElementById('tower-upgrades');
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

        this.waveManager.update();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startNextWave() {
        if (!this.waveManager.isWaveActive) {
            this.waveManager.startNextWave();
            document.getElementById('start-wave').style.display = 'none';
        }
    }

    waveComplete() {
        // Give a bonus for completing the wave
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
            this.updateUI();
        }
    }
    
    selectTowerAt(x, y) {
        this.selectedTower = null;
        for (const tower of this.towers) {
            const dist = Math.hypot(tower.x - x, tower.y - y);
            if (dist < TILE_SIZE / 2) {
                this.selectedTower = tower;
                break;
            }
        }
        this.updateUpgradePanel();
    }
    
    upgradeSelectedTower(stat) {
        if (!this.selectedTower) return;
        
        const config = TOWER_TYPES[this.selectedTower.type];
        let cost = 0;
        
        if (stat === 'damage') cost = config.upgradeCost.damage * (this.selectedTower.damageLevel + 1);
        if (stat === 'speed') cost = config.upgradeCost.speed * (this.selectedTower.speedLevel + 1);
        if (stat === 'range') cost = config.upgradeCost.range * (this.selectedTower.rangeLevel + 1);

        if (this.perutas >= cost) {
            const actualCost = this.selectedTower.upgrade(stat);
            if (actualCost > 0) {
                 this.perutas -= cost;
                 this.updateUI();
                 this.updateUpgradePanel();
            }
        }
    }
    
    sellSelectedTower() {
        if (!this.selectedTower) return;
        
        let sellValue = this.selectedTower.cost / 2;
        // Add half of upgrade costs back
        const config = TOWER_TYPES[this.selectedTower.type];
        for(let i=1; i < this.selectedTower.damageLevel; i++) sellValue += (config.upgradeCost.damage * (i + 1)) / 2;
        for(let i=1; i < this.selectedTower.speedLevel; i++) sellValue += (config.upgradeCost.speed * (i + 1)) / 2;
        for(let i=1; i < this.selectedTower.rangeLevel; i++) sellValue += (config.upgradeCost.range * (i + 1)) / 2;
        
        this.perutas += Math.floor(sellValue);
        this.towers = this.towers.filter(t => t !== this.selectedTower);
        this.selectedTower = null;
        this.updateUI();
        this.updateUpgradePanel();
    }


    // --- Update and Draw ---
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
            tower.draw(this.ctx, tower === this.selectedTower);
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

            // Hit detection
            if (p.target) {
                const dist = Math.hypot(p.x - p.target.x, p.y - p.target.y);
                if (dist < 10) {
                    p.target.takeDamage(p.damage);
                    if (p.target.health <= 0) {
                        this.perutas += p.target.perutaValue;
                        // Handle child spawning
                        if(p.target.children) {
                            const enemyConfig = ENEMY_TYPES[p.target.children.type];
                            for(let j=0; j < p.target.children.count; j++) {
                                // Spawn children at parent's location
                                const child = new Enemy(enemyConfig, 1); // No health multiplier for children
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
    
    // --- UI Updates ---
    updateUI() {
        this.perutasDisplay.textContent = this.perutas;
        this.healthDisplay.textContent = this.health;
    }
    
    updateWaveDisplay(waveNumber) {
        this.waveDisplay.textContent = waveNumber;
    }
    
    updateUpgradePanel() {
        if (this.selectedTower) {
            this.upgradePanel.classList.remove('hidden');
            const config = TOWER_TYPES[this.selectedTower.type];
            document.getElementById('upgrade-type').textContent = this.selectedTower.type;
            document.getElementById('upgrade-damage-cost').textContent = config.upgradeCost.damage * (this.selectedTower.damageLevel + 1);
            document.getElementById('upgrade-speed-cost').textContent = config.upgradeCost.speed * (this.selectedTower.speedLevel + 1);
            document.getElementById('upgrade-range-cost').textContent = config.upgradeCost.range * (this.selectedTower.rangeLevel + 1);
            document.getElementById('sell-value').textContent = Math.floor(this.selectedTower.cost / 2);
        } else {
            this.upgradePanel.classList.add('hidden');
        }
    }
}

// Initialize the game
const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
game.start();