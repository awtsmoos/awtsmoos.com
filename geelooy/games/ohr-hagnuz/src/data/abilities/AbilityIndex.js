/**
 * B"H
 * @module AbilityIndex
 * Torah debate moves unlock over a longer playthrough.
 */
export const AbilityIndex = {
  mishnahClarity: { name: 'Mishnah Clarity', power: 18, text: 'You clarify the case with precise Mishnah.', scale: 'chochmah' },
  chassidusWarmth: { name: 'Chassidus Warmth', power: 14, text: 'You reveal the inner spark behind the question.', scale: 'daat' },
  kabbalahLight: { name: 'Kabbalah Light', power: 24, text: 'You draw a higher pattern into the argument.', scale: 'chochmah' },
  niggunJoy: { name: 'Niggun Joy', power: 10, heal: 10, text: 'A niggun sweetens the dinim and restores light.', scale: 'binah' },
  gezeirahShava: { name: 'Gezeirah Shavah', power: 26, unlockLevel: 3, text: 'You connect two sugios by a precise equal language.', scale: 'daat' },
  svaraLuminous: { name: 'Luminous Svara', power: 32, unlockLevel: 5, text: 'A svara emerges that the opponent cannot deny.', scale: 'chochmah' },
  binahShuttle: { name: 'Binah Shuttle', power: 18, heal: 20, unlockQuest: 'sources', text: 'You weave the question back into a stronger vessel.', scale: 'binah' },
  orChozerReturn: { name: 'Ohr Chozer Return', power: 40, unlockQuest: 'cave_sod', text: 'The objection returns as a boot to higher light.', scale: 'daat' },
  keterSilence: { name: 'Keter Silence', power: 60, unlockGarment: 'CROWN_THREAD', text: 'A silence above reason sweetens the din.', scale: 'daat' }
};

export const BaseAbilityIds = ['mishnahClarity', 'chassidusWarmth', 'kabbalahLight', 'niggunJoy'];
