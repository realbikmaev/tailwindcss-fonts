let plugin = require("tailwindcss/plugin");
let extract = require("./extract");

module.exports = plugin(function ({ addUtilities, addBase }) {
    let utilities = extract.createUtilities();
    console.log(utilities);
    addUtilities(utilities);
    let fontFaces = extract.findUsedFontFaces();
    let atRules = extract.createFontFaceAtRules(fontFaces);
    console.log(atRules);
    addBase(atRules);
});
