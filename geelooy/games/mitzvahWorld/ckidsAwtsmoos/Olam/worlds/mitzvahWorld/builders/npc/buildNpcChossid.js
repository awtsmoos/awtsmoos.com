// B"H
/** @file buildNpcChossid.js @description NivrahFactory builder for chossid.glb NPCs with parser-clear props. */
import { buildChossidNpc } from "../../npcs/ChossidNpcBuilder.js";
function propsOf(def) { return def && def.props ? def.props : {}; }
function choose(value, fallback) { return value !== undefined && value !== null ? value : fallback; }
export async function buildNpcChossid(scene, physics, def, olam) {
  const props = propsOf(def);
  const npc = await buildChossidNpc(olam, { id:def.id, displayName:choose(props.displayName, def.id), position:choose(def.position, choose(props.position, [0,0,0])), rotation:choose(def.rotation, choose(props.rotation, [0,0,0])), scale:choose(def.scale, choose(props.scale, 1)) });
  return [npc];
}
export default buildNpcChossid;
