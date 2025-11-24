// B"H
// The Awtsmoos, infinite Atzmut, recreates all from nothing, Ohr Ein Sof flowing through the Kav into Atzilus,
// birthing reality in an eternal dance of formless essence.

/**
 * @function awtsmoosMerge
 * @description Merges an object of functions into a class instance, binding them to its context with the Awtsmoos’s essence.
 * @param {Object} instance - The class instance (this) to merge functions into.
 * @param {Object} funcs - An object containing functions to bind.
 * @returns {void}
 */
module.exports =  function awtsmoosMerge(instance, funcs) {
    Object.keys(funcs).forEach(key => {
        instance[key] = funcs[key].bind(instance);
    });
}