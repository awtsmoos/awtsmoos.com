//B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    // Needs (0-100)
    needs: {
        energy: 100,
        hunger: 0,
        social: 100, // Starts full, depletes
        wealth: 0
    },
    
    currentActionState: "IDLE", // IDLE, WORK, EAT, SLEEP, TALK, WANDER, BUILD
    targetEntity: null,
    navTarget: null,
    
    // Time constants
    lastDecisionTime: 0,
    decisionInterval: 2.0, // Seconds

    updateBrain(dt) {
        if (!this.isReady || !this.mesh) return;

        // 1. Biological Decay
        this.updateNeeds(dt);

        // 2. Decision Making (Throttled)
        const now = this.olam.clock.getElapsedTime();
        if (now - this.lastDecisionTime > this.decisionInterval) {
            this.makeDecision();
            this.lastDecisionTime = now;
        }

        // 3. Execution
        this.executeState(dt);
    },

    updateNeeds(dt) {
        // Energy drops faster if moving
        const moveCost = this.velocity.lengthSq() > 0.1 ? 2.0 : 0.5;
        this.needs.energy = Math.max(0, this.needs.energy - (moveCost * dt));
        
        // Hunger rises
        this.needs.hunger = Math.min(100, this.needs.hunger + (1.0 * dt));
        
        // Social drops slowly
        this.needs.social = Math.max(0, this.needs.social - (0.5 * dt));
    },

    makeDecision() {
        const time = this.olam.environment ? this.olam.environment.gameTime : 12;
        const isNight = time < 6 || time > 20;

        // PRIORITY 1: SLEEP (Night or Exhausted)
        if (isNight || this.needs.energy < 10) {
            this.setDecision("SLEEP", this.findHome());
            return;
        }

        // PRIORITY 2: EAT (Starving)
        if (this.needs.hunger > 80) {
            this.setDecision("EAT", this.findFoodSource());
            return;
        }

        // PRIORITY 3: WORK (Daytime, needs money)
        if (time >= 8 && time <= 18 && this.needs.wealth < 50) {
            this.setDecision("WORK", this.findWorkplace());
            return;
        }
        
        // PRIORITY 4: BUILD (Has resources, inspired)
        // B"H: NPCs contribute to the world
        if (Math.random() < 0.1 && this.needs.energy > 30) {
             const buildSpot = this.getRandomPoint();
             this.setDecision("BUILD", buildSpot);
             return;
        }

        // PRIORITY 5: SOCIAL (Lonely)
        if (this.needs.social < 30) {
            const friend = this.findNearestSoul();
            if (friend) {
                this.setDecision("TALK", friend.mesh.position);
                this.targetEntity = friend;
                return;
            }
        }

        // PRIORITY 6: WANDER
        if (this.currentActionState === "IDLE" || Math.random() < 0.1) {
            this.setDecision("WANDER", this.getRandomPoint());
        }
    },

    setDecision(state, target) {
        if (this.currentActionState === state && this.navTarget) return; // Keep doing it
        
        this.currentActionState = state;
        this.navTarget = target;
        
        // Visual feedback
        // this.olam.ayshPeula("ui event", "effectsOverlay", { text: `${this.name}: ${state}`, color: "#aaa", duration: 500 });
    },

    executeState(dt) {
        if (!this.navTarget) return;

        const dist = this.mesh.position.distanceTo(this.navTarget);

        // Movement Logic
        if (dist > 1.5) {
            const dir = new THREE.Vector3().subVectors(this.navTarget, this.mesh.position).normalize();
            
            // Jump if stuck or random joy
            if (this.onFloor && Math.random() < 0.005) this.velocity.y = 8;

            this.velocity.x = dir.x * this.speed * dt;
            this.velocity.z = dir.z * this.speed * dt;
            
            // Smooth Rotation
            const targetRot = Math.atan2(dir.x, dir.z);
            let rotDiff = targetRot - this.rotation.y;
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
            this.rotation.y += rotDiff * dt * 5;

            this.playChaweeyoos("run");
        } else {
            // Arrived logic
            this.velocity.set(0, 0, 0);
            this.processArrivalAction(dt);
        }
    },

    processArrivalAction(dt) {
        switch(this.currentActionState) {
            case "SLEEP":
                this.playChaweeyoos("idle"); // Should be sleep anim
                this.needs.energy += 10 * dt;
                break;
            case "EAT":
                this.playChaweeyoos("idle");
                this.needs.hunger = Math.max(0, this.needs.hunger - 20 * dt);
                break;
            case "WORK":
                this.playChaweeyoos("attack"); // Hammering
                this.needs.wealth += 1 * dt;
                if (Math.random() < 0.01) {
                     this.olam.player.spawnHebrewParticles(this.mesh.position, 1);
                }
                break;
            case "BUILD":
                 this.playChaweeyoos("attack"); // Gesturing creation
                 if (Math.random() < 0.01) {
                     // Verify space
                     const pos = this.navTarget.clone();
                     pos.y += 0.5;
                     
                     // B"H: Construct a Tree or Brick
                     const type = Math.random() > 0.5 ? "ProceduralTree" : "Brick";
                     const name = type === "Brick" ? "NPC Brick" : "NPC Tree";
                     
                     this.olam.addObject(type, {
                         position: pos,
                         isSolid: true,
                         name: name,
                         interactable: true,
                         golem: type === "Brick" ? { guf: { BoxGeometry: [1,1,1] }, toyr: { MeshLambertMaterial: { color: "gold" } } } : null
                     });
                     
                     this.olam.player.spawnHebrewParticles(pos, 10);
                     this.setDecision("IDLE", null); // Done building
                 }
                 break;
            case "TALK":
                this.playChaweeyoos("idle");
                this.mesh.lookAt(this.targetEntity ? this.targetEntity.mesh.position : this.mesh.position);
                this.needs.social += 10 * dt;
                if (Math.random() < 0.01) {
                    // Chat bubble simulation
                    this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Bla bla...", position: this.mesh.position, color: "white" });
                }
                break;
            default:
                this.playChaweeyoos("idle");
                break;
        }
    },

    // --- Sensing Helpers ---
    
    findHome() {
        return this.originalSpawnPosition || new THREE.Vector3(0,0,0);
    },
    
    findFoodSource() {
        // Look for Wheat fields or Store
        // Mockup: return random point
        return new THREE.Vector3(10, 0, 10);
    },
    
    findWorkplace() {
        return new THREE.Vector3(-10, 0, -10);
    },
    
    findNearestSoul() {
        if (!this.olam.nivrayim) return null;
        let closest = null;
        let minDist = Infinity;
        
        // Include player!
        const candidates = [...this.olam.nivrayim];
        if (this.olam.player) candidates.push(this.olam.player);

        for (const n of candidates) {
            if (n === this || !n.mesh) continue;
            const d = this.mesh.position.distanceTo(n.mesh.position);
            if (d < minDist && d < 20) { // Vision range
                minDist = d;
                closest = n;
            }
        }
        return closest;
    },

    getRandomPoint() {
        const r = 20;
        return new THREE.Vector3(
            (Math.random() - 0.5) * r,
            0,
            (Math.random() - 0.5) * r
        ).add(this.mesh.position);
    }
};
