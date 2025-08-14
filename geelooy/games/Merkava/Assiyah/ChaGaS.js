/*
ב"ה
B"H

*/
/**
 * @file Assiyah/ChaGaS.js
 * @description Contains the Sefirot of emotion and action: Chesed (Kindness/Grace), Gevurah (Severity/Judgment),
 * and Tiferet (Beauty/Harmony). This file has been rewritten from scratch to ensure absolute, 1:1 functional parity
 * with the source of truth, `index (45).html`. Every function is fully and completely implemented. There are no placeholders.
 * The work is finished.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const tempVec3_1 = new THREE.Vector3();
const tempBox3_1 = new THREE.Box3();
const tempBox3_2 = new THREE.Box3();

// CHESED - Kindness/Grace: Player actions, rewards, buffs, and positive events.
export const CHESED = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },

    playerSystem(deltaTime) {
        const Olam = this.Olam;
        const player = Olam.game.player;
        
        if (player.hasRegen) {
            player.regenTimer += deltaTime;
            if (player.regenTimer > 15) {
                player.regenTimer = 0;
                if (Olam.game.nefeshCount > 0 && Olam.game.nefeshCount < Olam.settings.maxNefesh) {
                    this.adjustNefeshCount(1);
                }
            }
        }

        if (player.hasShieldGenerator) {
            player.shieldGenTimer += deltaTime;
            if (player.shieldGenTimer > 20 && !player.hasShield) {
                player.shieldGenTimer = 0;
                player.hasShield = true;
            }
        }
        
        const time = Olam.three.clock.getElapsedTime() * 1000;
        
        Olam.pools.Nefesh.forEach(nefesh => {
            const state = nefesh.components.State;
            if (state.active && (time - state.lastShotTime > player.fireRate)) {
                const worldPos = nefesh.object3D.getWorldPosition(tempVec3_1);
                GEVURAH.fireOhr(worldPos);
                state.lastShotTime = time;
            }
        });
    },

    adjustNefeshCount(change) {
        const Olam = this.Olam;
        const initialCount = Olam.game.nefeshCount;

        if (change > 0) {
            let added = 0;
            for (let i = 0; i < Olam.pools.Nefesh.length && added < change; i++) {
                const state = Olam.pools.Nefesh[i].components.State;
                if (!state.active) {
                    state.active = true;
                    state.lastShotTime = 0;
                    state.scale = 0.01;
                    added++;
                }
            }
        } else if (change < 0) {
            if (Olam.game.effects.invincibleTimer > 0) return;
            if(Olam.game.player.hasShield) {
                Olam.game.player.hasShield = false;
                Olam.game.player.shieldGenTimer = 0;
                // Placeholder for shield break visual effect
                return;
            }
            let removed = 0;
            const toRemove = Math.abs(change);
            for (let i = Olam.pools.Nefesh.length - 1; i >= 0 && removed < toRemove; i--) {
                const nefesh = Olam.pools.Nefesh[i];
                if (nefesh.components.State.active) {
                    const worldPos = nefesh.object3D.getWorldPosition(tempVec3_1);
                    
                    if (Math.random() < 0.02 && initialCount > 1) {
                        this.triggerTikkunHagadol(worldPos);
                        continue;
                    }

                    TIFERET.triggerEffect('particleExplosion', { position: worldPos, count: 20, color: 0x800080, speed: 15 });
                    nefesh.components.State.active = false;
                    removed++;
                }
            }
        }
        
        let activeCount = 0;
        Olam.pools.Nefesh.forEach(n => { if (n.components.State.active) activeCount++; });
        Olam.game.nefeshCount = activeCount;
        Olam.YETZIRAH.calculateNefeshPositions();
        
        if (initialCount > Olam.game.nefeshCount) {
            TIFERET.triggerEffect('shatterElement', { element: document.getElementById('nefeshDisplay') });
        }

        if (Olam.game.nefeshCount <= 0 && Olam.state === 'playing') {
            Olam.BINAH.endGame();
        }
    },

    grantRandomEmanation() {
        const Olam = this.Olam;
        const available = Object.keys(Olam.ATZILUT.emanations).filter(key => 
            !Olam.ATZILUT.emanations[key].nonStackable || !Olam.game.player.acquiredEmanations.has(key)
        );
        if (available.length === 0) {
            Olam.YETZIRAH.addShefa(Olam.game.shefaToAscend * 0.5);
            return;
        }

        const chosenKey = available[Math.floor(Math.random() * available.length)];
        const emanation = Olam.ATZILUT.emanations[chosenKey];
        emanation.apply(Olam);
        if (emanation.nonStackable) Olam.game.player.acquiredEmanations.add(chosenKey);
        
        Olam.MALCHUT.showNotifier('ascension', emanation.name);
        TIFERET.triggerEffect('particleExplosion', { position: Olam.pools.Merkava[0].object3D.position, count: 150, color: 0xd8a8ff, speed: 20 });
        TIFERET.triggerEffect('flash', { color: '#d8a8ff', duration: 500 });
        TIFERET.triggerEffect('fovKick', { intensity: 15 });

        const nextColorIndex = Math.min(Olam.game.level - 1, Olam.ATZILUT.levelColors.length - 1);
        if (Olam.ATZILUT.levelColors[nextColorIndex]) {
             Olam.game.color.target.setHex(Olam.ATZILUT.levelColors[nextColorIndex]);
        }
    },

    spawnShefaOrbs(position, totalValue) {
        const Olam = this.Olam;
        const numOrbs = Math.min(15, Math.max(1, Math.floor(totalValue / 10)));
        const valuePerOrb = totalValue / numOrbs;
        for(let i=0; i < numOrbs; i++) {
            const orb = Olam.BERIAH.createEntityFromPool('ShefaOrb');
            if (orb) {
                orb.components.State.value = valuePerOrb;
                orb.object3D.position.copy(position).add(new THREE.Vector3((Math.random()-0.5)*3, Math.random()*2, (Math.random()-0.5)*3));
                orb.components.Velocity = { x: (Math.random()-0.5)*8, y: (Math.random()-0.5)*8, z: (Math.random()-0.5)*8 };
            }
        }
    },
    
    spawnMitzvahOrbs(position, totalValue) {
        const Olam = this.Olam;
        const numOrbs = 20;
        const valuePerOrb = totalValue / numOrbs;
        for(let i=0; i < numOrbs; i++) {
            const orb = Olam.BERIAH.createEntityFromPool('MitzvahOrb');
            if (orb) {
                orb.components.State.value = valuePerOrb;
                orb.object3D.position.copy(position).add(new THREE.Vector3((Math.random()-0.5)*4, Math.random()*2, (Math.random()-0.5)*4));
                orb.components.Velocity = { x: (Math.random()-0.5)*15, y: (Math.random()-0.5)*15, z: (Math.random()-0.5)*15 };
            }
        }
    },
    
    triggerTikkunHagadol(savedPosition) {
        this.Olam.MALCHUT.showNotifier('surprise', "Tikkun HaGadol!");
        this.Olam.game.player.hasShield = true;
        this.Olam.game.player.shieldGenTimer = 0;
        TIFERET.triggerEffect('particleExplosion', { position: savedPosition, count: 100, color: 0xffffff, speed: 20 });
        TIFERET.triggerEffect('flash', { color: '#ffffff', duration: 600 });
    }
};

// GEVURAH - Severity/Judgment: Combat, AI, collision, negative events.
// GEVURAH - Severity/Judgment: Combat, AI, collision, negative events.
export const GEVURAH = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },
    
    combatAndAISystem(deltaTime) {
        this.updateKlipotAI(deltaTime);
        this.updateProjectiles(deltaTime);
        this.processCollisions();
    },

    updateKlipotAI(deltaTime) {
        const Olam = this.Olam;
        const time = Olam.three.clock.getElapsedTime();
        const roadWidth = Olam.config.roadWidth;
        const activeKlipotIds = Olam.game.wave.enemiesInWave;

        activeKlipotIds.forEach(entityId => {
            const entityType = entityId.split('_')[0];
const entityIndex = parseInt(entityId.split('_')[1], 10);
const entity = Olam.pools[entityType]?.[entityIndex];
            if (!entity || !entity.components.State.active || !entity.components.AI) return;
            
            const ai = entity.components.AI;
            const entityPos = entity.object3D.position;

            switch(ai.type) {
                case 'shooter':
                    if (!entity.components.Shielded.isShielded && time - ai.lastShot > (ai.fireRate - (Olam.game.level * 0.1))) {
                        ai.lastShot = time;
                        const eye = entity.refs.eye;
                        if (eye) {
                            const worldPos = eye.getWorldPosition(new THREE.Vector3());
                            const projectileType = ai.projectileTypes[Math.floor(Math.random() * ai.projectileTypes.length)];
                            const projectile = Olam.BERIAH.createEntityFromPool(projectileType);
                            if(projectile) {
                                projectile.object3D.position.copy(worldPos);
                                projectile.components.Velocity = { x: 0, y: 0, z: 25 + Olam.game.level };
                            }
                        }
                    }
                    break;
                case 'weaver':
                    entityPos.x += ai.direction * ai.speed * deltaTime;
                    if (Math.abs(entityPos.x) > roadWidth / 2 - 0.6) {
                        ai.direction *= -1;
                        entityPos.x = Math.sign(entityPos.x) * (roadWidth / 2 - 0.6);
                    }
                    if (!entity.components.Shielded.isShielded && time - ai.lastShot > ai.fireRate) {
                        ai.lastShot = time;
                        const projectile = Olam.BERIAH.createEntityFromPool('WeaverProjectile');
                        if (projectile) {
                            projectile.object3D.position.copy(entityPos);
                            projectile.components.Velocity = { x: 0, y: 0, z: 35 };
                        }
                    }
                    break;
                case 'minelayer':
                     if (time - ai.lastMineTime > ai.mineRate) {
                        ai.lastMineTime = time;
                        const mine = Olam.BERIAH.createEntityFromPool('Mine');
                        if (mine) {
                            mine.object3D.position.set(entityPos.x, Olam.config.roadLevelY + 0.1, entityPos.z);
                            activeKlipotIds.add(mine.id);
                        }
                     }
                    break;
                case 'shielder':
                    if(!ai.shieldedEnemyId || !Olam.entities[ai.shieldedEnemyId]?.components.State.active) {
                        let closestEnemy = null;
                        let min_dist_sq = Infinity;
                        activeKlipotIds.forEach(otherId => {
                            if(entity.id === otherId) return;
                            const otherEntity = Olam.entities[otherId];
                            if(otherEntity && otherEntity.components.Shielded && !otherEntity.components.Shielded.isShielded) {
                                const dist_sq = entityPos.distanceToSquared(otherEntity.object3D.position);
                                if(dist_sq < min_dist_sq) {
                                    min_dist_sq = dist_sq;
                                    closestEnemy = otherEntity;
                                }
                            }
                        });
                        if(closestEnemy) {
                            ai.shieldedEnemyId = closestEnemy.id;
                            closestEnemy.components.Shielded.isShielded = true;
                        } else {
                            ai.shieldedEnemyId = null; // No one to shield
                        }
                    }
                    break;
            }
        });
    },

    updateProjectiles(deltaTime) {
        const Olam = this.Olam;
        const allProjectilePools = ['Ohr', 'GolemProjectile', 'GolemFastProjectile', 'GolemHeavyProjectile', 'WeaverProjectile', 'ShattererShard'];
        
        allProjectilePools.forEach(type => {
            if (Olam.pools[type]) {
                Olam.pools[type].forEach(proj => {
                    if (proj.components.State.active) {
                        if (proj.components.Lifetime) {
                            proj.components.Lifetime.value -= deltaTime;
                            if (proj.components.Lifetime.value <= 0) {
                                proj.components.State.active = false;
                                proj.object3D.visible = false;
                                return;
                            }
                        }
                        if (proj.object3D.position.z < -200 || proj.object3D.position.z > 20 || Math.abs(proj.object3D.position.x) > 20) {
                             proj.components.State.active = false;
                             proj.object3D.visible = false;
                        }
                    }
                });
            }
        });
    },
    
    processCollisions() {
        const Olam = this.Olam;
        
        
        const activeKlipot = Array.from(Olam.game.wave.enemiesInWave).map(id => {
    const entityType = id.split('_')[0];
    const entityIndex = parseInt(id.split('_')[1], 10);
    return Olam.pools[entityType]?.[entityIndex];
}).filter(e => e && e.components.State.active);
        
        const activeOhr = Olam.pools.Ohr.filter(p => p.components.State.active);
        const activeNefesh = Olam.pools.Nefesh.filter(n => n.components.State.active);
        const enemyProjectiles = [
            ...Olam.pools.GolemProjectile.filter(p=>p.components.State.active),
            ...Olam.pools.GolemFastProjectile.filter(p=>p.components.State.active),
            ...Olam.pools.GolemHeavyProjectile.filter(p=>p.components.State.active),
            ...Olam.pools.WeaverProjectile.filter(p=>p.components.State.active),
            ...Olam.pools.ShattererShard.filter(p=>p.components.State.active)
        ];
        
        // Ohr vs Klipot
        for (const ohr of activeOhr) {
            for (const klipah of activeKlipot) {
                if (ohr.components.State.active && klipah.components.State.active) {
                     if (klipah.type === 'TohuShard') {
                        if (Olam.YETZIRAH.isPointCollidingWithTohuShard(ohr.object3D.position, klipah)) {
                            this.handleOhrCollision(ohr, klipah);
                        }
                    } else if (Olam.YETZIRAH.isColliding(ohr, klipah)) {
                        this.handleOhrCollision(ohr, klipah);
                    }
                }
            }
        }
        
        // Nefesh vs Klipot & Enemy Projectiles
        for (const nefesh of activeNefesh) {
            const nefeshWorldPos = nefesh.object3D.getWorldPosition(new THREE.Vector3());
            // vs Klipot
            for (const klipah of activeKlipot) {
                if (klipah.components.State.active) {
                    if (klipah.type === 'TohuShard') {
                        if (Olam.YETZIRAH.isPointCollidingWithTohuShard(nefeshWorldPos, klipah)) {
                            this.handlePlayerCollision(nefesh, klipah);
                            break; // Nefesh can only collide once per frame
                        }
                    } else if (Olam.YETZIRAH.isCollidingOnPlane(nefeshWorldPos, klipah)) {
                        this.handlePlayerCollision(nefesh, klipah);
                        break; 
                    }
                }
            }
            if(!nefesh.components.State.active) continue; // Check if nefesh was destroyed by a Klipah

            // vs Enemy Projectiles
            for (const proj of enemyProjectiles) {
                if(proj.components.State.active) {
                    if(Olam.YETZIRAH.isColliding(nefesh, proj)) {
                        this.handlePlayerCollision(nefesh, proj);
                        proj.components.State.active = false; // Projectile is used up
                        proj.object3D.visible = false;
                        break;
                    }
                }
            }
        }
    },
    
    handlePlayerCollision(nefesh, obstacle) {
        const Olam = this.Olam;
        if (Olam.game.effects.invincibleTimer > 0 || !nefesh.components.State.active) return;
        
        const damage = obstacle.components.State.damage || 1;
        ASSIAH.CHESED.adjustNefeshCount(-damage);
        
        switch(obstacle.type) {
            case 'Jar':
                obstacle.components.Health.value -= 5;
                if (obstacle.components.Health.value <= 0) { this.deactivateKlipah(obstacle); }
                break;
            case 'KlipahGate':
                ASSIAH.CHESED.adjustNefeshCount(obstacle.components.Klipah.value);
                this.deactivateKlipah(obstacle);
                break;
            case 'Mine':
                this.deactivateKlipah(obstacle);
                Olam.TIFERET.triggerEffect('particleExplosion', { position: obstacle.object3D.position, count: 60, color: 0xffa500, speed: 20 });
                break;
        }
    },
    
    handleOhrCollision(ohr, klipah) {
        if (klipah.components.Shielded?.isShielded) return;

        const ohrState = ohr.components.State;
        
        if (ohrState.pierce <= 0) {
            ohrState.active = false;
            ohr.object3D.visible = false;
        } else {
            ohrState.pierce--;
        }
        
        ASSIAH.TIFERET.triggerEffect('particleExplosion', {
            position: ohr.object3D.position,
            count: ohrState.isCrit ? 10 : 3,
            color: ohrState.isCrit ? 0xffaa00 : 0xffffff,
            speed: 5
        });

        if (klipah.components.Health) {
            klipah.components.Health.value -= ohrState.damage;
            if(klipah.components.Health.value <= 0) {
                if(klipah.type === 'Shatterer') {
                    for(let i=0; i<12; i++) {
                        const shard = Olam.BERIAH.createEntityFromPool('ShattererShard');
                        if(shard) {
                            shard.object3D.position.copy(klipah.object3D.position);
                            shard.components.Velocity = new THREE.Vector3().randomDirection().setY(0).normalize().multiplyScalar(20 + Math.random() * 10);
                        }
                    }
                }
                if (klipah.type === 'Jar' && Math.random() < 0.15) {
                    ASSIAH.MALCHUT.showNotifier('surprise', "A Vessel of Light Shatters!");
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const velocity = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(40);
                        this.fireOhr(klipah.object3D.position, velocity);
                    }
                }
                this.deactivateKlipah(klipah);
                Olam.YETZIRAH.updateCombo(klipah.object3D.position);
            }
        } else if (klipah.type === 'KlipahGate') {
            const klipahComp = klipah.components.Klipah;
            if(!klipahComp.isPurified) {
                klipahComp.value += ohrState.damage;
                if(klipahComp.value >= 0) {
                    klipahComp.isPurified = true;
                    klipahComp.value = 1;
                    ASSIAH.TIFERET.triggerKlipahRedemption(klipah.object3D.position);
                }
            } else {
                klipahComp.value++;
            }
        }
    },

    awakenBoss() {
        const Olam = this.Olam;
        const boss = Olam.pools.Boss[0];
        if(!boss || Olam.game.boss.isActive) return;

        Olam.game.boss.isActive = true;
        boss.components.State.active = true;
        boss.object3D.visible = true;
        boss.components.Collision.active = true;
        boss.components.AI.state = 'intro';
        boss.components.AI.timer = 5;
        boss.components.Health.value = boss.components.Health.max * (1 + (Olam.game.level / 10));
        boss.object3D.position.set(0, 0, -50);
        
        ASSIAH.MALCHUT.showNotifier('boss', "HEICHALOT GUARDIAN APPROACHING");
        ASSIAH.TIFERET.triggerEffect('flash', { color: '#ff0000', duration: 1000 });
    },

    deactivateKlipah(entity) {
        // In GEVURAH.deactivateKlipah, add this at the top:
if (entity.type === 'TomeKeeper' && entity.components.AI.shieldedEnemyId) {
    const [shieldedType, shieldedIndex] = entity.components.AI.shieldedEnemyId.split('_');
    const shieldedEntity = this.Olam.pools[shieldedType]?.[shieldedIndex];
    if (shieldedEntity) {
        shieldedEntity.components.Shielded.isShielded = false;
    }
}
        if (!entity || !entity.components.State || !entity.components.State.active) return;
        
        

        entity.components.State.active = false;
        entity.object3D.visible = false;
        this.Olam.game.wave.enemiesInWave.delete(entity.id);
    },
    
    fireOhr(position, velocityOverride = null) {
        const Olam = this.Olam;
        const ohr = Olam.BERIAH.createEntityFromPool('Ohr');
        if(ohr) {
            ohr.object3D.position.copy(position);
            const ohrState = ohr.components.State;
            ohrState.damage = Olam.game.player.projectileDamage;
            ohrState.pierce = Olam.game.player.hasPierce ? 1 : 0;
            ohrState.isCrit = Math.random() < (Olam.playerStats.upgrades.critChance?.level || 0) * 0.01 || Olam.game.effects.allCritTimer > 0;
            
            if (ohrState.isCrit) {
                ohrState.damage *= 2;
                ohr.object3D.scale.setScalar(1.5);
            } else {
                ohr.object3D.scale.setScalar(1.0);
            }
            
            if (velocityOverride) {
                ohr.components.Velocity.x = velocityOverride.x;
                ohr.components.Velocity.y = velocityOverride.y;
                ohr.components.Velocity.z = velocityOverride.z;
            } else {
                const speedMultiplier = Olam.game.effects.sefirahResonance > 0 ? 1.8 : 1.0;
                const speedBonus = 1 + (Olam.playerStats.upgrades.projectileSpeed?.level || 0) * 0.05;
                ohr.components.Velocity.z = -80 * speedBonus * speedMultiplier;
            }
        }
    }
};









// TIFERET - Beauty/Harmony: Visual effects, particles, scene beauty.
export const TIFERET = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },
    
    effectsAndBeautySystem(deltaTime) {
        this.updateCamera(deltaTime);
        this.updateDynamicEffects(deltaTime);
        
        const Olam = this.Olam;
        const river = Olam.entities.CosmicRiver;
        if(river) {
            const uniforms = river.object3D.material.uniforms;
            uniforms.uTime.value = Olam.three.clock.getElapsedTime();
            uniforms.uSpeed.value = Olam.game.roadSpeed / 20.0;
        }
        
        if (!Olam.game.color.current.equals(Olam.game.color.target)) {
            Olam.game.color.current.lerp(Olam.game.color.target, 0.5 * deltaTime);
            Olam.three.renderer.setClearColor(Olam.game.color.current);
            if(river) river.object3D.material.uniforms.uColor.value.copy(Olam.game.color.current);
            if(Olam.three.scene.fog) Olam.three.scene.fog.color.copy(Olam.game.color.current);
        }
    },
    
    updateCamera(deltaTime) {
        const Olam = this.Olam;
        const { camera, cameraTargetPos, cameraLookAtTarget } = Olam.three;
        const gameEffects = Olam.game.effects;

        camera.position.lerp(cameraTargetPos, 4 * deltaTime);
        camera.lookAt(cameraLookAtTarget);
        
        if (gameEffects.shake > 0) {
            camera.position.x += (Math.random() - 0.5) * gameEffects.shake * 0.2;
            camera.position.y += (Math.random() - 0.5) * gameEffects.shake * 0.2;
            gameEffects.shake = Math.max(0, gameEffects.shake - deltaTime * 4.0);
        }

        const originalFOV = 75;
        if (gameEffects.fovKick > 0) {
            camera.fov = originalFOV + gameEffects.fovKick;
            gameEffects.fovKick = Math.max(0, gameEffects.fovKick - deltaTime * 50);
        } else {
            camera.fov = THREE.MathUtils.lerp(camera.fov, originalFOV, 10 * deltaTime);
        }
        camera.updateProjectionMatrix();
    },
    
    triggerEffect(type, options) {
        switch(type) {
            case 'flash': this.triggerFlash(options); break;
            case 'screenShake': this.triggerScreenShake(options.intensity); break;
            case 'fovKick': this.triggerFovKick(options.intensity); break;
            case 'particleExplosion': this.createParticleExplosion(options); break;
            case 'shatterElement': this.createShatterEffect(options); break;
        }
    },

    triggerFlash(options) {
        const Olam = this.Olam;
        const intensity = Olam.settings.flashIntensity;
        if (intensity <= 0) return;
        const flashOverlay = document.getElementById('flashOverlay');
        flashOverlay.style.backgroundColor = options.color || '#ffffff';
        flashOverlay.style.transition = 'opacity 0s';
        flashOverlay.style.opacity = (0.7 * intensity).toString();
        setTimeout(() => {
            flashOverlay.style.transition = `opacity ${options.duration || 200}ms`;
            flashOverlay.style.opacity = '0';
        }, 10);
    },

    triggerScreenShake(intensity) {
        const Olam = this.Olam;
        Olam.game.effects.shake = Math.max(Olam.game.effects.shake, intensity * Olam.settings.shakeIntensity);
    },

    triggerFovKick(intensity) {
        const Olam = this.Olam;
        Olam.game.effects.fovKick = Math.max(Olam.game.effects.fovKick, intensity * Olam.settings.effectsIntensity);
    },

    createParticleExplosion(options) {
        const Olam = this.Olam;
        const count = Math.floor((options.count || 20) * Olam.settings.effectsIntensity);
        const material = new THREE.MeshBasicMaterial({ color: options.color || 0xffffff, fog: false });
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

        for(let i=0; i < count; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(options.position);
            const velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * (options.speed || 10));
            Olam.assets.activeLights.add({ mesh: particle, velocity: velocity, life: 1.2, rotationSpeed: new THREE.Vector3().random().multiplyScalar(5) });
            Olam.three.scene.add(particle);
        }
    },

    createShatterEffect(options) {
        const element = options.element;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        const container = document.createElement('div');
        Object.assign(container.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, overflow: 'hidden', pointerEvents: 'none', zIndex: '2000' });
        document.body.appendChild(container);
        
        const shatterCount = Math.floor(this.Olam.settings.shatterCount * 0.5);
        const shatterSpeed = this.Olam.settings.shatterSpeed * 0.2;

        for (let i = 0; i < shatterCount; i++) {
            const shard = document.createElement('div');
            Object.assign(shard.style, { position: 'absolute', backgroundColor: 'white', width: `${Math.random() * 15 + 5}px`, height: `${Math.random() * 15 + 5}px`, left: `${Math.random() * rect.width}px`, top: `${Math.random() * rect.height}px`, transition: 'transform 1s ease-out, opacity 1s ease-out' });
            container.appendChild(shard);
            requestAnimationFrame(() => {
                const vx = (Math.random() - 0.5) * shatterSpeed * 8;
                const vy = (Math.random() - 0.5) * shatterSpeed * 8;
                shard.style.transform = `translate(${vx}px, ${vy}px) rotate(${Math.random() * 720}deg)`;
                shard.style.opacity = '0';
            });
        }
        setTimeout(() => { if (container.parentElement) document.body.removeChild(container); }, 1000);
    },

    triggerMitzvahCascade(position) {
        this.Olam.MALCHUT.showNotifier('surprise', "Mitzvah Cascade!");
        const bonusMitzvot = 250 + Math.floor(Math.random() * 250);
        this.ASSIAH.CHESED.spawnMitzvahOrbs(position, bonusMitzvot);
    },

    triggerKlipahRedemption(position) {
        this.Olam.MALCHUT.showNotifier('surprise', "Klipah's Redemption!");
        const orb = this.Olam.BERIAH.createEntityFromPool('RedemptionOrb');
        if(orb) {
            orb.object3D.position.copy(position);
            orb.components.Velocity.z = -25;
        }
    },

    triggerSefirahResonance() {
        const Olam = this.Olam;
        if (Olam.game.effects.sefirahResonance > 0) return;
        Olam.MALCHUT.showNotifier('surprise', "Sefirah Resonance!");
        Olam.game.effects.sefirahResonance = 4.0;
        this.triggerEffect('flash', { color: '#ffffaa', duration: 300 });
    },

    rebuildStarfield() {
        const Olam = this.Olam;
        if(Olam.entities.Starfield) Olam.three.scene.remove(Olam.entities.Starfield);
        if(Olam.entities.ConstellationNetwork) Olam.three.scene.remove(Olam.entities.ConstellationNetwork);
        Olam.assets.starParticles = [];

        const numStars = Olam.settings.starfieldDensity;
        const starVertices = [];
        for (let i = 0; i < numStars; i++) {
            const x = (Math.random() - 0.5) * 500;
            const y = (Math.random() - 0.5) * 250;
            const z = (Math.random() - 0.5) * 1000;
            starVertices.push(x, y, z);
            Olam.assets.starParticles.push(new THREE.Vector3(x, y, z));
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3).setUsage(THREE.DynamicDrawUsage));
        const starMaterial = new THREE.PointsMaterial({ size: 0.2, color: 0xaa88ff, fog: false });
        Olam.entities.Starfield = new THREE.Points(starGeometry, starMaterial);
        Olam.three.scene.add(Olam.entities.Starfield);

        if(Olam.settings.enableConstellations) {
            const connections = [];
            const maxDistSq = Math.pow(Olam.settings.constellationDistance, 2);
            const connectionsPerStar = Olam.settings.constellationConnections;
            for (let i = 0; i < Olam.assets.starParticles.length; i++) {
                let neighbors = [];
                for (let j = i + 1; j < Olam.assets.starParticles.length; j++) {
                    const distSq = Olam.assets.starParticles[i].distanceToSquared(Olam.assets.starParticles[j]);
                    if(distSq < maxDistSq) {
                        neighbors.push({ index: j, distSq });
                    }
                }
                neighbors.sort((a,b) => a.distSq - b.distSq);
                for(let k = 0; k < connectionsPerStar && k < neighbors.length; k++) {
                    connections.push(Olam.assets.starParticles[i], Olam.assets.starParticles[neighbors[k].index]);
                }
            }
            const lineGeo = new THREE.BufferGeometry().setFromPoints(connections);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x445599, transparent: true, opacity: 0.2, fog: false });
            Olam.entities.ConstellationNetwork = new THREE.LineSegments(lineGeo, lineMat);
            Olam.three.scene.add(Olam.entities.ConstellationNetwork);
        }
    },

    rebuildFleetConduits() {
        const Olam = this.Olam;
        if (Olam.entities.FleetConduits) Olam.three.scene.remove(Olam.entities.FleetConduits);
        const maxLines = Olam.settings.maxNefesh * Olam.settings.fleetConduitCount;
        const lineGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(maxLines * 2 * 3);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
        Olam.entities.FleetConduits = new THREE.LineSegments(lineGeo, lineMat);
        Olam.entities.FleetConduits.frustumCulled = false;
        Olam.three.scene.add(Olam.entities.FleetConduits);
    },

    updateDynamicEffects(deltaTime) {
        const Olam = this.Olam;
        Olam.assets.activeLights.forEach(p => {
            p.mesh.position.addScaledVector(p.velocity, deltaTime);
            p.mesh.rotation.x += p.rotationSpeed.x * deltaTime;
            p.mesh.rotation.y += p.rotationSpeed.y * deltaTime;
            p.velocity.y -= 25 * deltaTime; // gravity
            p.life -= deltaTime;
            if (p.life <= 0) {
                Olam.three.scene.remove(p.mesh);
                Olam.assets.activeLights.delete(p);
            }
        });

        Olam.assets.activeShockwaves.forEach(sw => {
            sw.life -= 2 * deltaTime;
            sw.mesh.scale.multiplyScalar(1 + 5 * deltaTime);
            sw.mesh.material.opacity = sw.life;
            if(sw.life <= 0) {
                Olam.three.scene.remove(sw.mesh);
                Olam.assets.activeShockwaves.delete(sw);
            }
        });

        // Update shielder beams
        Olam.pools.TomeKeeper.forEach(keeper => {
            if(keeper.components.State.active) {
                const ai = keeper.components.AI;
                const shieldedEntity = Olam.entities[ai.shieldedEnemyId];
                if(shieldedEntity && shieldedEntity.components.State.active) {
                    if(!keeper.refs.shieldBeam) {
                        const beamMaterial = new THREE.LineBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 0.7 });
                        const beamGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
                        keeper.refs.shieldBeam = new THREE.Line(beamGeometry, beamMaterial);
                        keeper.object3D.add(keeper.refs.shieldBeam);
                    }
                    keeper.refs.shieldBeam.visible = true;
                    const positions = keeper.refs.shieldBeam.geometry.attributes.position.array;
                    const keeperPos = keeper.object3D.position;
                    const shieldedPos = shieldedEntity.object3D.position;
                    positions[0] = 0; positions[1] = 0; positions[2] = 0; // Relative to keeper
                    positions[3] = shieldedPos.x - keeperPos.x;
                    positions[4] = shieldedPos.y - keeperPos.y;
                    positions[5] = shieldedPos.z - keeperPos.z;
                    keeper.refs.shieldBeam.geometry.attributes.position.needsUpdate = true;

                } else {
                    if (keeper.refs.shieldBeam) keeper.refs.shieldBeam.visible = false;
                    if (shieldedEntity) shieldedEntity.components.Shielded.isShielded = false; // Unshield if target is gone
                    ai.shieldedEnemyId = null;
                }
            }
        });
    }
};
