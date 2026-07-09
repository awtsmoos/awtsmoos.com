/**
 * B"H
 * @file heeooleey.js
 * @description Parser-plain event vessel for the worker root graph.
 */
export default class Heeoolee {
  constructor() {
    this.events = {};
  }

  static extend(target) {
    var names = Object.getOwnPropertyNames(Heeoolee.prototype);
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      if (name !== "constructor" && name !== "extend" && !Object.prototype.hasOwnProperty.call(target, name)) {
        target[name] = Heeoolee.prototype[name];
      }
    }
  }

  clearAll() {
    var keys = Object.keys(this.events || {});
    for (var i = 0; i < keys.length; i += 1) {
      try { delete this.events[keys[i]]; } catch (error) {}
    }
    this.events = {};
  }

  clear(shaym, func) {
    if (typeof shaym !== "string") return null;
    var list = this.events[shaym];
    if (!list) return null;
    if (typeof func !== "function") {
      delete this.events[shaym];
      return null;
    }
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i] && list[i].peula === func) list.splice(i, 1);
    }
    if (!list.length) delete this.events[shaym];
    return null;
  }

  remove(shaym, peula) {
    if (typeof shaym !== "string") return false;
    var list = this.events[shaym];
    if (typeof peula !== "function") {
      if (list) delete this.events[shaym];
      return true;
    }
    if (!Array.isArray(list)) return false;
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i] && list[i].peula === peula) {
        list.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  on(shaym, peula, oneTime) {
    if (typeof shaym !== "string") return null;
    if (typeof peula !== "function") {
      if (typeof peula !== "string") return null;
      try { peula = eval("(" + peula + ")"); } catch (error) { return null; }
    }
    if (!this.events[shaym]) this.events[shaym] = [];
    this.events[shaym].push({ peula:peula, oneTime:Boolean(oneTime) });
    return peula;
  }

  event(shaym) {
    var list = this.events[shaym];
    return list && list.length ? list : null;
  }

  ayshPeula(shaym) {
    var list = this.events[shaym];
    var args = Array.prototype.slice.call(arguments, 1);
    var asyncs = [];
    var results = [];
    var remove = [];
    if (Array.isArray(list)) {
      for (var i = 0; i < list.length; i += 1) {
        var ev = list[i] || {};
        var q = ev.peula;
        if (typeof q !== "function") continue;
        if (String(q).indexOf("async") > -1) asyncs.push(q.apply(this, args));
        else results.push(q.apply(this, args));
        if (ev.oneTime) remove.push(i);
      }
      for (var r = remove.length - 1; r >= 0; r -= 1) list.splice(remove[r], 1);
    }
    if (asyncs.length) return Promise.all(asyncs);
    if (results.length) return results[0];
    return undefined;
  }
}
