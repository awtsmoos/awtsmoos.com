// B"H
/**
 * TextureRepeat translates source pixels into world distance. The grass is not
 * crushed into hundreds of tiny tiles: one source image occupies the world
 * width implied by its real pixel dimensions and a readable texel density.
 */
export const REPEAT_HOOKS=Object.freeze({
  terrainTexelsPerWorld:48,
  wallTileWorld:6,
  floorTileWorld:4,
  roofTileWorld:7,
  roadTileWorld:3.8
});

export function textureSize(image){return{w:image?.naturalWidth||image?.videoWidth||image?.width||1254,h:image?.naturalHeight||image?.videoHeight||image?.height||1254};}
export function publicUrl(image){return image?.dataset?.url||image?.dataset?.publicUrl||image?.src||null;}
export function exactRepeat(width,height,tileWorld=1,min=1,max=128){return[clamp(Math.round(Math.abs(width)/tileWorld),min,max),clamp(Math.round(Math.abs(height)/tileWorld),min,max)];}
export function repeatFromPixels(width,height,image,texelsPerWorld,min=1,max=128){const s=textureSize(image),worldPerTextureX=s.w/texelsPerWorld,worldPerTextureY=s.h/texelsPerWorld;return[clamp(Math.round(Math.abs(width)/worldPerTextureX),min,max),clamp(Math.round(Math.abs(height)/worldPerTextureY),min,max)];}
export function materialTexture(color,image,repeat=[1,1],options={}){return{color,mapImage:image||null,textureUrl:publicUrl(image),mapRepeat:repeat,anisotropy:options.anisotropy??2,backfaceCull:!!options.backfaceCull,doubleSided:!!options.doubleSided,texturePolicy:policy(image,repeat,options)};}
export function wallRepeat(){return[1,1];}
export function floorRepeat(){return[1,1];}
export function roofRepeat(){return[1,1];}
export function roadRepeat(width,length){return exactRepeat(width,length,REPEAT_HOOKS.roadTileWorld,1,64);}
export function terrainRepeat(size,image){return repeatFromPixels(size,size,image,REPEAT_HOOKS.terrainTexelsPerWorld,1,64);}
export function mixRepeat(size,image){return terrainRepeat(size,image);}
function policy(image,repeat,options){return{originalPixels:textureSize(image),repeat,tileWorld:options.tileWorld||null,shaderWrap:'mirror-pingpong-repeat',fullResolution:true,oneDrawCall:true,hook:options.hook||null,projection:options.projection||'cube-world'};}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,Number.isFinite(v)?v:lo));}
