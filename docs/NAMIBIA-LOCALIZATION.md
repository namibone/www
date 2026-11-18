# Namibia-first localisation readiness

## Scope and honesty

The NamibOne pilot uses English as the canonical authored language. The shared browser selector currently includes draft translations for Afrikaans, Portuguese (European), French, German, Setswana, Sesotho and Shona. These are **partial, unreviewed** translations, not production-certified language packs. Do not claim the 47 pages are fully localised.

The following Namibian languages are registered as **English-preview placeholders**, not translated releases: Oshindonga (`ng`), Oshikwanyama (`kj`), Otjiherero (`hz`), Khoekhoegowab (`naq`), Rukwangali (`kwn`) and Silozi (`loz`). Selecting one displays English text until reviewed translations are available. Avoid machine-invented financial, legal, medical or government translations.

## Architecture

- `assets/i18n.js`: shared locale registry, progressive dictionary fallback and local browser preference. No remote translation service, language detection analytics or personal-data transfer.
- `scripts/ui.mjs`: consistent selector across generated routes.
- Add new text keys to the English catalog first. Translate only approved strings; retain English fallback for missing keys.
- Preserve SVG icons and interactive DOM when translating; never render untrusted strings as HTML.
- Locale-specific `lang` attributes must reflect the **actual rendered text**. Current mixed-language pages require a per-element `lang` strategy before claiming complete accessibility.
- Use `Intl.NumberFormat`, `Intl.DateTimeFormat`, and `Intl.PluralRules` with tested locale support. Default Namibia currency is NAD; Botswana is BWP. Do not convert currency merely by changing language.
- Do not automatically translate user prompts, account details, legal notices, or regulated disclosures. Human review and product approval are prerequisites.

## Pilot acceptance criteria

1. Native-speaker review for each indigenous-language dictionary, including dialect and orthography choices.
2. Keyboard and screen-reader checks of the selector; ensure selected preference persists across routes and survives refresh.
3. No layout overflow for long translations at 320, 390, 768, 1024 and 1440 CSS pixels.
4. Test Unicode normalization, fonts, input composition, truncation, right-to-left readiness and reduced motion.
5. Run Playwright navigation tests with each supported locale and verify links, labels, form instructions and error messages.
6. Mark untranslated pages and sections clearly; do not imply that a language is fully supported.
7. Review privacy, consent, support, identity and payments language before any live deployment.
8. Keep country selection separate from language preference; do not infer citizenship or location from the browser language.

## Translation workflow

Use key-based JSON or JavaScript catalogs, translator/reviewer attribution, versioned terminology glossary, and release gates for completeness and linguistic QA. Prioritise English and Afrikaans, then Oshindonga, Oshikwanyama, Otjiherero, Khoekhoegowab, Rukwangali and Silozi for the Namibia pilot. Community and accessibility stakeholders should confirm further languages and variants.
