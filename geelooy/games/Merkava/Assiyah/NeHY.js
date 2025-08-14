/*
ב"ה
B"H
*/

/**
 * @file Assiyah/NeHY.js
 * @description Contains the Sefirot of action and structure: Netzach (Endurance/Victory), Hod (Splendor/Glory),
 * and Yesod (Foundation). This is the final, fully implemented version.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// NETZACH - Endurance/Victory: Game flow, wave spawning, progression.
export const NETZACH = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },

    progressionAndEnduranceSystem(deltaTime) {
        const Olam = this.Olam;
        const time = Olam.three.clock.getElapsedTime();
        const game = Olam.game;

        if (!game.wave.isTracking && !game.boss.isActive && time > game.wave.nextSpawnTime) {
            this.spawnWave();
        }

        if (game.boss.isActive) {
            this.updateBossAI(deltaTime);
        }

        this.checkWaveCompletion();

        if (Math.random() < Math.min(0.95, 0.4 + (Olam.game.level * 0.025))) {
            this.spawnSpecialParticle();
        }
    },

    spawnWave() {
        const Olam = this.Olam;
        const patternSet = Olam.YETZIRAH.getPatternSet();
        const patternGenerator = patternSet[Math.floor(Math.random() * patternSet.length)];
        const pattern = patternGenerator();
        
        let furthestZOffset = 0;
        pattern.forEach(p => { if (p.zOffset && p.zOffset < furthestZOffset) { furthestZOffset = p.zOffset; }});

        const spawnZ = -130;
        const waveId = Olam.game.wave.waveId++;
        
        // Clear previous wave's enemies IF THEY ARE NOT part of the current active set
        const activeIds = new Set();
        Olam.game.wave.enemiesInWave.forEach(id => activeIds.add(id));
        Olam.game.wave.enemiesInWave.clear();


        pattern.forEach(klipahDef => {
            const laneIndex = klipahDef.lane !== undefined ? klipahDef.lane : Math.floor(Math.random() * 3);
            const position = {
                x: Olam.config.lanePositions[laneIndex],
                y: Olam.config.roadLevelY,
                z: spawnZ + (klipahDef.zOffset || 0)
            };
            const klipah = Olam.BERIAH.createEntityFromPool(klipahDef.type, { Position: position });
            if (klipah) {
                klipah.object3D.userData.waveId = waveId;
                Olam.game.wave.enemiesInWave.add(klipah.id);
            }
        });

        Olam.game.wave.isTracking = true;
        Olam.game.wave.hitsTakenThisWave = 0;
        Olam.game.wave.nextSpawnTime = Olam.three.clock.getElapsedTime() + Math.abs(furthestZOffset / Olam.game.roadSpeed) + 4;
    },
    
    spawnSpecialParticle() {
        const Olam = this.Olam;
        if (Olam.assets.specialParticleTextures.length === 0) return;

        if (Math.random() < 0.005) {
            const particle = Olam.BERIAH.createEntityFromPool('SpecialParticle');
            if (!particle) return;
            particle.object3D.material.map = null;
            particle.object3D.material.color.set(0xffffff);
            particle.object3D.scale.set(3, 3, 3);
            particle.object3D.position.set((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 60, -150);
            const state = particle.components.State;
            state.life = 6.0; state.type = 'ein_sof_glimmer'; state.velocity.set(0, 0, 50 + Olam.game.level * 3);
            ASSIAH.MALCHUT.showNotifier('surprise', "A Glimmer of Ein Sof appears!", "#ffffff");
            return;
        }

        const particle = Olam.BERIAH.createEntityFromPool('SpecialParticle');
        if (!particle) return;
        
        const texture = Olam.assets.specialParticleTextures[Math.floor(Math.random() * Olam.assets.specialParticleTextures.length)];
        particle.object3D.material.map = texture;
        particle.object3D.material.color.set(0xffffff);
        particle.object3D.material.opacity = 0.1 + Math.random() * 0.5;
        const scale = Olam.settings.minParticleSize + Math.random() * (Olam.settings.maxParticleSize - Olam.settings.minParticleSize);
        particle.object3D.scale.set(scale, scale, scale);
        
        const x = (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 60;
        particle.object3D.position.set(x, y, -150);
        
        const state = particle.components.State;
        state.life = 5.0; state.type = 'special_particle';
        const baseSpeed = 40 + (Olam.game.level * 3);
        const randomSpeed = 20 + Olam.game.level * 2;
        state.velocity.set(0, 0, baseSpeed + Math.random() * randomSpeed);
    },

    checkWaveCompletion() {
        const Olam = this.Olam;
        if (Olam.game.wave.isTracking && Olam.game.wave.enemiesInWave.size === 0) {
            Olam.game.wave.isTracking = false;
            
            if (Olam.game.wave.hitsTakenThisWave === 0) {
                ASSIAH.MALCHUT.showNotifier('perfectWave', "PERFECT WAVE!");
                Olam.YETZIRAH.addShefa(50);
                Olam.game.mitzvot += 100;

                if(Math.random() < 0.25 && Olam.playerStats.upgrades.commandmentsAuthority?.level < 10) {
                    Olam.playerStats.tabletFragments++;
                    Olam.BINAH.savePlayerStats();
                    ASSIAH.MALCHUT.showNotifier('surprise', `Tablet Fragment Found! (${Olam.playerStats.tabletFragments}/10)`, "#00f0ff");
                }
                
                Olam.pools.Nefesh.forEach(nefesh => {
                    if (nefesh.components.State.active) {
                        const worldPos = nefesh.object3D.getWorldPosition(new THREE.Vector3());
                        const echoOhr = Olam.BERIAH.createEntityFromPool('Ohr');
                        if (echoOhr) {
                            echoOhr.object3D.material = Olam.BERIAH.createMaterial('EchoOhr');
                            echoOhr.object3D.position.copy(worldPos);
                            const state = echoOhr.components.State;
                            state.damage = 2; state.pierce = 1; state.isEcho = true;
                            echoOhr.components.Velocity.z = -120;
                        }
                    }
                });
            }
        }
    },

    updateBossAI(deltaTime) {
        const Olam = this.Olam;
        const boss = Olam.pools.Boss[0];
        if (!boss.components.State.active) return;
        
        const ai = boss.components.AI;
        ai.timer -= deltaTime;
        
        switch(ai.state) {
            case 'intro':
                boss.object3D.position.z = THREE.MathUtils.lerp(boss.object3D.position.z, -30, 0.05);
                if (ai.timer <= 0) { ai.state = 'attacking_volley'; ai.timer = 4; }
                break;
            case 'attacking_volley':
                if (ai.timer <= 0) {
                    for(let i = 0; i < 5; i++) {
                        const proj = Olam.BERIAH.createEntityFromPool('GolemFastProjectile');
                        if(proj) {
                            const angle = (i / 5) * Math.PI - Math.PI / 2;
                            const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 1).normalize();
                            proj.object3D.position.copy(boss.object3D.position).add(new THREE.Vector3(0, 3, 0));
                            proj.components.Velocity = direction.multiplyScalar(30).toObject();
                        }
                    }
                    ai.state = 'attacking_sweep'; ai.timer = 3.5 - Math.min(2, Olam.game.level * 0.1);
                }
                break;
            case 'attacking_sweep':
                if (ai.timer <= 0) {
                    const openLane = Math.floor(Math.random() * 3);
                    for(let i = 0; i < 3; i++) {
                        if (i === openLane) continue;
                        const proj = Olam.BERIAH.createEntityFromPool('GolemHeavyProjectile');
                        if(proj) {
                            proj.object3D.position.copy(boss.object3D.position).add(new THREE.Vector3(Olam.config.lanePositions[i], 2, 0));
                            proj.components.Velocity = { x: 0, y: 0, z: 18 };
                        }
                    }
                    ai.state = 'vulnerable'; ai.timer = 3.0;
                }
                break;
            case 'vulnerable':
                boss.refs.core.material.emissive.setHex(0xffaa00);
                if (ai.timer <= 0) {
                    boss.refs.core.material.emissive.setHex(0xaa00ff);
                    ai.state = 'attacking_volley'; ai.timer = 2.0;
                }
                break;
        }
    }
};

// HOD - Splendor/Glory: Rendering, final scene composition, and visual networks.
export const HOD = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },

    splendorAndRenderSystem() {
        this.updateVisualNetworks();
        this.Olam.three.renderer.render(this.Olam.three.scene, this.Olam.three.camera);
    },

    updateVisualNetworks() {
        const Olam = this.Olam;
        if (Olam.settings.enableFleetConduits) this.updateFleetConduits();
        if (Olam.settings.enableParticleNetwork) this.updateParticleConstellations();
        this.updateStarfieldScrolling();
    },

    updateFleetConduits() {
        const Olam = this.Olam;
        if (!Olam.entities.FleetConduits) return;
        const activeNefesh = Olam.pools.Nefesh.filter(n => n.components.State.active);
        const positions = Olam.entities.FleetConduits.geometry.attributes.position.array;
        let lineIndex = 0;
        const maxLines = positions.length / 6;
        if(activeNefesh.length < 2) { Olam.entities.FleetConduits.geometry.setDrawRange(0, 0); return; }

        for (let i = 0; i < activeNefesh.length; i++) {
            const p1 = activeNefesh[i].object3D.getWorldPosition(new THREE.Vector3());
            let neighbors = [];
            for (let j = i + 1; j < activeNefesh.length; j++) {
                const p2 = activeNefesh[j].object3D.getWorldPosition(new THREE.Vector3());
                neighbors.push({ p2: p2, distSq: p1.distanceToSquared(p2) });
            }
            neighbors.sort((a,b) => a.distSq - b.distSq);

            for (let k = 0; k < Olam.settings.fleetConduitCount && k < neighbors.length; k++) {
                if (lineIndex >= maxLines) break;
                const p2 = neighbors[k].p2;
                positions[lineIndex*6+0] = p1.x; positions[lineIndex*6+1] = p1.y; positions[lineIndex*6+2] = p1.z;
                positions[lineIndex*6+3] = p2.x; positions[lineIndex*6+4] = p2.y; positions[lineIndex*6+5] = p2.z;
                lineIndex++;
            }
            if (lineIndex >= maxLines) break;
        }
        Olam.entities.FleetConduits.geometry.setDrawRange(0, lineIndex * 2);
        Olam.entities.FleetConduits.geometry.attributes.position.needsUpdate = true;
    },

    updateParticleConstellations() {
        const Olam = this.Olam;
        if (!Olam.entities.ParticleNetwork) return;
        const activeParticles = Olam.pools.SpecialParticle.filter(p => p.components.State.active && p.components.State.type === 'special_particle');
        if (activeParticles.length < 2) { Olam.entities.ParticleNetwork.geometry.setDrawRange(0, 0); return; }

        const positions = Olam.entities.ParticleNetwork.geometry.attributes.position.array;
        let lineIndex = 0;
        const maxLines = positions.length / 6;
        const maxDistSq = 40 * 40;

        for (let i = 0; i < activeParticles.length; i++) {
            const p1 = activeParticles[i].object3D.position;
            if (lineIndex >= maxLines) break;
            for (let j = i + 1; j < activeParticles.length; j++) {
                if (lineIndex >= maxLines) break;
                const p2 = activeParticles[j].object3D.position;
                if (p1.distanceToSquared(p2) < maxDistSq) {
                    positions[lineIndex*6+0] = p1.x; positions[lineIndex*6+1] = p1.y; positions[lineIndex*6+2] = p1.z;
                    positions[lineIndex*6+3] = p2.x; positions[lineIndex*6+4] = p2.y; positions[lineIndex*6+5] = p2.z;
                    lineIndex++;
                }
            }
        }
        Olam.entities.ParticleNetwork.geometry.setDrawRange(0, lineIndex * 2);
        Olam.entities.ParticleNetwork.geometry.attributes.position.needsUpdate = true;
    },

    updateStarfieldScrolling() {
        const Olam = this.Olam;
        const scrollSpeed = Olam.game.roadSpeed * 0.1 * (this.Olam.three.clock.getDelta() || 1/60);
        if (Olam.entities.Starfield) {
            const positions = Olam.entities.Starfield.geometry.attributes.position.array;
            for (let i = 2; i < positions.length; i += 3) {
                positions[i] += scrollSpeed;
                if (positions[i] > Olam.three.camera.position.z) { positions[i] -= 1000; }
            }
            Olam.entities.Starfield.geometry.attributes.position.needsUpdate = true;
        }
        if (Olam.entities.ConstellationNetwork) {
            const positions = Olam.entities.ConstellationNetwork.geometry.attributes.position.array;
            for (let i = 2; i < positions.length; i += 3) {
                positions[i] += scrollSpeed;
                if (positions[i] > Olam.three.camera.position.z) { positions[i] -= 1000; }
            }
            Olam.entities.ConstellationNetwork.geometry.attributes.position.needsUpdate = true;
        }
    }
};

// YESOD - Foundation: Physics, movement, and low-level animation states.
export const YESOD = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },

    movementAndPhysicsSystem(deltaTime) {
        const Olam = this.Olam;
        const Merkava = Olam.pools.Merkava[0];
        
        if (Merkava.components.State.active) {
            const pos = Merkava.components.Position;
            const input = Merkava.components.Input;
            pos.x = THREE.MathUtils.lerp(pos.x, input.targetX, 10 * deltaTime);
            Merkava.object3D.position.x = pos.x;
            const wheelRotation = (Olam.config.roadSpeed * deltaTime) / 0.8;
            Merkava.components.Children.wheels.forEach(ref => { if(Merkava.refs[ref]) Merkava.refs[ref].rotation.x -= wheelRotation; });
        }
        
        // --- Klipot Movement ---
const roadSpeed = Olam.config.roadSpeed;
Olam.game.wave.enemiesInWave.forEach(id => {
    // CORRECTED LOGIC: Find the entity in the correct pool by its ID.
    const entityType = id.split('_')[0];
    const entityIndex = parseInt(id.split('_')[1], 10);
    const entity = Olam.pools[entityType]?.[entityIndex];

    if(entity && entity.components.State.active) {
        const speedMultiplier = entity.type === 'Mine' ? 0.2 : 1.0;
        entity.object3D.position.z += roadSpeed * speedMultiplier * deltaTime;
        if(entity.object3D.position.z > 20) {
            Olam.ASSIYAH.GEVURAH.deactivateKlipah(entity);
        }
    }
});
        
        const allProjectilePools = ['Ohr', 'GolemProjectile', 'GolemFastProjectile', 'GolemHeavyProjectile', 'WeaverProjectile', 'ShattererShard'];
        allProjectilePools.forEach(type => {
            Olam.pools[type].forEach(entity => {
                if(entity.components.State?.active && entity.components.Velocity) {
                    entity.object3D.position.x += entity.components.Velocity.x * deltaTime;
                    entity.object3D.position.y += entity.components.Velocity.y * deltaTime;
                    entity.object3D.position.z += entity.components.Velocity.z * deltaTime;
                }
            });
        });
        
        const orbTypes = ['ShefaOrb', 'MitzvahOrb', 'RedemptionOrb'];
        const merkavaPos = Merkava.object3D.position;
        orbTypes.forEach(type => {
            Olam.pools[type].forEach(orb => {
                if(orb.components.State.active) {
                    const vel = orb.components.Velocity;
                    if(type === 'RedemptionOrb') {
                        orb.object3D.position.z += vel.z * deltaTime;
                    } else {
                        orb.object3D.position.lerp(merkavaPos, 0.08);
                        orb.object3D.position.addScaledVector(vel, deltaTime);
                        vel.x = THREE.MathUtils.lerp(vel.x, 0, 0.1); vel.y = THREE.MathUtils.lerp(vel.y, 0, 0.1); vel.z = THREE.MathUtils.lerp(vel.z, 0, 0.1);
                        if(orb.object3D.position.distanceTo(merkavaPos) < 1.5) {
                            if(type === 'ShefaOrb') Olam.YETZIRAH.addShefa(orb.components.State.value);
                            else if (type === 'MitzvahOrb') Olam.game.mitzvot += orb.components.State.value;
                            orb.components.State.active = false; orb.object3D.visible = false;
                        }
                    }
                }
            });
        });

        Olam.pools.SpecialParticle.forEach(p => {
            if (p.components.State.active) {
                const state = p.components.State; const pos = p.object3D.position;
                pos.addScaledVector(state.velocity, deltaTime); state.life -= deltaTime;
                if (state.type === 'ein_sof_glimmer') {
                    p.object3D.material.opacity = 0.5 + Math.sin(Olam.three.clock.getElapsedTime() * 5) * 0.5;
                    if (pos.distanceTo(merkavaPos) < 5) {
                        ASSIAH.MALCHUT.showNotifier('surprise', "✨ EIN SOF'S BLESSING! ✨", "#ffffff");
                        Olam.game.effects.invincibleTimer = 5.0; Olam.game.effects.allCritTimer = 5.0;
                        ASSIAH.TIFERET.triggerEffect('flash', { color: "#ffffff", duration: 800 });
                        state.life = 0; // Deactivate particle
                    }
                } else {
                    p.object3D.material.opacity = Math.sin(Math.max(0, state.life) * 0.5 * Math.PI) * 0.7;
                }
                if (state.life <= 0 || pos.z > Olam.three.camera.position.z) {
                    state.active = false; p.object3D.visible = false;
                }
            }
        });

        Olam.pools.Nefesh.forEach(nefesh => {
            const state = nefesh.components.State; const currentPos = nefesh.components.CurrentPos; const targetPos = nefesh.components.TargetPos;
            if(state.active) {
                 currentPos.x = THREE.MathUtils.lerp(currentPos.x, targetPos.x, 15 * deltaTime);
                 currentPos.z = THREE.MathUtils.lerp(currentPos.z, targetPos.z, 15 * deltaTime);
                 state.scale = THREE.MathUtils.lerp(state.scale, 1, 10 * deltaTime);
            } else {
                state.scale = THREE.MathUtils.lerp(state.scale, 0, 15 * deltaTime);
            }
            if(state.scale < 0.01) state.scale = 0;
            state.rotation += 2 * deltaTime;
            nefesh.object3D.position.set(currentPos.x, currentPos.y, currentPos.z);
            nefesh.object3D.scale.setScalar(state.scale);
            if(nefesh.refs.top && nefesh.refs.bottom) {
                nefesh.refs.top.rotation.y = state.rotation;
                nefesh.refs.bottom.rotation.y = -state.rotation;
            }
            nefesh.object3D.visible = state.scale > 0;
        });

        const boss = Olam.pools.Boss[0];
        if (boss.components.State.active) {
            boss.refs.ring1.rotation.z += deltaTime * 0.5;
            boss.refs.ring2.rotation.y -= deltaTime * 0.3;
            boss.refs.core.rotation.y += deltaTime * 0.2;
        }
    }
};
