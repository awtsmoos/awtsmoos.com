// B"H
'use strict';

/**
 * Chapter 2: The Awtsmoos folds waiting into ordered sparks.
 *
 * This runtime is a compact MD2-owned Promise and microtask queue. It is not a
 * native event loop, but it gives MD2 code deterministic Promise resolution,
 * chained then/catch/finally behavior, MD2 callback invocation, and explicit
 * queue flushing without eval or host-generated JavaScript.
 */
class Mode2MicrotaskQueue {
  constructor() { this.jobs = []; this.flushing = false; }
  enqueue(job) { this.jobs.push(job); if (!this.flushing) this.flush(); }
  flush() { this.flushing = true; try { while (this.jobs.length) this.jobs.shift()(); } finally { this.flushing = false; } }
}

class Mode2SyncPromise {
  constructor(value, callMd2, queue) {
    this.__md2Call = callMd2;
    this.__md2Queue = queue;
    this.__md2state = 'pending';
    this.__md2promise = undefined;
    this.__md2error = undefined;
    this.__md2reactions = [];
    if (value?.__md2promiseBrand || value instanceof Mode2SyncPromise) {
      value.then(v => this.resolve(v), e => this.reject(e));
    } else if (value?.__md2fn) {
      callMd2(value, [v => this.resolve(v), e => this.reject(e)]);
    } else if (typeof value === 'function') {
      try { value(v => this.resolve(v), e => this.reject(e)); } catch (err) { this.reject(err); }
    } else {
      this.resolve(value);
    }
  }

  resolve(value) {
    if (this.__md2state !== 'pending') return;
    if (value?.__md2promiseBrand) return value.then(v => this.resolve(v), e => this.reject(e));
    this.__md2state = 'fulfilled';
    this.__md2promise = value;
    this.flushReactions();
  }

  reject(error) {
    if (this.__md2state !== 'pending') return;
    this.__md2state = 'rejected';
    this.__md2error = error;
    this.flushReactions();
  }

  flushReactions() {
    for (const reaction of this.__md2reactions.splice(0)) this.__md2Queue.enqueue(reaction);
  }

  invoke(handler, value) {
    if (!handler) return value;
    if (handler.__md2fn) return this.__md2Call(handler, [value]);
    if (typeof handler === 'function') return handler(value);
    return value;
  }

  then(onFulfilled, onRejected) {
    return new Mode2SyncPromise((resolve, reject) => {
      const react = () => {
        try {
          if (this.__md2state === 'fulfilled') resolve(this.invoke(onFulfilled, this.__md2promise));
          else if (this.__md2state === 'rejected') {
            if (onRejected) resolve(this.invoke(onRejected, this.__md2error));
            else reject(this.__md2error);
          }
        } catch (err) { reject(err); }
      };
      if (this.__md2state === 'pending') this.__md2reactions.push(react);
      else this.__md2Queue.enqueue(react);
    }, this.__md2Call, this.__md2Queue);
  }

  catch(onRejected) { return this.then(undefined, onRejected); }

  finally(onFinally) {
    return this.then(
      value => { this.invoke(onFinally, undefined); return value; },
      err => { this.invoke(onFinally, undefined); throw err; }
    );
  }

  static resolve(value, callMd2, queue) { return new Mode2SyncPromise(value, callMd2, queue); }
  static reject(error, callMd2, queue) { return new Mode2SyncPromise((_, reject) => reject(error), callMd2, queue); }
}

function createMode2SyncPromiseClass(callMd2) {
  const queue = new Mode2MicrotaskQueue();
  return class BoundMode2SyncPromise extends Mode2SyncPromise {
    constructor(value) { super(value, callMd2, queue); this.__md2promiseBrand = true; }
    static resolve(value) { return new BoundMode2SyncPromise(value); }
    static reject(error) { return Mode2SyncPromise.reject(error, callMd2, queue); }
    static all(values) {
      return new BoundMode2SyncPromise((resolve, reject) => {
        const list = Array.from(values || []);
        if (!list.length) return resolve([]);
        const out = new Array(list.length);
        let left = list.length;
        list.forEach((item, index) => BoundMode2SyncPromise.resolve(item).then(
          value => { out[index] = value; if (--left === 0) resolve(out); },
          reject
        ));
      });
    }
    static race(values) {
      return new BoundMode2SyncPromise((resolve, reject) => {
        for (const item of Array.from(values || [])) BoundMode2SyncPromise.resolve(item).then(resolve, reject);
      });
    }
    static allSettled(values) {
      return new BoundMode2SyncPromise(resolve => {
        const list = Array.from(values || []);
        if (!list.length) return resolve([]);
        const out = new Array(list.length);
        let left = list.length;
        list.forEach((item, index) => BoundMode2SyncPromise.resolve(item).then(
          value => { out[index] = { status: 'fulfilled', value }; if (--left === 0) resolve(out); },
          reason => { out[index] = { status: 'rejected', reason }; if (--left === 0) resolve(out); }
        ));
      });
    }
    static any(values) {
      return new BoundMode2SyncPromise((resolve, reject) => {
        const list = Array.from(values || []);
        if (!list.length) return reject(new Error('All promises were rejected'));
        const errors = new Array(list.length);
        let left = list.length;
        list.forEach((item, index) => BoundMode2SyncPromise.resolve(item).then(
          resolve,
          reason => { errors[index] = reason; if (--left === 0) reject(new Error('All promises were rejected')); }
        ));
      });
    }
    static flushMicrotasks() { queue.flush(); }
  };
}

module.exports = { Mode2MicrotaskQueue, Mode2SyncPromise, createMode2SyncPromiseClass };
