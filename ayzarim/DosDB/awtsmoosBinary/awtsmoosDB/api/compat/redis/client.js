// B"H — AwtsmoosDB Redis-compatible API (node-redis v4 command surface).
// New files only. Uses AwtsmoosDB's public API exclusively (open, db.root, flush, close).
// Zero stringify-based serialization — values are stored as native AwtsmoosBinaryJSON records.
'use strict';

const path = require('path');
const { EventEmitter } = require('events');
const AwtsmoosDB = require(path.join(__dirname, '..', '..', '..', 'index.js'));

// Dedicated root subtree: every Redis key lives at db.root['__rd:' + key].
// The '__rd:' prefix guarantees Redis data never collides with other uses.
const PREFIX = '__rd:';

// Process-wide pub/sub bus so duplicated clients in one process hear each other.
const BUS = new Map(); // channel -> Set<{ client, listener }>

function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') re += '.*';
    else if (c === '?') re += '.';
    else if (c === '[') {
      const j = glob.indexOf(']', i + 1);
      if (j === -1) re += '\\[';
      else { re += glob.slice(i, j + 1); i = j; }
    } else if ('\\.+^${}()|'.indexOf(c) !== -1) re += '\\' + c;
    else re += c;
  }
  return new RegExp('^' + re + '$');
}

function isIntStr(s) { return /^-?\d+$/.test(s); }

function normRange(len, start, stop) {
  if (start < 0) start = len + start;
  if (stop < 0) stop = len + stop;
  if (start < 0) start = 0;
  if (stop >= len) stop = len - 1;
  if (start > stop || len === 0) return null;
  return [start, stop];
}

class AwtsmoosRedisClient extends EventEmitter {
  constructor(options) {
    super();
    options = options || {};
    this.options = options;
    this.dbPath = options.database || '/tmp/awtsmoos-redis.awtsdb';
    this.dbOptions = options.dbOptions || { compression: false };
    this._db = null;
    this._connected = false;
    this._mySubs = new Map(); // channel -> Set<listener>
    this._wtc = new Map(); // replaced by the shared map on connect()
    // Engine sharing: the engine enforces one exclusive writer per file, so
    // duplicates share the source client's engine via a refcounted holder.
    this._engineRef = null; // { db, wtc, count } — shared by duplicates
    this._dupOf = null; // set by duplicate()
  }

  get isConnected() { return this._connected; }

  async connect() {
    if (!this._engineRef) {
      if (this._dupOf) {
        await this._dupOf.connect(); // ensure the source is up; share its engine
        this._engineRef = this._dupOf._engineRef;
        this._engineRef.count++;
      } else {
        const db = new AwtsmoosDB(this.dbPath, this.dbOptions);
        db.open();
        // Write-through cache lives on the shared holder: the engine may
        // buffer db.batch() writes until flush(), so read-your-writes are
        // served from here. Values are plain records; _read clones on return
        // so callers can never mutate cached entries. (From mongo/store.js.)
        this._engineRef = { db: db, wtc: new Map(), count: 1 };
      }
    }
    this._db = this._engineRef.db;
    this._wtc = this._engineRef.wtc;
    this._connected = true;
    return this;
  }

  duplicate(overrideOptions) {
    const d = new AwtsmoosRedisClient(Object.assign({}, this.options, overrideOptions));
    // Share the engine only when targeting the same database file (the
    // engine enforces one exclusive writer per file).
    if (d.dbPath === this.dbPath) d._dupOf = this;
    return d;
  }

  // Release our hold on the shared engine; the last holder flushes+closes.
  _releaseEngine(flush) {
    if (this._engineRef) {
      this._engineRef.count--;
      if (this._engineRef.count <= 0) {
        if (flush) { try { this._engineRef.db.flush(); } catch (e) { /* already closed */ } }
        try { this._engineRef.db.close(); } catch (e) { /* already closed */ }
        this._engineRef.wtc.clear();
      }
      this._engineRef = null;
    }
    this._db = null;
  }

  async quit() {
    this._releaseEngine(true);
    this._connected = false;
    return 'OK';
  }

  async disconnect() {
    this._releaseEngine(false);
    this._connected = false;
  }

  // ---------- internal record layer ----------
  // Record shape: { t: 's'|'h'|'l'|'set'|'z', v: <native value>, e: <expireAtMs|0> }
  _rk(key) { return PREFIX + String(key); }

