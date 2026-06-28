// B'H
import { createWorld } from './state.js';
import { bindInput } from './input.js';
import { createRenderer } from './renderer.js';
import { bindUI } from './ui.js';
import { step,start,restart,nextWorld } from './game.js';
import { createSound } from './sound.js';
const canvas=document.getElementById('game'),world=createWorld();world.nextWorld=()=>nextWorld(world);const pollInput=bindInput(world),renderer=createRenderer(canvas),sound=createSound(world);const updateUI=bindUI(world,{start:()=>start(world),restart});let last=performance.now();
/** B'H: the saved traveler enters many worlds, and every frame is renewed from nothing. */
function frame(now){const dt=Math.min(.033,(now-last)/1000);last=now;pollInput();step(world,dt);renderer.render(world);updateUI();while(world.events.length)sound.event(world.events.shift());requestAnimationFrame(frame)}requestAnimationFrame(frame);
