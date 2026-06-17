// B"H
export class UniverseManifestStore { constructor() { this.items = []; } add(manifest) { this.items.push(manifest); return manifest; } latest() { return this.items[this.items.length - 1] || null; } snapshot() { return { count:this.items.length, latest:this.latest() }; } }
export const defaultUniverseManifestStore = new UniverseManifestStore();
