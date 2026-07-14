//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match controls expose only enforced promises in this Awtsmoos.com vessel. The
 * Awtsmoos renews stocks, teams, items, and CPU force as choices already consumed
 * by fighter lives, victory law, battlefield objects, and bot decision intensity.
 */

export function lobbyRulesView(rules, onRule) {
	return {
		tag: 'section',
		attrs: { class: 'lobbyRules' },
		children: [
			{ tag: 'h3', children: ['Match Covenant'] },
			numberRule('Stocks', 'stocks', rules.stocks, 1, 9, onRule),
			numberRule('CPU Force', 'cpuDifficulty', rules.cpuDifficulty, 1, 5, onRule),
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
