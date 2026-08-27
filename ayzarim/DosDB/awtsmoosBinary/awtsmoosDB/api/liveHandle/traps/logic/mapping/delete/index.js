
// B"H
class DeleteAction {
    static execute(state) {
        return (k) => state.writer.delete(k);
    }
}
module.exports = DeleteAction;
