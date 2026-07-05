// B"H
export function fleeStateFor(species = "rabbit") { return species === "bird" ? "takeoffAlarm" : species === "frog" ? "jumpAway" : "flee"; }
