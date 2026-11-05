// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDefinitionRecords.js
 * @description Generated canonical combat truth. Source SHA-256: 6f0028fe1453816df98201f9f0ed5e2c7f2a844fb134d1eae9aab0d653645f26.
 * The Awtsmoos renews one source through both vessels; Awtsmoos.com keeps parity whole.
 */

export const COMBAT_SCHEMA = deepFreeze({
	"BH": "B\"H",
	"boruchHashem": "Boruch Hashem",
	"blessedIsHe": "Blessed is He",
	"poem": "The Awtsmoos renews one schema in every vessel and clime; Awtsmoos.com keeps every saved identity stable through time.",
	"schemaVersion": 1,
	"minimumSaveVersion": 1,
	"actionIdentityVersion": 1,
	"statusIdentityVersion": 1
});

export const COMBAT_AFFINITIES = deepFreeze({
	"chochmah": {
		"id": "chochmah",
		"hebrewName": "חכמה",
		"englishName": "Wisdom",
		"elementId": "light-air",
		"icon": "spark-wind",
		"shape": "diamond-rays",
		"mechanics": {
			"projectileSpeedPerPoint": 0.015,
			"revealDurationPerPointMs": 120,
			"airborneCriticalThreshold": 6
		}
	},
	"binah": {
		"id": "binah",
		"hebrewName": "בינה",
		"englishName": "Understanding",
		"elementId": "fire",
		"icon": "letter-flame",
		"shape": "triangle-flame",
		"mechanics": {
			"burnDurationPerPointMs": 140,
			"chargedAreaPerPoint": 0.018,
			"burnStackThreshold": 5
		}
	},
	"zeir-anpin": {
		"id": "zeir-anpin",
		"hebrewName": "זעיר אנפין",
		"englishName": "Harmonized Flow",
		"elementId": "water",
		"icon": "sixfold-water",
		"shape": "six-wave-circle",
		"mechanics": {
			"flowRecoveryPerPoint": 0.012,
			"soakDurationPerPointMs": 110,
			"chainHealingThreshold": 6
		}
	},
	"malchus": {
		"id": "malchus",
		"hebrewName": "מלכות",
		"englishName": "Sovereignty",
		"elementId": "earth-dust",
		"icon": "crowned-earth",
		"shape": "square-crown",
		"mechanics": {
			"poisePerPoint": 2,
			"guardDamagePerPoint": 0.02,
			"groundedDurationPerPointMs": 130
		}
	}
});

export const COMBAT_ELEMENTS = deepFreeze({
	"light-air": {
		"id": "light-air",
		"hebrewName": "אור ורוח",
		"englishName": "Light and Air",
		"icon": "spark-wind",
		"shape": "diamond-rays",
		"motion": "rising-spiral",
		"statusId": "illuminated"
	},
	"fire": {
		"id": "fire",
		"hebrewName": "אש",
		"englishName": "Fire",
		"icon": "letter-flame",
		"shape": "triangle-flame",
		"motion": "flicker-rise",
		"statusId": "burning"
	},
	"water": {
		"id": "water",
		"hebrewName": "מים",
		"englishName": "Water",
		"icon": "sixfold-water",
		"shape": "six-wave-circle",
		"motion": "flowing-orbit",
		"statusId": "soaked"
	},
	"earth-dust": {
		"id": "earth-dust",
		"hebrewName": "עפר",
		"englishName": "Earth and Dust",
		"icon": "crowned-earth",
		"shape": "square-crown",
		"motion": "grounded-pulse",
		"statusId": "grounded"
	},
	"physical": {
		"id": "physical",
		"hebrewName": "גשמי",
		"englishName": "Physical",
		"icon": "measured-strike",
		"shape": "crossed-lines",
		"motion": "impact-ring",
		"statusId": null
	},
	"spiritual-neutral": {
		"id": "spiritual-neutral",
		"hebrewName": "רוחני",
		"englishName": "Spiritual",
		"icon": "clear-letter",
		"shape": "open-circle",
		"motion": "steady-glow",
		"statusId": null
	}
});

