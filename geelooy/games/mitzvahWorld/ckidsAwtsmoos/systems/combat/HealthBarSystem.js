// B"H
/** @file HealthBarSystem.js @description Compact health-bar/nameplate bridge that stays visual-only and delegates rich UI to runtime payloads. */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function hpOf(enemy) { return Number(enemy?.hp ?? enemy?.health?.current ?? enemy?.currentStats?.health ?? 0); }
function maxHpOf(enemy) { return Math.max(1, Number(enemy?.maxHp ?? enemy?.health?.max ?? enemy?.currentStats?.maxHealth ?? 1)); }
function posOf(enemy) { return enemy?.mesh?.position || enemy?.modelMesh?.position || enemy?.position || null; }
export default class HealthBarSystem {
  constructor() { this.bars = new Map(); this.selected = null; }
  makeTexture(enemy) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d'); const pct = Math.max(0, Math.min(1, hpOf(enemy) / maxHpOf(enemy)));
    ctx.clearRect(0, 0, 256, 64); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(8, 14, 240, 24);
    ctx.fillStyle = pct > .5 ? '#76ff8a' : pct > .25 ? '#ffd966' : '#ff7777'; ctx.fillRect(10, 16, 236 * pct, 20);
    ctx.strokeStyle = enemy === this.selected ? '#ffd700' : '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(8, 14, 240, 24);
    ctx.fillStyle = '#ffffff'; ctx.font = '14px sans-serif'; ctx.fillText(enemy?.name || enemy?.mesh?.name || 'Target', 10, 56);
    return new THREE.CanvasTexture(canvas);
  }
  createBar(enemy) {
    if (!enemy || this.bars.has(enemy.name)) return this.bars.get(enemy?.name) || null;
    const texture = this.makeTexture(enemy); if (!texture) return null;
    const material = new THREE.SpriteMaterial({ map:texture, transparent:true, depthTest:false });
    const sprite = new THREE.Sprite(material); sprite.scale.set(3.2, .8, 1); sprite.userData.enemy = enemy;
    enemy.mesh?.add?.(sprite); sprite.position.set(0, 2.5, 0); this.bars.set(enemy.name, { enemy, sprite, texture, material, lastHp:hpOf(enemy), lastMax:maxHpOf(enemy), selected:enemy === this.selected }); return sprite;
  }
  removeBar(name) { const row = this.bars.get(name); if (!row) return false; row.sprite?.parent?.remove?.(row.sprite); row.texture?.dispose?.(); row.material?.dispose?.(); this.bars.delete(name); return true; }
  setSelected(enemy) { this.selected = enemy || null; this.refreshAll(true); }
  refresh(enemy, force = false) { const row = this.bars.get(enemy?.name); if (!row) return this.createBar(enemy); const hp = hpOf(enemy), max = maxHpOf(enemy), selected = enemy === this.selected; if (!force && row.lastHp === hp && row.lastMax === max && row.selected === selected) return row; row.lastHp = hp; row.lastMax = max; row.selected = selected; row.texture?.dispose?.(); row.texture = this.makeTexture(enemy); if (row.material) row.material.map = row.texture, row.material.needsUpdate = true; return row; }
  refreshAll(force = false) { for (const { enemy } of this.bars.values()) this.refresh(enemy, force); }
  update(camera, refresh = false) { for (const { enemy, sprite } of this.bars.values()) { if (!sprite || !posOf(enemy)) continue; sprite.visible = hpOf(enemy) > 0; if (camera && sprite.quaternion) sprite.quaternion.copy(camera.quaternion); if (refresh) this.refresh(enemy); } }
  dispose() { for (const name of [...this.bars.keys()]) this.removeBar(name); this.selected = null; }
}
