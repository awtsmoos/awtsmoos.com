//B"H
// Boruch Hashem
// Blessed is He
/**
 * Prices, blessings, and relics make choice visible without pretending value is absolute.
 * The Awtsmoos beyond all value renews these vessels upon Awtsmoos.com.
 */
export const RUN_UPGRADES = Object.freeze([
	upgrade('sparks', 'Gather Sparks', '+6 holy sparks.', 18),
	upgrade('damage', 'Gevurah Edge', '+22% projectile damage.', 24),
	upgrade('fireRate', 'Swift Flame', '+16% firing speed.', 24),
	upgrade('sideShots', 'Four Camps', 'Adds side projectiles.', 36, 2),
	upgrade('piercing', 'Tablets of Fire', 'Shots pierce another target.', 40, 2),
	upgrade('shield', 'Yesod Shield', '+2 shield capacity.', 26),
	upgrade('magnet', 'Gathering Call', 'Wider Prutah magnet.', 20, 4),
	upgrade('prutahValue', 'Treasury of Malchut', '+20% Prutah value.', 30, 4),
	upgrade('positiveGate', 'Tablets of Measure', 'Improves positive gates.', 34, 3),
	upgrade('healing', 'Tiferet Renewal', 'Heal after each level.', 32, 4)
]);

export const PERMANENT_UPGRADES = Object.freeze([
	upgrade('startingSparks', 'Starting Sparks', '+1 starting spark.', 45, 8),
	upgrade('startingHealth', 'Chariot Strength', '+5 starting health.', 55, 8),
	upgrade('startingShield', 'Ancestral Shield', '+1 starting shield.', 90, 3),
	upgrade('baseFireRate', 'Remembered Flame', '+3% base fire rate.', 70, 6),
	upgrade('baseMagnet', 'Remembered Gathering', '+0.25 magnet radius.', 65, 6),
	upgrade('shopQuality', 'Wisdom of Exchange', 'Better checkpoint choices.', 100, 4),
	upgrade('relicChance', 'Hidden Treasure', 'Greater relic chance.', 120, 4)
]);

export const BLESSINGS = Object.freeze([
	blessing('chesed', 'CHESED', 'Growth, healing, and generous gates.'),
	blessing('gevurah', 'GEVURAH', 'Damage, critical force, and armor breaking.'),
	blessing('tiferet', 'TIFERET', 'Balance, regeneration, and harmony.'),
	blessing('netzach', 'NETZACH', 'Momentum, speed, and collection streaks.'),
	blessing('hod', 'HOD', 'Precision, ricochet, and splitting light.'),
	blessing('yesod', 'YESOD', 'Shielding, connection, and recovery.'),
	blessing('malchut', 'MALCHUT', 'Leadership, formation, and command.'),
	blessing('keter', 'KETER', 'A rare resurrection beyond ordinary measure.', true)
]);

export const RELICS = Object.freeze([
	relic('crown', 'Crown of Keter', 'One resurrection.'),
	relic('shield', 'Shield of Avraham', 'Absorbs three collisions.'),
	relic('staff', 'Staff of Moshe', 'Defeated enemies release split shots.'),
	relic('lamp', 'Lamp of Hidden Light', 'Golden Prutahs appear more often.'),
	relic('wheels', 'Wheels of the Chayot', 'Faster lane changes and dodge guard.'),
	relic('trumpet', 'Trumpet of Redemption', 'Periodically stuns every enemy.'),
	relic('tablets', 'Tablets of Fire', 'Positive arithmetic gates improve.')
]);

function upgrade(id, name, description, basePrice, maximum = 6) {
	return { id, name, description, basePrice, maximum };
}

function blessing(id, name, description, rare = false) {
	return { id, name, description, rare };
}

function relic(id, name, description) {
	return { id, name, description };
}
