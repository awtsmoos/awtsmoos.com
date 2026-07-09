// B"H
/**
 * @module SolidBlock
 * @description
 * Chapter 647: The stone learns to speak its role.
 *
 * The Awtsmoos places a platform, but the player needs mercy: green start,
 * warm path, gold reward, cyan finish, and marked crumb stones. This renderer
 * reads the level JSON's `visualRole` / `visualRoles` covenant and paints a
 * readable top sigil without changing the collision body beneath it.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const cache = new Map();
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const rgb = hex => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
const roleColor = Object.freeze({ start: 0x3fbf6f, reward: 0xffc84d, finish: 0x72fff4, crumb: 0xffa45c, path: 0xb9894c });
const roleEmissive = Object.freeze({ start: 0x072d12, reward: 0x302000, finish: 0x003636, crumb: 0x2b1204, path: 0x000000 });

function hashText(text = "") { let h = 2166136261; for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return h >>> 0; }
function noise(x, y, seed) { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.011) * 43758.5453; return n - Math.floor(n); }
function rolesOf(owner) { const roles = Array.isArray(owner.visualRoles) ? owner.visualRoles : []; if (owner.visualRole) roles.push(owner.visualRole); return [...new Set(roles.filter(Boolean))]; }
function primaryRole(owner) { return rolesOf(owner).find(role => ['start', 'finish', 'reward', 'crumb'].includes(role)) || owner.visualRole || 'path'; }
function styleFor(seed = "", role = "path") { if (role === 'finish' || /MEZUZAH|CYAN/i.test(seed)) return "cyanGlass"; if (role === 'reward' || /GOLD|CROWN/i.test(seed)) return "goldCarve"; if (role === 'start') return "greenCarve"; if (role === 'crumb') return "warmCrumb"; if (/DOOR|PANEL|BROWN|WOOD/i.test(seed)) return "woodBrick"; return "sandstone"; }
function readableBase(hex, style) { const [r, g, b] = rgb(hex || 0xc6aa62); if (style === "cyanGlass") return [34, 112, 128]; if (style === "goldCarve") return [132, 92, 30]; if (style === "greenCarve") return [42, 112, 54]; if (style === "warmCrumb") return [122, 72, 36]; if (style === "woodBrick") return [88, 49, 24]; return [(r * 0.32 + 82 * 0.68), (g * 0.3 + 58 * 0.7), (b * 0.25 + 28 * 0.75)].map(v => Math.min(126, v)); }
function shadeFor(style, x, y, h) { const brickW = style === "goldCarve" ? 8 : 16, brickH = style === "goldCarve" ? 4 : 8, row = Math.floor(y / brickH), offset = row % 2 ? brickW / 2 : 0; const mortar = ((x + offset) % brickW) < 1.2 || (y % brickH) < 1.1, grain = (noise(x * 0.7, y * 0.7, h) - 0.5) * 30, chip = noise(x, y, h) > 0.925 ? -35 : 0, ridge = style === "goldCarve" && (x % 8 === 0 || y % 8 === 0) ? 14 : 0, glass = style === "cyanGlass" ? Math.sin((x + y) * 0.35) * 12 : 0; return (mortar ? -46 : grain + chip) + ridge + glass; }

function makeTexture(seed, baseHex, role) {
  const style = styleFor(seed, role), key = `${seed}:${baseHex}:${style}:role-v2`; if (cache.has(key)) return cache.get(key).clone();
  const size = 64, h = hashText(seed), base = readableBase(baseHex, style), data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) { const i = (y * size + x) * 4, s = shadeFor(style, x, y, h), edge = x < 2 || y < 2 || x > 61 || y > 61 ? -22 : 0; data[i] = clamp(base[0] + s + edge); data[i + 1] = clamp(base[1] + s + edge); data[i + 2] = clamp(base[2] + s * 0.55 + edge); data[i + 3] = 255; }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType); tex.wrapS = THREE.MirroredRepeatWrapping; tex.wrapT = THREE.MirroredRepeatWrapping; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = true; tex.repeat.set(3.5 + (h % 2), 3.2 + ((h >> 3) % 2)); tex.needsUpdate = true; cache.set(key, tex); return tex.clone();
}

function makeTopMarker(owner) {
  const role = primaryRole(owner); if (role === 'path') return null;
  const color = roleColor[role] || roleColor.path;
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: role === 'crumb' ? 0.38 : 0.46, depthWrite: false });
  const marker = new THREE.Mesh(new THREE.BoxGeometry(owner.width * 0.72, 0.026, owner.depth * 0.72), material);
  marker.name = `${owner.name || 'solid'}_${role}_top_readability_sigil`;
  marker.position.y = owner.height / 2 + 0.018;
  marker.userData = { skipOctree: true, noOctree: true, addToOctree: false, visualRoleMarker: role };
  return marker;
}

export default class SolidBlock extends Domem {
  type = "solidBlock";
  constructor(op = {}, olam) {
    super(op, olam);
    this.width = op.width || 1; this.height = op.height || 1; this.depth = op.depth || 1;
    this.visualRole = op.visualRole || 'path'; this.visualRoles = Array.isArray(op.visualRoles) ? op.visualRoles : [this.visualRole];
    this.color = op.color || roleColor[primaryRole(this)] || 0xc6aa62;
    this.textureSeed = op.textureSeed || `${primaryRole(this)}_${op.name || "platform"}`;
    this.isSolid = op.isSolid !== false;
  }

  async heescheel(olam) {
    this.olam = olam;
    const role = primaryRole(this);
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: makeTexture(this.textureSeed, this.color, role), emissive: roleEmissive[role] || 0x000000, emissiveIntensity: role === 'path' ? 0 : 0.18 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name; this.mesh.nivraAwtsmoos = this; this.mesh.visible = true; this.mesh.frustumCulled = true;
    if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);
    this.mesh.userData ||= {}; Object.assign(this.mesh.userData, { isSolid: this.isSolid, visualRole: this.visualRole, visualRoles: this.visualRoles, gameplayHint: this.gameplayHint || null });
    const marker = makeTopMarker(this); if (marker) this.mesh.add(marker);
    this.mesh.updateMatrixWorld(true); this.applyPerformanceUserData?.(this.mesh);
    if (!this.isSolid) { this.mesh.userData.skipOctree = true; this.mesh.userData.noOctree = true; }
    await olam.hoyseef(this); if (this.isSolid) olam.worldOctree?.addObject(this.mesh); this.isReady = true;
  }
}
