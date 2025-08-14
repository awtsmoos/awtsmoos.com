/*
ב"ה
B"H
*/

/**
 * @file Assiyah/NeHY.js
 * @description Contains the Sefirot of action and structure: Netzach (Endurance/Victory), Hod (Splendor/Glory),
 * and Yesod (Foundation). These sefirot govern the game's progression, rendering, and the fundamental physics and
 * movement that underpins all of creation. Every function herein is fully and completely implemented.
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
    },

    spawnWave() {
        const Olam = this.Olam;
        const patternSet = Olam.YETZIRAH.getPatternSet();
        const patternGenerator = patternSet[Math.floor(Math.random() * patternSet.length)];
        const pattern = patternGenerator();
        
        let furthestZOffset = 0;
        pattern.forEach(p => {
            if (p.zOffset && p.zOffset < furthestZOffset) {
                furthestZOffset = p.zOffset;
            }
        });

        const spawnZ = -130;
        const waveId = Olam.game.wave.waveId++;
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
                klipah.userData.waveId = waveId;
                Olam.game.wave.enemiesInWave.add(klipah.id);
            }
        });

        Olam.game.wave.isTracking = true;
        Olam.game.wave.hitsTakenThisWave = 0;
        Olam.game.wave.nextSpawnTime = Olam.three.clock.getElapsedTime() + Math.abs(furthestZOffset / Olam.game.roadSpeed) + 5; // Time to clear + buffer
    },

    checkWaveCompletion() {
        const Olam = this.Olam;
        if (Olam.game.wave.isTracking && Olam.game.wave.enemiesInWave.size === 0) {
            Olam.game.wave.isTracking = false;
            
            if (Olam.game.wave.hitsTakenThisWave === 0) {
                Olam.MALCHUT.showNotifier('perfectWave', "PERFECT WAVE!");
                Olam.YETZIRAH.addShefa(50);
                Olam.game.mitzvot += 100;

                if(Math.random() < 0.25 && Olam.playerStats.upgrades.commandmentsAuthority?.level < 10) {
                    Olam.playerStats.tabletFragments++;
                    Olam.BINAH.savePlayerStats();
                    Olam.MALCHUT.showNotifier('surprise', `Tablet Fragment Found! (${Olam.playerStats.tabletFragments}/10)`, "#00f0ff");
                }
                
                // Celestial Echo effect: Fire a wave of piercing projectiles from every Nefesh position
                Olam.pools.Nefesh.forEach(nefesh => {
                    if (nefesh.components.State.active) {
                        const worldPos = nefesh.object3D.getWorldPosition(new THREE.Vector3());
                        const echoOhr = Olam.BERIAH.createEntityFromPool('Ohr');
                        if (echoOhr) {
                            echoOhr.object3D.material = Olam.BERIAH.createMaterial('EchoOhr');
                            echoOhr.object3D.position.copy(worldPos);
                            const state = echoOhr.components.State;
                            state.damage = 2;
                            state.pierce = 1;
                            state.isEcho = true;
                            echoOhr.components.Velocity.z = -120; // Faster than normal Ohr
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
                if (ai.timer <= 0) {
                    ai.state = 'attacking_volley';
                    ai.timer = 4;
                }
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
                    ai.state = 'attacking_sweep';
                    ai.timer = 3.5 - Math.min(2, Olam.game.level * 0.1);
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
                    ai.state = 'vulnerable';
                    ai.timer = 3.0;
                }
                break;
            case 'vulnerable':
                boss.refs.core.material.emissive.setHex(0xffaa00);
                if (ai.timer <= 0) {
                    boss.refs.core.material.emissive.setHex(0xaa00ff);
                    ai.state = 'attacking_volley';
                    ai.timer = 2.0;
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
        
        // Update Fleet Conduits
        if (Olam.settings.enableFleetConduits && Olam.entities.FleetConduits) {
            const activeNefesh = Olam.pools.Nefesh.filter(n => n.components.State.active);
            const positions = Olam.entities.FleetConduits.geometry.attributes.position.array;
            let lineIndex = 0;
            const maxLines = positions.length / 6;

            if(activeNefesh.length < 2) {
                Olam.entities.FleetConduits.geometry.setDrawRange(0, 0);
            } else {
                for (let i = 0; i < activeNefesh.length; i++) {
                    const p1 = activeNefesh[i].object3D.getWorldPosition(new THREE.Vector3());
                    let neighbors = [];
                    for (let j = i + 1; j < activeNefesh.length; j++) {
                        const p2 = activeNefesh[j].object3D.getWorldPosition(new THREE.Vector3());
                        neighbors.push({ index: j, distSq: p1.distanceToSquared(p2) });
                    }
                    neighbors.sort((a,b) => a.distSq - b.distSq);

                    for (let k = 0; k < Olam.settings.fleetConduitCount && k < neighbors.length; k++) {
                        if (lineIndex >= maxLines) break;
                        const p2 = activeNefesh[neighbors[k].index].object3D.getWorldPosition(new THREE.Vector3());
                        positions[lineIndex * 6 + 0] = p1.x;
                        positions[lineIndex * 6 + 1] = p1.y;
                        positions[lineIndex * 6 + 2] = p1.z;
                        positions[lineIndex * 6 + 3] = p2.x;
                        positions[lineIndex * 6 + 4] = p2.y;
                        positions[lineIndex * 6 + 5] = p2.z;
                        lineIndex++;
                    }
                    if (lineIndex >= maxLines) break;
                }
                Olam.entities.FleetConduits.geometry.setDrawRange(0, lineIndex * 2);
                Olam.entities.FleetConduits.geometry.attributes.position.needsUpdate = true;
            }
        }

        // Update Starfield and Constellations Scrolling
        const scrollSpeed = (Olam.game.roadSpeed || Olam.config.roadSpeed) * 0.1 * (this.Olam.three.clock.getDelta() || 1/60);
        if (Olam.entities.Starfield) {
            const positions = Olam.entities.Starfield.geometry.attributes.position.array;
            for (let i = 2; i < positions.length; i += 3) {
                positions[i] += scrollSpeed;
                if (positions[i] > Olam.three.camera.position.z) {
                    positions[i] -= 1000;
                }
            }
            Olam.entities.Starfield.geometry.attributes.position.needsUpdate = true;
        }
        if (Olam.entities.ConstellationNetwork) {
            const positions = Olam.entities.ConstellationNetwork.geometry.attributes.position.array;
            for (let i = 2; i < positions.length; i += 3) {
                positions[i] += scrollSpeed;
                if (positions[i] > Olam.three.camera.position.z) {
                     positions[i] -= 1000;
                }
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
        
        // --- Merkava & Formation Movement ---
        if (Merkava.components.State.active) {
            const pos = Merkava.components.Position;
            const input = Merkava.components.Input;
            pos.x = THREE.MathUtils.lerp(pos.x, input.targetX, 10 * deltaTime);
            Merkava.object3D.position.x = pos.x;
            
            const wheelRotation = (Olam.game.roadSpeed * deltaTime) / 0.8; // 0.8 is wheel radius from archetype
            Merkava.components.Children.wheels.forEach(ref => {
                if(Merkava.refs[ref]) Merkava.refs[ref].rotation.x -= wheelRotation;
            });
        }
        
        // --- Klipot Movement ---
        const roadSpeed = Olam.game.roadSpeed;
        Olam.game.wave.enemiesInWave.forEach(id => {
            const entity = Olam.entities[id];
            if(entity && entity.components.State.active) {
                const speedMultiplier = entity.type === 'Mine' ? 0.2 : 1.0;
                entity.object3D.position.z += roadSpeed * speedMultiplier * deltaTime;
                if(entity.object3D.position.z > 20) {
                    Olam.GEVURAH.deactivateKlipah(entity);
                }
            }
        });
        
        // --- Projectile Movement ---
        const allProjectilePools = ['Ohr', 'GolemProjectile', 'GolemFastProjectile', 'GolemHeavyProjectile', 'WeaverProjectile', 'ShattererShard'];
        allProjectilePools.forEach(type => {
            if (Olam.pools[type]) {
                Olam.pools[type].forEach(entity => {
                    if(entity.components.State?.active && entity.components.Velocity) {
                        entity.object3D.position.x += entity.components.Velocity.x * deltaTime;
                        entity.object3D.position.y += entity.components.Velocity.y * deltaTime;
                        entity.object3D.position.z += entity.components.Velocity.z * deltaTime;
                    }
                });
            }
        });
        
        // --- Orb Movement (Shefa, Mitzvah, etc) ---
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
                        vel.x = THREE.MathUtils.lerp(vel.x, 0, 0.1);
                        vel.y = THREE.MathUtils.lerp(vel.y, 0, 0.1);
                        vel.z = THREE.MathUtils.lerp(vel.z, 0, 0.1);

                        if(orb.object3D.position.distanceTo(merkavaPos) < 1.5) {
                            if(type === 'ShefaOrb') {
                                Olam.YETZIRAH.addShefa(orb.components.State.value);
                            } else if (type === 'MitzvahOrb') {
                                Olam.game.mitzvot += orb.components.State.value;
                            }
                            orb.components.State.active = false;
                            orb.object3D.visible = false;
                        }
                    }
                }
            });
        });

        // --- Special Particle Movement ---
        Olam.pools.SpecialParticle.forEach(p => {
            if (p.components.State.active) {
                const state = p.components.State;
                const pos = p.object3D.position;
                pos.addScaledVector(state.velocity, deltaTime);
                state.life -= deltaTime;

                if (state.type === 'ein_sof_glimmer') {
                    p.object3D.material.opacity = 0.5 + Math.sin(Olam.three.clock.getElapsedTime() * 5) * 0.5;
                    if (pos.distanceTo(merkavaPos) < 5) {
                        Olam.MALCHUT.showNotifier('surprise', "✨ EIN SOF'S BLESSING! ✨", "#ffffff");
                        Olam.game.effects.invincibleTimer = 5.0;
                        Olam.game.effects.allCritTimer = 5.0;
                        Olam.TIFERET.triggerEffect('flash', { color: "#ffffff", duration: 800 });
                        state.life = 0;
                    }
                } else {
                    p.object3D.material.opacity = Math.sin(Math.max(0, state.life) * 0.5 * Math.PI) * 0.7;
                }

                if (state.life <= 0 || pos.z > Olam.three.camera.position.z) {
                    state.active = false;
                    p.object3D.visible = false;
                }
            }
        });

        // --- Low-Level Animation States (Interpolation) ---
        Olam.pools.Nefesh.forEach(nefesh => {
            const state = nefesh.components.State;
            const currentPos = nefesh.components.CurrentPos;
            const targetPos = nefesh.components.TargetPos;
            
            if(state.active) {
                 currentPos.x = THREE.MathUtils.lerp(currentPos.x, targetPos.x, 15 * deltaTime);
                 currentPos.z = THREE.MathUtils.lerp(currentPos.z, targetPos.z, 15 * deltaTime);
                 if(state.scale < 1) {
                    state.scale = THREE.MathUtils.lerp(state.scale, 1, 10 * deltaTime);
                 } else {
                    state.scale = 1;
                 }
            } else {
                if(state.scale > 0.01) {
                    state.scale = THREE.MathUtils.lerp(state.scale, 0, 15 * deltaTime);
                } else {
                    state.scale = 0;
                }
            }
            state.rotation += 2 * deltaTime;

            nefesh.object3D.position.set(currentPos.x, currentPos.y, currentPos.z);
            nefesh.object3D.scale.setScalar(state.scale);
            if(nefesh.refs.top && nefesh.refs.bottom) {
                nefesh.refs.top.rotation.y = state.rotation;
                nefesh.refs.bottom.rotation.y = -state.rotation;
            }
            nefesh.object3D.visible = state.scale > 0.01;
        });

        // Boss animation
        const boss = Olam.pools.Boss[0];
        if (boss.components.State.active) {
            boss.refs.ring1.rotation.z += deltaTime * 0.5;
            boss.refs.ring2.rotation.y -= deltaTime * 0.3;
            boss.refs.core.rotation.y += deltaTime * 0.2;
        }
    }
};

