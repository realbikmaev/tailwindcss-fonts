// const fetch = require("node-fetch");
const fs = require("fs");
const walkdir = require("walkdir");
const fonts = require("./fonts");
const postcssjs = require("postcss-js");
const postcss = require("postcss");

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

function findUsedFontFaces(rootSrcDir = "./src") {
    let classNameRegex = /font-([^-]+)-(\d+)\-?([i])?/;

    let files = walkdir.sync(rootSrcDir);

    used = {};
    files.forEach((file) => {
        const fileContent = fs.readFileSync(file, "utf8");
        const lines = fileContent.split("\n");
        lines.forEach((line) => {
            let matches = line.match(classNameRegex);
            if (matches) {
                let [_, fontName, fontWeight, fontStyle] = matches;
                let className_ = className(fontName, fontStyle, fontWeight);
                used[className_] = [fontName, fontStyle, fontWeight];
            }
        });
    });

    return used;
}

function createFontFaceAtRule(fontName, fontStyle, fontWeight) {
    if (fontStyle === "i") {
        fontStyle = "italic";
    } else {
        fontStyle = "normal";
    }

    fontWeight = parseInt(fontWeight);
    let fontNameExact = fonts[fontName][fontStyle][fontWeight];
    let url = fontFaceUrl(fontNameExact, fontStyle, fontWeight);
    let fontFace = "";
    fetch(url).then((res) => {
        fontFace = res.text();
    });
    let atRule = postcssjs.objectify(postcss.parse(fontFace));
    return atRule;
}

function createFontFaceAtRules(used) {
    let atRules = {};
    Object.keys(used).forEach((className_) => {
        let [fontName, fontStyle, fontWeight] = used[className_];
        let atRule = createFontFaceAtRule(fontName, fontStyle, fontWeight);
        atRules[fontName] = atRule;
    });
    return atRules;
}

function fontFaceUrl(fontName, fontStyle, fontWeight) {
    let url =
        "https://fonts.googleapis.com/css2?family=" +
        fontName.replace(/\s/g, "+");

    if (fontStyle === "i") {
        url += ":ital,wght@";
        url += `1,${fontWeight}`;
    } else {
        url += ":wght@";
        url += `${fontWeight}`;
    }

    return `url("${url}")`;
}

function createUtilities() {
    let utilities = {};
    Object.keys(fonts).forEach((fontName) => {
        let variants = fonts[fontName];
        Object.keys(variants).forEach((fontStyle) => {
            let variant = fonts[fontName][fontStyle];
            Object.keys(variant).forEach((fontWeight) => {
                utilities[className(fontName, fontStyle, fontWeight)] = {
                    "font-family": fontName,
                    "font-weight": fontWeight,
                    "font-style": fontStyle === "i" ? "italic" : "normal",
                };
            });
        });
    });
    return utilities;
}

module.exports = {
    findUsedFontFaces,
    createFontFaceAtRules,
    createUtilities,
};
