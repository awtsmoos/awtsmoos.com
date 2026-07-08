// B"H
import { expandArrayModifier } from "./ArrayModifier.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { applyTransformModifier } from "./TransformModifier.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { applyGroupModifier } from "./GroupModifier.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { applyInstanceModifier } from "./InstanceModifier.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function applyOne(commands, modifier) { if (modifier.type === "array") return commands.flatMap(c => expandArrayModifier(c, modifier)); return commands.map(c => modifier.type === "transform" ? applyTransformModifier(c, modifier) : modifier.type === "group" ? applyGroupModifier(c, modifier) : modifier.type === "instance" ? applyInstanceModifier(c, modifier) : c); }
export function compileModifiers(command = {}) { return (command.modifiers || []).reduce(applyOne, [command]); }
export function compileCommandModifiers(commands = []) { return commands.flatMap(compileModifiers); }
