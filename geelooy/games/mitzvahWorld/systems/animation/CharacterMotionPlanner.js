// B"H
/** Character movement as declarative intention: walk/run/turn/arrive. */
import { animationForIntent } from "./AnimationIntentMapper.js";
export function planCharacterMotion(target, to, intent = "walk") { return { target, to, intent, animation:animationForIntent(intent), command:"move_character" }; }
export function planMotions(items = []) { return items.map(i => planCharacterMotion(i.target, i.to || null, i.intent || "walk")); }
