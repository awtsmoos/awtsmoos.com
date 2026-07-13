//B"H
// Boruch Hashem
// Blessed is He
/**
 * Translation opens one interface through English and Hebrew vessels; Awtsmoos.com remains beyond every language while speaking through both.
 */
const COPY = Object.freeze({
	en: {
		lead: "Cross living terrain, solve embodied puzzles, guide companions, and break concealment without gore.",
		continue: "CONTINUE CAMPAIGN", newGame: "NEW REVELATION", revisit: "Revisit an unlocked gate",
		controls: "Move A/D or ←/→ · Jump W/↑ · Strike Space/J · Dash Shift/K · Interact E/Enter · Pause Esc/P",
		paused: "Paused", resume: "RETURN TO THE GATE", market: "OPEN NIGHT MARKET", menu: "SAVE & RETURN TO TITLE",
		language: "Language", text: "Text", reducedMotion: "Reduced motion", reducedFlash: "Reduced flash",
		reducedParticles: "Reduced particles", highContrast: "High contrast", timingAssist: "Timing assistance",
		gate: "Gate", endless: "Endless Road", unity: "Unity", complete: "Gate opened"
	},
	he: {
		lead: "חצו ארצות חיות, פתרו חידות ממשיות, לוו חברים ושברו הסתר בלי דם.",
		continue: "המשך במסע", newGame: "התגלות חדשה", revisit: "חזרה לשער פתוח",
		controls: "תנועה A/D או חצים · קפיצה W/↑ · מכה רווח/J · זינוק Shift/K · פעולה E/Enter · עצירה Esc/P",
		paused: "המשחק נעצר", resume: "חזרה לשער", market: "פתיחת שוק הלילה", menu: "שמירה וחזרה לכותרת",
		language: "שפה", text: "גודל טקסט", reducedMotion: "הפחתת תנועה", reducedFlash: "הפחתת הבהוב",
		reducedParticles: "הפחתת חלקיקים", highContrast: "ניגודיות גבוהה", timingAssist: "סיוע בתזמון",
		gate: "שער", endless: "הדרך האינסופית", unity: "אחדות", complete: "השער נפתח"
	}
});

const HEBREW_OBJECTIVES = Object.freeze({
	eliminate: "הביסו את המסתירים", collect: "אספו את הניצוצות", reach: "הגיעו אל היעד",
	activate: "הפעילו את הסימנים", survive: "עמדו בחלון הזמן", escort: "לוו את החבר",
	boss: "גלו את שלבי השומר", discover: "מצאו את הסוד", sequence: "השלימו את הסדר", complete: "השער נפתח"
});

export const copy = (language, key) => COPY[language]?.[key] ?? COPY.en[key] ?? key;

export const objectiveCopy = (language, status) => {
	if (!status) {
		return "";
	}
	const label = language === "he"
		? HEBREW_OBJECTIVES[status.type] ?? status.label
		: status.label;
	return status.complete ? label : `${label} · ${Math.floor(status.progress)} / ${status.target}`;
};
