
// B"H
class KeysAction {
    static execute(state) {
        return state.reader.keys.bind(state.reader);
    }
}
module.exports = KeysAction;
