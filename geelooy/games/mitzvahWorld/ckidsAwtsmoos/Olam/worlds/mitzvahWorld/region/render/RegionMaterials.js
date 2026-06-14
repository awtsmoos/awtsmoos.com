// B"H
/**
 * @file RegionMaterials.js
 * @description
 * Chapter 1002: grass material actually carries generated grain texture.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import GrassGenerator from "../../../../../utils/TextureForge/Generators/Grass.js?v=grainy-grass-texture-20260614-bh2";
const cache = new Map();
const COLORS = Object.freeze({ grass:0xffffff, straw:0xd3b35f, daisyPetal:0xffffff, lavenderFlower:0x9275d8, barkOak:0x6b4325, barkPine:0x58402a, leaf:0x3f8d3d, graniteRock:0x8e8b82, slateStone:0x707783, mossPatch:0x557a3a, yellowBrick:0xd9b84c, dirt:0x8a5f35, darkWood:0x4b2d1a, lampShade:0xffd487, cabbageLeaf:0x5f9e42, carrotSkin:0xd7772f, potatoSkin:0xb08a5c, onionSkin:0xc99d66, goldHammered:0xd7b34a, marbleWhite:0xe9e0ce, cottonFiber:0xf4efe0, linenFabric:0xd8cfb2, mushroomCap:0xb46b5e, packedEarth:0x89613f, leafTrail:0x596f35, softTrail:0x726244, stoneDust:0x8b8779, wood:0x6f4829, foxFur:0xc65c24, foxTailFur:0xd97832, rabbitFur:0xd8cda8, deerFur:0x8c5d36, goatFur:0xc8b99b, birdFeather:0x8fa7c8, frogSkin:0x4f9b45, eyeBlack:0x070707, muzzleWhite:0xf4ead2, muzzle:0xbfa37a, darkSock:0x211611, tailTip:0xfff3d8, horn:0xd8c28c });
function grassTexture() { if (cache.has("__grassTexture")) return cache.get("__grassTexture"); const tex = new THREE.CanvasTexture(GrassGenerator.generate(384,384)); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2.5, 2.5); tex.anisotropy = 4; tex.userData.generatedGrassTexture = true; cache.set("__grassTexture", tex); return tex; }
export function regionMaterial(kind="grass",options={}){const key=`${kind}:${options.simple?1:0}:${options.unlit?1:0}:${options.side||0}`;if(cache.has(key))return cache.get(key);const args={color:COLORS[kind]||COLORS.grass,side:options.side??THREE.FrontSide};if(kind==="grass"){args.map=grassTexture();args.color=0xffffff;}const mat=options.unlit?new THREE.MeshBasicMaterial(args):new THREE.MeshLambertMaterial(args);mat.name=`fast_region_material_${kind}`;mat.userData={kind,generatedGrassTexture:kind==="grass",proceduralIntent:kind==="grass"?"actual-canvas-grainy-grass-texture":null};cache.set(key,mat);return mat;}
export function materialStats(){return{materials:cache.size,fast:true,generatedGrassTexture:true};}
