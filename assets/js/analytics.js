// Google Analytics 4 (gtag.js) configuration.
// TODO: replace 'G-XXXXXXXXXX' below with the real GA4 Measurement ID once
// the property exists (analytics.google.com > Admin > Data Streams > Web).
// The <script async src="...?id=G-XXXXXXXXXX"> tag in each page's <head>
// also needs the same real ID swapped in — that part can't be centralized
// here, Google's loader requires it inline per page.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');
