// B"H
export class SefirosSceneRegistry { constructor() { this.scenes = []; } add(scene) { const row = { scene, at:new Date().toISOString() }; this.scenes.push(row); return row; } snapshot() { return { scenes:this.scenes.length, latest:this.scenes[this.scenes.length - 1] || null }; } }
export default SefirosSceneRegistry;
