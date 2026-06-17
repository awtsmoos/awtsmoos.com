// B"H
import { expandArrayModifier } from "./ArrayModifier.js";
import { applyTransformModifier } from "./TransformModifier.js";
import { applyGroupModifier } from "./GroupModifier.js";
import { applyInstanceModifier } from "./InstanceModifier.js";
function applyOne(commands, modifier) { if (modifier.type === "array") return commands.flatMap(c => expandArrayModifier(c, modifier)); return commands.map(c => modifier.type === "transform" ? applyTransformModifier(c, modifier) : modifier.type === "group" ? applyGroupModifier(c, modifier) : modifier.type === "instance" ? applyInstanceModifier(c, modifier) : c); }
export function compileModifiers(command = {}) { return (command.modifiers || []).reduce(applyOne, [command]); }
export function compileCommandModifiers(commands = []) { return commands.flatMap(compileModifiers); }
