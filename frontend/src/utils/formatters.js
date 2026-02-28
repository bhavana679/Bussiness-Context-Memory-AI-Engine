/**
 * Converts English digits to Devanagari digits if locale is Hindi.
 */
export const convertDigits = (str, i18n) => {
    if (!str) return '';
    if (!i18n || i18n.language !== 'hi') return str;

    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(str).replace(/[0-9]/g, (w) => devanagariDigits[+w]);
};

/**
 * Format currency with locale-aware digits
 */
export const formatCurrency = (val, i18n) => {
    if (val === undefined || val === null || isNaN(Number(val))) {
        val = 0;
    }
    const valNum = Number(val);
    const locale = (i18n && i18n.language === 'hi') ? 'hi-IN-u-nu-deva' : 'en-IN';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(valNum);
};

/**
 * Format number with locale-aware digits
 */
export const formatNumber = (val, i18n, fractionDigits = 0) => {
    if (val === undefined || val === null || isNaN(Number(val))) {
        val = 0;
    }
    const valNum = Number(val);
    const locale = (i18n && i18n.language === 'hi') ? 'hi-IN-u-nu-deva' : 'en-IN';
    return new Intl.NumberFormat(locale, {
        maximumFractionDigits: fractionDigits
    }).format(valNum);
};
