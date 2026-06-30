// B"H
export function createExplorerCommands(initial = {}) {
  const commands = new Map(Object.entries(initial));
  return {
    register(name, handler) { commands.set(name, handler); return () => commands.delete(name); },
    async run(name, payload = {}) {
      if (!commands.has(name)) throw new Error(`Unknown explorer command: ${name}`);
      return await commands.get(name)(payload);
    },
    has(name) { return commands.has(name); },
    list() { return [...commands.keys()]; }
  };
}

/** B"H: commands are named vessels; buttons may invoke them without owning them. */
