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
    for (let i = 0; i < files.length; i++) {
        try {
            const fileContent = fs.readFileSync(files[i], "utf8");
            const lines = fileContent.split("\n");
            for (let j = 0; j < lines.length; j++) {
                let matches = lines[j].match(classNameRegex);
                if (matches) {
                    let [_, fontName, fontWeight, fontStyle] = matches;
                    let className_ = className(fontName, fontStyle, fontWeight);
                    used[className_] = [fontName, fontStyle, fontWeight];
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

const request = require("sync-request");

function createFontFaceAtRule(fontName, fontStyle, fontWeight) {
    if (fontStyle === "i") {
        fontStyle = "italic";
    } else {
        fontStyle = "normal";
    }

    fontWeight = parseInt(fontWeight);
    let fontNameExact = fonts[fontName][fontStyle][fontWeight];
    let url = fontFaceUrl(fontNameExact, fontStyle, fontWeight);

    let fontFace = undefined;

    const res = request("GET", url);
    fontFace = res.getBody("utf8");
    console.log(fontFace);

    fontFace = postcssjs.objectify(postcss.parse(fontFace));

    console.log("here fontFace");
    console.log(fontFace);

    let atRule = {
        "@import": {
            url: url,
        },
    };
    return fontFace;
}

function createFontFaceAtRules(used) {
    atRules = {};
    Object.keys(used).forEach((className_) => {
        let [fontName, fontStyle, fontWeight] = used[className_];
        let atRule = createFontFaceAtRule(fontName, fontStyle, fontWeight);
        atRules[Object.keys(atRule)[0]] = Object.values(atRule)[0];
        console.log("created atRule");
        console.log(atRule);
    });

    return atRules;

    // console.log(atRules.join("\n"));
    // return postcssjs.objectify(postcss.parse(atRules.join("\n")));
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

    return url;
}

function createUtilities() {
    let utilities = {};
    const fontNames = Object.keys(fonts);
    for (let i = 0; i < fontNames.length; i++) {
        const fontName = fontNames[i];
        const variants = fonts[fontName];
        const fontStyles = Object.keys(variants);
        for (let j = 0; j < fontStyles.length; j++) {
            const fontStyle = fontStyles[j];
            const variant = variants[fontStyle];
            const fontWeights = Object.keys(variant);
            for (let k = 0; k < fontWeights.length; k++) {
                const fontWeight = fontWeights[k];
                utilities[className(fontName, fontStyle, fontWeight)] = {
                    "font-family": fontName,
                    "font-weight": fontWeight,
                    "font-style": fontStyle === "i" ? "italic" : "normal",
                };
            }
        }
    }
    return utilities;
}

module.exports = {
    findUsedFontFaces,
    createFontFaceAtRules,
    createUtilities,
};
