const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// ฟังก์ชันเริ่มวาด
function startDraw(x, y) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// ฟังก์ชันวาดต่อ
function draw(x, y) {
  if (!drawing) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = '#3399ff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// ฟังก์ชันหยุดวาด
function stopDraw() {
  drawing = false;
}

// 🖱️ รองรับเมาส์ (คอม)
canvas.addEventListener('mousedown', (e) => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener('mousemove', (e) => draw(e.offsetX, e.offsetY));
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

// 📱 รองรับนิ้วสัมผัส (มือถือ)
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  startDraw(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  draw(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener('touchend', stopDraw);

// 🧼 ปุ่มล้างภาพ
document.getElementById('clearBtn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 🍽️ ปุ่มให้อาหารแมว
document.getElementById('feedBtn').addEventListener('click', feedCat);

function feedCat() {
  const fish = document.createElement('img');
  fish.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'; // placeholder
  fish.classList.add('fish');
  document.body.appendChild(fish);

  const cat = document.getElementById('cat');
  cat.style.transform = 'scale(1.1) rotate(3deg)';

  setTimeout(() => {
    fish.remove();
    cat.style.transform = 'scale(1) rotate(0deg)';
  }, 2000);
}
