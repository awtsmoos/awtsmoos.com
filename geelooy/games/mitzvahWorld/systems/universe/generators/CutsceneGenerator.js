// B"H
/** Cutscene plans become movie runtime registration commands. */
export function generateCutsceneCommands(cutscenes = []) {
  return cutscenes.map((c, i) => ({ type:"cutscene", id:c.id || `cutscene_${i+1}`, title:c.title, duration:c.duration || 0, command:"register_cutscene", source:c }));
}
export default generateCutsceneCommands;
