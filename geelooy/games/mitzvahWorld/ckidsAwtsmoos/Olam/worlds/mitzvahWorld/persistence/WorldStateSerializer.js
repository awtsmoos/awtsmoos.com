/**
 * B"H
 * Chapter 29: The World Folded Into A Seed.
 */

export class WorldStateSerializer {
  serialize(state) {
    return JSON.stringify({ version: 1, state });
  }

  deserialize(text) {
    const parsed = JSON.parse(text);
    if (parsed.version !== 1) throw new Error(`Unsupported world state: ${parsed.version}`);
    return parsed.state;
  }

  merge(base, patch) {
    return { ...base, ...patch };
  }
}

export default WorldStateSerializer;
