
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class ParticlePhysics
 * @chapter The Sifting of the Sparks (Birur Nitzotzot)
 * @description
 * Every step of the Tzaddik vibrates the physical world, revealing the spiritual letters (Otiot) 
 * that sustain it. "By the word of the Lord the heavens were made."
 * Expanded infinitely to handle the scorching sparks of Tehom and the transparent shards of Yetzirah.
 */
export class ParticlePhysics {
    /**
     * @description Spawns a cluster of Otiot based on the terrain interacted with.
     * @param {number} x - Absolute world X
     * @param {number} y - Absolute world Y
     * @param {string} terrainType - E.g., 'GRASS', 'SAND', 'LAVA'
     */
    static spawnStepDust(x, y, terrainType) {
        const letters = {
            'GRASS': ['ד', 'ש', 'א', 'צ', 'מ', 'ח'], // Deshe, Tzemach
            'SAND':  ['ח', 'ו', 'ל', 'ע', 'פ', 'ר'], // Chol, Afar
            'SNOW':  ['ש', 'ל', 'ג', 'ק', 'ר', 'ח'], // Sheleg, Kerach
            'LAVA':  ['א', 'ש', 'ד', 'י', 'ן'],      // Aish (Fire), Din (Judgment)
            'VOID':  ['ת', 'ה', 'ו', 'ב'],           // Tohu, Bohu
            'LIGHT': ['א', 'ו', 'ר', 'י', 'ה', 'י']  // Ohr (Light), Yehi (Let there be)
        };

        const colors = {
            'GRASS': '#81c784',
            'SAND': '#ffd54f',
            'SNOW': '#e0f7fa',
            'LAVA': '#ff5252',
            'VOID': '#ea80fc',
            'LIGHT': '#ffffff'
        };

        const charset = letters[terrainType] || ['א','ו','ר']; 
        const color = colors[terrainType] || '#ffffff';
        const count = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < count; i++) {
            StateRegister.Particles.push({
                x: x + (Math.random() * 20 - 10),
                y: y + (Math.random() * 10),
                vx: (Math.random() * 2 - 1),
                vy: (Math.random() * -2 - 1), // Always float upwards toward the Source
                life: 1.0,
                decay: 0.02 + (Math.random() * 0.03),
                char: charset[Math.floor(Math.random() * charset.length)],
                color: color,
                scale: Math.random() * 0.5 + 0.5,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }

    /**
     * @description Advances the physics simulation for all particles.
     */
    static digest(dt) {
        const P = StateRegister.Particles;
        for (let i = P.length - 1; i >= 0; i--) {
            let p = P[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // Gravity/Buoyancy drag
            p.rotation += p.rotSpeed;
            p.life -= p.decay;

            if (p.life <= 0) {
                P.splice(i, 1);
            }
        }
    }
}
