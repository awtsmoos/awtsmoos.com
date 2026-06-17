// B"H
export const COMMAND_TO_SEFIRAH = Object.freeze({ region:"malchus", building:"binah", road:"yesod", prop:"tiferes", npc_spawn:"netzach", quest:"kesser", cutscene:"hod" });
export function sefirahForCommand(command = {}) { return COMMAND_TO_SEFIRAH[command.type] || "malchus"; }
