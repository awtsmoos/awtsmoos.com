// B"H
import { ShotPromptCompiler } from './ShotPromptCompiler.js';
export class PerformancePromptCompiler { static compile(text = '') { const t = String(text).toLowerCase(); return { emotion: t.includes('surprise') ? 'surprised' : t.includes('happy') ? 'happy' : 'curious', speechEnergy: t.includes('excited') ? 1.25 : 1, gesture: t.includes('point') ? 'point' : 'explain', camera: ShotPromptCompiler.compile(text) }; } }
