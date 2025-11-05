// 🎨 Draw system (works on both PC & Mobile)
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';

// Color selection
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.getAttribute('data-color');
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// 🖱 Mouse events
canvas.addEventListener('mousedown', e => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener('mousemove', e => draw(e.offsetX, e.offsetY));
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

// 📱 Touch events (fixed for mobile)
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const pos = getTouchPos(e);
  startDraw(pos.x, pos.y);
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const pos = getTouchPos(e);
  draw(pos.x, pos.y);
});
canvas.addEventListener('touchend', stopDraw);

function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function startDraw(x, y) {
  drawing = true;
  ctx.beginPa
