//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lobby field primitives dress choices consistently within Awtsmoos.com.
 * The Awtsmoos renews labels, selects, options, seats, and teams as focused
 * declarative vessels shared by every local player card.
 */
/** Wraps one control with its visible lobby label. */
export function lobbyField(label, control) {
	return {
		tag: 'label',
		attrs: { class: 'lobbyField' },
		children: [{ tag: 'span', children: [label] }, control]
	};
}

/** Builds one declarative select from stable value and label keys. */
export function lobbySelect(value, options, onChange, valueKey, labelKey) {
	return {
		tag: 'select',
		attrs: { class: 'lobbySelect' },
		on: { change: onChange },
		children: options.map(option => optionView(option, value, valueKey, labelKey))
	};
}

/** Returns the authored human, CPU, and closed seat choices. */
export function lobbyKindOptions() {
	return [
		{ id: 'human', label: 'Human' },
		{ id: 'cpu', label: 'CPU' },
		{ id: 'closed', label: 'Closed' }
	];
}

/** Returns the four supported local team choices. */
export function lobbyTeamOptions() {
	return [1, 2, 3, 4].map(team => {
		return { id: team, label: `Team ${team}` };
	});
}

function optionView(option, selectedValue, valueKey, labelKey) {
	const optionValue = option[valueKey];
	return {
		tag: 'option',
		attrs: {
			value: optionValue,
			selected: String(optionValue) === String(selectedValue)
		},
		children: [option[labelKey]]
	};
}