  _assertConn() {
    if (!this._connected || !this._db) throw new Error('Client not connected: call await client.connect() first');
  }

  // Resolve liveHandle lazy values. Object reads can come back as
  // FUNCTION-handles (typeof 'function') with __resolve__() attached, not
  // plain objects — resolve before reading fields. (From mongo/store.js.)
  // Only resolves handle-shaped values; live engine views pass through
  // untouched for _plainRec to convert.
  _resolveTop(v) {
    let depth = 0;
    while (v !== null && v !== undefined && typeof v.__resolve__ === 'function' && depth < 60) {
      try { v = v.__resolve__(); } catch (e) { return undefined; }
      depth++;
    }
    return (typeof v === 'function') ? undefined : v;
  }

  // Views are live engine Handles (Array.isArray false, slice() broken,
  // writing a view back serializes to garbage), so _read returns a plain
  // deep copy. Callers may freely mutate and re-write the result.
  _plainRec(rec) {
    const t = rec.t;
    const out = { t: t, e: rec.e || 0 };
    let v = this._resolveTop(rec.v);
    if (t === 's') { out.v = v; }
    else if (t === 'h') {
      const h = {};
      for (const k of Object.keys(v)) h[k] = String(v[k]);
      out.v = h;
    } else if (t === 'l' || t === 'set') {
      const a = [];
      for (let i = 0; i < v.length; i++) a[i] = v[i];
      out.v = a;
    } else if (t === 'z') {
      const a = [];
      for (let i = 0; i < v.length; i++) {
        const e = this._resolveTop(v[i]);
        a[i] = { s: e.s, m: String(e.m) };
      }
      out.v = a;
    } else { out.v = v; }
    return out;
  }

  // Clone a plain record so _read callers can never mutate the cached entry.
  _cloneRec(r) {
    if (!r) return r;
    const t = r.t, v = r.v;
    const out = { t: t, e: r.e || 0 };
    if (t === 's') out.v = v;
    else if (t === 'h') { const h = {}; for (const k in v) h[k] = v[k]; out.v = h; }
    else if (t === 'l' || t === 'set') out.v = v.slice();
    else if (t === 'z') out.v = v.map(e => ({ s: e.s, m: e.m }));
    else out.v = v;
    return out;
  }

  _wtcSet(rk, rec) {
    const m = this._wtc;
    if (m.has(rk)) m.delete(rk); // refresh recency
    m.set(rk, rec);
    if (m.size > 100000) {
      // Evict oldest half (Map preserves insertion order). Safe: the engine
      // still has the data; the next read just re-resolves.
      let n = 0;
      for (const k of m.keys()) { m.delete(k); if (++n >= 50000) break; }
    }
  }

  _deleteRk(rk) {
    try { delete this._db.root[rk]; } catch (e) { /* already gone */ }
    this._wtc.delete(rk);
  }

  _read(key) {
    const rk = this._rk(key);
    let rec;
    if (this._wtc.has(rk)) {
      rec = this._wtc.get(rk);
    } else {
      let raw = this._db.root[rk];
      if (raw === undefined || raw === null) return null;
      raw = this._resolveTop(raw);
      if (raw === undefined || raw === null || typeof raw !== 'object') return null;
      rec = this._plainRec(raw);
      this._wtcSet(rk, rec);
    }
    if (rec.e && Date.now() >= rec.e) { this._deleteRk(rk); return null; }
    return this._cloneRec(rec);
  }

  _write(key, rec) {
    const rk = this._rk(key);
    this._db.root[rk] = rec;
    this._wtcSet(rk, rec);
  }

  _need(key, wantType) {
    const r = this._read(key);
    if (r && r.t !== wantType) {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }
    return r;
  }

  // ---------- strings ----------
  async set(key, value, options) {
    this._assertConn();
    options = options || {};
    // Fast path: plain SET needs no read. Only NX/XX/GET require the old record.
    let old = null;
    if (options.NX || options.XX || options.GET) {
      const cur = this._read(key);
      if (options.NX && cur) return null;
      if (options.XX && !cur) return null;
      old = cur && cur.t === 's' ? cur.v : null;
    }
    let e = 0;
    if (options.EX) e = Date.now() + options.EX * 1000;
    else if (options.PX) e = Date.now() + options.PX;
    this._write(key, { t: 's', v: String(value), e });
    if (options.GET) return old;
    return 'OK';
  }

  async get(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 's' ? r.v : null;
  }

