// B"H
import { AssetResolver } from './AssetResolver.js';
export class SceneCompiler { static compile(dsl) { return (dsl.commands || []).map(c => ({ id: c.options?.id || c.type, assetId: AssetResolver.resolve(c.type), ...c.options })); } }
