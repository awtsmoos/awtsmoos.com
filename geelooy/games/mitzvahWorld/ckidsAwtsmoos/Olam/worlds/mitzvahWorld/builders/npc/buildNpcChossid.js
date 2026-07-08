// B"H
/** @file buildNpcChossid.js @description NivrahFactory builder for visible chossid.glb NPCs with top-level scene props preserved. */
import { buildChossidNpc } from "../../npcs/ChossidNpcBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function propsOf(def) { return def && def.props ? def.props : {}; }
function choose(value, fallback) { return value !== undefined && value !== null ? value : fallback; }
function arrPosition(def, props) { return choose(def.position, choose(props.position, [0, 0, 0])); }
function arrRotation(def, props) { return choose(def.rotation, choose(props.rotation, [0, 0, 0])); }
function npcDef(def) {
  const props = propsOf(def);
  return {
    id:choose(def.id, choose(def.name, props.id)),
    displayName:choose(def.displayName, choose(props.displayName, choose(def.name, def.id))),
    name:choose(def.name, choose(props.name, def.id)),
    role:choose(def.role, choose(props.role, "friendly_village_chossid")),
    dialogueId:choose(def.dialogueId, props.dialogueId),
    dialogues:choose(def.dialogues, choose(props.dialogues, [])),
    position:arrPosition(def, props),
    rotation:arrRotation(def, props),
    scale:choose(def.scale, choose(props.scale, 1)),
    proximity:choose(def.proximity, choose(props.proximity, 9)),
    hp:choose(def.hp, choose(props.hp, 100)),
    isFriendly:true,
    faction:"chossidim"
  };
}
export async function buildNpcChossid(scene, physics, def, olam) { return [await buildChossidNpc(olam, npcDef(def))]; }
export default buildNpcChossid;
