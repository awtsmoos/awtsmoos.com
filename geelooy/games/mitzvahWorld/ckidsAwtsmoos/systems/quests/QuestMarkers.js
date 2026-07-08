// B"H
/** @file QuestMarkers.js @description Lightweight ! and ? markers over NPCs. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { questMarkerType } from "./QuestState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function color(type) { return type === "progress" ? 0xc9ced8 : 0xffcc33; }
function makeBang(mat) {
  const root = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.BoxGeometry(.15, .7, .12), mat);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), mat);
  stem.position.y = .16; dot.position.y = -.34; root.add(stem, dot); return root;
}
function makeQuestion(mat) {
  const root = new THREE.Group();
  const torus = new THREE.Mesh(new THREE.TorusGeometry(.24, .055, 8, 18, Math.PI * 1.5), mat);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(.12, .28, .11), mat);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), mat);
  tail.position.set(.12, -.18, 0); dot.position.y = -.48; root.add(torus, tail, dot); return root;
}

export function attachQuestMarker(mesh, bridge, olam) {
  if (!mesh || !bridge?.questId) return null;
  const type = questMarkerType(olam, bridge.questId);
  mesh.userData.questMarkerState = type;
  mesh.userData.markerType = type === "complete" ? "dialogue" : "quest";
  if (!type) {
    if (mesh.__kidQuestMarker) mesh.__kidQuestMarker.visible = false;
    return mesh.__kidQuestMarker || null;
  }
  const symbol = type === "available" ? "!" : "?";
  if (mesh.__kidQuestMarker && mesh.__kidQuestMarker.userData?.markerSymbol !== symbol) {
    mesh.__kidQuestMarker.removeFromParent?.();
    mesh.__kidQuestMarker = null;
  }
  if (!mesh.__kidQuestMarker) {
    const mat = new THREE.MeshBasicMaterial({ color:color(type) });
    const root = symbol === "!" ? makeBang(mat) : makeQuestion(mat);
    root.name = `quest_marker_${bridge.questId}`;
    root.position.y = 2.95;
    root.userData = { questMarker:true, questId:bridge.questId, markerState:type };
    root.onBeforeRender = () => { root.rotation.y += .02; };
    mesh.add(root);
    mesh.__kidQuestMarker = root;
  }
  mesh.__kidQuestMarker.visible = true;
  mesh.__kidQuestMarker.userData.markerState = type;
  mesh.__kidQuestMarker.userData.markerSymbol = symbol;
  mesh.__kidQuestMarker.traverse?.(child => child.material && child.material.color?.setHex?.(color(type)));
  return mesh.__kidQuestMarker;
}

export function collectQuestMarkerCounts(olam) {
  let availableMarkers = 0, completeMarkers = 0, markerBangVisible = false, markerQuestionVisible = false;
  for (const npc of olam?.interactableNivrayim || []) {
    const state = npc?.mesh?.userData?.questMarkerState || null;
    if (state === "available") { availableMarkers++; markerBangVisible = Boolean(npc.mesh.__kidQuestMarker?.visible); }
    if (state === "complete") { completeMarkers++; markerQuestionVisible = Boolean(npc.mesh.__kidQuestMarker?.visible); }
  }
  return { availableMarkers, completeMarkers, markerBangVisible, markerQuestionVisible };
}

export default { attachQuestMarker, collectQuestMarkerCounts };
