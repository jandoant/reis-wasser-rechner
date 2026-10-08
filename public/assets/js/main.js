/**
 * Entry point: wires the router to the views and registers the service worker.
 */
import { getRice } from './data/rice.js';
import { redirectHome, startRouter } from './router.js';
import { mountDetail } from './views/detail.js';
import { mountHome } from './views/home.js';
import { mountSettings } from './views/settings.js';

const root = document.getElementById('app');
let cleanup = () => {};
let current = null;
let homeScrollY = 0;

function show(route) {
  if (route.name === 'rice' && !getRice(route.id)) route = { name: 'unknown' };
  if (route.name === 'unknown') return redirectHome();

  if (current === 'home') homeScrollY = window.scrollY;
  cleanup();

  if (route.name === 'home') {
    cleanup = mountHome(root);
    window.scrollTo(0, homeScrollY);
  } else if (route.name === 'settings') {
    cleanup = mountSettings(root);
    window.scrollTo(0, 0);
  } else {
    cleanup = mountDetail(root, getRice(route.id));
    window.scrollTo(0, 0);
  }
  current = route.name;
  root.focus({ preventScroll: true });
}

startRouter(show);

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline mode is optional */ });
  });
}
