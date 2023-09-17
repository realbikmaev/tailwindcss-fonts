let plugin = require("tailwindcss/plugin");
let extract = require("./extract");

module.exports = plugin(function ({ addUtilities, addBase }) {
    let utilities = extract.createUtilities();
    addUtilities(utilities);
    console.log("import utils");
    let fontFaces = extract.findUsedFontFaces();
    let atRules = extract.createFontFaceAtRules(fontFaces);
    console.log(atRules);
    addBase(atRules);
});