export const COMBAT_STATUSES = deepFreeze({
	"illuminated": {
		"id": "illuminated",
		"hebrewName": "מואר",
		"englishName": "Illuminated",
		"durationMs": 7000,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "concealment",
		"modifiers": {
			"revealsHidden": true,
			"evasionMultiplier": 0.75
		}
	},
	"unbalanced": {
		"id": "unbalanced",
		"hebrewName": "בלתי מאוזן",
		"englishName": "Airborne or Unbalanced",
		"durationMs": 2400,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "physical",
		"modifiers": {
			"airborne": true,
			"groundingReceivedMultiplier": 1.3
		}
	},
	"burning": {
		"id": "burning",
		"hebrewName": "בוער",
		"englishName": "Burning",
		"durationMs": 6500,
		"tickMs": 1000,
		"maximumStacks": 4,
		"dispelCategory": "fire",
		"modifiers": {
			"damagePerTick": 4,
			"regenerationMultiplier": 0.7
		}
	},
	"soaked": {
		"id": "soaked",
		"hebrewName": "רטוב",
		"englishName": "Soaked",
		"durationMs": 6000,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "water",
		"modifiers": {
			"fireReceivedMultiplier": 0.72,
			"earthReceivedMultiplier": 1.2
		}
	},
	"flowing": {
		"id": "flowing",
		"hebrewName": "זורם",
		"englishName": "Flowing",
		"durationMs": 8000,
		"tickMs": 0,
		"maximumStacks": 3,
		"dispelCategory": "blessing",
		"modifiers": {
			"recoveryMultiplierPerStack": 0.05,
			"movementCasting": true
		}
	},
	"grounded": {
		"id": "grounded",
		"hebrewName": "מקורקע",
		"englishName": "Grounded",
		"durationMs": 5000,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "earth",
		"modifiers": {
			"airborne": false,
			"interruptResistanceMultiplier": 0.82,
			"teleportSuppressed": true
		}
	},
	"rooted": {
		"id": "rooted",
		"hebrewName": "מושרש",
		"englishName": "Rooted",
		"durationMs": 2600,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "earth",
		"modifiers": {
			"movementMultiplier": 0,
			"rooted": true
		}
	},
	"dust-bound": {
		"id": "dust-bound",
		"hebrewName": "קשור בעפר",
		"englishName": "Dust Bound",
		"durationMs": 3200,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "earth",
		"modifiers": {
			"movementMultiplier": 0.58,
			"rooted": true
		}
	},
	"dust-obscured": {
		"id": "dust-obscured",
		"hebrewName": "מעורפל בעפר",
		"englishName": "Dust-obscured",
		"durationMs": 4200,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "concealment",
		"modifiers": {
			"precisionMultiplier": 0.72,
			"targetingClarity": 0.65
		}
	},
	"exposed": {
		"id": "exposed",
		"hebrewName": "חשוף",
		"englishName": "Exposed",
		"durationMs": 3600,
		"tickMs": 0,
		"maximumStacks": 2,
		"dispelCategory": "physical",
		"modifiers": {
			"staggerReceivedMultiplier": 1.25,
			"weakPointVisible": true
		}
	},
	"disrupted": {
		"id": "disrupted",
		"hebrewName": "מופרע",
		"englishName": "Silenced or Disrupted",
		"durationMs": 1800,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "ritual",
		"modifiers": {
			"castCategoriesSuppressed": [
				"ritual",
				"projectile"
			],
			"diminishingReturns": true
		}
	},
	"guard-broken": {
		"id": "guard-broken",
		"hebrewName": "מגן שבור",
		"englishName": "Guard Broken",
		"durationMs": 1400,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "physical",
		"modifiers": {
			"guardDisabled": true,
			"staggered": true
		}
	},
	"clarified": {
		"id": "clarified",
		"hebrewName": "מבואר",
		"englishName": "Clarified",
		"durationMs": 5500,
		"tickMs": 0,
		"maximumStacks": 1,
		"dispelCategory": "blessing",
		"modifiers": {
			"interruptAccuracy": 0.16,
			"insightTierBonus": 1
		}
	}
});

export const COMBAT_STATUS_LIMIT = deepFreeze(24);