  async getSet(key, value) {
    this._assertConn();
    const r = this._read(key);
    const old = r && r.t === 's' ? r.v : null;
    this._write(key, { t: 's', v: String(value), e: 0 });
    return old;
  }
  async getset(key, value) {
    this._assertConn(); return this.getSet(key, value); }

  _numOp(key, delta) {
    const r = this._read(key);
    let n = 0;
    let e = 0;
    if (r) {
      if (r.t !== 's' || !isIntStr(r.v)) {
        throw new Error('ERR value is not an integer or out of range');
      }
      n = parseInt(r.v, 10);
      e = r.e;
    }
    n += delta;
    this._write(key, { t: 's', v: String(n), e });
    return n;
  }

  async incr(key) {
    this._assertConn(); return this._numOp(key, 1); }
  async decr(key) {
    this._assertConn(); return this._numOp(key, -1); }
  async incrBy(key, n) {
    this._assertConn(); return this._numOp(key, n); }
  async decrBy(key, n) {
    this._assertConn(); return this._numOp(key, -n); }

  async append(key, value) {
    this._assertConn();
    const r = this._need(key, 's');
    const nv = (r ? r.v : '') + String(value);
    this._write(key, { t: 's', v: nv, e: r ? r.e : 0 });
    return nv.length;
  }

  async strLen(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 's' ? r.v.length : 0;
  }

  async mGet(keys) {
    this._assertConn();
    if (!Array.isArray(keys)) keys = [keys];
    return keys.map(k => {
      const r = this._read(k);
      return r && r.t === 's' ? r.v : null;
    });
  }

