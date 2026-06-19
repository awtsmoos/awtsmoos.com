// B"H
/**
 * @file Npc3DMarkerPostBuild.js
 * @description Floating 3D question and exclamation markers for NPCs.
 *
 * The Awtsmoos makes a question hover before wisdom and an exclamation burn
 * before action. These are not DOM labels; they are small mesh signs above
 * real NPC vessels, visible to desktop and mobile cameras alike.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { NPC_INTERACTION_SCHEMA } from "../data/manifests/NpcInteractionSchema.js";

const KEY = "__awtsmoosNpc3DMarker";

/**
 * Returns object data, creating it if needed.
 *
 * @param {object} object Three object.
 * @returns {object} User data.
 */
function dataOf(object) { object.userData ||= {}; return object.userData; }

/**
 * Marker color for a role type.
 *
 * @param {string} type Marker type.
 * @returns {number} Hex color.
 */
function colorFor(type) {
  return { quest:0xffcc33, debate:0x6ee7ff, shop:0xa6ff7a, dialogue:0xffffff, farm:0xb7ff62, clothing:0xff9dff }[type] || 0xffffff;
}

/**
 * Creates one mesh box.
 *
 * @param {number[]} size Box size.
 * @param {number[]} pos Position.
 * @param {number} color Color.
 * @returns {THREE.Mesh} Mesh.
 */
function box(size, pos, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), new THREE.MeshBasicMaterial({ color }));
  mesh.position.set(pos[0], pos[1], pos[2]); mesh.userData.npcMarkerPart = true; return mesh;
}

/**
 * Creates dot geometry for punctuation.
 *
 * @param {number} color Color.
 * @returns {THREE.Mesh} Dot mesh.
 */
function dot(color) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color }));
  mesh.position.y = -.38; mesh.userData.npcMarkerPart = true; return mesh;
}

/**
 * Creates an exclamation or question marker.
 *
 * @param {string} type Marker type.
 * @returns {THREE.Group} Marker group.
 */
export function createNpc3DMarker(type = "dialogue") {
  const color = colorFor(type), root = new THREE.Group();
  root.name = `npc_3d_marker_${type}`;
  if (type === "quest") root.add(box([.16,.78,.12], [0,.14,0], color), dot(color));
  else if (type === "debate" || type === "dialogue") root.add(new THREE.Mesh(new THREE.TorusGeometry(.26,.055,8,18,Math.PI*1.55), new THREE.MeshBasicMaterial({ color })), box([.13,.32,.11], [.16,-.12,0], color), dot(color));
  else root.add(new THREE.Mesh(new THREE.OctahedronGeometry(.34), new THREE.MeshBasicMaterial({ color })));
  root.position.y = 2.65; root.userData = { npc3DMarker:true, markerType:type };
  return root;
}

/**
 * Returns true when the node has an NPC marker role.
 *
 * @param {object} node Scene node.
 * @returns {boolean} Whether it should receive a marker.
 */
function markerCandidate(node) {
  const data = dataOf(node), markers = NPC_INTERACTION_SCHEMA.markerTypes || {};
  return Boolean(data.interactable && (data.markerType || markers[data.markerType]));
}

/**
 * Installs 3D markers above marked NPCs.
 *
 * @param {object} context Postbuild context.
 * @returns {object[]} Nodes marked.
 */
export function ensureNpc3DMarkers(context = {}) {
  const scene = context.scene || context.olam?.scene || null, touched = [];
  if (!scene?.traverse) return touched;
  scene.traverse(node => {
    if (!markerCandidate(node) || node[KEY]) return;
    const marker = createNpc3DMarker(dataOf(node).markerType || "dialogue");
    node.add(marker); node[KEY] = marker; touched.push(node);
  });
  return touched;
}

export default ensureNpc3DMarkers;
