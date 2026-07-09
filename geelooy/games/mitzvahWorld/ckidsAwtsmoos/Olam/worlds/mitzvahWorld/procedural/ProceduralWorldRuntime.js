// B"H
/**
 * @file ProceduralWorldRuntime.js
 * @description Installs JSON-authored procedural environments and cutscene paths.
 *
 * A world JSON block becomes a root group, its groups unfold, its modifiers
 * line up, and its star/arc cutscene marks wait in the scene. The old world is
 * not replaced; this layer is a sidecar, gentle and fast.
 */
import { GeometryEngine } from "../GeometryEngine.js?compact=true&v=awtsmoos-geometry-engine-20260614-bh2";
import { normalizeProceduralWorld } from "./ProceduralWorldSchema.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const KEY = "__awtsmoosProceduralWorldRuntime";

const FALLBACK = Object.freeze({
  id:"mitzvah_world_json_shape_sample",
  title:"JSON Shape Sample",
  components:[
    { type:"group", name:"question_star_gate", position:[-14,1.8,10], children:[
      { type:"star", material:"GOLD", options:{ points:8, outerRadius:1.6, innerRadius:.7, depth:.12 }, rotation:[0,0,.2] },
      { type:"arc", material:"BLUE_GLASS", options:{ radius:2.6, start:.25, end:2.9, thickness:.06 }, position:[0,-.4,0] }
    ] },
    { type:"array", name:"stone_learning_steps", count:5, offset:[1.6,0,.8], position:[-18,.1,5], component:{ type:"box", params:[1.1,.18,.7], material:"JERUSALEM_STONE" } }
  ],
  cutscenes:[{ id:"shape_gate_reveal", beats:[{ target:"question_star_gate", camera:"arc_push", seconds:4 }] }]
});

/**
 * Returns the procedural block from level/world data.
 *
 * @param {object} context Postbuild context.
 * @returns {object} Procedural JSON block.
 */
function inputOf(context = {}) {
  return context.proceduralWorldJson || context.worldData?.awtsmoosProceduralWorld || context.worldData?.proceduralWorld || FALLBACK;
}

/**
 * Finds the scene and holder from context.
 *
 * @param {object} context Runtime context.
 * @returns {{scene:object|null, holder:object}} Scene and holder.
 */
function refs(context = {}) {
  const holder = context.olam || context || {};
  return { holder, scene:context.scene || holder.scene || null };
}

/**
 * Installs a procedural JSON world sidecar into the scene.
 *
 * @param {object} context Runtime context.
 * @returns {object|null} Installed group or null.
 */
export async function ensureProceduralWorldRuntime(context = {}) {
  const { holder, scene } = refs(context);
  if (!scene || holder[KEY]) return holder[KEY] || null;
  const blueprint = normalizeProceduralWorld(inputOf(context));
  const root = GeometryEngine.manifest(blueprint, { blueprints:blueprint.blueprints });
  root.name = `awtsmoos_json_world_${blueprint.id}`;
  root.userData = { proceduralJsonWorld:true, id:blueprint.id, title:blueprint.title, cutscenes:blueprint.cutscenes, components:blueprint.components.length };
  scene.add(root);
  holder[KEY] = root;
  holder.__AWTSMOOS_PROCEDURAL_WORLD__ = { id:blueprint.id, components:blueprint.components.length, cutscenes:blueprint.cutscenes.length, root:root.name };
  return root;
}

export default ensureProceduralWorldRuntime;
