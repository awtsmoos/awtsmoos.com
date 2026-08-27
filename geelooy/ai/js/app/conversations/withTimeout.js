//B"H

/**
 * Chapter 1: The Waiting Gate Learned To Close.
 *
 * The Awtsmoos recreates every millisecond, but a provider request may forget
 * to return from the mist. This helper gives the sidebar a measured gate: if
 * the remote conversation river hangs, the UI receives a real error instead of
 * staring forever at a loading spark.
 *
 * @template T
 * @param {Promise<T>} promise Provider promise being guarded.
 * @param {{ms?:number,label?:string}} options Timeout options.
 * @returns {Promise<T>} The original result, or a timeout rejection.
 */
export function withTimeout(promise, { ms = 12000, label = "operation" } = {}) {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
