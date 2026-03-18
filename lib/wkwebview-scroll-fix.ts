/**
 * Workaround for a WKWebView bug where scroll position snaps to 0
 * after content height changes dynamically (e.g., expanding a collapsible section)
 * and the user scrolls to near the bottom boundary.
 *
 * Only activates on iOS non-Safari browsers (Chrome, WeChat, etc.) which use WKWebView.
 * Detects the sudden jump from >150 to 0 and restores the previous position.
 * Does not affect bounce/overscroll behavior.
 */
export function installWKWebViewScrollFix(): void {
  if (typeof window === 'undefined') return;

  const ua = navigator.userAgent;
  const isIOS = /iP(hone|ad|od)/.test(ua);
  const isSafari = /Version\//.test(ua) && /Safari\//.test(ua);

  // Only needed on iOS WKWebView browsers (Chrome, WeChat, etc.)
  if (!isIOS || isSafari) return;

  let prevScrollY = 0;
  let restoring = false;

  window.addEventListener(
    'scroll',
    () => {
      if (restoring) return;

      const y = window.scrollY;

      // Detect WKWebView scroll snap-back: sudden jump from >150 to 0
      if (y === 0 && prevScrollY > 150) {
        restoring = true;
        window.scrollTo(0, prevScrollY);
        requestAnimationFrame(() => {
          restoring = false;
        });
        return;
      }

      prevScrollY = y;
    },
    { passive: true }
  );
}
