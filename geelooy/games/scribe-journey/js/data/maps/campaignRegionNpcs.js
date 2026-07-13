// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Named residents who carry the regional campaign through relationship.
 * @description A map becomes a world when another soul remembers the player.
 * As the Awtsmoos recreates speaker, listener, and meeting in one instant,
 * these residents keep each chapter from becoming silent scenery. The roads of
 * Awtsmoos.com likewise point beyond themselves toward living connection.
 */

function resident(id, name, visual, line) {
	return Object.freeze({ id, name, visual, line });
}

function roster(...residents) {
	return Object.freeze(residents);
}

export const campaignRegionNpcs = Object.freeze({
	malkuth: roster(
		resident('master_oren', 'Master Oren', '👴', 'A blank page is not empty when someone is ready to answer it.'),
		resident('tamar', 'Tamar', '🧭', 'Tracks are relationships written briefly upon the earth.'),
		resident('yael_miller', 'Yael the Miller', '🌾', 'Grain remembers the field when hands treat it with care.'),
		resident('eli_child', 'Eli', '🪁', 'The wall stopped being frightening after it remembered my name.')
	),
	yesod: roster(
		resident('warden_liora', 'Warden Liora', '🌙', 'Moonwater keeps what hurried minds abandon.'),
		resident('dream_healer_mara', 'Mara the Dream Healer', '💤', 'A dream returns safely when its sleeper is welcomed home.'),
		resident('lantern_keeper', 'The Lantern Keeper', '🏮', 'One light knows the road because another light answers it.'),
		resident('neria', 'Neria', '⚔', 'A shortcut is useful only when no one is left behind.')
	),
	hod: roster(
		resident('hod_registrar', 'The Hod Registrar', '📋', 'A record must serve a life, never replace it.'),
		resident('archivist_paz', 'Archivist Paz', '📚', 'Every escaped page is searching for its true neighbor.'),
		resident('letterwright_avi', 'Avi the Letterwright', '✒', 'Durable ink begins with a purpose worth preserving.'),
		resident('scholar_rivka', 'Scholar Rivka', '🔎', 'A definition should open attention rather than close it.')
	),
	netzach: roster(
		resident('tamar', 'Tamar', '🧭', 'The wild is not unclaimed; it is already full of promises.'),
		resident('captain_rimon', 'Captain Rimon', '🛡', 'We defend the camp by learning what the forest defends.'),
		resident('ragged_cantor', 'The Ragged Cantor', '🎶', 'Roots keep melodies that mouths have forgotten.'),
		resident('beekeeper_dalia', 'Dalia the Beekeeper', '🐝', 'A harvest survives only when the pollinators return.')
	),
	tiferet: roster(
		resident('neria', 'Neria', '⚔', 'Balance is harder than victory because it must keep listening.'),
		resident('bridgekeeper_shai', 'Bridgekeeper Shai', '🌉', 'The bridge holds when both valleys are permitted to arrive.'),
		resident('tamar', 'Tamar', '🧭', 'A reflection becomes honest when it can move differently.'),
		resident('festival_keeper', 'The Festival Keeper', '🎻', 'Two songs can share a stage without surrendering their names.')
	),
	gevurah: roster(
		resident('commander_adir', 'Commander Adir', '🛡', 'Strength is measured by what it refuses to crush.'),
		resident('dayan_malka', 'Dayan Malka', '⚖', 'Judgment begins only after every witness has been heard.'),
		resident('quartermaster_noa', 'Quartermaster Noa', '📦', 'A fortress protects nothing when its supplies never arrive.'),
		resident('neria', 'Neria', '⚔', 'Borrowed certainty burns longer than borrowed fire.')
	),
	chesed: roster(
		resident('hostess_miriam', 'Hostess Miriam', '🍲', 'A gift becomes generous when the receiver remains visible.'),
		resident('healer_avital', 'Healer Avital', '🩹', 'Rescue first; celebration can wait on dry ground.'),
		resident('steward_elazar', 'Steward Elazar', '🧺', 'Abundance needs honest boundaries to reach every table.'),
		resident('door_warden', 'The Door Warden', '🚪', 'The central room opens only after kindness leaves this house.')
	),
	binah: roster(
		resident('tamar', 'Tamar', '🧭', 'A route learned through care cannot be stolen by forgetting.'),
		resident('loomwright_devorah', 'Loomwright Devorah', '🧵', 'A vessel holds because each thread accepts its place.'),
		resident('garden_mother', 'The Garden Mother', '🌱', 'Form arrives slowly when every water is allowed to teach.'),
		resident('question_keeper', 'The Question Keeper', '❓', 'A patient question is already part of its answer.')
	),
	chokhmah: roster(
		resident('lightning_abbot', 'The Lightning Abbot', '⚡', 'Insight must find a vessel before brilliance becomes damage.'),
		resident('tamar', 'Tamar', '🧭', 'Prediction is attention practiced before the moment arrives.'),
		resident('vessel_keeper', 'The Vessel Keeper', '🏺', 'A repaired cup can carry a revelation farther than a storm.'),
		resident('thunder_archivist', 'The Thunder Archivist', '📜', 'Read quickly, then remember slowly.')
	),
	keter: roster(
		resident('master_oren', 'Master Oren', '👴', 'Intention crowns every deed without standing above it.'),
		resident('tamar', 'Tamar', '🧭', 'A community returns when its relationships are restored.'),
		resident('crownless_steward', 'The Crownless Steward', '🏛', 'Streets need purpose more than monuments need praise.'),
		resident('neria', 'Neria', '⚔', 'I can choose brilliance without abandoning responsibility.')
	),
	postgame: roster(
		resident('ragged_cantor', 'The Ragged Cantor', '🎶', 'The whole song begins where listening refuses to end.'),
		resident('tamar', 'Tamar', '🧭', 'Before names, distinction was already a form of care.'),
		resident('master_oren', 'Master Oren', '👴', 'An ending is a margin wide enough for another deed.'),
		resident('first_song', 'The First Song', '🎼', 'I choose a home that can keep changing with me.')
	)
});
