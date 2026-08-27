// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

/** Generates UI panels and forms from the same method definitions used at runtime. */
export function createApiExplorerModel(registry) {
	const panels = new Map();
	for (const method of registry.list()) {
		const panelName = method.ui?.panel ?? "Expert";
		const panel = panels.get(panelName) ?? { id: panelName, methods: [] };
		panel.methods.push({
			id: method.id,
			label: method.label,
			description: method.description,
			control: method.ui?.control ?? "form",
			expert: method.ui?.expert === true,
			paramsSchema: method.paramsSchema,
			examples: method.examples
		});
		panels.set(panelName, panel);
	}
	return {
		title: "Awtsmoos Universal API Explorer",
		panels: [...panels.values()].sort((a, b) => a.id.localeCompare(b.id))
	};
}
