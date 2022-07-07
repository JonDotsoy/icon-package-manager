
module.exports.readVersion = function (contents) {
    return ``
}

/**
 * @param {string} contents 
 * @param {string} version 
 * @return {string}
 */
module.exports.writeVersion = function (contents, version) {
    return `export const version = "${version}";\n`
}
