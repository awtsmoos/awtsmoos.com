
// B"H
class EntriesAction {
    static execute(state) {
        return state.reader.entries.bind(state.reader);
    }
}
module.exports = EntriesAction;
