
// B"H
class ValuesAction {
    static execute(state) {
        return state.reader.values.bind(state.reader);
    }
}
module.exports = ValuesAction;
