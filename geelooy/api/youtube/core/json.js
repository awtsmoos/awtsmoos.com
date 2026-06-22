// B"H
function json(data, statusCode = 200) {
  return { statusCode, mimeType: 'application/json; charset=utf-8', response: JSON.stringify(data, null, 2) };
}
function fail(error, statusCode = 400, extra = {}) { return json({ BH:'B"H', ok:false, error, ...extra }, statusCode); }
function ok(extra = {}) { return json({ BH:'B"H', ok:true, ...extra }); }
module.exports = { json, fail, ok };
