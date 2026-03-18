import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { installWKWebViewScrollFix } from '@/lib/wkwebview-scroll-fix';

describe('installWKWebViewScrollFix', () => {
  let scrollListeners: Array<() => void>;
  let originalUA: PropertyDescriptor | undefined;
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollListeners = [];
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll') {
        scrollListeners.push(handler as () => void);
      }
    });
    vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    originalUA = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalUA) {
      Object.defineProperty(navigator, 'userAgent', originalUA);
    }
  });

  function setUA(ua: string) {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      writable: true,
      configurable: true,
    });
  }

  function simulateScroll(scrollY: number) {
    Object.defineProperty(window, 'scrollY', {
      value: scrollY,
      writable: true,
      configurable: true,
    });
    scrollListeners.forEach((fn) => fn());
  }

  const IOS_CHROME_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/117.0.5938.117 Mobile/15E148 Safari/604.1';
  const IOS_SAFARI_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const DESKTOP_CHROME_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

  it('does not install on desktop browsers', () => {
    setUA(DESKTOP_CHROME_UA);
    installWKWebViewScrollFix();
    expect(scrollListeners).toHaveLength(0);
  });

  it('does not install on iOS Safari', () => {
    setUA(IOS_SAFARI_UA);
    installWKWebViewScrollFix();
    expect(scrollListeners).toHaveLength(0);
  });

  it('installs scroll listener on iOS Chrome', () => {
    setUA(IOS_CHROME_UA);
    installWKWebViewScrollFix();
    expect(scrollListeners).toHaveLength(1);
  });

  it('restores scroll position when jump from >150 to 0 is detected', () => {
    setUA(IOS_CHROME_UA);
    installWKWebViewScrollFix();

    // User scrolls to 202
    simulateScroll(202);
    expect(scrollToSpy).not.toHaveBeenCalled();

    // WKWebView bug: sudden jump to 0
    simulateScroll(0);
    expect(scrollToSpy).toHaveBeenCalledWith(0, 202);
  });

  it('does not interfere with normal scroll to top (gradual)', () => {
    setUA(IOS_CHROME_UA);
    installWKWebViewScrollFix();

    // User scrolls down
    simulateScroll(200);
    // User scrolls up gradually
    simulateScroll(100);
    simulateScroll(50);
    simulateScroll(0);

    // No restoration — this was a gradual scroll, not a jump
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('does not interfere with small scroll positions jumping to 0', () => {
    setUA(IOS_CHROME_UA);
    installWKWebViewScrollFix();

    // User is at a small scroll position
    simulateScroll(50);
    // Jumps to 0 — this is normal bounce, not the bug
    simulateScroll(0);

    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});
