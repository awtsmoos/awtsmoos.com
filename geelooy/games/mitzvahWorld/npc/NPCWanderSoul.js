
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';
import NPCSchedule from './NPCSchedule.js';
import NPCThoughts from './NPCThoughts.js';

/**
 * B"H
 * @file NPCWanderSoul.js
 * 
 * Chapter: The Breathing of the Chariot.
 * Previously, the NPC just paced back and forth endlessly.
 * Now, infused with the `NPCSchedule` and `NPCThoughts`, it is an autonomous 
 * spiritual being. It will stop to pray (shuckle), read, wander, and emit thoughts.
 */

/**
 * @class NPCWanderSoul
 * @extends SederHishtalshelusNode
 * @description Provides the deep internal drive, schedule binding, and movement vectors.
 */
export default class NPCWanderSoul extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {Object} npcData - The pure data vessel of the NPC.
     */
    constructor(npcData) {
        super({ worldName: "Atzilut_NPC_Motivation_Advanced" });
        this.npcData = npcData;
        this.npcData.position = this.npcData.position || { x: 0, y: 0, z: 0 };
        this.npcData.rotation = this.npcData.rotation || { y: 0, z: 0 };
        this.npcData.animation = 'IDLE';

        this.schedule = new NPCSchedule();
        this.thoughts = new NPCThoughts();

        this.internalClock = 0;
        this.targetPosition = null;
        this.thoughtBubble = null;
    }

    /**
     * @method update
     * @description Called every frame. Assesses time and dictates reality.
     * @param {number} deltaTime - Time since last frame.
     * @param {number} engineTimeOfDay - 0 to 24 celestial time.
     */
    update(deltaTime, engineTimeOfDay = 12) {
        // 1. Check the celestial decrees
        const decreedState = this.schedule.getCurrentPhase(engineTimeOfDay);

        // 2. Map the spiritual state to physical action logic
        if (decreedState.includes('DAVENING') || decreedState === 'STUDYING_TORAH') {
            this.handleShuckling(deltaTime, decreedState);
        } else if (decreedState === 'SLEEPING_AND_RECHARGING') {
            this.handleSleep(deltaTime);
        } else {
            this.handleWander(deltaTime, decreedState);
        }

        // 3. Occasionally bubble up a thought (e.g. every 10 seconds)
        this.internalClock += deltaTime;
        if (this.internalClock > 10000) {
            this.internalClock = 0;
            this.thoughtBubble = this.thoughts.popThought(decreedState);
            console.log(`B"H - 💭 NPC [${this.npcData.id}] thinks: "${this.thoughtBubble}"`);
        }
    }

    /**
     * @method handleShuckling
     * @description Simulates the swaying motion of deep prayer/study.
     */
    handleShuckling(deltaTime, stateName) {
        this.npcData.animation = stateName;
        // Apply a gentle sine wave to the Z rotation to simulate swaying (Shuckling)
        const timeFactor = Date.now() / 300; 
        this.npcData.rotation.z = Math.sin(timeFactor) * 0.15; // Sway amplitude
    }

    /**
     * @method handleSleep
     * @description Stillness. Nullification.
     */
    handleSleep(deltaTime) {
        this.npcData.animation = 'SLEEPING';
        this.npcData.rotation.z = 0;
        this.targetPosition = null;
    }

    /**
     * @method handleWander
     * @description Standard seeking movement logic.
     */
    handleWander(deltaTime) {
        this.npcData.animation = 'WANDER';
        this.npcData.rotation.z = 0; // Stand up straight

        if (!this.targetPosition) {
            // Find a new holy coordinate to travel to
            const radius = 15;
            this.targetPosition = {
                x: this.npcData.position.x + (Math.random() * radius * 2 - radius),
                z: this.npcData.position.z + (Math.random() * radius * 2 - radius)
            };
            return;
        }

        const dx = this.targetPosition.x - this.npcData.position.x;
        const dz = this.targetPosition.z - this.npcData.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.5) {
            this.targetPosition = null; // Reached, pause for a moment
            this.npcData.animation = 'IDLE';
            return;
        }

        // Apply physical velocity vector
        const speed = 2.5 * (deltaTime / 1000); 
        this.npcData.position.x += (dx / distance) * speed;
        this.npcData.position.z += (dz / distance) * speed;

        // Orient body to destination
        this.npcData.rotation.y = Math.atan2(dx, dz);
    }
}
