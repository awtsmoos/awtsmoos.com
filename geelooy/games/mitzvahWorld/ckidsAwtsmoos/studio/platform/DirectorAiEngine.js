// B"H
const list = value => Array.isArray(value) ? value : value == null ? [] : [value];

const SHOT_FOR_EVENT = Object.freeze({
  dialogue:"overShoulder",
  quest:"medium",
  combat:"action",
  discovery:"wide",
  emotional:"closeup",
  travel:"tracking",
  shop:"insert"
});

export function directGameplayEvents(events = [], options = {}) {
  let cursor = 0;
  const mood = options.mood || (String(options.prompt || "").includes("emotional") ? "emotional" : "adventure");
  const shots = list(events).map((event, index) => {
    const kind = event.kind || event.type || "discovery";
    const duration = Math.max(2, Number(event.duration || (kind === "dialogue" ? 5 : 3)));
    const shot = {
      id:`director_shot_${index + 1}`,
      kind,
      shot:mood === "emotional" && kind === "dialogue" ? "closeup" : SHOT_FOR_EVENT[kind] || "medium",
      start:cursor,
      duration,
      target:event.target || event.actor || event.npcId || "player",
      pacing:mood === "emotional" ? "held-reaction" : "clear-action",
      transition:index === 0 ? "fade_in" : kind === "combat" ? "hard_cut" : "match_cut",
      camera:event.camera || null
    };
    cursor += duration;
    return shot;
  });
  return {
    mood,
    duration:cursor,
    shots,
    cameraGraph:shots.map(shot => ({ from:shot.id, to:shot.target, relation:"frames" })),
    edits:shots.map(shot => ({ at:shot.start, transition:shot.transition, pacing:shot.pacing })),
    music:{ cue:mood === "emotional" ? "soft_theme" : "village_theme", duckDialogue:true }
  };
}

export function directWorldGraph(graph = {}, options = {}) {
  const events = (graph.nodes || []).filter(node => ["quest", "shot", "npc", "animal", "shop"].includes(node.type)).slice(0, 12).map(node => ({ kind:node.type === "npc" ? "dialogue" : node.type === "shot" ? "discovery" : node.type, target:node.id }));
  return directGameplayEvents(events, options);
}

export default { directGameplayEvents, directWorldGraph };
