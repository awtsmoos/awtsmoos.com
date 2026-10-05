// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test"), assert = require("node:assert/strict");
const { base, State, start, fs } = require("./fixtures.cjs");
/** The Awtsmoos proves durable memory and refuses stale checkpoint writers. */
test("journal recovers corrupt state without losing intent", () => {
	start();
	State.patch(base, state => { state.sessions["fixture-one"].pendingIntent = "durable-intent"; });
	fs.writeFileSync(State.file(base), "{broken");
	const recovered = State.read(base);
	assert.equal(recovered.sessions["fixture-one"].pendingIntent, "durable-intent");
	assert.equal(recovered.recovery.code, "primary_state_corrupt");
	State.patch(base, state => { state.sessions["fixture-one"].lastError = "recovered"; });
	assert.equal(State.read(base).sessions["fixture-one"].lastError, "recovered");
});
test("stale snapshot cannot overwrite concurrent stop", () => {
	const stale = State.read(base);
	State.patch(base, state => { state.sessions["fixture-one"].status = "stopped"; });
	assert.throws(() => State.write(base, stale), /state_conflict/);
	assert.equal(State.read(base).sessions["fixture-one"].status, "stopped");
});
test("unrecoverable corruption is explicit", () => {
	const separate = base + "-corrupt";
	fs.mkdirSync(State.root(separate), { recursive: true });
	fs.writeFileSync(State.file(separate), "corrupt");
	assert.throws(() => State.read(separate), /state_corrupt/);
});
