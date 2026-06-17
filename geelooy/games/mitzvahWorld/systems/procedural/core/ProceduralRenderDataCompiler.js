// B"H
import { compileProceduralGeometry } from "./ProceduralGeometryCompiler.js";
import { adaptGroup } from "./ProceduralGroupAdapter.js";
import { adaptArray } from "./ProceduralArrayAdapter.js";
import { adaptInstance } from "./ProceduralInstanceAdapter.js";
export function compileProceduralRenderData(config = {}) { return { id:config.id, kind:"procedural_render_data", geometry:compileProceduralGeometry(config), material:config.material || {}, shader:config.shader || null, group:adaptGroup(config), array:adaptArray(config), instance:adaptInstance(config) }; }
