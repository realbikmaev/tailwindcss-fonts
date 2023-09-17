let plugin = require("tailwindcss/plugin");
let extract = require("./extract");

module.exports = plugin(function ({ addUtilities, addBase }) {
    let utilities = extract.createUtilities();
    addUtilities(utilities);
    console.log("final utilities");
    console.log(utilities);
    // let fontFaces = extract.findUsedFontFaces();
    // let atRules = extract.createFontFaceAtRules(fontFaces);
    // console.log("final atRules");
    // console.log(atRules);
    // addBase(atRules);
});
