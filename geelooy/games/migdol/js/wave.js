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
        const healthMultiplier = 1 + (this.waveNumber - 1) * 0.25;
        const waveConfig = this.getWaveConfig(this.waveNumber);
        
        waveConfig.forEach(group => {
            const enemyType = ENEMY_TYPES[group.type];
            for (let i = 0; i < group.count; i++) {
                this.enemiesToSpawn.push(new Enemy(enemyType, healthMultiplier, this.game.path));
            }
        });

        // Shuffle the enemies to make the wave less predictable
        for (let i = this.enemiesToSpawn.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.enemiesToSpawn[i], this.enemiesToSpawn[j]] = [this.enemiesToSpawn[j], this.enemiesToSpawn[i]];
        }
    }

    getWaveConfig(wave) {
        if (wave === 1) return [{ type: 'cat', count: 10 }];
        if (wave === 2) return [{ type: 'cat', count: 15 }, { type: 'tiger', count: 2 }];
        if (wave === 3) return [{ type: 'flyer', count: 20 }]; // Fast wave
        if (wave === 4) return [{ type: 'tiger', count: 10 }, { type: 'cat', count: 10 }];
        if (wave === 5) return [{ type: 'armored', count: 8 }]; // Introduce armored
        if (wave === 6) return [{ type: 'tiger', count: 15 }, { type: 'armored', count: 5 }];
        if (wave === 7) return [{ type: 'gorilla', count: 5 }];
        if (wave === 8) return [{ type: 'healer', count: 4 }, { type: 'gorilla', count: 6 }]; // Introduce healer
        if (wave === 9) return [{ type: 'flyer', count: 30 }, { type: 'armored', count: 10 }];
        if (wave === 10) return [{ type: 'golem', count: 3 }, { type: 'healer', count: 5 }]; // Mini-boss wave
        
        // Procedural generation for later waves
        const totalValue = wave * 20;
        let currentValue = 0;
        const config = [];
        const availableEnemies = ['cat', 'tiger', 'flyer'];
        if (wave > 5) availableEnemies.push('armored');
        if (wave > 7) availableEnemies.push('gorilla', 'healer');
        if (wave > 9) availableEnemies.push('golem');
        
        while (currentValue < totalValue) {
            const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
            const enemyValue = ENEMY_TYPES[randomType].perutaValue || 5;
            const count = Math.ceil(Math.random() * 5);
            config.push({ type: randomType, count });
            currentValue += enemyValue * count;
        }
        return config;
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