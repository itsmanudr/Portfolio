(() => {
  const track = document.querySelector('.scroll-flight');
  const marker = track?.querySelector('.scroll-flight-marker');
  if (!marker) return;

  let queued = false;
  function update() {
    queued = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    const progress = range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0;
    const travel = Math.max(0, track.clientHeight - marker.offsetHeight);
    marker.style.transform = `translate3d(0, ${progress * travel}px, 0)`;
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  addEventListener('pageshow', schedule);
  document.addEventListener('motionchange', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  update();
})();
