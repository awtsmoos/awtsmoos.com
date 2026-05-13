
/**
 * B"H
 * @file WorkerBootState.js
 * @description
 * Mutable Worker boot state.
 */

/**
 * B"H
 * Creates Worker boot state.
 *
 * @returns {{
 *   promiseMap: Map<any, any>,
 *   systemCore: {OlamClass:any,UtilsClass:any,isReady:boolean},
 *   activeOlamInstance: any,
 *   bootPromise: Promise<boolean>
 * }}
 * Worker state.
 */
export function createWorkerBootState() {
  return {
    promiseMap: new Map(),
    systemCore: {
      OlamClass: null,
      UtilsClass: null,
      isReady: false
    },
    activeOlamInstance: null,
    bootPromise: Promise.resolve(false)
  };
}

/**
 * B"H
 * Stores SystemCore.
 *
 * @param {Object} state
 * State.
 *
 * @param {Object} systemCore
 * SystemCore.
 *
 * @returns {boolean}
 * Ready flag.
 */
export function setWorkerSystemCore(state, systemCore) {
  state.systemCore = systemCore || {
    OlamClass: null,
    UtilsClass: null,
    isReady: false
  };

  return Boolean(state.systemCore.isReady);
}

/**
 * B"H
 * Stores active Olam instance.
 *
 * @param {Object} state
 * State.
 *
 * @param {any} instance
 * Olam instance.
 *
 * @returns {void}
 */
export function setActiveOlamInstance(state, instance) {
  state.activeOlamInstance = instance;
}
