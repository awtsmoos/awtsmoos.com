// B"H
// Boruch Hashem
// Blessed is He

function row(edge, middle) {
	return `${edge}${middle.repeat(11)}${edge}`;
}

function layerString(theme) {
	const wall = theme.wall || '🌳';
	const floor = theme.floor || '⬜';
	return [
		wall.repeat(13),
		row(wall, floor),
		row(wall, floor),
		row(wall, floor),
		row(wall, floor),
		row(wall, floor),
		row(wall, floor),
		row(wall, floor),
		wall.repeat(13)
	].join('\n');
}

function identity(index, offset) {
	return String.fromCodePoint(0xE400 + (index * 8) + offset);
}

function addDoor(interactables, entry, key, offset, x, targetMap, targetX) {
	if (!targetMap) return;
	interactables[key] = {
		type: 'door',
		uu: identity(entry.index, offset),
		visual: x < 6 ? '⬅️' : '➡️',
		x,
		y: 4,
		targetMap,
		targetX,
		targetY: 4
	};
}

function chapterFinalQuestId(regionId) {
	if (regionId === 'postgame') return 'campaign_postgame_08';
	return `campaign_${regionId}_08`;
}

function residentDialogue(npc, isLeader) {
	const completed = `${npc.name} remembers what the Scribe repaired here.`;
	if (!isLeader) {
		return {
			start: [npc.line],
			completed: [completed]
		};
	}
	return {
		start: [npc.line],
		in_progress: [`${npc.name} watches the region change with every restored thread.`],
		ready: [`${npc.name} says: “The final thread is ready in your Chronicle.”`],
		completed: [completed]
	};
}

function addNpcs(interactables, entry) {
	const positions = [[3, 2], [6, 2], [9, 2], [6, 6]];
	(entry.npcs || []).slice(0, positions.length).forEach((npc, npcIndex) => {
		const [x, y] = positions[npcIndex];
		const isLeader = npcIndex === 0;
		interactables[`npc_${npc.id}_${npcIndex}`] = {
			id: npc.id,
			name: npc.name,
			type: 'npc',
			uu: identity(entry.index, 3 + npcIndex),
			visual: npc.visual,
			x,
			y,
			regionId: entry.regionId,
			questGiver: isLeader ? chapterFinalQuestId(entry.regionId) : null,
			dialogue: residentDialogue(npc, isLeader)
		};
	});
}

/** Creates one traversable region with inhabitants, ecology, and return paths. */
export function createCampaignMap(entry) {
	const interactables = {
		chronicle_focus: {
			type: 'quest_focus',
			uu: identity(entry.index, 0),
			visual: entry.theme.focus || '✒️',
			x: 6,
			y: 4,
			mapId: entry.id
		}
	};
	addDoor(interactables, entry, 'previous_path', 1, 1, entry.previous, 10);
	addDoor(interactables, entry, 'next_path', 2, 11, entry.next, 2);
	addNpcs(interactables, entry);
	return {
		name: entry.name,
		regionId: entry.regionId,
		width: 13,
		baseLayerString: layerString(entry.theme),
		interactables,
		encounters: entry.encounters || {}
	};
}