  async mSet(kv) {
    this._assertConn();
    const pairs = Array.isArray(kv) ? kv : [].concat(...Object.entries(kv));
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      this._write(pairs[i], { t: 's', v: String(pairs[i + 1]), e: 0 });
    }
    return 'OK';
  }

  // ---------- generic keys ----------
  _argList(a) { return Array.isArray(a) ? a : [a]; }

  async del(keys) {
    this._assertConn();
    let n = 0;
    for (const k of this._argList(keys)) {
      if (this._read(k) === null) continue; // missing or expired (purges)
      this._deleteRk(this._rk(k));
      n++;
    }
    return n;
  }

  async exists(keys) {
    this._assertConn();
    let n = 0;
    for (const k of this._argList(keys)) if (this._read(k) !== null) n++;
    return n;
  }

  async expire(key, seconds) {
    this._assertConn();
    const r = this._read(key);
    if (!r) return false;
    this._write(key, { t: r.t, v: r.v, e: Date.now() + seconds * 1000 });
    return true;
  }

  async pExpire(key, ms) {
    this._assertConn();
    const r = this._read(key);
    if (!r) return false;
    r.e = Date.now() + ms;
    this._write(key, r);
    return true;
  }

  async ttl(key) {
    this._assertConn();
    const r = this._read(key);
    if (!r) return -2;
    if (!r.e) return -1;
    return Math.max(0, Math.ceil((r.e - Date.now()) / 1000));
  }

  async pTTL(key) {
    this._assertConn();
    const r = this._read(key);
    if (!r) return -2;
    if (!r.e) return -1;
    return Math.max(0, r.e - Date.now());
  }
  async pttl(key) {
    this._assertConn(); return this.pTTL(key); }

  async persist(key) {
    this._assertConn();
    const r = this._read(key);
    if (!r || !r.e) return false;
    this._write(key, { t: r.t, v: r.v, e: 0 });
    return true;
  }

  async keys(pattern) {
    this._assertConn();
    const re = globToRegExp(pattern === undefined || pattern === null ? '*' : String(pattern));
    const out = [];
    const rootKeys = Object.keys(this._db.root);
    for (const rk of rootKeys) {
      if (rk.indexOf(PREFIX) !== 0) continue;
      const k = rk.slice(PREFIX.length);
      if (!re.test(k)) continue;
      if (this._read(k) === null) continue; // purges expired
      out.push(k);
    }
    return out;
  }

  async type(key) {
    this._assertConn();
    const r = this._read(key);
    if (!r) return 'none';
    return { s: 'string', h: 'hash', l: 'list', set: 'set', z: 'zset' }[r.t] || 'none';
  }

  async rename(key, newKey) {
    this._assertConn();
    const r = this._read(key);
    if (!r) throw new Error('ERR no such key');
    const nRk = this._rk(newKey);
    this._deleteRk(nRk); // overwrite destination if present
    this._write(newKey, { t: r.t, v: r.v, e: r.e });
    this._deleteRk(this._rk(key));
    return 'OK';
  }

  // ---------- hashes ----------
  async hSet(key, field, value) {
    this._assertConn();
    let entries;
    if (value === undefined && field !== null && typeof field === 'object') {
      entries = Object.entries(field);
    } else {
      entries = [[field, value]];
    }
    const r = this._need(key, 'h');
    const h = r ? Object.assign({}, r.v) : {};
    let added = 0;
    for (const [f0, v0] of entries) {
      const f = String(f0);
      if (!Object.prototype.hasOwnProperty.call(h, f)) added++;
      h[f] = String(v0);
    }
    this._write(key, { t: 'h', v: h, e: r ? r.e : 0 });
    return added;
  }

  async hGet(key, field) {
    this._assertConn();
    const r = this._read(key);
    if (!r || r.t !== 'h') return null;
    const v = r.v[String(field)];
    return v === undefined ? null : v;
  }

  async hGetAll(key) {
    this._assertConn();
    const r = this._read(key);
    if (!r || r.t !== 'h') return {};
    return Object.assign({}, r.v);
  }

  async hDel(key, fields) {
    this._assertConn();
    const r = this._need(key, 'h');
    if (!r) return 0;
    const h = Object.assign({}, r.v);
    let n = 0;
    for (const f of this._argList(fields)) {
      if (Object.prototype.hasOwnProperty.call(h, String(f))) { delete h[String(f)]; n++; }
    }
    this._write(key, { t: 'h', v: h, e: r.e });
    return n;
  }

  async hExists(key, field) {
    this._assertConn();
    const r = this._read(key);
    return !!r && r.t === 'h' && Object.prototype.hasOwnProperty.call(r.v, String(field));
  }

  async hKeys(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 'h' ? Object.keys(r.v) : [];
  }

  async hVals(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 'h' ? Object.keys(r.v).map(k => r.v[k]) : [];
  }

  async hIncrBy(key, field, n) {
    this._assertConn();
    const r = this._need(key, 'h');
    const h = r ? Object.assign({}, r.v) : {};
    const cur = h[String(field)];
    let num = 0;
    if (cur !== undefined) {
      if (!isIntStr(cur)) throw new Error('ERR hash value is not an integer');
      num = parseInt(cur, 10);
    }
    num += n;
    h[String(field)] = String(num);
    this._write(key, { t: 'h', v: h, e: r ? r.e : 0 });
    return num;
  }

  // ---------- lists ----------
  _push(key, elements, front) {
    const r = this._need(key, 'l');
    const arr = r ? r.v.slice() : [];
    // Redis LPUSH a b c => [c, b, a, ...rest]: elements are pushed left one by one.
    if (front) { for (const el of elements) arr.unshift(String(el)); }
    else { for (const el of elements) arr.push(String(el)); }
    this._write(key, { t: 'l', v: arr, e: r ? r.e : 0 });
    return arr.length;
  }

  async lPush(key, elements) {
    this._assertConn(); return this._push(key, this._argList(elements), true); }
  async rPush(key, elements) {
    this._assertConn(); return this._push(key, this._argList(elements), false); }

  _pop(key, front) {
    const r = this._need(key, 'l');
    if (!r || r.v.length === 0) return null;
    const arr = r.v.slice();
    const el = front ? arr.shift() : arr.pop();
    this._write(key, { t: 'l', v: arr, e: r.e });
    return el;
  }

  async lPop(key) {
    this._assertConn(); return this._pop(key, true); }
  async rPop(key) {
    this._assertConn(); return this._pop(key, false); }

  async lRange(key, start, stop) {
    this._assertConn();
    const r = this._read(key);
    if (!r || r.t !== 'l') return [];
    const rng = normRange(r.v.length, start, stop);
    if (!rng) return [];
    return r.v.slice(rng[0], rng[1] + 1);
  }

  async lLen(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 'l' ? r.v.length : 0;
  }

  // ---------- sets ----------
  async sAdd(key, members) {
    this._assertConn();
    const r = this._need(key, 'set');
    const arr = r ? r.v.slice() : [];
    let added = 0;
    for (const m of this._argList(members)) {
      const s = String(m);
      if (arr.indexOf(s) === -1) { arr.push(s); added++; }
    }
    this._write(key, { t: 'set', v: arr, e: r ? r.e : 0 });
    return added;
  }

  async sRem(key, members) {
    this._assertConn();
    const r = this._need(key, 'set');
    if (!r) return 0;
    const arr = r.v.slice();
    let n = 0;
    for (const m of this._argList(members)) {
      const i = arr.indexOf(String(m));
      if (i !== -1) { arr.splice(i, 1); n++; }
    }
    this._write(key, { t: 'set', v: arr, e: r.e });
    return n;
  }

  async sMembers(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 'set' ? r.v.slice() : [];
  }

  async sIsMember(key, member) {
    this._assertConn();
    const r = this._read(key);
    return !!r && r.t === 'set' && r.v.indexOf(String(member)) !== -1;
  }

  async sCard(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 'set' ? r.v.length : 0;
  }

  // ---------- sorted sets ----------
  // v: array of { s: score(number), m: member(string) }, kept sorted by (score, member).
  _zSort(arr) {
    arr.sort((a, b) => (a.s - b.s) || (a.m < b.m ? -1 : a.m > b.m ? 1 : 0));
  }

  async zAdd(key, members, scoreOrOpts, memberArg) {
    this._assertConn();
    let list;
    if (Array.isArray(members)) {
      list = members;
    } else if (memberArg !== undefined) {
      list = [{ score: members, value: memberArg }];
    } else if (members && typeof members === 'object') {
      list = [members];
    } else {
      throw new Error('ERR wrong number of arguments for zadd');
    }
    const r = this._need(key, 'z');
    const arr = r ? r.v.map(e => ({ s: e.s, m: e.m })) : [];
    let added = 0;
    for (const z of list) {
      const m = String(z.value);
      const s = Number(z.score);
      const i = arr.findIndex(e => e.m === m);
      if (i === -1) { arr.push({ s, m }); added++; }
      else arr[i].s = s;
    }
    this._zSort(arr);
    this._write(key, { t: 'z', v: arr, e: r ? r.e : 0 });
    return added;
  }

  async zRange(key, start, stop, options) {
    this._assertConn();
    const r = this._read(key);
    if (!r || r.t !== 'z') return [];
    let arr = r.v;
    if (options && options.REV) arr = arr.slice().reverse();
    const rng = normRange(arr.length, start, stop);
    if (!rng) return [];
    return arr.slice(rng[0], rng[1] + 1).map(e => e.m);
  }

  async zRank(key, member) {
    this._assertConn();
    const r = this._read(key);
    if (!r || r.t !== 'z') return null;
    const i = r.v.findIndex(e => e.m === String(member));
    return i === -1 ? null : i;
  }

  async zScore(key, member) {
    this._assertConn();
    const r = this._read(key);
    if (!r || r.t !== 'z') return null;
    const e = r.v.find(v => v.m === String(member));
    return e ? e.s : null;
  }

  async zCard(key) {
    this._assertConn();
    const r = this._read(key);
    return r && r.t === 'z' ? r.v.length : 0;
  }

  // ---------- pub/sub (in-process) ----------
  async subscribe(channels, listener) {
    this._assertConn();
    if (typeof channels === 'function') { listener = channels; channels = []; }
    for (const ch of this._argList(channels)) {
      const c = String(ch);
      if (!BUS.has(c)) BUS.set(c, new Set());
      const entry = { client: this, listener };
      BUS.get(c).add(entry);
      if (!this._mySubs.has(c)) this._mySubs.set(c, new Set());
      this._mySubs.get(c).add(listener);
    }
  }

  async unsubscribe(channels) {
    this._assertConn();
    const list = channels === undefined ? [...this._mySubs.keys()] : this._argList(channels);
    for (const ch of list) {
      const c = String(ch);
      const listeners = this._mySubs.get(c);
      if (!listeners) continue;
      const set = BUS.get(c);
      if (set) {
        for (const entry of [...set]) {
          if (entry.client === this && listeners.has(entry.listener)) set.delete(entry);
        }
        if (set.size === 0) BUS.delete(c);
      }
      this._mySubs.delete(c);
    }
  }

  async publish(channel, message) {
    this._assertConn();
    const c = String(channel);
    const set = BUS.get(c);
    if (!set || set.size === 0) return 0;
    const msg = String(message);
    for (const entry of [...set]) {
      try { entry.listener(msg, c); }
      catch (e) { entry.client.emit('error', e); }
    }
    return set.size;
  }
}

function createClient(options) {
  return new AwtsmoosRedisClient(options);
}

module.exports = { createClient, AwtsmoosRedisClient };
