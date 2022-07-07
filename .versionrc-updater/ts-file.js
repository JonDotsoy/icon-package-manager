
/**
 * @param {string} contents 
 * @returns {string}
 */
module.exports.readVersion = function (_contents) {
    return ``
}

/**
 * @param {string} contents 
 * @param {string} version 
 * @return {string}
 */
module.exports.writeVersion = function (_contents, version) {
    return `export const version = "${version}";\n`
}
