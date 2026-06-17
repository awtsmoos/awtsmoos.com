// B"H
import { compileMotionToSefirah } from "./SefirosMotionCompiler.js";
export function locomotionToSefiros(queue = []) { return queue.map(compileMotionToSefirah); }
