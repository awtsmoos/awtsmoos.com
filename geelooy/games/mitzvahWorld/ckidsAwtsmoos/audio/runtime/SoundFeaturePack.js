// B"H
/** @file SoundFeaturePack.js @description Installs short sound effects only; no music runtime is created. */
import { createWebAudioSfxRuntime } from "./WebAudioSfxRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installSoundFeaturePack(runtime,scope=globalThis){ const sfx=createWebAudioSfxRuntime(scope); const api={sfx,play:(id,options)=>sfx.play(id,options),mute:()=>sfx.mute(),snapshot:()=>sfx.snapshot()}; runtime.sound=api; runtime?.markReady?.("sound:sfx",{music:false,webAudio:true}); return api; }
export default installSoundFeaturePack;
