// Kiungo cha Node.js (kinachofuata mkataba wa kawaida wa tree-sitter-<lugha>).
const root = require("path").join(__dirname, "..", "..");

module.exports = require("node-gyp-build")(root);

try {
  module.exports.nodeTypeInfo = require("../../src/node-types.json");
} catch (_) {}
