// B"H
/**
 * @file index.js
 * @class Domem
 * @description
 * Chapter 61: The Still Stone Learned A Faster Breath.
 *
 * Every visible body begins here. The Awtsmoos now gives animation blending
 * knobs to every entity so platformer bodies can leave idle instantly while
 * slower decorative vessels may still drift if they choose.
 */
import Nivra from "../nivra.js";
import { Kav } from "../roochney.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';
import lifecycleMethods from "./methods/lifecycle.js";
import graphicsMethods from "./methods/graphics.js";
import audioMethods from "./methods/audio.js";
import animationMethods from "./methods/animation.js?v=fast-platformer-blend-20260602-bh15";
import serializationMethods from "./methods/serialization.js";

const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

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
    animationBlendDuration = 0.075;
    animationActionTimeScale = 1;
    _animationSpeedScale = 1.4;

    get animationSpeedScale() { return this._animationSpeedScale; }
    set animationSpeedScale(v) {
        const speed = numberOr(v, this._animationSpeedScale || 1);
        if (this.animationMixer) this.animationMixer.timeScale = speed;
        this._animationSpeedScale = speed;
    }

    _visible = true;
    set visible(v) { this._visible = v; if (this.mesh) this.mesh.visible = v; }
    get visible() { return this._visible; }

    /** @param {object} options Entity options. @param {object} olam World. */
    constructor(options = {}, olam) {
        super(options);
        this.olam = olam;
        this.originalOptions = options;
        this.path = options.path;
        this.golem = options.golem;
        this.position.set(options?.position);
        const rot = options?.rotation || {};
        this.rotation.set({ x: rot.x, y: rot.y, z: rot.z });
        this.methodsToCall = options?.methods || options?.methodsToCall;
        this.scale.set(options.scale || { x: 1, y: 1, z: 1 });
        this.isSolid = !!options.isSolid;
        this.interactable = options.interactable;
        if (this.interactable) this.isInteractive = true;
        this.proximity = options.proximity;
        this.heesHawveh = options.heesHawveh;
        this.height = options.height;
        this.instanced = options.instanced;
        this.entityName = options.entityName;
        this.playAll = !!options.playAll;
        this.environment = options.environment;
        this.itemData = options.itemData;
        this.isTemplate = options.isTemplate || typeof this.entityName === "string";
        this.animationBlendDuration = numberOr(options.animationBlendDuration, this.animationBlendDuration);
        this.animationActionTimeScale = numberOr(options.animationActionTimeScale, this.animationActionTimeScale);
        this._animationSpeedScale = numberOr(options.animationSpeedScale, this._animationSpeedScale);
        if (options.entities) this.entityData = options.entities;
        if (typeof this.instanced !== "number" || !this.instanced) this.instanced = false;

        this.on("madeAll", async olamRef => {});
        this.on("opacity", amount => {
            if (!Array.isArray(this.materials)) return;
            this.materials.forEach(mat => { if (!mat.transparent) mat.transparent = true; mat.opacity = amount; });
        });
        this.locationsChanged = [];
        this.on("reset position", () => {
            const mostRecent = this.locationsChanged[0];
            if (mostRecent) this.ayshPeula("change transformation", mostRecent);
        });
        this.on("change transformation", ({ position, rotation, scale }) => {
            if (this.mesh) {
                if (position) this.mesh.position.copy(position);
                if (this.setPosition) this.setPosition(position);
                if (rotation) this.mesh.rotation.copy(rotation);
                if (scale) this.mesh.scale.copy(scale);
            }
            this.ayshPeula("collider transform update", { position, rotation, scale });
            this.locationsChanged.push({ position, rotation, scale });
        });
        this.ayshPeula("varructed", this);
    }
}

ChasveiAwtsmoos.emanate(Domem.prototype, [lifecycleMethods, graphicsMethods, audioMethods, animationMethods, serializationMethods]);
