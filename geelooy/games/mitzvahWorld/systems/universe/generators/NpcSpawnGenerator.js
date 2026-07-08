// B"H
import { applyManualOverride } from "../manual/ManualOverrideLayer.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { withModifierStack } from "../modifiers/UniverseModifierStack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function generateNpcSpawnCommands(beings = []) { return beings.map((b, i) => withModifierStack(applyManualOverride({ type:"npc_spawn", id:b.id || `npc_${i+1}`, name:b.name, role:b.role, home:b.home, work:b.work, animations:b.animationTimeline || [], procedural:{ recipe:"rigged_human" }, command:"spawn_living_being", source:b }, b), b)); }
export default generateNpcSpawnCommands;
