export function setupCommonShell() {
  const announcer = document.getElementById('route-announcer');
  const focusDestination = (hash = location.hash) => {
    if (!hash || hash === '#main') return;
    const destination = document.querySelector<HTMLElement>(hash);
    const heading = destination?.matches('h1, h2') ? destination : destination?.querySelector<HTMLElement>('h1, h2');
    if (!destination || !heading) return;
    destination.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    if (announcer) announcer.textContent = heading.textContent ?? 'Page section changed';
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      event.preventDefault();
      history.pushState({ hash }, '', hash);
      focusDestination(hash);
    });
  });
  addEventListener('popstate', () => focusDestination());
  if (location.hash) requestAnimationFrame(() => focusDestination());
}

export function registerServiceWorker() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
  }
}