export const PLAYER_CAST_DEFINITIONS = deepFreeze({
	"letter-light": {
		"id": "letter-light",
		"clientAbilityIds": [
			"light-against-concealment"
		],
		"hebrewName": "אור האות",
		"englishName": "Letter Light",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"kind": "cast",
		"castType": "projectile",
		"targetType": "selected-enemy",
		"tags": [
			"ranged",
			"reveal",
			"precision"
		],
		"applyStatusIds": [
			"illuminated"
		],
		"interruptForce": 8,
		"danger": "measured",
		"counterGuidance": "Sidestep the ray or answer with grounding."
	},
	"guarded-thought": {
		"id": "guarded-thought",
		"clientAbilityIds": [
			"guarded-thought"
		],
		"hebrewName": "מחשבה שמורה",
		"englishName": "Guarded Thought",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"kind": "cast",
		"castType": "reactive",
		"targetType": "selected-enemy",
		"tags": [
			"interrupt",
			"clarity",
			"counter-cast"
		],
		"applyStatusIds": [
			"disrupted"
		],
		"interruptForce": 28,
		"danger": "counter",
		"counterGuidance": "Use during a visible hostile wind-up."
	},
	"hebrew-fire": {
		"id": "hebrew-fire",
		"clientAbilityIds": [
			"joy-breaks-barriers"
		],
		"hebrewName": "אש האותיות",
		"englishName": "Fire of Letters",
		"affinityId": "binah",
		"elementId": "fire",
		"kind": "cast",
		"castType": "charged-area",
		"targetType": "ground-point",
		"tags": [
			"area",
			"charged",
			"armor-soften"
		],
		"applyStatusIds": [
			"burning",
			"exposed"
		],
		"interruptForce": 14,
		"danger": "high",
		"counterGuidance": "Interrupt the charge or leave the marked area."
	},
	"burning-letters": {
		"id": "burning-letters",
		"clientAbilityIds": [],
		"hebrewName": "אותיות בוערות",
		"englishName": "Burning Letters",
		"affinityId": "binah",
		"elementId": "fire",
		"kind": "cast",
		"castType": "channel",
		"targetType": "cone",
		"tags": [
			"channel",
			"multi-hit",
			"detonation"
		],
		"applyStatusIds": [
			"burning"
		],
		"interruptForce": 10,
		"danger": "high",
		"counterGuidance": "Break concentration or move behind the cone."
	},
	"staff-cast": {
		"id": "staff-cast",
		"clientAbilityIds": [
			"voice-of-unity"
		],
		"hebrewName": "קול האחדות",
		"englishName": "Voice of Unity",
		"affinityId": "zeir-anpin",
		"elementId": "water",
		"kind": "cast",
		"castType": "channel",
		"targetType": "chain",
		"tags": [
			"chain",
			"flow",
			"slow"
		],
		"applyStatusIds": [
			"soaked"
		],
		"removeStatusIds": [
			"burning"
		],
		"interruptForce": 9,
		"danger": "measured",
		"counterGuidance": "Separate linked targets or interrupt the channel."
	},
	"waters-of-purification": {
		"id": "waters-of-purification",
		"clientAbilityIds": [
			"waters-of-purification"
		],
		"hebrewName": "מי טהרה",
		"englishName": "Waters of Purification",
		"affinityId": "zeir-anpin",
		"elementId": "water",
		"kind": "cast",
		"castType": "support",
		"targetType": "selected-ally",
		"tags": [
			"cleanse",
			"healing",
			"flow"
		],
		"applyStatusIds": [
			"flowing"
		],
		"removeStatusIds": [
			"burning",
			"dust-obscured",
			"disrupted"
		],
		"interruptForce": 0,
		"danger": "support",
		"counterGuidance": "Pressure the caster before the cleanse completes."
	},
	"dust-seal": {
		"id": "dust-seal",
		"clientAbilityIds": [
			"stillness-of-shabbos",
			"shield-of-trust"
		],
		"hebrewName": "חותם העפר",
		"englishName": "Seal of Dust",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"kind": "cast",
		"castType": "ground-area",
		"targetType": "ground-point",
		"tags": [
			"guard",
			"control",
			"terrain"
		],
		"applyStatusIds": [
			"grounded",
			"dust-obscured"
		],
		"interruptForce": 18,
		"danger": "control",
		"counterGuidance": "Leave the square seal before it closes."
	},
	"merciful-restraint": {
		"id": "merciful-restraint",
		"clientAbilityIds": [
			"merciful-restraint"
		],
		"hebrewName": "גבורה ברחמים",
		"englishName": "Merciful Restraint",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"kind": "cast",
		"castType": "instant-control",
		"targetType": "selected-enemy",
		"tags": [
			"root",
			"break-on-damage"
		],
		"applyStatusIds": [
			"rooted",
			"grounded"
		],
		"interruptForce": 22,
		"danger": "control",
		"counterGuidance": "A protected ally can break the restraint with measured damage."
	},
	"returning-spark": {
		"id": "returning-spark",
		"clientAbilityIds": [
			"grateful-awakening"
		],
		"hebrewName": "ניצוץ חוזר",
		"englishName": "Returning Spark",
		"affinityId": "zeir-anpin",
		"elementId": "water",
		"kind": "cast",
		"castType": "instant-support",
		"targetType": "self",
		"tags": [
			"healing",
			"renewal",
			"flow"
		],
		"applyStatusIds": [
			"flowing"
		],
		"interruptForce": 0,
		"danger": "support",
		"counterGuidance": "No hostile counter is required."
	}
});

