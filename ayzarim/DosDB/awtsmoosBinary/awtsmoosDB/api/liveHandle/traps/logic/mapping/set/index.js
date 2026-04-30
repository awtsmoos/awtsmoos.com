
// B"H
class SetAction {
    static execute(state, receiver) {
        return (k, v) => {
            state.writer.set(k, v);
            return receiver;
        };
    }
}
module.exports = SetAction;
