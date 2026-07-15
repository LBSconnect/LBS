// Google Analytics 4 (gtag.js) configuration.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-XFCXVR2BFX');

// Fires begin_checkout whenever a visitor clicks through to Stripe, on any
// page. Delegated on document so product pages don't need their own
// listener wired up per button.
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a[href*="checkout.lbs4.com"]');
  if (!link) return;
  var url = new URL(link.href, window.location.href);
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    items: [{ item_id: url.searchParams.get('client_reference_id') || 'unknown' }],
  });
});

// Fires purchase exactly once per Stripe session, even if the confirmation
// page is reloaded, bookmarked, or revisited later (GA4 does not dedupe
// repeated purchase events with the same transaction_id on its own).
function gaTrackPurchaseOnce(transactionId, value, items) {
  var key = 'ga_purchase_' + transactionId;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
  } catch (e) { /* localStorage unavailable — fire anyway, worst case is a rare double-count */ }
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'USD',
    items: items,
  });
}
