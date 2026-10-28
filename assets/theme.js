/* Tiny dependency-free theme controller, evaluated before styles to avoid a flash. */
(() => {
  'use strict';
  const KEY = 'ai-engineering-brief-theme';
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const stored = () => { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch { return null; } };
  const desired = () => stored() || (media && media.matches ? 'dark' : 'light');
  function apply(mode) {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    const bar = document.querySelector('meta[name="theme-color"]');
    if (bar) bar.content = mode === 'dark' ? '#0e1722' : '#f8fafc';
    const control = document.querySelector('.theme-toggle');
    if (control) {
      control.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      control.setAttribute('title', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      control.setAttribute('aria-pressed', String(mode === 'dark'));
      const text = control.querySelector('.theme-label');
      if (text) text.textContent = mode === 'dark' ? 'Dark' : 'Light';
    }
  }
  apply(desired());
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    apply(desired());
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, next); } catch {}
      apply(next);
    });
  });
  const refreshSystem = () => { if (!stored()) apply(desired()); };
  if (media) {
    if (media.addEventListener) media.addEventListener('change', refreshSystem);
    else if (media.addListener) media.addListener(refreshSystem);
  }
  window.addEventListener('storage', e => { if (e.key === KEY) apply(desired()); });
})();
