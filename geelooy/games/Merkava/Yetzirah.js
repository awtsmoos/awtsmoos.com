/*
ב"ה
B"H
*/

/**
 * @file Yetzirah.js
 * @description The World of Yetzirah (יצירה): The World of Formation.
 * This is the third world, the realm of abstract laws, physics, and behaviors. If Beriah is the workshop
 * that builds the clock, Yetzirah is the set of mathematical principles that define how its gears must turn.
 * The functions herein do not *act* on the world; they *define the rules of action*. They are pure, stateless
 * helpers and calculations that provide the logical foundation for Assiah's systems. The air here hums with
 * the silent music of algorithms and the cold, beautiful light of pure logic.
 */

export const YETZIRAH = {
    Olam: null,

    /**
     * @description Binds the laws of this world to the Olam (World State).
     * @param {object} Olam - The central world state object.
     */
    init(Olam) { this.Olam = Olam; },

    /**
     * @description A law of sacred numerology. Translates a cardinal number into its Hebrew gematria equivalent.
     * This is a fundamental principle of this universe's symbolic layer.
     * @param {number} n - The number to convert.
     * @returns {string} The gematria representation.
     */
    toGematria(n) {
        const map = { 1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט',10:'י',20:'כ',30:'ל',40:'מ',50:'נ',60:'ס',70:'ע',80:'פ',90:'צ',100:'ק',200:'ר',300:'ש',400:'ת' };
        if (n === 15) return 'ט״ו';
        if (n === 16) return 'ט״ז';
        let str = '';
        let val = Math.abs(n);
        const keys = Object.keys(map).map(Number).sort((a, b) => b - a);
        while (val > 0) {
            for (const key of keys) {
                if (val >= key) {
                    str += map[key];
                    val -= key;
                    break;
                }
            }
        }
        if (str.length > 1) str = str.slice(0, -1) + '״' + str.slice(-1);
        else if (str.length === 1) str += '׳';
        return str;
    },

    /**
     * @description The Law of Formation. Calculates the ideal, harmonic positions for the Nefesh souls.
     * This is not an action of moving them, but the definition of their perfect state of being.
     * It uses the golden angle phyllotaxis, ensuring a divine and efficient arrangement.
     */
    calculateNefeshPositions() {
        const Olam = this.Olam;
        const activeNefeshCount = Olam.game.nefeshCount;
        if (activeNefeshCount === 0) return;

        const angleStep = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        const radiusStep = 0.45;
        const roadWidth = Olam.config.roadWidth;

        // Determine the maximum radius of the formation to scale it down if it exceeds road width.
        let maxRadiusForLayout = radiusStep * Math.sqrt(activeNefeshCount);
        const scaleFactor = (maxRadiusForLayout * 2 > roadWidth * 0.9) ? (roadWidth * 0.9) / (maxRadiusForLayout * 2) : 1;
        
        let activeIndex = 0;
        for (let i = 0; i < Olam.pools.Nefesh.length; i++) {
            const nefesh = Olam.pools.Nefesh[i];
            if (nefesh.components.State.active) {
                const radius = radiusStep * Math.sqrt(activeIndex + 1) * scaleFactor;
                const angle = activeIndex * angleStep;
                nefesh.components.TargetPos.x = Math.cos(angle) * radius;
                nefesh.components.TargetPos.z = Math.sin(angle) * radius;
                activeIndex++;
            }
        }
    },

    /**
     * @description The Law of Divine Flow (Shefa). Defines how Shefa is added to the Merkava's reserves.
     * It incorporates bonuses from upgrades and checks if an Ascension threshold has been met.
     * @param {number} amount - The base amount of Shefa to add.
     */
    addShefa(amount) {
        const Olam = this.Olam;
        const shefaGainUpgrade = Olam.playerStats.upgrades.shefaGain;
        const shefaBonus = 1 + (shefaGainUpgrade ? shefaGainUpgrade.level * 0.02 : 0);
        Olam.game.shefa += amount * shefaBonus;

        if (Olam.game.shefa >= Olam.game.shefaToAscend) {
            Olam.game.shefa -= Olam.game.shefaToAscend;
            Olam.game.level++;
            Olam.game.shefaToAscend *= 1.5;
            Olam.ASSIAH.CHESED.grantRandomEmanation();

            if (Olam.game.level % 7 === 0 && !Olam.game.boss.isActive) {
                Olam.ASSIAH.GEVURAH.awakenBoss();
            }
        }
        
        // A small chance to trigger a resonance event
        if (Math.random() < 0.05) {
            Olam.ASSIAH.TIFERET.triggerSefirahResonance();
        }
    },
    
    /**
     * @description The Law of the Combo. Defines the logic for tracking and rewarding consecutive hits.
     * A combo is a rhythmic harmony in the act of purification, a resonance that builds upon itself.
     * @param {THREE.Vector3} position - The world position where the combo-extending event occurred.
     */
    updateCombo(position) {
        const Olam = this.Olam;
        const comboTimerUpgrade = Olam.playerStats.upgrades.comboTimer;
        Olam.game.combo.timer = 3.0 * (1 + (comboTimerUpgrade ? comboTimerUpgrade.level * 0.05 : 0));
        Olam.game.combo.count++;

        if (Olam.game.combo.count === 50) {
            Olam.ASSIAH.TIFERET.triggerMitzvahCascade(position);
        }

        const shefaValueUpgrade = Olam.playerStats.upgrades.shefaValue;
        const shefaValueBonus = 1 + (shefaValueUpgrade ? shefaValueUpgrade.level * 0.05 : 0);
        const shefaGained = (5 * Olam.game.combo.count) * shefaValueBonus; // Base 5 shefa per combo hit
        
        Olam.ASSIAH.CHESED.spawnShefaOrbs(position, shefaGained);

        Olam.ASSIAH.MALCHUT.showNotifier('combo', `COMBO x${Olam.game.combo.count}`);
    },

    /**
     * @description The Law of Collision. A pure, mathematical check to see if two abstract entities occupy the same space.
     * It uses simple Axis-Aligned Bounding Box (AABB) intersection, the most fundamental form of interaction.
     * @param {object} entityA - The first entity with Position and Collision components.
     * @param {object} entityB - The second entity with Position and Collision components.
     * @returns {boolean} True if their boundaries intersect, false otherwise.
     */
    isColliding(entityA, entityB) {
        if (!entityA.components.Collision?.active || !entityB.components.Collision?.active) {
            return false;
        }

        const posA = entityA.object3D.position;
        const sizeA = entityA.components.Collision.size;
        const posB = entityB.object3D.position;
        const sizeB = entityB.components.Collision.size;

        return (
            Math.abs(posA.x - posB.x) * 2 < (sizeA.x + sizeB.x) &&
            Math.abs(posA.y - posB.y) * 2 < (sizeA.y + sizeB.y) &&
            Math.abs(posA.z - posB.z) * 2 < (sizeA.z + sizeB.z)
        );
    },
    
    /**
     * @description A specialized law for checking collision on the 2D plane of the road.
     * This is used for checking the Merkava's Nefesh against Klipot.
     * @param {object} nefeshWorldPos - A THREE.Vector3 for the world position of the Nefesh.
     * @param {object} klipah - The Klipah entity to check against.
     * @returns {boolean} True if they intersect on the XZ plane.
     */
    isCollidingOnPlane(nefeshWorldPos, klipah) {
        if (!klipah.components.Collision?.active) {
            return false;
        }
        
        const posK = klipah.object3D.position;
        const sizeK = klipah.components.Collision.size;
        const sizeN = 0.8; // Approximate size of a Nefesh

        return (
            Math.abs(nefeshWorldPos.x - posK.x) * 2 < (sizeN + sizeK.x) &&
            Math.abs(nefeshWorldPos.z - posK.z) * 2 < (sizeN + sizeK.z)
        );
    },
    
     /**
     * @description A specific law for the composite, multi-part nature of the Tohu Shard Klipah.
     * It checks a point against the many individual collision zones of the shard.
     * @param {THREE.Vector3} point - The point (e.g., a projectile's position) to check.
     * @param {object} tohuShardEntity - The Tohu Shard entity.
     * @returns {boolean} True if the point is inside any of the shard's collision zones.
     */
    isPointCollidingWithTohuShard(point, tohuShardEntity) {
        for (const shardPart of tohuShardEntity.object3D.children) {
            const partPos = shardPart.getWorldPosition(new THREE.Vector3());
            const partSize = shardPart.userData.Collision.size;

            if (
                Math.abs(point.x - partPos.x) * 2 < partSize.x &&
                Math.abs(point.y - partPos.y) * 2 < partSize.y &&
                Math.abs(point.z - partPos.z) * 2 < partSize.z
            ) {
                return true;
            }
        }
        return false;
    },

    /**
     * @description The Law of Wave Formation. Defines which patterns of Klipot are appropriate for the current level of the journey.
     * As the Merkava ascends, the challenges must grow in complexity and severity.
     * @returns {Array<Function>} An array of wave pattern generator functions.
     */
    getPatternSet() {
        const level = this.Olam.game.level;
        const patterns = this.Olam.ATZILUT.wavePatterns;
        if (level < 3) return patterns.early;
        if (level < 7) return [...patterns.early, ...patterns.mid];
        if (level < 12) return [...patterns.mid, ...patterns.late];
        return [...patterns.late, ...patterns.expert];
    },
};
