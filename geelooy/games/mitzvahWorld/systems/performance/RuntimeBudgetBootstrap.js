// B"H
/** Starts the global runtime budget director gently, after first paint breathes. */
import { createWorldQualityDirector } from './WorldQualityDirector.js';
const scope=globalThis;
function startDirector(){if(scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__)return scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__;const director=createWorldQualityDirector(scope,{publishEveryMs:2500,maxFrames:150});scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__=director;director.start();scope.dispatchEvent?.(new CustomEvent('mitzvah-world:runtime-budget-started',{detail:{at:Date.now(),cheap:true}}));return director;}
const idle=scope.requestIdleCallback?cb=>scope.requestIdleCallback(cb,{timeout:1800}):cb=>scope.setTimeout(cb,900);
idle(startDirector);
export default scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__||null;