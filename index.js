const plugin = require("tailwindcss/plugin");
const fs = require("fs");
const walkdir = require("walkdir");
const postcss = require("postcss");
const postcssjs = require("postcss-js");

module.exports = plugin(function ({ addUtilities, addBase }) {
    function className(fontName, fontStyle, fontWeight) {
        fontName = fontName.replace(/\s/g, "");
        if (fontStyle === "italic") {
            fontStyle = "i";
        }
        if (fontStyle === "normal") {
            fontStyle = "";
        }
        const clazz = `.font-${fontName}-${fontWeight}`;
        if (fontStyle === "i") {
            return `${clazz}-i`;
        }
        return clazz;
    }

    let filez = "";

    function findUsedFontFaces(rootSrcDir = "./src") {
        const classNameRegex = /font-([^-]+)-(\d+)-?([i])?/g;
        const files = walkdir.sync(rootSrcDir);
        const used = [];

        for (const file of files) {
            filez += file + "\n";
            try {
                const fileContent = fs.readFileSync(file, "utf8");
                filez += fileContent + "\n";
                let matches;
                while ((matches = classNameRegex.exec(fileContent)) !== null) {
                    const [, fontName, fontWeight, fontStyle] = matches;
                    const className_ = className(
                        fontName,
                        fontStyle,
                        fontWeight
                    );
                    if (!used.includes(className_)) {
                        used.push(className_);
                    }
                }
            } catch (err) {
                if (err.code === "EISDIR") {
                    continue;
                }
            }
        }

        return used;
    }

    function getAtRules(fontFaces, usedFontFaces, addBase) {
        for (const usedFontFace of usedFontFaces) {
            const fontFace = fontFaces[usedFontFace];
            if (fontFace) {
                addBase(postcssjs.objectify(postcss.parse(fontFace)));
            }
        }
    }

    let utils = require("./utils.json");
    addUtilities(utils);
    let usedFontFaces = findUsedFontFaces("./src");
    let fontFaces = require("./fonts.json");
    getAtRules(fontFaces, usedFontFaces, addBase);
});
