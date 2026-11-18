const descriptions = {
  learning: ['Learn & grow', 'A proposed home for skills and learning resources, helping people explore their next step.'],
  work: ['Work & enterprise', 'A proposed space for work, enterprise and practical opportunities in Namibia.'],
  discover: ['Discover Namibia', 'A proposed gateway to local knowledge, places and experiences across Namibia.'],
  community: ['Everyday connections', 'A proposed starting point for useful information and community connections.'],
};
const dialog = document.querySelector('#service-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const [title, description] = descriptions[link.dataset.service];
      document.querySelector('#dialog-title').textContent = title;
      document.querySelector('#dialog-description').textContent = description;
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
}
const banner = document.querySelector('#connection-banner');
const showConnection = () => { if (banner) banner.hidden = navigator.onLine; };
showConnection();
addEventListener('online', showConnection);
addEventListener('offline', showConnection);
const status = document.querySelector('#offline-status');
const unavailable = () => {
  if (status) status.textContent = 'Offline saving is unavailable in this browser. You can still browse while connected.';
};
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    const watchInstall = () => {
      const worker = registration.installing;
      if (!worker) return;
      const checkState = () => {
        if (worker.state === 'redundant' && !registration.active) unavailable();
      };
      worker.addEventListener('statechange', checkState);
      checkState();
    };
    registration.addEventListener('updatefound', watchInstall);
    watchInstall();
    return navigator.serviceWorker.ready;
  }).then(() => {
    if (status) status.textContent = 'Public pilot pages saved for offline reading.';
  }).catch(unavailable);
} else if (status) status.textContent = 'This browser does not support offline saving. You can browse while connected.';
