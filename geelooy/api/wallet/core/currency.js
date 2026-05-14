
// B"H

/**
 * Internal unit: perutah.
 *
 * This wallet is inspired by the coinage ratios discussed around Shekalim.
 * It is NOT a halachic psak and NOT metal-weight redemption money.
 */
const PERUTAH_USD_CENTS = 2;

const COINS = [
  { id: "perutah", name: "Perutah", perutahs: 1, note: "Base token unit." },
  { id: "isar", name: "Isar", perutahs: 8, note: "1 Isar = 8 Perutahs." },
  { id: "pundyon", name: "Pundyon", perutahs: 16, note: "1 Pundyon = 2 Isarin." },
  { id: "meah", name: "Me'ah / Gayrah", perutahs: 32, note: "1 Me'ah = 2 Pundyonin." },
  { id: "dinar", name: "Dinar", perutahs: 192, note: "1 Dinar = 6 Me'in." },
  { id: "sela", name: "Sela / Second Temple Shekel", perutahs: 768, note: "1 Sela = 4 Dinarin." },
  { id: "dinar_zahav", name: "Dinar Zahav", perutahs: 4800, note: "1 Dinar Zahav = 25 Dinarim." },
  { id: "maneh", name: "Maneh", perutahs: 19200, note: "1 Maneh = 4 Dinar Zahavim." },
  { id: "maneh_kodesh", name: "Maneh Shel Kodesh", perutahs: 38400, note: "1 Maneh Shel Kodesh = 2 Manehim." },
  { id: "kikar", name: "Kikar", perutahs: 2304000, note: "1 Kikar = 60 Maneh Shel Kodesh." },
  { id: "kikar_kodesh", name: "Kikar Shel Kodesh", perutahs: 4608000, note: "1 Kikar Shel Kodesh = 2 Kikarin." }
];

function decompose(perutahs) {
  let left = Math.max(0, Math.floor(Number(perutahs || 0)));
  const out = [];

  for (const coin of [...COINS].reverse()) {
    const count = Math.floor(left / coin.perutahs);

    if (count > 0) {
      out.push({ ...coin, count });
      left -= count * coin.perutahs;
    }
  }

  if (!out.length) {
    out.push({ ...COINS[0], count: 0 });
  }

  return out;
}

function usdToPerutahs(dollars) {
  const cents = Math.round(Number(dollars || 0) * 100);
  return Math.floor(cents / PERUTAH_USD_CENTS);
}

function perutahsToUsd(perutahs) {
  return Math.round(Number(perutahs || 0) * PERUTAH_USD_CENTS) / 100;
}

module.exports = {
  PERUTAH_USD_CENTS,
  COINS,
  decompose,
  usdToPerutahs,
  perutahsToUsd
};
