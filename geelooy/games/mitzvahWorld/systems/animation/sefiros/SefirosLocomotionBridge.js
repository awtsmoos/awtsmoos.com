// B"H
import { compileMotionToSefirah } from "./SefirosMotionCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function locomotionToSefiros(queue = []) { return queue.map(compileMotionToSefirah); }
