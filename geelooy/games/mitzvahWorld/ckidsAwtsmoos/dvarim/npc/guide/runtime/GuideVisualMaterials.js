// B"H
/**
 * @file GuideVisualMaterials.js
 * @description Chapter 511: Materials for the procedural guide visual. The
 * Awtsmoos dresses face, beard, robe, vest, belt, and glow with named colors.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const parse = value => typeof value === 'number' ? value : Number.parseInt(String(value || '#ffffff').replace('#', ''), 16);
export const guideMat = color => new THREE.MeshLambertMaterial({ color: parse(color) });
export const guideGlow = (color, opacity = 0.7) => new THREE.MeshBasicMaterial({ color: parse(color), transparent: true, opacity, depthWrite: false });
