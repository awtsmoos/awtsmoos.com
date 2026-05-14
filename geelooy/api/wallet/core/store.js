
// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { decompose, perutahsToUsd } = require("./currency.js");

const DATA_DIR = path.join(process.cwd(), "dayuh", "wallet");
const DATA_FILE = path.join(DATA_DIR, "wallets.json");

const DEFAULT_DAILY_REFILL = 240;
const DEFAULT_CAP = 1200;
const DEFAULT_START = 600;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function readDb() {
  try {
    const txt = await fsp.readFile(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    return { BH: "B\"H", wallets: {}, txs: [] };
  }
}

async function writeDb(db) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

function tx(type, userId, amount, meta = {}) {
  return {
    id: "tx_" + crypto.randomBytes(8).toString("hex"),
    type,
    userId,
    amount,
    meta,
    at: Date.now()
  };
}

function freshWallet(userId) {
  return {
    userId,
    balance: DEFAULT_START,
    dailyRefill: DEFAULT_DAILY_REFILL,
    cap: DEFAULT_CAP,
    lastRefillDay: todayKey(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function refillWallet(wallet) {
  const today = todayKey();

  if (wallet.lastRefillDay === today) {
    return { wallet, added: 0 };
  }

  const before = wallet.balance;
  wallet.balance = Math.min(wallet.cap, wallet.balance + wallet.dailyRefill);
  wallet.lastRefillDay = today;
  wallet.updatedAt = Date.now();

  return {
    wallet,
    added: wallet.balance - before
  };
}

async function getWallet(userId) {
  const db = await readDb();

  if (!db.wallets[userId]) {
    db.wallets[userId] = freshWallet(userId);
    db.txs.push(tx("welcome_grant", userId, DEFAULT_START));
  }

  const refilled = refillWallet(db.wallets[userId]);

  if (refilled.added > 0) {
    db.txs.push(tx("daily_refill", userId, refilled.added));
  }

  await writeDb(db);

  const wallet = db.wallets[userId];

  return {
    ...wallet,
    usdValue: perutahsToUsd(wallet.balance),
    coins: decompose(wallet.balance),
    recent: db.txs.filter(x => x.userId === userId).slice(-25).reverse()
  };
}

async function credit(userId, amount, meta = {}) {
  const db = await readDb();

  if (!db.wallets[userId]) {
    db.wallets[userId] = freshWallet(userId);
  }

  db.wallets[userId].balance += Math.max(0, Math.floor(amount));
  db.wallets[userId].updatedAt = Date.now();
  db.txs.push(tx("credit", userId, amount, meta));

  await writeDb(db);
  return await getWallet(userId);
}

async function spend(userId, amount, meta = {}) {
  const db = await readDb();

  if (!db.wallets[userId]) {
    db.wallets[userId] = freshWallet(userId);
  }

  amount = Math.max(0, Math.floor(amount));

  if (db.wallets[userId].balance < amount) {
    return { ok: false, error: "insufficient_perutahs", balance: db.wallets[userId].balance, needed: amount };
  }

  db.wallets[userId].balance -= amount;
  db.wallets[userId].updatedAt = Date.now();
  db.txs.push(tx("spend", userId, -amount, meta));

  await writeDb(db);
  return { ok: true, wallet: await getWallet(userId) };
}

module.exports = {
  getWallet,
  credit,
  spend,
  DEFAULT_DAILY_REFILL,
  DEFAULT_CAP,
  DEFAULT_START
};
