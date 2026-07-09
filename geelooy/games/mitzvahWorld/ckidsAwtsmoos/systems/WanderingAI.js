// B"H
/**
 * @file WanderingAI.js
 * @description Precompiled, staggered, above-ground wandering for NPCs/animals.
 * The Awtsmoos lets each creature receive a path before the frame begins, so
 * the per-frame river only carries intent, not repeated random searching.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const ray = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);
const up = new THREE.Vector3(0, 1, 0);
const temp = new THREE.Vector3();
const hash = text => [...String(text || "chai")].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const groundNames = /terrain|ground|road|path|grass|stone|floor/i;
function rand(seed) { let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967295; }
function named(actor) { return actor.shaym || actor.name || actor.id || actor.constructor?.name || "wanderer"; }
function callHeight(olam, x, z) { for (const k of ["getTerrainHeightAt", "getGroundHeightAt", "groundHeightAt", "terrainHeightAt", "sampleGroundHeight", "heightAt"]) { const fn = olam?.[k]; if (typeof fn !== "function") continue; const y = Number(fn.call(olam, x, z)); if (Number.isFinite(y)) return y; } return null; }
function groundMeshes(olam) { const out = [], root = olam?.scene || olam?.ayshPeula || olam?.threeScene; root?.traverse?.(o => { if (o?.isMesh && (o.userData?.visualGroundAuthority || o.userData?.isGround || groundNames.test(o.name || ""))) out.push(o); }); return out; }
function rayGround(actor, x, z, fallback) { const meshes = actor.__awtsWanderGroundMeshes ||= groundMeshes(actor.olam); if (!meshes.length) return fallback; ray.set(temp.set(x, fallback + 80, z), down); ray.far = 180; const hit = ray.intersectObjects(meshes, true)[0]; return hit ? hit.point.y : fallback; }
function resolveY(actor, x, z, originY) { const explicit = Number(actor.options?.wanderGroundY); if (Number.isFinite(explicit)) return explicit + Number(actor.options?.wanderFootClearance ?? 0.04); const sampled = callHeight(actor.olam, x, z); const base = Number.isFinite(sampled) ? sampled : rayGround(actor, x, z, originY); return Math.max(originY, base + Number(actor.options?.wanderFootClearance ?? 0.06)); }
function buildPath(actor) { const origin = actor.wanderOrigin || actor.mesh?.position || new THREE.Vector3(), range = Number(actor.options?.wanderRange || 10), count = clamp(Number(actor.options?.wanderPathPoints || 8), 3, 24), seed = hash(`${named(actor)}:${origin.x}:${origin.z}:${range}`), random = rand(seed), path = []; for (let i = 0; i < count; i++) { const a = random() * Math.PI * 2, r = range * (.25 + random() * .75), x = origin.x + Math.cos(a) * r, z = origin.z + Math.sin(a) * r, y = resolveY(actor, x, z, origin.y); path.push(new THREE.Vector3(x, y, z)); } return path; }
function face(actor, target) { const p = actor.mesh?.position; if (!p) return; const yaw = Math.atan2(target.x - p.x, target.z - p.z); actor.rotation ||= {}; actor.rotation.y = yaw; if (actor.mesh?.rotation) actor.mesh.rotation.y = yaw; }
function shouldThink(actor) { if (!actor.isWandering || actor.state === "talking") return false; if (/attack|chase|combat/i.test(String(actor.state || ""))) return true; actor.__wanderThinkT = (actor.__wanderThinkT || 0) - (actor.__wanderLastDt || 0); if (actor.__wanderThinkT > 0) return false; actor.__wanderThinkT = actor.__wanderInterval || .16; return true; }
export default {
  initWandering() { if (!this.options.isWandering) return; this.wanderOrigin = this.mesh.position.clone(); this.wanderRange = this.options.wanderRange || 10; this.__wanderSeed = hash(named(this)); this.__wanderInterval = clamp(Number(this.options.wanderThinkInterval || .14), .06, .5); this.__wanderThinkT = (this.__wanderSeed % 11) * .013; this.__wanderPath = buildPath(this); this.__wanderPathIndex = 0; this.wanderTarget = this.__wanderPath[0]?.clone?.() || this.wanderOrigin.clone(); this.isWandering = true; this.wanderPauseTimer = 0; this.__wanderCompiledAt = performance?.now?.() || Date.now(); },
  createNewWanderTarget() { if (!this.__wanderPath?.length) this.__wanderPath = buildPath(this); this.__wanderPathIndex = ((this.__wanderPathIndex || 0) + 1) % this.__wanderPath.length; const next = this.__wanderPath[this.__wanderPathIndex].clone(); next.y = resolveY(this, next.x, next.z, this.wanderOrigin?.y || this.mesh?.position?.y || 0); return next; },
  updateWandering(dt) { this.__wanderLastDt = dt; if (!shouldThink(this)) return; if (this.wanderPauseTimer > 0) { this.wanderPauseTimer -= this.__wanderInterval; this.moving.forward = false; return; } const p = this.mesh?.position, t = this.wanderTarget; if (!p || !t) return; const dx = p.x - t.x, dz = p.z - t.z; if ((dx * dx + dz * dz) < 1) { this.wanderPauseTimer = 1.6 + (this.__wanderSeed % 17) * .07; this.wanderTarget = this.createNewWanderTarget(); this.moving.forward = false; return; } t.y = resolveY(this, t.x, t.z, this.wanderOrigin?.y || p.y); face(this, t); this.moving.forward = true; },
  recompileWanderPath() { this.__wanderPath = buildPath(this); this.__wanderPathIndex = 0; this.wanderTarget = this.__wanderPath[0]?.clone?.(); }
};
