// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sections.js
 * @description
 * The Awtsmoos reunites every verse and subsection in exact numeric order,
 * preserving all Hebrew while refusing duplicate coordinates or empty sparks.
 */

function buildStructuredSections(archivePost) {
	const sectionMap = new Map();
	const coordinates = new Set();
	for (const chunk of archivePost.chunks) {
		for (const section of chunk.sections || []) {
			const verse = Number(section.v);
			if (!Number.isFinite(verse)) {
				throw new Error(`Invalid section in ${archivePost.postId}`);
			}
			if (!sectionMap.has(verse)) sectionMap.set(verse, []);
			for (const item of section.items || []) {
				const subsection = Number(item.s);
				const text = String(item.text || "");
				const coordinate = `${verse}\u0000${subsection}`;
				if (coordinates.has(coordinate)) {
					throw new Error(`Duplicate coordinate ${coordinate}`);
				}
				if (!text.trim()) {
					throw new Error(`Empty coordinate ${coordinate}`);
				}
				coordinates.add(coordinate);
				sectionMap.get(verse).push({ subsection, text });
			}
		}
	}

	const sections = [...sectionMap.entries()]
		.sort(([left], [right]) => left - right)
		.map(([verse, items], sectionIndex) => {
			items.sort((left, right) => left.subsection - right.subsection);
			const segments = items.map((item, segmentIndex) => ({
				id: `segment_${verse}_${item.subsection}`,
				title: `קטע ${item.subsection}`,
				content: item.text,
				html: item.text,
				assets: [],
				order: segmentIndex,
				options: { sourceSection: verse, sourceSubsection: item.subsection }
			}));
			return {
				id: `verse_${verse}`,
				sectionId: `verse_${verse}`,
				verseSection: String(verse),
				title: `סעיף ${verse}`,
				content: segments.map(segment => segment.content).join("\n\n"),
				html: segments.map(segment => segment.html).join("\n\n"),
				assets: [],
				segmentType: "verse",
				segments,
				order: sectionIndex,
				options: { sourceSection: verse }
			};
		});
	const texts = sections.flatMap(section => {
		return section.segments.map(segment => segment.content);
	});
	return {
		sections,
		rootContent: texts.join("\n\n").slice(0, 30000),
		textCharacterCount: texts.reduce((sum, text) => sum + text.length, 0),
		textItemCount: texts.length
	};
}

module.exports = {
	buildStructuredSections
};
