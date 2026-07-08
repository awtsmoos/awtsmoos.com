// B"H
import { compileProceduralGeometry } from "./ProceduralGeometryCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { adaptGroup } from "./ProceduralGroupAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { adaptArray } from "./ProceduralArrayAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { adaptInstance } from "./ProceduralInstanceAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileProceduralRenderData(config = {}) { return { id:config.id, kind:"procedural_render_data", geometry:compileProceduralGeometry(config), material:config.material || {}, shader:config.shader || null, group:adaptGroup(config), array:adaptArray(config), instance:adaptInstance(config) }; }
