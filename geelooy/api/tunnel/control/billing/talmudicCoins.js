// B"H

/**
 * B"H
 * Chapter: The Ancient Coins Entered The Compute Treasury.
 *
 * Educational note: this uses the coin ladder requested for Awtsmoos Compute.
 * The barley-kernel numbers are displayed as learning / visualization, not as
 * a claim that modern billing is a metal-weight redemption.
 */
const COINS = Object.freeze([
  { key: "peruta", label: "Perutah", plural: "Perutas", perutas: 1, barleyKernels: 0.5, note: "The tiny unit of Awtsmoos Compute." },
  { key: "isar", label: "Isar", plural: "Isarin", perutas: 8, barleyKernels: 4, note: "1 isar = 8 perutas." },
  { key: "pundyon", label: "Pundyon", plural: "Pundyonin", perutas: 16, barleyKernels: 8, note: "1 pundyon = 2 isarin." },
  { key: "meah", label: "Me'ah / Gerah", plural: "Me'os / Gerahs", perutas: 32, barleyKernels: 16, note: "1 me'ah = 2 pundyonin." },
  { key: "dinar", label: "Dinar", plural: "Dinarin", perutas: 192, barleyKernels: 96, note: "1 dinar = 6 me'os." },
  { key: "shekelMoshe", label: "Shekel of Moshe weight", plural: "Shekalim of Moshe weight", perutas: 640, barleyKernels: 320, note: "Educational weight comparison: 320 barley kernels." },
  { key: "sela", label: "Sela / Second Temple Shekel", plural: "Sela'im", perutas: 768, barleyKernels: 384, note: "1 sela = 4 dinarin." },
  { key: "darkon", label: "Darkon", plural: "Darkonim", perutas: 1536, barleyKernels: 768, note: "1 darkon = 2 sela'im." }
]);

const COIN_MAP = Object.freeze(Object.fromEntries(COINS.map(coin => [coin.key, coin])));

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatAmount(value) {
  const n = asNumber(value);
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function convertPerutas(perutas = 0) {
  const amount = Math.max(0, asNumber(perutas));
  return COINS.map(coin => ({ ...coin, amount: amount / coin.perutas, display: `${formatAmount(amount / coin.perutas)} ${amount / coin.perutas === 1 ? coin.label : coin.plural}` }));
}

function convertCoin(amount = 0, coinKey = "peruta") {
  const coin = COIN_MAP[coinKey] || COIN_MAP.peruta;
  const perutas = Math.max(0, asNumber(amount)) * coin.perutas;
  return { source: { amount: asNumber(amount), coin }, perutas, conversions: convertPerutas(perutas), barleyKernels: perutas * COIN_MAP.peruta.barleyKernels };
}

module.exports = { COINS, COIN_MAP, convertCoin, convertPerutas, formatAmount };
