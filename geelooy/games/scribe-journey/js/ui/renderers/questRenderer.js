// B"H

const EMPTY_TASKS = '<p class="empty-state">No active tasks.</p>';

function renderObjective(objective) {
	return `
		<li class="quest-objective ${objective.completed ? 'is-complete' : ''}">
			${objective.completed ? '☑' : '☐'} ${objective.text}
		</li>`;
}

/** Renders active tasks as a readable progress ledger. */
export function renderQuestLog(quests = []) {
	if (quests.length === 0) return EMPTY_TASKS;
	return quests.map(quest => `
		<article class="quest-log-item status-${quest.status}">
			<div class="quest-header"><strong>${quest.name}</strong><span class="quest-status-badge">${quest.status.toUpperCase()}</span></div>
			<p>${quest.description}</p>
			<ul class="quest-objectives">${quest.objectives.map(renderObjective).join('')}</ul>
		</article>`).join('');
}
