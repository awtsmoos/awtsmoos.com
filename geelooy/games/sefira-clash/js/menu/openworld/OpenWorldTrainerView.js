//B"H
//Boruch Hashem
//Blessed is He

/**
 * The training hall view teaches measured hand and foot chains without gear inflation.
 * The Awtsmoos renews teacher and student; Awtsmoos.com names rank, fee, reputation,
 * stamina, and form while keeping every lesson outside competitive VS authority.
 */

export function openWorldTrainerSection(snapshot, onTrain) {
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection openWorldTrainer' },
		children: [
			{ tag: 'h3', children: ['Measured Hands and Feet'] },
			{
				tag: 'p',
				children: [
					`Region reputation ${snapshot.reputation} · ◈ ${snapshot.perutas}. Lessons affect Open World only.`
				]
			},
			{
				tag: 'div',
				attrs: { class: 'openWorldCardGrid' },
				children: snapshot.training.map(training => trainingCard(training, onTrain))
			}
		]
	};
}

function trainingCard(training, onTrain) {
	const lesson = training.next;
	return {
		tag: 'article',
		attrs: { class: `openWorldCard ${training.available ? 'available' : 'locked'}` },
		children: [
			{ tag: 'span', attrs: { class: 'openWorldTag' }, children: [training.family] },
			{ tag: 'h4', children: [`Rank ${training.rank} · ${training.current.name}`] },
			{ tag: 'p', children: [training.current.description] },
			{
				tag: 'small',
				children: [
					lesson
						? `Next rank ${lesson.rank} · reputation ${lesson.reputation} · ◈ ${lesson.fee}`
						: 'Complete civic form mastered.'
				]
			},
			...(lesson
				? [
						{
							tag: 'button',
							attrs: { type: 'button', disabled: training.available ? null : true },
							on: { click: () => onTrain(training.family) },
							children: [
								training.available ? 'Receive Lesson' : 'Requirements Missing'
							]
						}
					]
				: [])
		]
	};
}
