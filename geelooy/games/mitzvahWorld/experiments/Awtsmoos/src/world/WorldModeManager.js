// B"H
/** WorldModeManager: only one world is loaded into sight/collision at a time. */
export class WorldModeManager {
  constructor({ state, ground, mover, mainOctree, mainGroup, lava, mainObjects = [], footOffset }) { Object.assign(this, { state, ground, mover, mainOctree, mainGroup, lava, mainObjects, footOffset, mode: 'eretz' }); }
  enterLava() { this.mode = 'lava'; this.mainGroup.visible = false; for (const o of this.mainObjects) o.visible = false; this.ground.terrainHeightAt = (x, z) => this.lava.heightAt(x, z); this.ground.octree = this.lava.octree; this.lava.enter(this.state, this.ground, this.mover, this.footOffset); }
  returnEretz() { this.mode = 'eretz'; this.mainGroup.visible = true; for (const o of this.mainObjects) o.visible = true; this.ground.terrainHeightAt = this.mainHeightAt; this.ground.octree = this.mainOctree; this.lava.leave(this.state, this.ground, this.mover, this.mainOctree, this.footOffset); }
  rememberMainHeight(heightAt) { this.mainHeightAt = heightAt; return this; }
  stats() { return { mode: this.mode, mainVisible: this.mainGroup.visible, lavaVisible: this.lava.group.visible }; }
}
