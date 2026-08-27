// B"H
import { DocumentRegistry } from './DocumentRegistry.js';
export class SceneLoader { static load(id) { const doc = DocumentRegistry.get(id); if (!doc) throw new Error(`Scene not found: ${id}`); return doc; } }
