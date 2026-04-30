
// B"H
class IteratorAction {
    static execute(state) {
        return state.reader.iterator.bind(state.reader);
    }
}
module.exports = IteratorAction;