export const PLAYER_MELEE_DEFINITIONS = deepFreeze({
	"chalaf-harvest": {
		"id": "chalaf-harvest",
		"clientActionIds": [],
		"hebrewName": "קציר מדוד",
		"englishName": "Measured Harvest",
		"affinityId": "malchus",
		"elementId": "physical",
		"kind": "melee",
		"tags": [
			"tool",
			"harvest"
		],
		"guardDamage": 6,
		"stagger": 5,
		"interruptForce": 4,
		"danger": "low"
	},
	"staff-light": {
		"id": "staff-light",
		"clientActionIds": [
			"staff.light-one"
		],
		"hebrewName": "מכת מטה",
		"englishName": "Staff Strike",
		"affinityId": "zeir-anpin",
		"elementId": "physical",
		"kind": "melee",
		"tags": [
			"flow",
			"combo-start"
		],
		"guardDamage": 9,
		"stagger": 12,
		"interruptForce": 10,
		"danger": "measured"
	},
	"staff-follow": {
		"id": "staff-follow",
		"clientActionIds": [
			"staff.light-two"
		],
		"hebrewName": "השבת המטה",
		"englishName": "Returning Staff Strike",
		"affinityId": "zeir-anpin",
		"elementId": "physical",
		"kind": "melee",
		"tags": [
			"flow",
			"combo-follow"
		],
		"guardDamage": 11,
		"stagger": 14,
		"interruptForce": 12,
		"danger": "measured"
	},
	"staff-heavy": {
		"id": "staff-heavy",
		"clientActionIds": [
			"staff.heavy-sweep"
		],
		"hebrewName": "סחיפת המטה",
		"englishName": "Heavy Staff Sweep",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"kind": "melee",
		"tags": [
			"area",
			"heavy",
			"grounding"
		],
		"applyStatusIds": [
			"unbalanced"
		],
		"guardDamage": 28,
		"stagger": 32,
		"interruptForce": 30,
		"danger": "high"
	},
	"staff-shove": {
		"id": "staff-shove",
		"clientActionIds": [
			"staff.shove"
		],
		"hebrewName": "שבירת שמירה",
		"englishName": "Staff Guard Break",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"kind": "melee",
		"tags": [
			"guard-break",
			"counter"
		],
		"applyStatusIds": [
			"exposed"
		],
		"guardDamage": 44,
		"stagger": 42,
		"interruptForce": 38,
		"danger": "counter"
	},
	"sword-light": {
		"id": "sword-light",
		"clientActionIds": [
			"sword.light-one"
		],
		"hebrewName": "חיתוך אור",
		"englishName": "Sword Slash",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"kind": "melee",
		"tags": [
			"swift",
			"combo-start",
			"precision"
		],
		"guardDamage": 8,
		"stagger": 10,
		"interruptForce": 11,
		"danger": "measured"
	},
	"sword-follow": {
		"id": "sword-follow",
		"clientActionIds": [
			"sword.light-two"
		],
		"hebrewName": "חיתוך חוזר",
		"englishName": "Reverse Sword Slash",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"kind": "melee",
		"tags": [
			"swift",
			"combo-follow",
			"precision"
		],
		"guardDamage": 9,
		"stagger": 11,
		"interruptForce": 12,
		"danger": "measured"
	},
	"sword-finish": {
		"id": "sword-finish",
		"clientActionIds": [
			"sword.finisher"
		],
		"hebrewName": "חתימת אור",
		"englishName": "Finishing Slash",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"kind": "melee",
		"tags": [
			"swift",
			"finisher",
			"precision"
		],
		"applyStatusIds": [
			"exposed"
		],
		"guardDamage": 18,
		"stagger": 22,
		"interruptForce": 24,
		"danger": "high"
	},
	"sword-heavy": {
		"id": "sword-heavy",
		"clientActionIds": [
			"sword.heavy"
		],
		"hebrewName": "בקיעת אור",
		"englishName": "Heavy Sword Cleave",
		"affinityId": "binah",
		"elementId": "fire",
		"kind": "melee",
		"tags": [
			"heavy",
			"charged",
			"armor-soften"
		],
		"applyStatusIds": [
			"burning",
			"exposed"
		],
		"guardDamage": 30,
		"stagger": 35,
		"interruptForce": 32,
		"danger": "high"
	}
});

