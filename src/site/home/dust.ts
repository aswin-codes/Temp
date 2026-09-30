/**
 * Slow-rising dust motes on a canvas, ~30fps, paused while off screen.
 * Returns a stop function.
 */
export function startDust(cv: HTMLCanvasElement, count: number): () => void {
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  let W = 0, H = 0, visible = true, last = 0, raf = 0;

  const size = () => {
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();

  const motes = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.3 + 0.3,
    vx: (Math.random() - 0.5) * 0.14,
    vy: -(Math.random() * 0.2 + 0.04),
    a: Math.random() * 0.45 + 0.12,
  }));

  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible || t - last < 33) return;
    last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f4e3d2";
    for (const p of motes) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  raf = requestAnimationFrame(loop);

  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(cv);
  window.addEventListener("resize", size);
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("resize", size);
  };
}
