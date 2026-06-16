// B"H
/** @file groundTexture.js @description Wide repeating textured earth, no flat solid edge. */
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeShaderTexture } from "../shaderTexture.js?v=ground-grain-20260614-bh1";
function rendererFrom(op={}){return op.renderer||op.olam?.renderer||null;}
export function createVillageGroundTexture(op={}){const texture=bakeShaderTexture(rendererFrom(op),{kind:"ground",size:op.size||1024,colorA:op.grassDark||0x486b2f,colorB:op.grassLight||0x9cc766,colorC:op.flowerColor||0xe8d860}); texture.wrapS=texture.wrapT=THREE.RepeatWrapping; texture.repeat?.set?.(op.repeatX||Math.max(4,(op.width||400)/80),op.repeatY||Math.max(4,(op.depth||400)/80)); texture.anisotropy=8; texture.userData.wideRepeatingGround=true; return texture;}
export function villageGroundMaterial(op={}){const mat=new THREE.MeshLambertMaterial({color:0xffffff,map:createVillageGroundTexture(op)}); mat.name="awtsmoos_wide_textured_ground_material"; mat.userData.noSolidColor=true; return mat;}
