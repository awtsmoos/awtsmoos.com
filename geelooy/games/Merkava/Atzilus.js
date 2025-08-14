/**
ב"ה
B"H
 * @file Atzilut.js
 * @description The World of Atzilut (אצילות): The World of Emanation.
 * This is the first and highest world, the divine blueprint from which all reality unfolds.
 * It is a single, monolithic object containing the raw potential, the very archetypes of existence.
 * The air here is thin and electric, smelling of pure concept before it is burdened by matter.
 * Nothing acts here; things simply ARE, in their most perfect and unrealized form.
 * This file contains no logic outside of the ATZILUT constant. It is pure data, pure potential.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const ATZILUT = {
    // Geometries: The Otiot (Letters) of Creation, the fundamental shapes from which all matter is formed.
    // The celestial forge rings with the sound of pure math being hammered into platonic solids.
    geometries: {
        NefeshCone: { type: 'ConeGeometry', args: [0.4, 0.6, 3] },
        OhrSphere: { type: 'SphereGeometry', args: [0.12, 6, 6] },
        EchoOhrSphere: { type: 'SphereGeometry', args: [0.15, 6, 6] },
        KlipahGateBox: { type: 'BoxGeometry', args: [3, 4, 0.5] },
        KlipahValuePlane: { type: 'PlaneGeometry', args: [3, 3] },
        JarCylinder: { type: 'CylinderGeometry', args: [0.8, 0.8, 1.5, 12] },
        JarHealthPlane: { type: 'PlaneGeometry', args: [2.5, 1.25] },
        TohuShardCone: { type: 'ConeGeometry', args: [0.45, 1.5, 6] },
        GolemTorso: { type: 'BoxGeometry', args: [1.5, 2.0, 1.5] },
        GolemHead: { type: 'BoxGeometry', args: [1.0, 1.0, 1.0] },
        GolemEye: { type: 'SphereGeometry', args: [0.2, 8, 8] },
        GolemProjectile: { type: 'SphereGeometry', args: [0.3, 8, 8] },
        GolemFastProjectile: { type: 'SphereGeometry', args: [0.25, 8, 8] },
        GolemHeavyProjectile: { type: 'BoxGeometry', args: [0.6, 0.6, 1.2] },
        TomeKeeperBody: { type: 'IcosahedronGeometry', args: [0.7, 0] },
        ShieldSphere: { type: 'SphereGeometry', args: [1.5, 16, 16] },
        WeaverBody: { type: 'SphereGeometry', args: [0.6, 16, 8] },
        WeaverProjectile: { type: 'SphereGeometry', args: [0.2, 8, 8] },
        ShattererBody: { type: 'IcosahedronGeometry', args: [0.8, 0] },
        ShattererShard: { type: 'IcosahedronGeometry', args: [0.15, 0] },
        MinelayerBody: { type: 'BoxGeometry', args: [1.2, 1.2, 1.8] },
        MineTorus: { type: 'TorusGeometry', args: [0.4, 0.1, 8, 16] },
        MineCore: { type: 'SphereGeometry', args: [0.15] },
        TorahHandle: { type: 'CylinderGeometry', args: [0.2, 0.2, 3.5, 8] },
        TorahScrollGeom: { type: 'CylinderGeometry', args: [0.5, 0.5, 3, 16] },
        TorahParchment: { type: 'PlaneGeometry', args: [2.5, 3] },
        BossCore: { type: 'IcosahedronGeometry', args: [2, 1] },
        BossRing: { type: 'TorusGeometry', args: [3, 0.2, 16, 100] },
        BossRing2: { type: 'TorusGeometry', args: [4, 0.2, 16, 100] },
        MerkavaPlatform: { type: 'BoxGeometry', args: [6, 0.4, 8] },
        MerkavaAxle: { type: 'CylinderGeometry', args: [0.1, 0.1, 7.2, 8] },
        MerkavaWheel: { type: 'CylinderGeometry', args: [0.8, 0.8, 0.3, 16] },
        MerkavaPlank: { type: 'BoxGeometry', args: [1.5, 0.2, 5] },
        MerkavaSign: { type: 'PlaneGeometry', args: [2.5, 2] },
        CosmicRiver: { type: 'PlaneGeometry', args: [9, 200, 20, 100] },
        ShefaOrb: { type: 'SphereGeometry', args: [0.2, 8, 8] },
        MitzvahOrb: { type: 'SphereGeometry', args: [0.15, 6, 6] },
        RedemptionOrb: { type: 'SphereGeometry', args: [0.4, 12, 12] },
    },

    // Materials: The spiritual colors and textures that clothe the forms. The scent of ozone and starlight.
    materials: {
        MagenDavid: { type: 'MeshLambertMaterial', props: { color: 0x00aaff, emissive: 0x00aaff, emissiveIntensity: 0.5 } },
        Webcam: { type: 'MeshBasicMaterial', props: { map: 'placeholder_webcam', transparent: true, alphaMap: 'placeholder_circleAlpha' } },
        Ohr: { type: 'MeshBasicMaterial', props: { color: 0x00ffff, fog: false } },
        EchoOhr: { type: 'MeshBasicMaterial', props: { color: 0xffd700, fog: false, transparent: true } },
        KlipahCrack: { type: 'MeshStandardMaterial', props: { color: 0x550000, emissive: 0xff0000, emissiveIntensity: 1.0, roughness: 0.9 } },
        KlipahValue: { type: 'MeshBasicMaterial', props: { transparent: true, depthWrite: false } },
        Jar: { type: 'MeshStandardMaterial', props: { color: 0x815633, emissive: 0x4d341f, emissiveIntensity: 1.5, metalness: 0.1, roughness: 0.8 } },
        JarHealth: { type: 'MeshBasicMaterial', props: { transparent: true, depthWrite: false } },
        Tohu: { type: 'MeshStandardMaterial', props: { color: 0x800080, emissive: 0xff00ff, emissiveIntensity: 1.2, roughness: 0.2, metalness: 0.8 } },
        Golem: { type: 'MeshStandardMaterial', props: { color: 0x666666, emissive: 0x333333, emissiveIntensity: 1.5, metalness: 0.8, roughness: 0.2 } },
        GolemFriendly: { type: 'MeshStandardMaterial', props: { color: 0xb8860b, emissive: 0xffd700, emissiveIntensity: 1.5, metalness: 0.5, roughness: 0.3 } },
        GolemEye: { type: 'MeshBasicMaterial', props: { color: 0xff0000 } },
        GolemProjectile: { type: 'MeshBasicMaterial', props: { color: 0xff4500, fog: false } },
        GolemFastProjectile: { type: 'MeshBasicMaterial', props: { color: 0xffff00, fog: false } },
        GolemHeavyProjectile: { type: 'MeshBasicMaterial', props: { color: 0x4b0082, fog: false } },
        TomeKeeper: { type: 'MeshStandardMaterial', props: { color: 0x3d005b, emissive: 0x8a2be2, emissiveIntensity: 1.8, metalness: 0.3, roughness: 0.4 } },
        Shield: { type: 'MeshBasicMaterial', props: { color: 0x8a2be2, transparent: true, opacity: 0.35, side: 'DoubleSide' } },
        Weaver: { type: 'MeshStandardMaterial', props: { color: 0x111111, emissive: 0xaaaaaa, emissiveIntensity: 1.5, roughness: 0.1, metalness: 0.9 } },
        WeaverProjectile: { type: 'MeshBasicMaterial', props: { color: 0xcccccc, fog: false } },
        Shatterer: { type: 'MeshStandardMaterial', props: { color: 0x00ced1, emissive: 0x00ffff, emissiveIntensity: 1.0, roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.8 } },
        Minelayer: { type: 'MeshStandardMaterial', props: { color: 0x8B4513, emissive: 0xff8c00, emissiveIntensity: 1.2, metalness: 0.6, roughness: 0.7 } },
        Mine: { type: 'MeshBasicMaterial', props: { color: 0xffa500, transparent: true, opacity: 0.8 } },
        MineCore: { type: 'MeshBasicMaterial', props: { color: 0xff4500 } },
        TorahParchment: { type: 'MeshStandardMaterial', props: { color: 0xf5deb3, roughness: 0.8 } },
        TorahHandle: { type: 'MeshStandardMaterial', props: { color: 0x8b4513, roughness: 0.6 } },
        TorahPortal: { type: 'ShaderMaterial', props: { vertexShader: 'cosmicRiverVertexShader', fragmentShader: 'torahPortalShader', uniforms: { uTime: { value: 0.0 } }, transparent: true } },
        BossCore: { type: 'MeshStandardMaterial', props: { color: 0x220033, metalness: 0.8, roughness: 0.2, emissive: 0xaa00ff, emissiveIntensity: 1.5 } },
        MerkavaWood: { type: 'MeshStandardMaterial', props: { color: 0x8b5a2b, roughness: 0.7, metalness: 0.1 } },
        MerkavaMetal: { type: 'MeshStandardMaterial', props: { color: 0x666666, roughness: 0.3, metalness: 0.9 } },
        MerkavaWebcam: { type: 'MeshBasicMaterial', props: { map: 'placeholder_webcam_mirrored', side: 'DoubleSide' } },
        CosmicRiver: { type: 'ShaderMaterial', props: { vertexShader: 'cosmicRiverVertexShader', fragmentShader: 'cosmicRiverFragmentShader', uniforms: { uTime: { value: 0.0 }, uSpeed: { value: 1.0 }, uColor: { value: new THREE.Color(0x483d8b) }, uOpacity: { value: 0.85 } }, transparent: true, fog: false } },
        ShefaOrb: { type: 'MeshBasicMaterial', props: { color: 0xffd700, fog: false } },
        MitzvahOrb: { type: 'MeshBasicMaterial', props: { color: 0xffffff, fog: false } },
        RedemptionOrb: { type: 'MeshBasicMaterial', props: { color: 0xaaffaa, fog: false } },
        SpecialParticleMaterial: { type: 'SpriteMaterial', props: { fog: false, transparent: true } },
    },

    // Archetypes: The very essence of a being, its components and innate behaviors.
    archetypes: {
        Merkava: { isSingleton: true, poolSize: 1, components: { Type: 'Merkava', Position: { x: 0, y: 0, z: 5 }, Velocity: { x: 0, y: 0, z: 0 }, Input: { targetX: 0, lastTouchX: 0, isDragging: false }, Children: { wheels: ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'] }, State: { active: false } }, renderable: { type: 'group', children: {
            platform: { type: 'mesh', geometry: 'MerkavaPlatform', material: 'MerkavaWood', position: [0, 0, 0], webcamTarget: 'platform' },
            axle_front: { type: 'mesh', geometry: 'MerkavaAxle', material: 'MerkavaMetal', position: [0, -0.4, -3], rotation: [0, 0, Math.PI/2] },
            axle_rear: { type: 'mesh', geometry: 'MerkavaAxle', material: 'MerkavaMetal', position: [0, -0.4, 3], rotation: [0, 0, Math.PI/2] },
            wheel_fl: { type: 'mesh', geometry: 'MerkavaWheel', material: 'MerkavaMetal', position: [-3.5, -0.4, -3], ref: 'wheel_fl' },
            wheel_fr: { type: 'mesh', geometry: 'MerkavaWheel', material: 'MerkavaMetal', position: [3.5, -0.4, -3], ref: 'wheel_fr' },
            wheel_rl: { type: 'mesh', geometry: 'MerkavaWheel', material: 'MerkavaMetal', position: [-3.5, -0.4, 3], ref: 'wheel_rl' },
            wheel_rr: { type: 'mesh', geometry: 'MerkavaWheel', material: 'MerkavaMetal', position: [3.5, -0.4, 3], ref: 'wheel_rr' },
            plank_left: { type: 'mesh', geometry: 'MerkavaPlank', material: 'MerkavaWood', position: [-4.2, 0.1, 0], webcamTarget: 'side_left', ref: 'plank_left' },
            plank_right: { type: 'mesh', geometry: 'MerkavaPlank', material: 'MerkavaWood', position: [4.2, 0.1, 0], webcamTarget: 'side_right', ref: 'plank_right' },
            sign_rear: { type: 'mesh', geometry: 'MerkavaSign', material: 'MerkavaWebcam', position: [0, 1.2, 4.1], webcamTarget: 'rear' },
        }}},
        Nefesh: { poolSize: 248, components: { Type: 'Nefesh', TargetPos: { x: 0, y: 0.4, z: 0 }, CurrentPos: { x: 0, y: 0.4, z: 0 }, State: { active: false, scale: 0.01, rotation: 0, lastShotTime: 0 } }, renderable: { type: 'group', children: {
            top: { type: 'mesh', geometry: 'NefeshCone', material: 'MagenDavid', position: [0,0.2,0], ref:'top' },
            bottom: { type: 'mesh', geometry: 'NefeshCone', material: 'MagenDavid', position: [0,-0.2,0], rotation:[Math.PI,0,0], ref:'bottom' },
        }}},
        Ohr: { poolSize: 500, components: { Type: 'Ohr', Position: {}, Velocity: {x:0,y:0,z:-80}, Lifetime: {value:3}, State: { active: false, damage: 1, pierce: 0, isCrit: false, isEcho: false } }, renderable: { type: 'mesh', geometry: 'OhrSphere', material: 'Ohr' }},
        KlipahGate: { poolSize: 15, components: { Type: 'KlipahGate', Position: {}, Collision: { size: {x: 3, y: 4, z:0.5}, active: true }, Health: { value: 1 }, Klipah: { value: 0, isPurified: false }, State: {active: false} }, renderable: { type: 'group', position: [0, 2, 0], children: {
            body: { type: 'mesh', geometry: 'KlipahGateBox', material: 'KlipahCrack', ref: 'body' },
            valuePlane: { type: 'mesh', geometry: 'KlipahValuePlane', material: 'KlipahValue', position: [0, 0, 0.26], ref: 'valuePlane' }
        }}},
        Jar: { poolSize: 15, components: { Type: 'Jar', Position: {}, Collision: { size: {x: 1.6, y: 1.5, z:1.6}, active: true }, Health: { value: 30, max: 30 }, Shielded: { isShielded: false }, State: {active: false} }, renderable: { type: 'group', position: [0, 0.75, 0], children: {
            body: { type: 'mesh', geometry: 'JarCylinder', material: 'Jar', rotation: [0, 0, Math.PI/2], ref: 'body' },
            healthPlane: { type: 'mesh', geometry: 'JarHealthPlane', material: 'JarHealth', position: [0, 1.2, 0], ref: 'healthPlane' },
        }}},
        TohuShard: { poolSize: 15, components: { Type: 'TohuShard', Position: {}, State: {active: false} }, renderable: { type: 'group', children: (entity, Olam) => { const c = {}; for(let i=0; i<10; i++){ c[`s_${i}`] = { type: 'mesh', geometry: 'TohuShardCone', material: 'Tohu', position: [(Math.random()-0.5)*2.5, 0.75, (Math.random()-0.5)*0.5], userData: { Collision: { size: {x: 0.9, y: 1.5, z:0.9}, active: true }} }; } return c; }}},
        GolemSentry: { poolSize: 10, components: { Type: 'GolemSentry', Position: {}, Collision: { size: {x: 1.5, y: 3, z:1.5}, active: true }, Health: { value: 120 }, AI: { type: 'shooter', lastShot: 0, fireRate: 3.5, friendlyTimer: 0, projectileTypes:['GolemProjectile', 'GolemFastProjectile', 'GolemHeavyProjectile'] }, Shielded: { isShielded: false }, State: {active: false} }, renderable: { type: 'group', children: {
            torso: { type: 'mesh', geometry: 'GolemTorso', material: 'Golem', position: [0, 1.0, 0], ref: 'torso' },
            head: { type: 'mesh', geometry: 'GolemHead', material: 'Golem', position: [0, 2.5, 0], ref: 'head' },
            eye: { type: 'mesh', geometry: 'GolemEye', material: 'GolemEye', position: [0, 2.5, 0.5], ref: 'eye' },
        }}},
        TomeKeeper: { poolSize: 5, components: { Type: 'TomeKeeper', Position: {}, Collision: { size: {x: 1.4, y: 1.4, z:1.4}, active: true }, Health: { value: 50 }, AI: { type: 'shielder', shieldedEnemyId: null }, Shielded: { isShielded: false }, State: {active: false} }, renderable: { type: 'group', position: [0, 1.5, 0], children: {
            body: { type: 'mesh', geometry: 'TomeKeeperBody', material: 'TomeKeeper', ref: 'body' },
        }}},
        Weaver: { poolSize: 10, components: { Type: 'Weaver', Position: {}, Collision: { size: {x: 1.2, y: 1.2, z:1.2}, active: true }, Health: { value: 40 }, AI: { type: 'weaver', lastShot: 0, fireRate: 1.0, direction: 1, speed: 2 }, Shielded: { isShielded: false }, State: {active: false} }, renderable: { type: 'group', position: [0, 1.0, 0], children: {
            body: { type: 'mesh', geometry: 'WeaverBody', material: 'Weaver', ref: 'body' },
        }}},
        Shatterer: { poolSize: 8, components: { Type: 'Shatterer', Position: {}, Collision: { size: {x: 1.6, y: 1.6, z:1.6}, active: true }, Health: { value: 60 }, Shielded: { isShielded: false }, State: {active: false} }, renderable: { type: 'group', position: [0, 1.0, 0], children: {
            body: { type: 'mesh', geometry: 'ShattererBody', material: 'Shatterer', ref: 'body' },
        }}},
        Minelayer: { poolSize: 10, components: { Type: 'Minelayer', Position: {}, Collision: { size: {x: 1.2, y: 1.2, z:1.8}, active: true }, Health: { value: 70 }, AI: { type: 'minelayer', lastMineTime: 0, mineRate: 4.0 }, Shielded: { isShielded: false }, State: {active: false} }, renderable: { type: 'group', position: [0, 0.6, 0], children: {
            body: { type: 'mesh', geometry: 'MinelayerBody', material: 'Minelayer', ref: 'body' },
        }}},
        Mine: { poolSize: 20, components: { Type: 'Mine', Position: {}, Collision: { size: {x: 0.8, y: 0.2, z:0.8}, active: true }, Health: { value: 1 }, State: {active: false} }, renderable: { type: 'group', position: [0, 0.1, 0], children: {
            ring: { type: 'mesh', geometry: 'MineTorus', material: 'Mine', rotation: [Math.PI/2, 0, 0] },
            core: { type: 'mesh', geometry: 'MineCore', material: 'MineCore' },
        }}},
        TorahScroll: { poolSize: 5, components: { Type: 'TorahScroll', Position: {}, Collision: { size: {x: 3.5, y: 3, z:0.5}, active: true }, State: {active: false} }, renderable: { type: 'group', rotation: [-Math.PI/2, 0, Math.PI/2], position: [0, 1.8, 0], children: {
            leftHandle: { type: 'mesh', geometry: 'TorahHandle', material: 'TorahHandle', position: [-1.75, 0, 0] },
            rightHandle: { type: 'mesh', geometry: 'TorahHandle', material: 'TorahHandle', position: [1.75, 0, 0] },
            leftScroll: { type: 'mesh', geometry: 'TorahScrollGeom', material: 'TorahParchment', position: [-1.25, 0, 0] },
            rightScroll: { type: 'mesh', geometry: 'TorahScrollGeom', material: 'TorahParchment', position: [1.25, 0, 0] },
            portal: { type: 'mesh', geometry: 'TorahParchment', material: 'TorahPortal', ref: 'portal' },
        }}},
        Boss: { isSingleton: true, poolSize: 1, components: { Type: 'Boss', Position: { x: 0, y: 0, z: -50 }, Health: { value: 500, max: 500 }, AI: { state: 'inactive', timer: 0, substate: null }, Collision: { size: {x:8, y:6, z:8}, active: false}, State: {active: false} }, renderable: { type: 'group', children: {
            core: { type: 'mesh', geometry: 'BossCore', material: 'BossCore', position: [0, 3, 0], ref: 'core' },
            ring1: { type: 'mesh', geometry: 'BossRing', material: 'Golem', position: [0, 3, 0], rotation: [Math.PI/2, 0, 0], ref: 'ring1' },
            ring2: { type: 'mesh', geometry: 'BossRing2', material: 'Golem', position: [0, 3, 0], rotation: [Math.PI/4, 0, 0], ref: 'ring2' },
        }}},
        GolemProjectile: { poolSize: 30, components: { Type: 'GolemProjectile', Position: {}, Velocity: {}, State: { active: false, damage: 1 } }, renderable: { type: 'mesh', geometry: 'GolemProjectile', material: 'GolemProjectile' }},
        GolemFastProjectile: { poolSize: 30, components: { Type: 'GolemFastProjectile', Position: {}, Velocity: {}, State: { active: false, damage: 1 } }, renderable: { type: 'mesh', geometry: 'GolemFastProjectile', material: 'GolemFastProjectile' }},
        GolemHeavyProjectile: { poolSize: 20, components: { Type: 'GolemHeavyProjectile', Position: {}, Velocity: {}, State: { active: false, damage: 10 } }, renderable: { type: 'mesh', geometry: 'GolemHeavyProjectile', material: 'GolemHeavyProjectile' }},
        WeaverProjectile: { poolSize: 50, components: { Type: 'WeaverProjectile', Position: {}, Velocity: {}, State: { active: false, damage: 1 } }, renderable: { type: 'mesh', geometry: 'WeaverProjectile', material: 'WeaverProjectile' }},
        ShattererShard: { poolSize: 100, components: { Type: 'ShattererShard', Position: {}, Velocity: {}, State: { active: false, damage: 1 } }, renderable: { type: 'mesh', geometry: 'ShattererShard', material: 'Shatterer' }},
        ShefaOrb: { poolSize: 100, components: { Type: 'ShefaOrb', Position:{}, Velocity:{}, State: {active: false, value: 1} }, renderable: { type: 'mesh', geometry: 'ShefaOrb', material: 'ShefaOrb' } },
        MitzvahOrb: { poolSize: 50, components: { Type: 'MitzvahOrb', Position:{}, Velocity:{}, State: {active: false, value: 1} }, renderable: { type: 'mesh', geometry: 'MitzvahOrb', material: 'MitzvahOrb' } },
        RedemptionOrb: { poolSize: 5, components: { Type: 'RedemptionOrb', Position:{}, Velocity:{}, State: {active: false} }, renderable: { type: 'mesh', geometry: 'RedemptionOrb', material: 'RedemptionOrb' } },
        // Atzilus.js

        SpecialParticle: {
            poolSize: 300,
            components: {
                Type: 'SpecialParticle',
                Position: {},
                // *** FIX 1: Velocity is now a top-level component. ***
                // This allows the pooling system to correctly instantiate it as a THREE.Vector3.
                Velocity: { x: 0, y: 0, z: 0 },
                State: {
                    active: false,
                    life: 0,
                    type: 'special_particle', // Can also be 'ein_sof_glimmer'
                    // Velocity is no longer here.
                }
            },
            renderable: {
                // Note: This is a 'sprite', not a 'mesh'
                type: 'sprite',
                material: 'SpecialParticleMaterial'
            }
        },
},
    },
    uiSchemas: {
        mainMenu: { id: 'mainMenuOverlay', tag: 'div', baseClass: 'overlay', children: [
            { tag: 'div', class: 'menu-button-group', children: [
                { tag: 'div', class: 'game-title', text: 'MERKAVA' }, { tag: 'div', class: 'game-subtitle', text: 'The Final Rectification' },
                { tag: 'button', class: 'menu-button', text: 'BEGIN TIKKUN', onClick: 'startGame' },
                { tag: 'button', class: 'menu-button', text: "OTZAR HA'SEFIROT", style: 'background: linear-gradient(145deg, #2a9d8f, #264653);', onClick: 'showUpgrades' },
                { tag: 'button', class: 'menu-button', text: 'CUSTOM JOURNEY', onClick: 'showCustom' },
                { tag: 'button', class: 'menu-button', text: 'SETTINGS', onClick: 'showSettings' }
            ]}
        ]},
        gameOver: { id: 'gameOverOverlay', tag: 'div', baseClass: 'overlay', children: [
            { tag: 'div', class: 'menu-button-group', children: [
                { tag: 'div', class: 'game-title', text: 'THE MERKAVA HAS FALLEN', style: 'color: var(--klipot-color);' },
                { tag: 'div', id: 'finalMitzvotDisplay', class: 'game-subtitle', text: 'You gathered 0 Mitzvot.' },
                { tag: 'button', class: 'menu-button', text: 'ATTEMPT THE JOURNEY AGAIN', onClick: 'startGame' },
                { tag: 'button', class: 'menu-button', text: 'BACK TO MAIN MENU', style: 'background: linear-gradient(145deg, #555, #222);', onClick: 'showMainMenu' }
            ]}
        ]},
        customMenu: { id: 'customMenuOverlay', tag: 'div', baseClass: 'overlay', children: [
            { tag: 'div', class: 'menu-button-group', children: [
                { tag: 'div', class: 'game-title', text: 'CUSTOM JOURNEY' },
                { tag: 'div', class: 'game-subtitle', text: 'Paste prayers below, separated by two new lines.', style: 'margin-bottom: 20px;' },
                { tag: 'textarea', id: 'customPrayerTextarea', placeholder: 'Prayer 1...\n\nPrayer 2...' },
                { tag: 'button', class: 'menu-button', text: 'BEGIN', onClick: 'startCustomGame' },
                { tag: 'button', class: 'menu-button', text: 'BACK', style: 'background: linear-gradient(145deg, #555, #222);', onClick: 'showMainMenu' }
            ]}
        ]},
        settings: { id: 'settingsOverlay', tag: 'div', baseClass: 'overlay', children: [
            { tag: 'div', id: 'settings-container', class: 'menu-button-group', style: 'max-width: 600px; width: 90%;', children: [
                { tag: 'div', class: 'game-title', text: 'SETTINGS' },
                { tag: 'button', class: 'menu-button', text: 'BACK', style: 'background: linear-gradient(145deg, #555, #222); margin-top: 20px;', onClick: 'showMainMenu' }
            ]}
        ]},
        upgradeShop: { id: 'upgradeShopOverlay', tag: 'div', baseClass: 'overlay', children: [
             { tag: 'div', class: 'game-title', text: "OTZAR HA'SEFIROT" },
             { tag: 'div', id: 'totalMitzvotDisplay', class: 'game-subtitle', style: 'color: var(--mitzvot-color);', text: 'Total Mitzvot: 0' },
             { tag: 'div', id: 'upgradeShopGrid', class: 'upgrade-grid' },
             { tag: 'button', class: 'menu-button', text: 'BACK', style: 'background: linear-gradient(145deg, #555, #222); margin-top: 20px; max-width: 400px;', onClick: 'showMainMenu' }
        ]},
        prayerList: { id: 'prayerListOverlay', tag: 'div', baseClass: 'overlay', children: [
            { tag: 'div', class: 'prayer-list-modal', children: [
                { tag: 'div', id: 'prayerList', class: 'scrollable-list' },
                { tag: 'div', children: [
                    { tag: 'button', text: 'Back to Menu', style: 'padding: 10px; font-size: 1.2em; background: linear-gradient(145deg, #772222, #441111); color: white; border: 1px solid var(--glow-color); border-radius: 5px; cursor: pointer; width: 100%; margin-bottom: 10px;', onClick: 'showMainMenu' },
                    { tag: 'button', text: 'Close', style: 'padding: 10px; font-size: 1.2em; background: linear-gradient(145deg, #333, #111); color: white; border: 1px solid var(--glow-color); border-radius: 5px; cursor: pointer; width: 100%;', onClick: 'closePrayerList' }
                ]}
            ]}
        ]},
        hud: { id: 'hudContainer', tag: 'div', class: 'hud-container', children: [
            { tag: 'div', id: 'bhText', class: 'hud-element', text: 'ב"ה' },
            { tag: 'div', id: 'mitzvotDisplay', class: 'hud-element', text: 'MITZVOT: 0' },
            { tag: 'div', id: 'nefeshDisplay', class: 'hud-element', text: 'NEFESH: 0' },
            { tag: 'div', id: 'shefaContainer', children: [{tag: 'div', id: 'shefaBar'}] },
            { tag: 'div', id: 'prayerDisplayContainer', children: [
                { tag: 'button', id: 'prevPrayerBtn', class: 'prayer-nav-button', text: '<', onClick: 'prevPrayer' },
                { tag: 'div', id: 'prayerTextContainer', children: [
                    { tag: 'button', id: 'prayerDropdownBtn', text: '📜', onClick: 'openPrayerList' },
                    { tag: 'div', id: 'prayerText' }
                ]},
                { tag: 'button', id: 'nextPrayerBtn', class: 'prayer-nav-button', text: '>', onClick: 'nextPrayer' },
            ]},
        ]},
        notifiers: { id: 'notifierContainer', tag: 'div', class: 'notifier-container', children: [
            { tag: 'div', id: 'ascensionNotifier', class: 'notifier' }, { tag: 'div', id: 'comboNotifier', class: 'notifier' },
            { tag: 'div', id: 'perfectWaveNotifier', class: 'notifier' }, { tag: 'div', id: 'surpriseNotifier', class: 'notifier' },
            { tag: 'div', id: 'bossNotifier', class: 'notifier' }, { tag: 'div', id: 'globalErrorNotifier' }
        ]}
    },
    settings: [
        { type: 'header', text: 'Gameplay' },
        { id: 'maxNefesh', label: 'Max Nefesh', type: 'range', min: 10, max: 248, step: 1, defaultValue: 100 },
        { type: 'header', text: 'Visual Effects' },
        { id: 'shakeIntensity', label: 'Screen Shake', type: 'range', min: 0, max: 5, step: 0.1, defaultValue: 1 },
        { id: 'flashIntensity', label: 'Flash Intensity', type: 'range', min: 0, max: 1, step: 0.05, defaultValue: 1 },
        { id: 'effectsIntensity', label: 'Special Effect Intensity', type: 'range', min: 0, max: 2, step: 0.1, defaultValue: 1 },
        { type: 'header', text: 'Graphics & Particles' },
        { id: 'starfieldDensity', label: 'Starfield Density', type: 'range', min: 100, max: 10000, step: 100, defaultValue: 2000 },
        { id: 'particleChars', label: 'Special Particle Characters', type: 'textarea', defaultValue: '✨✡️📜🪐☄️⭐🛞🏆☄️🌏🌘🪐🗣️☀️⭐🕳️✊🤓🤓⚡🎗️🧠🧠🌍🌔🌔🌞🌟🌤️🌪️🏝️🌚🌝🌎🌀🌑🌓🌛🌜🌙✨🌖🎩🌗😀😃😄🗣️⚡✨🌟🌟💫🌝🌚💥🌀💐☀️⚡🌙⭐🌝🌚🌍🌏🌎🪐🌕🌘🌑🌗🌖🌖🌕🌔🌓🌒🌑קראטוןםפףךלחיעכגגשזסבהנממצתץ' },
        { id: 'minParticleSize', label: 'Min Particle Size', type: 'range', min: 0.5, max: 10, step: 0.1, defaultValue: 2 },
        { id: 'maxParticleSize', label: 'Max Particle Size', type: 'range', min: 1, max: 20, step: 0.1, defaultValue: 5 },
        { id: 'shatterCount', label: 'Shatter Particle Count', type: 'range', min: 1, max: 100, step: 1, defaultValue: 20 },
        { id: 'shatterSpeed', label: 'Shatter Particle Speed', type: 'range', min: 1, max: 50, step: 1, defaultValue: 25 },
        { type: 'header', text: 'Network Systems' },
        { id: 'enableFleetConduits', label: 'Enable Fleet Energy Conduits', type: 'checkbox', defaultValue: true },
        { id: 'fleetConduitCount', label: 'Conduits per Nefesh', type: 'range', min: 1, max: 5, step: 1, defaultValue: 2 },
        { id: 'enableConstellations', label: 'Enable Celestial Constellations', type: 'checkbox', defaultValue: true },
        { id: 'enableParticleNetwork', label: 'Enable Particle Constellations', type: 'checkbox', defaultValue: true },
        { id: 'constellationConnections', label: 'Connections per Star', type: 'range', min: 1, max: 5, step: 1, defaultValue: 2 },
        { id: 'constellationDistance', label: 'Max Connection Distance', type: 'range', min: 5, max: 100, step: 1, defaultValue: 30 },
        { type: 'header', text: 'Webcam' },
        { id: 'webcamMode', label: 'Webcam Display Mode', type: 'select', options: [
            {value: 'off', text: 'Off'}, {value: 'platform', text: 'Merkava Platform'},
            {value: 'nefesh', text: 'Individual Nefesh'}, {value: 'side_planks', text: 'Side Planks'}
        ], defaultValue: 'off' },
        { id: 'chariot_plank_distance', label: 'Chariot Webcam Plank Distance', type: 'range', min: 3.8, max: 6, step: 0.1, defaultValue: 4.2 },
    ],
    upgrades: {
        startNefesh: { name: "Keter's Foundation", desc: "Begin each journey with +1 starting Nefesh per level.", maxLevel: 10, cost: level => 500 * Math.pow(2.2, level) },
        shefaGain: { name: "Chesed's Abundance", desc: "Gain 2% more Shefa from all sources per level.", maxLevel: 10, cost: level => 400 * Math.pow(1.9, level) },
        mitzvotGain: { name: "Malkut's Bounty", desc: "Gain 2% more Mitzvot from all sources per level.", maxLevel: 10, cost: level => 600 * Math.pow(2.0, level) },
        projectileSpeed: { name: "Hod's Velocity", desc: "Projectiles travel 5% faster per level.", maxLevel: 5, cost: level => 800 * Math.pow(1.8, level) },
        comboTimer: { name: "Yesod's Connection", desc: "Combo timer lasts 5% longer per level.", maxLevel: 8, cost: level => 750 * Math.pow(1.7, level) },
        startingShield: { name: "Gevurah's Ward", desc: "Start the journey with a shield that blocks one hit.", maxLevel: 1, cost: () => 7500 },
        fireRateBonus: { name: "Netzach's Alacrity", desc: "Start with a 10% faster firing rate.", maxLevel: 1, cost: () => 6000 },
        initialMitzvot: { name: "Tiferet's Endowment", desc: "Begin each journey with 100 extra Mitzvot per level.", maxLevel: 5, cost: level => 1500 * Math.pow(2.5, level) },
        idleMitzvot: { name: "Chochmah's Wisdom", desc: "Passively gain 1 Mitzvah every 10 seconds, even when the game is closed.", maxLevel: 5, cost: level => 10000 * Math.pow(3, level) },
        critChance: { name: "Da'at's Opening", desc: "Projectiles have a 1% chance per level to deal critical (2x) damage.", maxLevel: 10, cost: level => 2000 * Math.pow(2.1, level) },
        shefaValue: { name: "Yesod's Treasury", desc: "Shefa orbs are worth 5% more per level.", maxLevel: 10, cost: level => 1800 * Math.pow(1.8, level) },
        commandmentsAuthority: { name: "Commandment's Authority", desc: "Klipah Gates are 1% less potent per level. Requires 10 Tablet Fragments from PERFECT WAVES to unlock.", maxLevel: 10, cost: level => 5000 * Math.pow(2.5, level), isLocked: (stats) => stats.tabletFragments < 10 },
    },
    emanations: {
        'gevurah': { name: "GEVURAH'S MIGHT", desc: "Projectile damage increased.", apply: (Olam) => Olam.game.player.projectileDamage++ }, 
        'netzach': { name: "NETZACH'S SWIFTNESS", desc: "Increases fire rate.", apply: (Olam) => Olam.game.player.fireRate *= 0.85 },
        'hod': { name: "HOD'S SPLENDOR", desc: "Projectiles pierce one enemy.", nonStackable: true, apply: (Olam) => Olam.game.player.hasPierce = true }, 
        'chesed': { name: "CHESED'S GRACE", desc: "Periodically gain a shield that blocks one hit.", nonStackable: true, apply: (Olam) => Olam.game.player.hasShieldGenerator = true },
        'tikkun': { name: "TIKKUN OLAM", desc: "Slowly regenerate lost Nefesh over time.", nonStackable: true, apply: (Olam) => Olam.game.player.hasRegen = true },
    },
    wavePatterns: {
        early: [
            () => ([ {type: 'Jar', lane: 0}, {type: 'Jar', lane: 1}, {type: 'Jar', lane: 2} ]),
            () => ([ {type: 'KlipahGate', lane: 0}, {type: 'KlipahGate', lane: 1, zOffset: -15}, {type: 'KlipahGate', lane: 2, zOffset: -30} ]),
            () => { const side = Math.random() < 0.5 ? 0 : 2; return [ {type: 'GolemSentry', lane: 1, zOffset:-10}, {type: 'Jar', lane: side, zOffset: 5} ] },
        ],
        mid: [
            () => { const lane = Math.floor(Math.random()*3); let p = []; for(let i=0; i<4; i++) p.push({type: 'TohuShard', lane: lane, zOffset: -i*15}); return p; },
            () => ([ {type: 'Weaver', lane: 0}, {type: 'Weaver', lane: 2, zOffset: -10} ]),
            () => ([ {type: 'Minelayer', lane: 1} ]),
        ],
        late: [
            () => { const pLane = Math.floor(Math.random()*3); const kLane = (pLane + 1 + Math.floor(Math.random()*2)) % 3; return [ {type: 'GolemSentry', lane: pLane}, {type: 'TomeKeeper', lane: kLane, zOffset: -5} ]; },
            () => ([ {type: 'Shatterer', lane: 1}, {type: 'Jar', lane: 0, zOffset: -15}, {type: 'Jar', lane: 2, zOffset: -15} ]),
            () => ([ {type: 'TorahScroll', lane: 0}, {type: 'TorahScroll', lane: 2} ]),
        ],
        expert: [
            () => ([ {type: 'Shatterer', lane:0}, {type:'Shatterer', lane:2, zOffset:-5} ]),
            () => ([ {type: 'Minelayer', lane: 0}, {type: 'Weaver', lane: 2, zOffset: -20} ]),
            () => { const pLane = Math.floor(Math.random()*3); return [ {type: 'GolemSentry', lane: pLane}, {type: 'GolemSentry', lane: (pLane+1)%3, zOffset:-10}, {type: 'GolemSentry', lane: (pLane+2)%3, zOffset:-20} ] }
        ]
    },
    levelColors: [ 0x483d8b, 0x1b0021, 0x2e0036, 0x4d0000, 0x002b4d, 0x522d00, 0x1a1a1a, 0x400050 ],
};