export const ENEMY_ACTION_DEFINITIONS = deepFreeze({
	"beast-bite": {
		"id": "beast-bite",
		"hebrewName": "נשיכת חיה",
		"englishName": "Beast Bite",
		"affinityId": "malchus",
		"elementId": "physical",
		"tags": [
			"melee"
		],
		"applyStatusIds": [
			"unbalanced"
		],
		"interruptResistance": 10,
		"danger": "measured",
		"counterGuidance": "Block toward the creature or step outside its short reach."
	},
	"guardian-slam": {
		"id": "guardian-slam",
		"hebrewName": "מכת השומר",
		"englishName": "Guardian Slam",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"tags": [
			"melee",
			"guard-damage",
			"area"
		],
		"applyStatusIds": [
			"grounded",
			"dust-obscured"
		],
		"interruptResistance": 34,
		"danger": "high",
		"counterGuidance": "Dodge the square impact or interrupt before the final descent."
	},
	"letter-bolt": {
		"id": "letter-bolt",
		"hebrewName": "חץ אות",
		"englishName": "Letter Bolt",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"tags": [
			"ranged",
			"projectile",
			"precision"
		],
		"applyStatusIds": [
			"illuminated",
			"disrupted"
		],
		"interruptResistance": 18,
		"danger": "measured",
		"counterGuidance": "Sidestep the ray or use a grounded defense."
	},
	"letter-wave": {
		"id": "letter-wave",
		"hebrewName": "גל אותיות",
		"englishName": "Letter Wave",
		"affinityId": "zeir-anpin",
		"elementId": "water",
		"tags": [
			"area",
			"wave",
			"slow"
		],
		"applyStatusIds": [
			"soaked",
			"unbalanced"
		],
		"removeStatusIds": [
			"burning"
		],
		"interruptResistance": 26,
		"danger": "high",
		"counterGuidance": "Move through the safe gap or break the channel."
	},
	"reposition-step": {
		"id": "reposition-step",
		"hebrewName": "צעד מדוד",
		"englishName": "Measured Reposition",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"tags": [
			"dodge",
			"movement"
		],
		"applyStatusIds": [],
		"interruptResistance": 0,
		"danger": "movement",
		"counterGuidance": "Track the new angle instead of striking the old position."
	},
	"ritual-heal": {
		"id": "ritual-heal",
		"hebrewName": "רפואת טקס",
		"englishName": "Ritual Healing",
		"affinityId": "zeir-anpin",
		"elementId": "water",
		"tags": [
			"heal",
			"channel",
			"cleanse"
		],
		"applyStatusIds": [
			"flowing"
		],
		"removeStatusIds": [
			"burning",
			"disrupted"
		],
		"interruptResistance": 20,
		"danger": "support",
		"counterGuidance": "Interrupt before the water ring closes."
	},
	"shadow-strike": {
		"id": "shadow-strike",
		"hebrewName": "מכת צל",
		"englishName": "Shadow Strike",
		"affinityId": "binah",
		"elementId": "fire",
		"tags": [
			"melee",
			"burn",
			"armor-soften"
		],
		"applyStatusIds": [
			"burning",
			"exposed"
		],
		"interruptResistance": 16,
		"danger": "measured",
		"counterGuidance": "Parry the bright letter-flash before impact."
	},
	"stone-guard": {
		"id": "stone-guard",
		"hebrewName": "שמירת אבן",
		"englishName": "Stone Guard",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"tags": [
			"guard",
			"projectile-block"
		],
		"applyStatusIds": [
			"grounded"
		],
		"interruptResistance": 42,
		"danger": "defense",
		"counterGuidance": "Use guard damage or wait for the stone shell to recede."
	},
	"summon-shades": {
		"id": "summon-shades",
		"hebrewName": "זימון צללים",
		"englishName": "Summon Shades",
		"affinityId": "binah",
		"elementId": "fire",
		"tags": [
			"summon",
			"channel"
		],
		"applyStatusIds": [
			"dust-obscured"
		],
		"interruptResistance": 30,
		"danger": "critical",
		"counterGuidance": "Interrupt before the final burning letter appears."
	},
	"summit-enrage": {
		"id": "summit-enrage",
		"hebrewName": "בערת הפסגה",
		"englishName": "Summit Enrage",
		"affinityId": "binah",
		"elementId": "fire",
		"tags": [
			"enrage",
			"phase",
			"channel"
		],
		"applyStatusIds": [
			"burning"
		],
		"interruptResistance": 50,
		"danger": "critical",
		"counterGuidance": "Prepare water and interruption before the phase completes."
	},
	"warden-cleave": {
		"id": "warden-cleave",
		"hebrewName": "בקיעת השומר",
		"englishName": "Warden Cleave",
		"affinityId": "malchus",
		"elementId": "earth-dust",
		"tags": [
			"boss",
			"melee",
			"area"
		],
		"applyStatusIds": [
			"grounded",
			"exposed"
		],
		"interruptResistance": 48,
		"danger": "critical",
		"counterGuidance": "Leave the crowned square or commit a coordinated interrupt."
	},
	"warden-retreat": {
		"id": "warden-retreat",
		"hebrewName": "נסיגת השומר",
		"englishName": "Warden Retreat",
		"affinityId": "chochmah",
		"elementId": "light-air",
		"tags": [
			"boss",
			"retreat",
			"movement"
		],
		"applyStatusIds": [],
		"interruptResistance": 0,
		"danger": "movement",
		"counterGuidance": "Do not chase into the next telegraph; regain formation."
	}
});

