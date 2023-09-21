-   production build where we put fonts that are actually used into a lockfile or load em into static/ folder
-   using [data-uris](https://css-tricks.com/data-uris/) we can inline the fonts to get instant loading which i guess improves UX and Web Vitals
-   another cool thing is to use `css2?text=` option where we first gather all the letters we actually use and then generate a font with only those letters
-   resolve issue with svelte preprocess and vite shenanigans where only changes to `tailwind.config.js` or `app.css` trigger page reload that updates the fonts
    -   also another question is why the fuck do we need full reload to load fonts and can't regular HMR handle that?
-   setup ci that runs `bash extract.sh` daily
-   write proper README lmao
-   handle these fonts manually for some reason our `extract.py` ain't picking em up
    -   [Open Sans](https://fonts.google.com/specimen/Open+Sans)
    -   [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans)
    -   [Roboto](https://fonts.google.com/specimen/Roboto)
-   another problem is we fuck up handling of variable fonts like [Inter](https://fonts.google.com/specimen/Inter?sort=popularity) where we create only `font-Inter-400`

    -   way to detect them is check that `axes` is not null
    -   if roboto is wght 100 to 900 generate range(100, 1000, 100)
    -   for any other axis generate dynamic utilities like eg for roboto `font-wdth-[75]` which in turn is `font-variation-settings: 'wdth' 75;`

        -   probably better to use css vars here tbh `font-wdth-[75]` would change `var(--font-roboto-wdth)`
        -   still [this](https://www.npmjs.com/package/tailwind-variable-font)
        -   also we may be should declare variable fonts separately: `font-Roboto-v` or `font-Roboto-var`

-   there are fallbacks defined in metadata we can may be add em to utils.json `font-family` key
