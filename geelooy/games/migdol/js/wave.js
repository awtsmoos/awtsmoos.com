//B"H

import Enemy from './enemy.js';
import { ENEMY_TYPES } from './config.js';

export default class WaveManager {
    constructor(game) {
        this.game = game;
        this.waveNumber = 0;
        this.enemiesToSpawn = [];
        this.spawnInterval = 50; // Frames between spawns
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
        const healthMultiplier = 1 + (this.waveNumber - 1) * 0.35;
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
        // Easier beginning
        if (wave === 1) return [{ type: 'imp', count: 10 }];
        if (wave === 2) return [{ type: 'cat', count: 15 }];
        if (wave === 3) return [{ type: 'flyer', count: 15 }];
        if (wave === 4) return [{ type: 'tiger', count: 10 }, { type: 'cat', count: 10 }];
        if (wave === 5) return [{ type: 'armored', count: 8 }];
        
        // Harder mid-game with more children
        if (wave === 6) return [{ type: 'snake', count: 12 }, { type: 'armored', count: 5 }];
        if (wave === 7) return [{ type: 'gorilla', count: 7 }];
        if (wave === 8) return [{ type: 'healer', count: 4 }, { type: 'gorilla', count: 8 }];
        if (wave === 9) return [{ type: 'flyer', count: 30 }, { type: 'wraith', count: 8 }];
        if (wave === 10) return [{ type: 'golem', count: 5 }, { type: 'healer', count: 5 }];
        
        // Procedural generation for later waves - WAY harder
        const totalValue = wave * 35;
        let currentValue = 0;
        const config = [];
        // Add all enemies to the procedural generator pool, unlocking them as waves progress
        const availableEnemies = ['cat', 'flyer', 'imp'];
        if (wave > 3) availableEnemies.push('tiger', 'snake');
        if (wave > 5) availableEnemies.push('armored', 'gorilla', 'healer', 'fox');
        if (wave > 7) availableEnemies.push('wraith', 'crocodile');
        if (wave > 9) availableEnemies.push('golem', 'cloner');
        if (wave > 12) availableEnemies.push('elephant');
        if (wave > 15) availableEnemies.push('brute');
        if (wave > 20) availableEnemies.push('leviathan');

        while (currentValue < totalValue) {
            const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
            const enemyValue = ENEMY_TYPES[randomType].perutaValue || 5;
            const count = Math.ceil(Math.random() * (wave / 4));
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