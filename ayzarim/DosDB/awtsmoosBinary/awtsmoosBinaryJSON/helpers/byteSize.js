//B"H
function byteSize(number) {
    return Math.ceil(
        Math.log2(number + 1) / 8
    )

}

module.exports = byteSize;