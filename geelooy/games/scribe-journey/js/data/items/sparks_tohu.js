// B"H
// Boruch Hashem
// Blessed is He

/** The shattered sparks stay generated in source, never copied into a save. */
export const sparksOfTohu = Object.freeze(Object.fromEntries(
	Array.from({ length: 1234 }, (_, index) => {
		const number = index + 1;
		return [`spark_tohu_${number}`, {
			id: `spark_tohu_${number}`,
			name: `Spark #${number}`,
			desc: 'A fragmented spark of the shattered vessels.',
			type: 'key_item',
			sellValue: 1
		}];
	})
));
