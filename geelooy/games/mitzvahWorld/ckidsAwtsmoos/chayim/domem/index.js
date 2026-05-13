
/**
 * B"H
 * @file index.js
 * @class Domem
 * @description The foundational element of existence in the game world.
 * Represents inanimate matter, but holds the potential for all spiritual elevation.
 */
import Nivra from "../nivra.js";
import {Kav} from "../roochney.js";
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from '../../utils.js';

import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';

// Import Faculties
import lifecycleMethods from "./methods/lifecycle.js";
import graphicsMethods from "./methods/graphics.js";
import audioMethods from "./methods/audio.js";
import animationMethods from "./methods/animation.js";
import serializationMethods from "./methods/serialization.js";

export default class Domem extends Nivra {
    type = "domem";
    animations = [];
    path = "";
    position = new Kav();
    rotation = new Kav();
    scale = new Kav();
    static = true;
    olam = null;
    heesHawveh = false;
    animationMixer;
    currentAnimationPlaying = null;
    golem = null;
    playAll = false;
    shaym = "BH_" + Math.floor(Math.random() * 827231) + 12312 + "_" + Date.now();
    removed = false;
    entityData = {};

    _animationSpeedScale = 1.4;

    get animationSpeedScale() {
        return this._animationSpeedScale;
    }

    set animationSpeedScale(v) {
        if(this.animationMixer) {
            this.animationMixer.timeScale = v;
        }
        this._animationSpeedScale = v;
    }

    _visible = true;
    set visible(v) {
        this._visible = v;
        if(!this.mesh) return;
        this.mesh.visible = v;
    }

    get visible() {
        return this._visible;
    }

    constructor(options, olam) {
        super(options);
        this.olam = olam;
        this.originalOptions = options;
        this.path = options.path;
        this.golem = options.golem;
        
        this.position.set(options?.position);
        
        var rot = options?.rotation;
        var rotX = {};
        rotX.x = rot?.x;
        rotX.y = rot?.y;
        rotX.z = rot?.z;
        this.rotation.set(rotX);
        
        this.methodsToCall = options?.methods || options?.methodsToCall;
        
        var scale = options.scale;
        if(!scale) scale = {x:1,y:1,z:1};
        this.scale.set(scale);
        
        this.isSolid = !!options.isSolid;
        this.interactable = options.interactable;
        if(this.interactable) {
            this.isInteractive = true;
        }
        this.proximity = options.proximity;
        this.heesHawveh = options.heesHawveh;
        this.height = options.height;
        this.instanced = options.instanced;
        this.entityName = options.entityName;
        this.playAll = !!options.playAll;
        this.environment = options.environment;
        
        if(typeof(this.entityName) == "string") {
            this.isTemplate = true;
        }
        this.itemData = options.itemData; 
        this.isTemplate = options.isTemplate;

        if(options.entities) {
            this.entityData = options.entities;
        }
        if(typeof(this.instanced) != "number" || !this.instanced) {
            this.instanced = false;
        }

        // Event Listeners
        this.on("madeAll", async (olam) => {
            // Post-creation logic if needed
        });

        this.on("opacity", amount => {
            var m = Array.isArray(this.materials);
            if(!m) return;
            this.materials.forEach(q => {
                if(!q.transparent) {
                    q.transparent = true;
                }
                q.opacity = amount;
            });
        });

        this.locationsChanged = [];
        
        this.on("reset position", () => {
            var mostRecent = this.locationsChanged[0];
            if(!mostRecent) return;
            this.ayshPeula("change transformation", mostRecent);
        });

        this.on("change transformation", ({ position, rotation, scale }) => {
            if(this.mesh) {
                if(position) this.mesh.position.copy(position);
                if(this.setPosition) this.setPosition(position);
                if(rotation) this.mesh.rotation.copy(rotation);
                if(scale) this.mesh.scale.copy(scale);
            }
            
            this.ayshPeula("collider transform update", { position, rotation, scale });
            this.locationsChanged.push({ position, rotation, scale });
        });

        this.on("sealayk", () => {
            if(this.olam) {
                this.olam?.sealayk(this);
            }
        });

        this.ayshPeula("varructed", this);
    }
}

// B"H - Aggregating the Faculties with Divine Emanation
ChasveiAwtsmoos.emanate(Domem.prototype, [
    lifecycleMethods,
    graphicsMethods,
    audioMethods,
    animationMethods,
    serializationMethods
]);
