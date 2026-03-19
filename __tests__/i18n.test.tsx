import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';

import { LanguageProvider, useLocale, useT, useToggleLocale } from '@/lib/i18n';

function TestConsumer() {
  const locale = useLocale();
  const t = useT();
  const toggleLocale = useToggleLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="label">{t('nav.today')}</span>
      <button onClick={toggleLocale}>toggle</button>
    </div>
  );
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-locale');
  });

  it('defaults to zh when no data-locale attribute', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('locale').textContent).toBe('zh');
    expect(screen.getByTestId('label').textContent).toBe('今日');
  });

  it('reads data-locale="en" on init', () => {
    document.documentElement.setAttribute('data-locale', 'en');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('label').textContent).toBe('Today');
  });

  it('toggleLocale switches from zh to en', async () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(localStorage.getItem('locale')).toBe('en');
  });

  it('toggleLocale switches from en back to zh', async () => {
    document.documentElement.setAttribute('data-locale', 'en');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('locale').textContent).toBe('zh');
    expect(localStorage.getItem('locale')).toBe('zh');
  });
});
