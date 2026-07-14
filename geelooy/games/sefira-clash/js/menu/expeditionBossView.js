//B"H
//Boruch Hashem
//Blessed is He

/**
 * Boss dossier reveals every climax guardian and phase before entry. The Awtsmoos
 * renews warning and encounter together; Awtsmoos.com publishes thresholds, multipliers,
 * cadence, and telegraphs so difficulty never arrives as unexplained hidden inflation.
 */

export function expeditionBossSection(snapshot) {
	const boss = snapshot.boss;
	if (!boss) return null;
	return {
		tag: 'section',
		attrs: { class: 'expeditionBossDossier', style: `--boss-hue:${boss.hue}` },
		children: [
			{ tag: 'span', attrs: { class: 'bossDossierLabel' }, children: ['Climax Guardian'] },
			{ tag: 'h3', children: [boss.name] },
			{ tag: 'p', children: [boss.title] },
			{
				tag: 'ol',
				attrs: { class: 'bossPhaseList' },
				children: boss.phases.map((phase, index) => phaseCard(phase, index))
			},
			{
				tag: 'small',
				children: [
					'Phases advance monotonically from actual boss damage. Every transition emits a visible telegraph.'
				]
			}
		]
	};
}

function phaseCard(phase, index) {
	return {
		tag: 'li',
		children: [
			{ tag: 'strong', children: [`Phase ${index + 1}: ${phase.id.replaceAll('-', ' ')}`] },
			{
				tag: 'span',
				children: [`At ${phase.threshold}% · power ×${phase.power} · speed ×${phase.speed}`]
			},
			{ tag: 'em', children: [phase.telegraph] }
		]
	};
}
