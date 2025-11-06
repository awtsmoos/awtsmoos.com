//B"H

import Enemy from './enemy.js';
import { ENEMY_TYPES } from './config.js';

export default class WaveManager {
    constructor(game) {
        this.game = game;
        this.waveNumber = 0;
        this.enemiesToSpawn = [];
        this.spawnInterval = 60; // Frames between spawns
        this.spawnTimer = 0;
        this.isWaveActive = false;
    }

    startNextWave() {
        this.waveNumber++;
        this.isWaveActive = true;
        this.game.updateWaveDisplay(this.waveNumber);
        this.generateEnemies();
    }
    
    generateEnemies() {
        this.enemiesToSpawn = [];
        const healthMultiplier = 1 + (this.waveNumber - 1) * 0.2;
        const enemyCount = 5 + this.waveNumber * 2;
        
        for (let i = 0; i < enemyCount; i++) {
            let enemyType;
            if (this.waveNumber > 5 && Math.random() < 0.3) {
                enemyType = ENEMY_TYPES.gorilla;
            } else if (this.waveNumber > 2 && Math.random() < 0.4) {
                 enemyType = ENEMY_TYPES.tiger;
            } else {
                 enemyType = ENEMY_TYPES.cat;
            }
            this.enemiesToSpawn.push(new Enemy(enemyType, healthMultiplier));
        }
    }

    update() {
        if (!this.isWaveActive) return;

        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval && this.enemiesToSpawn.length > 0) {
            this.spawnTimer = 0;
            const enemy = this.enemiesToSpawn.shift();
            this.game.enemies.push(enemy);
        }
        
        // Check if wave is over
        if (this.enemiesToSpawn.length === 0 && this.game.enemies.length === 0) {
            this.isWaveActive = false;
            this.game.waveComplete();
        }
    }
}