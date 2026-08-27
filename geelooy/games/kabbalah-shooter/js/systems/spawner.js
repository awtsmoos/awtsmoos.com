//B"H
import { Vec2 } from '../math.js';
import { SnakeEnemy, TurretEnemy, SwarmerEnemy, SeraphEnemy } from '../entities/enemy.js';
import { MetatronShape } from '../entities/metatron.js';
import { FloatingText } from '../entities/particles.js';
import { COLORS, SPRITES, WORLDS, HEBREW_LETTERS } from '../constants.js';

export class SpawnerSystem {
    constructor(game) {
        this.game = game;
    }

    spawnWave() {
      const difficultyMult = 1 + Math.pow(this.game.wave, 1.5) * 0.05;
      const prevWorld = this.game.worldLevel;
      // Cycle: Assiyah -> Yetzirah -> Beriah -> Atzilus -> Lower Gan Eden -> Higher Gan Eden
      this.game.worldLevel = Math.floor((this.game.wave - 1) / 3) % 6;
      
      if(this.game.worldLevel > prevWorld) {
           this.game.audio.play('ascend');
           let name = "OLAM HA'BA";
           if(this.game.worldLevel === WORLDS.GAN_EDEN_LOWER) name = "GAN EDEN (LOWER)";
           if(this.game.worldLevel === WORLDS.GAN_EDEN_HIGHER) name = "GAN EDEN (HIGHER)";
           
           this.game.texts.push(new FloatingText(this.game.width/2, this.game.height/2, name, COLORS.GOLD));
           this.game.shake = 30;
           this.game.aberration = 2.0;
      }
      
      // Spawn Patterns
      const roll = Math.random();
      const count = 1 + Math.min(5, Math.floor(this.game.wave/2));
      
      // Metatron (Beriah+)
      if(this.game.worldLevel >= WORLDS.BERIAH && roll > 0.7) {
          for(let i=0; i<3; i++) {
              this.game.metatronShapes.push(new MetatronShape(
                  this.game.width * (i+1)/4, -100, SPRITES.PLATONIC_CUBE
              ));
          }
      }
      
      // Swarmers (Yetzirah+)
      if(this.game.worldLevel >= WORLDS.YETZIRAH && roll < 0.3) {
          const swarmSize = 5 + Math.floor(this.game.wave);
          for(let i=0; i<swarmSize; i++) {
              this.game.enemies.push(new SwarmerEnemy(
                  Math.random() * this.game.width, 
                  -100 - (Math.random()*200),
                  20 * difficultyMult
              ));
          }
          return; // Skip snake if swarming
      }

      // Turrets (Assiyah+)
      if(roll > 0.4 && roll < 0.6) {
          this.game.enemies.push(new TurretEnemy(Math.random() * this.game.width, -50, 100 * difficultyMult));
      }
      
      // Seraphim (Beriah+)
      if(this.game.worldLevel >= WORLDS.BERIAH && roll > 0.8) {
           this.game.enemies.push(new SeraphEnemy(this.game.width/2, -100, 200 * difficultyMult));
      }

      // Standard Snake
      // REMOVED DARK COLORS TO PREVENT INVISIBLE GAMEPLAY
      const palettes = [COLORS.CYAN, COLORS.GREEN, COLORS.GOLD, COLORS.PURPLE, COLORS.RED, COLORS.ORANGE, COLORS.BLUE];
      this.game.themeColor = palettes[this.game.wave % palettes.length];
      
      for(let k=0; k<count; k++) {
          const path = [new Vec2(this.game.width*(k+1)/(count+1), -100)];
          const variance = this.game.worldLevel >= WORLDS.BERIAH ? 300 : 150;
          for(let i=0; i<4; i++) path.push(new Vec2(Math.random()*this.game.width, 100 + i*variance));
          path.push(new Vec2(Math.random()*this.game.width, -500));
          
          const snake = new SnakeEnemy(path, this.game.wave * 1.2);
          const isBoss = this.game.wave % 5 === 0;
          const hpMult = (isBoss ? 20 : 1) * difficultyMult;
          const isMerkabah = isBoss && this.game.wave > 5;
          const headType = isMerkabah ? SPRITES.MERKABAH : SPRITES.SNAKE_HEAD;
          
          snake.addSegment(headType, 50 * hpMult);
          
          const len = isBoss ? (isMerkabah ? 4 : 40) : 6 + Math.min(15, this.game.wave);
          for(let i=0; i<len; i++) {
              let type = i % 3 === 0 ? SPRITES.CIRCLE : SPRITES.HEXAGON;
              if(isMerkabah) type = SPRITES.MERKABAH; 

              let drop = null;
              if(Math.random() < 0.05) drop = 'RAPID';
              else if(Math.random() < 0.05) drop = 'SHIELD';
              else if(Math.random() < 0.15) drop = HEBREW_LETTERS[Math.floor(Math.random()*HEBREW_LETTERS.length)];
              
              let hp = (10 + i) * hpMult;
              snake.addSegment(type, hp, drop);
          }
          this.game.enemies.push(snake);
      }
      
      this.game.wave++;
    }
}