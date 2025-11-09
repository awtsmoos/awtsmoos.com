//B"H

import Enemy from './enemy.js';
import { ENEMY_TYPES } from './config.js';

export default class WaveManager {
    constructor(game) {
        this.game = game;
        console. log("game", game)
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
            let enemyTypeKey;
            const rand = Math.random();

            if (this.waveNumber > 7 && rand < 0.25) {
                enemyTypeKey = 'golem';
            } else if (this.waveNumber > 5 && rand < 0.5) {
                enemyTypeKey = 'gorilla';
            } else if (this.waveNumber > 2 && rand < 0.6) {
                 enemyTypeKey = 'tiger';
            } else {
                 enemyTypeKey = 'cat';
            }
            const enemyType = ENEMY_TYPES[enemyTypeKey];
            this.enemiesToSpawn.push(new Enemy(enemyType, healthMultiplier, this.game.path));
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
        
        if (this.enemiesToSpawn.length === 0 && this.game.enemies.length === 0) {
            this.isWaveActive = false;
            this.game.waveComplete();
        }
    }
}