// B"H
/** Single THREE import gateway for new systems; old code migrates here gradually. */
import * as THREE from "/games/scripts/build/three.module.js";
import { createProceduralThreeMesh } from "../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js";
export { THREE };
export function awtsmoosThree() { return THREE; }
export function createAwtsmoosMesh(config) { return createProceduralThreeMesh(THREE, config); }
export const THREE_MIGRATION_NOTE = "New code imports this gateway; legacy direct THREE imports require staged rewrites.";