export const ENEMY_AFFINITY_PROFILES = deepFreeze({
	"fox": {
		"affinityId": "chochmah",
		"resistances": {
			"light-air": 0.08,
			"fire": 0,
			"water": 0.05,
			"earth-dust": -0.08
		},
		"interruptResistance": 8,
		"poise": 8,
		"actionIds": [
			"beast-bite",
			"reposition-step"
		]
	},
	"wolf": {
		"affinityId": "zeir-anpin",
		"resistances": {
			"light-air": 0,
			"fire": -0.08,
			"water": 0.08,
			"earth-dust": 0.03
		},
		"interruptResistance": 12,
		"poise": 14,
		"actionIds": [
			"beast-bite",
			"warden-retreat"
		]
	},
	"dybbuk-shade": {
		"affinityId": "chochmah",
		"resistances": {
			"light-air": -0.18,
			"fire": 0.08,
			"water": 0,
			"earth-dust": 0.12
		},
		"interruptResistance": 14,
		"poise": 10,
		"actionIds": [
			"shadow-strike",
			"reposition-step"
		]
	},
	"fallen-seraph-husk": {
		"affinityId": "binah",
		"resistances": {
			"light-air": 0,
			"fire": 0.2,
			"water": -0.2,
			"earth-dust": 0.04
		},
		"interruptResistance": 24,
		"poise": 24,
		"actionIds": [
			"letter-bolt",
			"warden-retreat"
		]
	},
	"great-dybbuk": {
		"affinityId": "zeir-anpin",
		"resistances": {
			"light-air": -0.08,
			"fire": 0.12,
			"water": 0.18,
			"earth-dust": 0
		},
		"interruptResistance": 34,
		"poise": 38,
		"actionIds": [
			"shadow-strike",
			"summon-shades",
			"ritual-heal"
		]
	},
	"klipah-guardian": {
		"affinityId": "malchus",
		"resistances": {
			"light-air": 0.05,
			"fire": 0,
			"water": -0.08,
			"earth-dust": 0.22
		},
		"interruptResistance": 30,
		"poise": 44,
		"actionIds": [
			"guardian-slam",
			"stone-guard"
		]
	},
	"kedem-letter-warden": {
		"affinityId": "malchus",
		"resistances": {
			"light-air": 0.08,
			"fire": 0.08,
			"water": 0.08,
			"earth-dust": 0.14
		},
		"interruptResistance": 48,
		"poise": 72,
		"actionIds": [
			"warden-cleave",
			"stone-guard",
			"letter-wave",
			"summit-enrage",
			"summon-shades"
		],
		"phaseAffinities": [
			"malchus",
			"chochmah",
			"binah",
			"zeir-anpin"
		]
	}
});

