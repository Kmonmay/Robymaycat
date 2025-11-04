const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const fishContainer = document.getElementById('fishContainer');
let drawing = false;
let currentColor = '#3399ff';
let fishList = [];

// 🎨 เปลี่ยนสี
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.getAttribute('data-color');
    document.querySelectorAll('.color-btn').forEach(b => b.style.border = '2px solid #fff');
    btn.style.border = '3px solid #333';
  });
});

// ✍️ ฟังก์ชันวาด
function startDraw(x, y) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(x, y) {
  if (!drawing) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function stopDraw() {
  drawing = false;
}

// 🖱️ เมาส์
canvas.addEventListener('mousedown', e => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener('mousemove', e => draw(e.offsetX, e.offsetY));
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

// 📱 ทัชสกรีน
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  startDraw(t.clientX - rect.left, t.clientY - rect.top);
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  draw(t.clientX - rect.left, t.clientY - rect.top);
});
canvas.addEventListener('touchend', stopDraw);

// 🧼 ล้างภาพ
document.getElementById('clearBtn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 🍽️ ให้อาหารแมว
document.getElementById('feedBtn').addEventListener('click', () => {
  const imageData = canvas.toDataURL('image/png');
  addFishToAquarium(imageData);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cat = document.getElementById('cat');
  cat.style.transform = 'scale(1.1) rotate(5deg)';
  setTimeout(() => cat.style.transform = 'scale(1) rotate(0deg)', 600);
});

function addFishToAquarium(imageData) {
  if (fishList.length >= 15) {
    fishList[0].remove(); // ลบตัวเก่าสุด
    fishList.shift();
  }

  const fish = document.createElement('img');
  fish.src = imageData;
  fish.classList.add('fish');

  // 🌊 จำกัดให้ปลาว่ายเฉพาะในโซนน้ำทะเล
  const seaTop = 40;   // จุดเริ่มของทะเล (เปอร์เซ็นต์จากบน)
  const seaHeight = 35; // ความสูงของทะเล (เปอร์เซ็นต์)
  fish.style.top = seaTop + Math.random() * seaHeight + '%';
  fish.style.left = Math.random() * 60 + '%';
  fish.style.animationDuration = (8 + Math.random() * 4) + 's';

  fishContainer.appendChild(fish);
  fishList.push(fish);
}
