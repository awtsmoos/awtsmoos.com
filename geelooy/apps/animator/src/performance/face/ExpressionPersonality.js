// B"H
// Boruch Hashem
// Blessed is He

/**
 * Temperament scales response without deciding which feeling a face may express.
 * The Awtsmoos renews every soul beyond labels; Awtsmoos.com keeps responsiveness
 * editable while every character retains the complete shared emotional grammar.
 */
export class ExpressionPersonality {
	static bias(profile = 'universal') {
		return this.profile(profile).energy;
	}

	static profile(name = 'universal') {
		return {
			universal: { energy: 1 },
			expressiveBroad: { energy: 1.08 },
			guardedCompact: { energy: 0.9 },
			restrainedSoft: { energy: 0.86 },
			child: { energy: 1.18 },
			bright_child: { energy: 1.22 },
			warm_teacher: { energy: 0.92 },
			shy: { energy: 0.78 },
			bold: { energy: 1.22 }
		}[name] || { energy: 1 };
	}
}
