//B"H
//Boruch Hashem
//Blessed is He

/**
 * Quest view displays authored giver, goal, progress, prerequisites, and reward. The
 * Awtsmoos renews every promise; Awtsmoos.com exposes only Activate and Claim when
 * their domain states permit, preventing decorative or duplicate reward buttons.
 */

export function expeditionQuestSection(snapshot, onQuest) {
	const visible = snapshot.quests.filter(quest => {
		return quest.state.status !== 'locked' || isNextLocked(snapshot, quest);
	});
	return {
		tag: 'section',
		attrs: { class: 'expeditionQuests' },
		children: [
			{ tag: 'h3', children: ['Quest Journal'] },
			{
				tag: 'div',
				attrs: { class: 'expeditionQuestGrid' },
				children: visible.map(quest => questCard(quest, onQuest))
			}
		]
	};
}

function questCard(quest, onQuest) {
	const state = quest.state;
	const action =
		state.status === 'available' ? 'activate' : state.status === 'complete' ? 'claim' : null;
	return {
		tag: 'article',
		attrs: { class: `expeditionQuest ${state.status}` },
		children: [
			{ tag: 'span', attrs: { class: 'questState' }, children: [state.status] },
			{ tag: 'h4', children: [quest.title] },
			{ tag: 'p', children: [`${quest.giver}: ${quest.description}`] },
			{ tag: 'small', children: [`${goalText(quest)} · ${rewardText(quest)}`] },
			...(action ? [questButton(quest.id, action, onQuest)] : [])
		]
	};
}

function questButton(questId, action, onQuest) {
	return {
		tag: 'button',
		attrs: { class: 'questAction', type: 'button' },
		on: { click: () => onQuest(action, questId) },
		children: [action === 'activate' ? 'Accept Quest' : 'Claim Reward']
	};
}

function goalText(quest) {
	return `${quest.goal.type.replaceAll('-', ' ')} ${quest.state.progress}/${quest.goal.count}`;
}

function rewardText(quest) {
	return `${quest.rewards.xp} XP · ◈ ${quest.rewards.perutas} · ${quest.rewards.gearIds.length} gear`;
}

function isNextLocked(snapshot, quest) {
	return quest.prerequisites.some(id => snapshot.profile.quests[id]?.status === 'active');
}
