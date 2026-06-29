// B'H
import { createECS } from './ecs.js';
import { createCity, createChunk } from './city.js';
import { createStreamer } from './streamer.js';
import { scaledSize, shapeFor } from './meshes.js';
import { heightAt, hsl } from '../math.js';
export function createAwtsmoosEngine(seed=7708){const ecs=createECS();return{ecs,seed,city(w,b){return createCity(seed,w,b)},chunk(w,k,b,n){return createChunk(seed,w,k,b,n)},streamer(w,b,r){return createStreamer(this,w,b,r)},material(kind,hue){return{shape:shapeFor(kind),color:hsl(hue)}},object(base,tier,world){const size=scaledSize(base.kind,tier.r,tier.h);return{...base,...size,shape:shapeFor(base.kind),name:base.kind,r:tier.r,sparks:tier.sparks,hue:tier.hue,color:hsl(tier.hue),z:heightAt(base.x,base.y,world),taken:false}}}}
