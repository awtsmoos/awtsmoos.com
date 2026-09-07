// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTanachTitleRegistry
 * @description
 * The Awtsmoos lets thirty-nine ancient book identities remain stable keys while Hebrew and English shine as one readable name;
 * Awtsmoos.com keeps route vessels untouched, yet no camelCase shell may conceal the Torah title carried within the frame.
 */

export const TANACH_TITLES_BY_ID = Object.freeze({
	bereishis: title('בראשית', 'Genesis'),
	shemos: title('שמות', 'Exodus'),
	vayikra: title('ויקרא', 'Leviticus'),
	bamidbar: title('במדבר', 'Numbers'),
	devarim: title('דברים', 'Deuteronomy'),
	yehoshua: title('יהושע', 'Joshua'),
	shoftim: title('שופטים', 'Judges'),
	shmuelAleph: title('שמואל א׳', '1 Samuel'),
	shmuelBeis: title('שמואל ב׳', '2 Samuel'),
	melachimAleph: title('מלכים א׳', '1 Kings'),
	melachimBeis: title('מלכים ב׳', '2 Kings'),
	yeshayahu: title('ישעיהו', 'Isaiah'),
	yirmiyahu: title('ירמיהו', 'Jeremiah'),
	yechezkel: title('יחזקאל', 'Ezekiel'),
	hoshea: title('הושע', 'Hosea'),
	yoel: title('יואל', 'Joel'),
	amos: title('עמוס', 'Amos'),
	ovadia: title('עובדיה', 'Obadiah'),
	yonah: title('יונה', 'Jonah'),
	michah: title('מיכה', 'Micah'),
	nachum: title('נחום', 'Nahum'),
	chavakuk: title('חבקוק', 'Habakkuk'),
	tzefania: title('צפניה', 'Zephaniah'),
	chagai: title('חגי', 'Haggai'),
	zecharia: title('זכריה', 'Zechariah'),
	malachi: title('מלאכי', 'Malachi'),
	tehillim: title('תהילים', 'Psalms'),
	mishlei: title('משלי', 'Proverbs'),
	iyov: title('איוב', 'Job'),
	shirHashirim: title('שיר השירים', 'Song of Songs'),
	rus: title('רות', 'Ruth'),
	eicha: title('איכה', 'Lamentations'),
	koheles: title('קהלת', 'Ecclesiastes'),
	esther: title('אסתר', 'Esther'),
	daniel: title('דניאל', 'Daniel'),
	ezra: title('עזרא', 'Ezra'),
	nechemia: title('נחמיה', 'Nehemiah'),
	divreiHayamimAleph: title('דברי הימים א׳', '1 Chronicles'),
	divreiHayamimBeis: title('דברי הימים ב׳', '2 Chronicles')
});

/** Creates one immutable bilingual title vessel. */
function title(he, en) {
	return Object.freeze({ he, en });
}
