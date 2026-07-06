// B"H
function objectSchema(properties = {}, required = []) { return { type:'object', additionalProperties:true, required, properties }; }
function string(description) { return { type:'string', description }; }
function integer(description) { return { type:'integer', description }; }
function bool(description) { return { type:'boolean', description }; }
function object(description) { return { type:'object', description, additionalProperties:true }; }
function array(items) { return { type:'array', items }; }
function pathSchema(extra = {}) { return objectSchema({ path:string('Repo-relative file/path.'), p:string('Path alias.'), ...extra }); }
function commonSchema() { return objectSchema({ p:string('Repo-relative path.'), path:string('Repo-relative path.'), query:string('Query/search text.'), content:string('Complete content or JSON carrier.'), params:object('Object carrier.'), command:string('Command.'), timeoutMs:integer('Timeout.'), maxChars:integer('Maximum returned characters.'), totalMaxChars:integer('Maximum total returned characters.') }); }
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }
module.exports = { objectSchema, string, integer, bool, object, array, pathSchema, commonSchema, unique };
