
// B"H
class SizeAction {
    static execute(state) {
        return () => state.reader.length();
    }
}
module.exports = SizeAction;
