(() => {
  const $ = s => document.querySelector(s);
  const loader = $('.loader'), cur = $('.cursor');

  /* loader: hide on load, bring back on internal navigation */
  const hide = () => loader.classList.add('loader--hidden');
  addEventListener('load', hide);
  addEventListener('pageshow', e => e.persisted && hide());
  const go = url => { loader.classList.remove('loader--hidden'); setTimeout(() => (location.href = url), 450); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.getAttribute('href').startsWith('#') || e.metaKey || e.ctrlKey || a.target) return;
    e.preventDefault(); go(a.href);
  });

  /* trailing cursor */
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('mousemove', e => {
    if (!cur.classList.contains('live')) { cx = e.clientX; cy = e.clientY; cur.classList.add('live'); }
    x = e.clientX; y = e.clientY;
    cur.classList.toggle('hot', !!e.target.closest('a,.link,button'));
  });
  (function tick() {
    cx += (x - cx) * .16; cy += (y - cy) * .16;
    cur.style.translate = cx + 'px ' + cy + 'px';
    requestAnimationFrame(tick);
  })();

  /* magnetic menu links */
  document.querySelectorAll('.link').forEach(l => {
    const s = l.firstElementChild;
    l.addEventListener('mousemove', e => {
      const r = l.getBoundingClientRect();
      s.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px,${(e.clientY - r.top - r.height / 2) * .3}px) scale(1.1)`;
    });
    l.addEventListener('mouseleave', () => (s.style.transform = ''));
  });

  /* deck engine */
  const slides = [...document.querySelectorAll('.slide')];
  if (!slides.length) return;
  const hud = $('.hud'), bar = $('.progress i'), hub = $('.deck').dataset.hub || '../';
  const pad = n => String(n).padStart(2, '0');
  let i = 0;
  const show = n => {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); });
    hud.textContent = pad(i + 1) + ' / ' + pad(slides.length);
    bar.style.width = ((i + 1) / slides.length) * 100 + '%';
    history.replaceState(null, '', '#' + (i + 1));
  };
  const fromHash = () => (parseInt(location.hash.slice(1)) || 1) - 1;
  const keys = {
    ArrowRight: () => show(i + 1), ' ': () => show(i + 1), PageDown: () => show(i + 1),
    ArrowLeft: () => show(i - 1), PageUp: () => show(i - 1),
    Home: () => show(0), End: () => show(slides.length - 1),
    f: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()),
    Escape: () => { if (!document.fullscreenElement) go(hub); }
  };
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const fn = keys[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (fn) { e.preventDefault(); fn(); }
  });
  let tx = 0;
  addEventListener('touchstart', e => (tx = e.changedTouches[0].clientX), { passive: true });
  addEventListener('touchend', e => {
    const d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 50) show(d < 0 ? i + 1 : i - 1);
  });
  addEventListener('hashchange', () => show(fromHash()));
  show(fromHash());
})();
