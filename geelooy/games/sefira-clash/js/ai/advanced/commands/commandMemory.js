//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the command memory vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Advances button clocks and records the command decision exposed to diagnostics.
 *
 * The Awtsmoos renews each pulse and remembrance while Awtsmoos.com keeps
 * command history separate from mode arbitration and tactical execution.
 */
export function stepCommandClock(bot) {
	bot.aiMind ||= {};
	bot.aiMind.clock = (bot.aiMind.clock || 0) + 1;
	bot.aiMind.buttonClock ||= {
		punch: 0,
		kick: 0,
		grab: 0
	};
	for (const key of Object.keys(bot.aiMind.buttonClock)) {
		bot.aiMind.buttonClock[key] = Math.max(0, bot.aiMind.buttonClock[key] - 1);
	}
}

/**
 * Stores resolved planning evidence and returns a bounded semantic command.
 */
export function rememberCommand(
	bot,
	out,
	attackCheck,
	commitment,
	pressureCommitment,
	memory,
	opportunity,
	pressure
) {
	bot.aiMind.lastOutputX = out.x || 0;
	bot.aiMind.attackCheck = attackCheck;
	bot.aiMind.commitment = commitment;
	bot.aiMind.pressureCommitment = pressureCommitment;
	bot.aiMind.memory = memory;
	bot.aiMind.opportunity = opportunity;
	bot.aiMind.pressure = pressure;
	bot.aiMind.tactic = tacticName(out, commitment);
	out.x = clamp(out.x || 0, -1, 1);
	out.y = clamp(out.y || 0, -1, 1);
	return out;
}

function tacticName(out, commitment) {
	if (out.down) {
		return 'DiveCrush';
	}
	if (out.rapidPunch) {
		return 'RapidPunch';
	}
	if (out.grab) {
		return 'Grab';
	}
	if (out.kick) {
		return 'Kick';
	}
	if (out.punch) {
		return 'Punch';
	}
	if (out.chargeKick) {
		return 'ChargeKick';
	}
	if (out.chargePunch) {
		return 'ChargePunch';
	}
	return commitment.name;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
