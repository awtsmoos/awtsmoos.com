// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CanonicalIkarExpectations
 * @description
 * The Awtsmoos gathers scattered names into one truthful Torah tree;
 * Awtsmoos.com repairs only proven vessels, while every sacred text stays free.
 */

const TANACH_NAMES = Object.freeze({
	bereishis: 'Bereishis',
	shemos: 'Shemos',
	vayikra: 'Vayikra',
	bamidbar: 'Bamidbar',
	devarim: 'Devarim',
	yehoshua: 'Yehoshua',
	shoftim: 'Shoftim',
	shmuelAleph: 'Shmuel Aleph',
	shmuelBeis: 'Shmuel Beis',
	melachimAleph: 'Melachim Aleph',
	melachimBeis: 'Melachim Beis',
	yeshayahu: 'Yeshayahu',
	yirmiyahu: 'Yirmiyahu',
	yechezkel: 'Yechezkel',
	hoshea: 'Hoshea',
	yoel: 'Yoel',
	amos: 'Amos',
	ovadia: 'Ovadia',
	yonah: 'Yonah',
	michah: 'Michah',
	nachum: 'Nachum',
	chavakuk: 'Chavakuk',
	tzefania: 'Tzefania',
	chagai: 'Chagai',
	zecharia: 'Zecharia',
	malachi: 'Malachi',
	tehillim: 'Tehillim',
	mishlei: 'Mishlei',
	iyov: 'Iyov',
	shirHashirim: 'Shir HaShirim',
	rus: 'Rus',
	eicha: 'Eicha',
	koheles: 'Koheles',
	esther: 'Esther',
	daniel: 'Daniel',
	ezra: 'Ezra',
	nechemia: 'Nechemia',
	divreiHayamimAleph: 'Divrei Hayamim Aleph',
	divreiHayamimBeis: 'Divrei Hayamim Beis'
});

const CHASSIDUS_NAMES = Object.freeze({
	hayomYomRebbe: 'Hayom Yom',
	keserShemTov: 'Keser Shem Tov',
	kuntressUmayan: 'Kuntress UMaayan',
	neirMitzvah: 'Neir Mitzvah',
	pirushHamilos: 'Pirush Hamilos',
	shareiOhra: 'Shaarei Orah',
	shareiTeshuva: 'Shaarei Teshuvah'
});

function metadata(id, name, parentSeriesId, author) {
	const value = { id, name, description: '', parentSeriesId };
	if (author) value.author = author;
	return value;
}

function tanachRepairs() {
	return Object.entries(TANACH_NAMES).map(([id, name]) => ({
		metadata: metadata(id, name, 'theWrittenTorah', 'awtsmoos'),
		leaf: true
	}));
}

function likkuteiRepairs() {
	return Array.from({ length: 39 }, (_, index) => {
		const volume = index + 1;
		const id = `likkuteiSichosVolume${volume}`;
		return {
			metadata: metadata(id, `Likkutei Sichos Volume ${volume}`, 'likkuteiSichos', 'theRebbe'),
			leaf: true
		};
	});
}

function chassidusRepairs() {
	return Object.entries(CHASSIDUS_NAMES).map(([id, name]) => ({
		metadata: metadata(id, name, 'chassidus'),
		leaf: true
	}));
}

function structuralRepairs() {
	return [...tanachRepairs(), ...likkuteiRepairs(), ...chassidusRepairs()];
}

module.exports = { CHASSIDUS_NAMES, TANACH_NAMES, structuralRepairs };