export const COMBAT_EFFECTIVENESS = deepFreeze({
	"BH": "B\"H",
	"boruchHashem": "Boruch Hashem",
	"blessedIsHe": "Blessed is He",
	"poem": "The Awtsmoos renews context before force and diagnostics after deed; Awtsmoos.com makes position, status, guard, and element the visible roots of need.",
	"schemaVersion": 1,
	"minimumMultiplier": 0.2,
	"maximumMultiplier": 2.5,
	"rules": [
		{
			"id": "target-resistance",
			"order": 10,
			"kind": "resistance",
			"diagnostic": "target resistance",
			"source": "targetResistance"
		},
		{
			"id": "guarded-physical",
			"order": 20,
			"kind": "tag-status",
			"requiredActionTag": "melee",
			"excludedActionTag": "guard-break",
			"requiredTargetTag": "guarded",
			"multiplier": 0.7,
			"diagnostic": "guard reduced the physical impact"
		},
		{
			"id": "guard-break",
			"order": 21,
			"kind": "tag-status",
			"requiredActionTag": "guard-break",
			"requiredTargetTag": "guarded",
			"multiplier": 1.35,
			"applyStatusId": "guard-broken",
			"diagnostic": "guard-break force opened the defense"
		},
		{
			"id": "light-reveals-hidden",
			"order": 30,
			"kind": "element-status",
			"elementId": "light-air",
			"requiredTargetTag": "hidden",
			"multiplier": 1.28,
			"applyStatusId": "illuminated",
			"diagnostic": "light revealed concealed form"
		},
		{
			"id": "earth-catches-airborne",
			"order": 31,
			"kind": "element-status",
			"elementId": "earth-dust",
			"requiredTargetTag": "airborne",
			"multiplier": 1.3,
			"criticalInteraction": true,
			"applyStatusId": "grounded",
			"diagnostic": "earth grounded an airborne target"
		},
		{
			"id": "water-quenches-burning",
			"order": 32,
			"kind": "element-status",
			"elementId": "water",
			"requiredStatusId": "burning",
			"multiplier": 1.18,
			"removeStatusId": "burning",
			"applyStatusId": "soaked",
			"diagnostic": "water quenched burning letters"
		},
		{
			"id": "fire-dampened-by-soak",
			"order": 33,
			"kind": "element-status",
			"elementId": "fire",
			"requiredStatusId": "soaked",
			"multiplier": 0.72,
			"diagnostic": "soaked target dampened fire"
		},
		{
			"id": "earth-forms-binding-mud",
			"order": 34,
			"kind": "element-status",
			"elementId": "earth-dust",
			"requiredStatusId": "soaked",
			"multiplier": 1.2,
			"applyStatusId": "dust-bound",
			"diagnostic": "earth and water formed binding mud"
		},
		{
			"id": "fire-spreads-on-illuminated",
			"order": 35,
			"kind": "element-status",
			"elementId": "fire",
			"requiredStatusId": "illuminated",
			"multiplier": 1.12,
			"applyStatusId": "burning",
			"diagnostic": "revealed letters gave fire a clear path"
		},
		{
			"id": "flanking-pressure",
			"order": 40,
			"kind": "context-tag",
			"requiredContextTag": "flanking",
			"multiplier": 1.14,
			"diagnostic": "flanking position opened the target"
		},
		{
			"id": "counter-cast",
			"order": 41,
			"kind": "context-tag",
			"requiredContextTag": "counter-cast",
			"multiplier": 1.16,
			"diagnostic": "timed counter met the hostile cast"
		}
	],
	"insightTiers": {
		"0": [
			"identity",
			"danger"
		],
		"1": [
			"identity",
			"danger",
			"target",
			"element"
		],
		"2": [
			"identity",
			"danger",
			"target",
			"element",
			"progress",
			"counterGuidance"
		],
		"3": [
			"identity",
			"danger",
			"target",
			"element",
			"progress",
			"counterGuidance",
			"interruptResistance",
			"resistanceHint"
		]
	}
});

function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}
	Object.values(value).forEach(deepFreeze);
	return Object.freeze(value);
}
