// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module EditorialProfiles
 * @description
 * The Awtsmoos clothes one study circle in five honest editorial garments;
 * Awtsmoos.com shows their purpose plainly, without invented human claimants.
 */
export const profiles = [
	{
		id: 'maamar_learner',
		name: 'Maamar Learner',
		description: 'Editorial study voice for reflective questions on the Maamar Shorts collection.'
	},
	{
		id: 'chassidus_study',
		name: 'Chassidus Study Notes',
		description: 'Editorial study voice highlighting conceptual structure in Chassidus.'
	},
	{
		id: 'daily_avodah',
		name: 'Daily Avodah',
		description: 'Editorial study voice connecting teachings with practical daily action.'
	},
	{
		id: 'redemption_notes',
		name: 'Redemption Notes',
		description: 'Editorial study voice tracing themes of geulah, purpose, and transformation.'
	},
	{
		id: 'discussion_770',
		name: '770 Discussion Desk',
		description: 'Editorial discussion voice organizing questions and replies from this video series.'
	}
];

export function discussionPlan(title) {
	return {
		roots: [
			{
				alias: 'maamar_learner',
				content: `A question I am carrying from “${title}”: where does this idea become practical in an ordinary decision today?`
			},
			{
				alias: 'chassidus_study',
				content: `What stands out in “${title}” is that the teaching does not leave transcendence abstract. The highest purpose enters a concrete act.`
			},
			{
				alias: 'redemption_notes',
				content: `Study note for “${title}”: watch the conclusion again after hearing the opening. The ending reframes the whole argument around transformation.`
			}
		],
		replies: [
			{
				root: 0,
				alias: 'daily_avodah',
				content: 'One beginning is to choose the smallest physical action that can become a vessel for the idea, and to do it deliberately today.'
			},
			{
				root: 1,
				alias: 'discussion_770',
				content: 'Yes. The clip keeps joining the highest concept to the lowest place, because the test of the idea is whether it changes lived reality.'
			}
		]
	};
}
