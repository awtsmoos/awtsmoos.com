// B"H
export function cutsceneTrigger(type, detail = {}) { return { type, detail }; }
export function triggerMatches(trigger = {}, event = {}) { return trigger.type === event.type; }
