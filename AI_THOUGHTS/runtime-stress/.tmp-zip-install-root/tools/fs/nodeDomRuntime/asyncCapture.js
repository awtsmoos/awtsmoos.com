// B"H
/**
 * @file asyncCapture.js
 * @description Chapter 370: Even the late rupture is caught in a vessel. Async
 * IIFEs and rejected promises become runtime diagnostics, not process death.
 */
function installAsyncCapture(errors) {
  const unhandled = reason => errors.push(toError(reason, "unhandledRejection"));
  const exception = error => errors.push(toError(error, "uncaughtException"));
  process.on("unhandledRejection", unhandled);
  process.on("uncaughtException", exception);
  return () => {
    process.off("unhandledRejection", unhandled);
    process.off("uncaughtException", exception);
  };
}
function toError(error, phase) {
  return { message: error?.message || String(error), stack: error?.stack || "", phase };
}
module.exports = { installAsyncCapture, toError };
