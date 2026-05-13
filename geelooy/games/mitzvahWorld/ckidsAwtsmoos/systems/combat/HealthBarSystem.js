/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE CROWN OF VITALITY — HealthBarSystem.js
 *   ──────────────────────────────────────────────────────────────────
 *
 *   📜 THE PSALM OF THE LIFE-FORCE CROWN:
 *   Above each head a crown of light does gleam,
 *   Red for the wounded, green for those supreme,
 *   The Awtsmoos breathes life into every bar,
 *   Displaying the soul-force near and far!
 *
 *   @module HealthBarSystem
 *   @description Renders floating health bars above enemy heads
 *   using THREE.Sprite billboards. Efficient, no HTML overlay needed.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';

/**
 * B"H
 * @class HealthBarSystem
 * @description Manages sprite-based health bars that float above entities.
 */
export default class HealthBarSystem {
    constructor() {
        /** @type {Map<string, Object>} Map of entity ID to health bar data */
        this.bars = new Map();
    }

    /**
     * B"H - Creates a health bar for an entity.
     * @param {Object} entity - The entity (Mazik) to attach the bar to.
     */
    createBar(entity) {
        if (!entity || !entity.mesh) return;
        if (this.bars.has(entity.name)) return;

        // B"H - Background bar (dark red)
        const bgCanvas = this._createBarCanvas(1.0, '#330000', '#660000');
        const bgTexture = new THREE.CanvasTexture(bgCanvas);
        const bgMat = new THREE.SpriteMaterial({
            map: bgTexture, transparent: true, depthTest: false
        });
        const bgSprite = new THREE.Sprite(bgMat);
        bgSprite.scale.set(2.2, 0.3, 1);

        // B"H - Foreground bar (green to red gradient)
        const fgCanvas = this._createBarCanvas(1.0, '#00ff00', '#00cc00');
        const fgTexture = new THREE.CanvasTexture(fgCanvas);
        const fgMat = new THREE.SpriteMaterial({
            map: fgTexture, transparent: true, depthTest: false
        });
        const fgSprite = new THREE.Sprite(fgMat);
        fgSprite.scale.set(2.0, 0.25, 1);

        // B"H - Name label
        const nameCanvas = this._createNameCanvas(entity.name || "Mazik");
        const nameTex = new THREE.CanvasTexture(nameCanvas);
        const nameMat = new THREE.SpriteMaterial({
            map: nameTex, transparent: true, depthTest: false
        });
        const nameSprite = new THREE.Sprite(nameMat);
        nameSprite.scale.set(3.0, 0.5, 1);

        // B"H - Assemble the container
        const container = new THREE.Group();
        container.add(bgSprite);
        container.add(fgSprite);
        nameSprite.position.y = 0.35;
        container.add(nameSprite);

        entity.mesh.add(container);
        container.position.y = 2.5; // Float above head

        this.bars.set(entity.name, {
            container,
            bgSprite,
            fgSprite,
            fgCanvas,
            fgTexture,
            fgMat,
            nameSprite,
            entity
        });
    }

    /**
     * B"H - Updates all health bars. Called every frame.
     * @param {THREE.Camera} camera - The active camera for billboard orientation.
     */
    update(camera) {
        for (const [id, bar] of this.bars) {
            const entity = bar.entity;
            if (!entity || !entity.mesh) continue;

            // B"H - Calculate health ratio
            const maxHp = entity.maxHp || entity.options?.maxHp || 100;
            const currentHp = entity.hp !== undefined ? entity.hp : maxHp;
            const ratio = Math.max(0, Math.min(1, currentHp / maxHp));

            // B"H - Update foreground bar width and color
            bar.fgSprite.scale.x = 2.0 * ratio;
            // Shift the bar left so it shrinks from right
            bar.fgSprite.position.x = -(1.0 - ratio) * 1.0;

            // B"H - Color transition: green -> yellow -> red
            this._updateBarColor(bar, ratio);

            // B"H - Billboard: always face camera
            if (camera) {
                bar.container.quaternion.copy(camera.quaternion);
            }

            // B"H - Hide bar if entity is dead
            if (currentHp <= 0) {
                bar.container.visible = false;
            }
        }
    }

    /**
     * B"H - Redraws the bar canvas with the appropriate health color.
     */
    _updateBarColor(bar, ratio) {
        const ctx = bar.fgCanvas.getContext('2d');
        const w = bar.fgCanvas.width;
        const h = bar.fgCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // B"H - Color lerp: green(1.0) -> yellow(0.5) -> red(0.0)
        let r, g;
        if (ratio > 0.5) {
            const t = (ratio - 0.5) * 2;
            r = Math.floor(255 * (1 - t));
            g = 255;
        } else {
            const t = ratio * 2;
            r = 255;
            g = Math.floor(255 * t);
        }

        const color = `rgb(${r}, ${g}, 0)`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(4, 4, w - 8, h - 8, 8);
        ctx.fill();

        // B"H - Inner glow
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.beginPath();
        ctx.roundRect(4, 4, w - 8, (h - 8) * 0.4, 8);
        ctx.fill();

        bar.fgTexture.needsUpdate = true;
    }

    /**
     * B"H - Creates a rounded bar canvas.
     */
    _createBarCanvas(fillRatio, color1, color2) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 32);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(2, 2, (256 - 4) * fillRatio, 28, 6);
        ctx.fill();

        return canvas;
    }

    /**
     * B"H - Creates a name label canvas.
     */
    _createNameCanvas(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(10, 5, 492, 54, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 256, 32);

        return canvas;
    }

    /**
     * B"H - Removes a health bar for a specific entity.
     */
    removeBar(entityName) {
        const bar = this.bars.get(entityName);
        if (!bar) return;
        if (bar.entity?.mesh) {
            bar.entity.mesh.remove(bar.container);
        }
        bar.fgMat.dispose();
        bar.fgTexture.dispose();
        this.bars.delete(entityName);
    }

    /**
     * B"H - Cleans up all health bars.
     */
    dispose() {
        for (const [id, bar] of this.bars) {
            this.removeBar(id);
        }
    }
}
