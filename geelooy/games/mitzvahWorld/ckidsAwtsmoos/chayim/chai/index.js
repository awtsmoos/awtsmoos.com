/**
 * B"H
 * @file index.js
 * @description The central nervous system of the Chai (Living) entity.
 * It aggregates the spiritual and physical faculties (methods) from their respective chambers.
 */

import Tzomayach from "../tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import { Capsule } from '../../Olam/math/Capsule.js';

// Import Faculties
import visualMethods from "./methods/visuals.js";
import movementMethods from "./methods/movement.js";
import physicsMethods from "./methods/physics.js";
import raycastingMethods from "./methods/raycasting.js";
import buildingMethods from "./methods/building.js";
import projectileMethods from "./methods/projectiles.js";
import combatMethods from "./methods/combat.js"; // B"H: New Combat Module

export default class Chai extends Tzomayach {
    type = "chai";
    
    // Properties
    rotationSpeed;
    distanceFromRay = 5;
    placementRotation = 0;
    speedScale = 1.4;
    defaultSpeed = 127;
    rayAnchor = null;
    _speed = this.defaultSpeed;
    _originalSpeed = this._speed;
    _movementSpeed = this._speed;
    jumpHeight = 12;

    velocity = new THREE.Vector3();
    collider;
    cameraRotation = null;
    
    offset = 0;
    gotOffset = false;
    lastRotateOffset = 0;
    rotateOffset = 0;
    
    currentModelVector = new THREE.Vector3();
    worldDirectionVector = new THREE.Vector3();
    worldSideDirectionVector = new THREE.Vector3();
    
    height = 0.75;
    radius = 0.35;

    lerpTurnSpeed = 0.145;
    targetRotateOffset = 0;

    empty;
    modelMesh = null;
    dontRotateMesh = false;
    onFloor = true;
    
    // Raycasting State
    activeRay = null;
    activeObject = null;
    currentHighlighted = null;
    _isGeneratingGhost = false;
    
    // B"H: New State for Nature Painting
    isPaintingMode = false;

    // Lists
    rays = [];
    spheres = [];
    particles = [];

    // B"H: Stats & Vitality
    hp = 100;
    maxHp = 100;
    koach = 50; // Mana/Energy
    maxKoach = 50;
    xp = 0;
    level = 1;
    baseDefense = 0;
    basePower = 10;
    
    // Regeneration timers
    lastRegenTime = 0;
    regenRate = 1.0; // Seconds

    moving = {
        stridingLeft: false,
        stridingRight: false,
        forward: false,
        backward: false,
        turningLeft: false,
        turningRight: false,
        running: false,
        jump: false
    };
    
    movingAutomatically = false;
    isDancing = false;

    chaweeyoosMap = {
        run: () => this.moving.running ? "run" : "walk",
        idle: () => this.isDancing ? "dance silly" : "stand",
        walk: "walk",
        jump: "jump",
        falling: "falling",
        "right turn": "right turn",
        "left turn": "left turn",
        "dance silly": "dance silly"
    };

    get speed() { return this._speed; }
    set speed(v) { this._speed = v; }

    constructor(options, olam) {
        super(options, olam);
        this.rotationSpeed = options.rotationSpeed || 2;
        this.heesHawveh = true;
        this.rayAnchor = new THREE.Group();
        
        this.height = options.height || this.height;
        this.radius = options.radius || this.radius;
        
        // B"H: Stats overrides
        if(options.maxHp) { this.maxHp = options.maxHp; this.hp = this.maxHp; }
        if(options.maxKoach) { this.maxKoach = options.maxKoach; this.koach = this.maxKoach; }
        if(options.level) this.level = options.level;
        
        this.collider = new Capsule(
            new THREE.Vector3(0, this.height, 0), 
            new THREE.Vector3(0, this.height, 0), 
            this.radius
        );
        this.collider.nivraReference = this;

        const cm = options.chaweeyoosMap;
        if(cm && typeof(cm) == "object") {
            Object.keys(cm).forEach(k => { this.chaweeyoosMap[k] = cm[k]; });
        }

        this.on("collider transform update", ({ position, rotation }) => {
            // Hook for future logic
        });
    }

    // Lifecycle Methods
    async heescheel(olam) {
        await super.heescheel(olam);
    }

    async afterBriyah() {
        await super.afterBriyah(this);
        this.distanceFromRay = 5;
    }

    async ready() {
        await super.ready();
        if(this.olam) this.olam.scene.add(this.rayAnchor);
        this.speed = this.speed;
        this.animationSpeed = this.speed;
        
        // Setup separate mesh containers for physics vs visuals
        this.empty = new THREE.Group();
        if(this.olam) this.olam.scene.add(this.empty);
        
        const pos = this.mesh?.position;
        if(pos) {
            this.empty.position.copy(pos);
        }
        
        this.modelMesh = this.mesh;
        this.mesh = this.empty;
        
        this.emptyCopy = this.empty.clone();
        this.nonRotatingEmptyForMovement = this.empty.clone();
        if(this.olam) this.olam.scene.add(this.emptyCopy);
        
        this.setPosition(this.mesh.position);
    }

    // B"H: Update logic includes Regen
    heesHawvoos(dt) {
        super.heesHawvoos(dt); // Calls physics.js logic
        
        // Regeneration
        const now = Date.now();
        if (now - this.lastRegenTime > this.regenRate * 1000) {
            if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 1);
            if (this.koach < this.maxKoach) this.koach = Math.min(this.maxKoach, this.koach + 2);
            this.lastRegenTime = now;
            
            // Update UI if player
            if (this.type === 'chossid') this.updateStatsUI();
        }
    }
}

// B"H - Assigning the Divine Faculties to the Vessel
Object.assign(Chai.prototype, visualMethods);
Object.assign(Chai.prototype, movementMethods);
Object.assign(Chai.prototype, physicsMethods);
Object.assign(Chai.prototype, raycastingMethods);
Object.assign(Chai.prototype, buildingMethods);
Object.assign(Chai.prototype, projectileMethods);
Object.assign(Chai.prototype, combatMethods); // B"H: Combat Logic
