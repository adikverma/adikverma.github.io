export function initWindField() {
  const canvas = document.getElementById('wind-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const STREAM_COUNT = 72;
  const streams = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let running = false;
  let visible = true;
  let resizeTimer = 0;
  let strokeBase = 'rgba(243, 241, 237, 0.11)';
  let strokeWarm = 'rgba(255, 122, 69, 0.24)';

  const pointer = { x: -9999, y: -9999, active: false };

  function readColors() {
    const styles = getComputedStyle(document.documentElement);
    strokeBase = styles.getPropertyValue('--wind-stroke').trim() || strokeBase;
    strokeWarm = styles.getPropertyValue('--wind-accent').trim() || strokeWarm;
  }

  function seedStreams() {
    streams.length = 0;
    for (let i = 0; i < STREAM_COUNT; i += 1) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 48 + Math.random() * 92,
        speed: 0.28 + Math.random() * 0.44,
        amp: 6 + Math.random() * 14,
        freq: 0.004 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.12,
      });
    }
  }

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColors();
    if (streams.length === 0) {
      seedStreams();
    } else {
      for (const s of streams) {
        if (s.x > width + s.len) s.x = Math.random() * width;
        if (s.y > height) s.y = Math.random() * height;
      }
    }
  }

  function step(time) {
    if (!running) return;
    const t = time * 0.00055;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    const radius = 190;
    const radiusSq = radius * radius;

    for (let i = 0; i < streams.length; i += 1) {
      const s = streams[i];
      s.x += s.speed;
      s.y += s.drift;

      if (s.x - s.len > width + 20) {
        s.x = -s.len - Math.random() * 40;
        s.y = Math.random() * height;
      }
      if (s.y < -30) s.y = height + 20;
      if (s.y > height + 30) s.y = -20;

      const x0 = s.x - s.len;
      const x1 = s.x - s.len * 0.5;
      const x2 = s.x;

      const wave0 = Math.sin(x0 * s.freq + s.phase + t) * s.amp;
      const wave1 = Math.sin(x1 * s.freq + s.phase + t) * s.amp;
      const wave2 = Math.sin(x2 * s.freq + s.phase + t) * s.amp;

      let bend = 0;
      let near = false;
      if (pointer.active) {
        const dx = x1 - pointer.x;
        const dy = s.y + wave1 - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < radiusSq && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const falloff = 1 - dist / radius;
          const dir = dy >= 0 ? 1 : -1;
          bend = dir * falloff * falloff * 38;
          near = falloff > 0.22;
        }
      }

      ctx.strokeStyle = near ? strokeWarm : strokeBase;
      ctx.beginPath();
      ctx.moveTo(x0, s.y + wave0);
      ctx.quadraticCurveTo(x1, s.y + wave1 + bend, x2, s.y + wave2 + bend * 0.4);
      ctx.stroke();
    }

    rafId = window.requestAnimationFrame(step);
  }

  function start() {
    if (running || document.hidden || !visible || reducedMotion.matches) return;
    running = true;
    rafId = window.requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  measure();
  start();

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    },
    { passive: true }
  );

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 180);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  window.addEventListener('themechange', readColors);

  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) {
      stop();
      ctx.clearRect(0, 0, width, height);
    } else {
      measure();
      start();
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible) start();
      else stop();
    });
    observer.observe(canvas);
  }
}
