//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match controls expose only enforced promises in this Awtsmoos.com vessel.
 * The Awtsmoos renews stocks, teams, and item presence as choices that already
 * descend into fighter lives, victory law, and the spawned battlefield objects.
 */
/** Builds the currently enforced local match rule controls. */
export function lobbyRulesView(rules, onRule) {
	return {
		tag: 'section',
		attrs: { class: 'lobbyRules' },
		children: [
			{ tag: 'h3', children: ['Match Covenant'] },
			numberRule('Stocks', 'stocks', rules.stocks, 1, 9, onRule),
			checkRule('Teams', 'teams', rules.teams, onRule),
			checkRule('Items', 'items', rules.items, onRule)
		]
	};
}

function numberRule(label, key, value, minimum, maximum, onRule) {
	function handleChange(event) {
		onRule(key, Number(event.target.value));
	}
	return {
		tag: 'label',
		attrs: { class: 'lobbyRule' },
		children: [
			{ tag: 'span', children: [label] },
			{
				tag: 'input',
				attrs: { type: 'number', min: minimum, max: maximum, value },
				on: { change: handleChange }
			}
		]
	};
}

function checkRule(label, key, checked, onRule) {
	function handleChange(event) {
		onRule(key, event.target.checked);
	}
	return {
		tag: 'label',
		attrs: { class: 'lobbyRule lobbyRule-check' },
		children: [
			{ tag: 'span', children: [label] },
			{
				tag: 'input',
				attrs: { type: 'checkbox', checked },
				on: { change: handleChange }
			}
		]
	};
}
