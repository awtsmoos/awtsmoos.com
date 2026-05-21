/**
 * B"H
 * @file DialogueMemoryRuntime.js
 *
 * Chapter 38: The Speaker Remembered The Player's Footsteps.
 *
 * The Awtsmoos lets words answer history. Dialogue lines may require memory
 * flags or world events, allowing NPCs to speak as residents of a living city
 * instead of statues reciting sealed plaques.
 */

export function chooseDialogueLine(lines = [], context = {}) {
  const matches = line => {
    const memoryOk = !line.requiresMemory || context.memory?.[line.requiresMemory];
    const eventOk = !line.requiresEvent || context.events?.includes(line.requiresEvent);
    return memoryOk && eventOk;
  };
  return lines.find(line => (line.requiresMemory || line.requiresEvent) && matches(line))
    || lines.find(line => !line.requiresMemory && !line.requiresEvent)
    || lines.find(matches)
    || null;
}

export function rememberDialogue(memory = {}, key, value = true) {
  if (!key) throw new Error('Dialogue memory key is required.');
  return { ...memory, [key]: value };
}
