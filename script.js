const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const fishContainer = document.getElementById('fishContainer');
let drawing = false;
let currentColor = '#000000';
let fishList = JSON.parse(localStorage.getItem('myFish')) || [];

// 🎨 เปลี่ยนสี
const colorButtons = document.querySelectorAll('.color-btn');
colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.getAttribute('data-color');
    colorButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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
  ctx.lineWidth = 5;
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

// 🍽️ ปุ่ม Feed → ตรวจว่าเป็นปลาไหม ก่อนปล่อยลงน้ำ
document.getElementById('feedBtn').addEventListener('click', async () => {
  const imageData = canvas.toDataURL('image/png');

  const isFish = await checkIfFish(imageData);
  if (!isFish) {
    alert("Oops! That doesn’t look like a fish. Try drawing again :)");
    return;
  }

  addFishToAquarium(imageData);
  saveFish(imageData);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 🧠 ตรวจว่าเป็นปลาไหม (ใช้ Hugging Face API)
async function checkIfFish(imageData) {
  const API_URL = "https://api-inference.huggingface.co/models/cafeai/sketch-image-classification";
  const TOKEN = "hf_your_api_token_here"; // ใช้ token ของเธอที่ได้จาก Hugging Face

  // 🧠 ขั้นตอนที่ 1: ส่งให้ AI ตรวจ
  let isAIThinkFish = false;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: imageData })
    });

    const data = await res.json();
    const predictions = data[0];
    const fishLike = predictions.find(p =>
      p.label.toLowerCase().includes("fish") ||
      p.label.toLowerCase().includes("aquatic")
    );

    if (fishLike && fishLike.score > 0.5) {
      isAIThinkFish = true;
    }
  } catch (e) {
    console.error("AI check failed:", e);
  }

  // 🧮 ขั้นตอนที่ 2: ตรวจลักษณะรูปทรงพื้นฐาน
  const img = new Image();
  img.src = imageData;
  await new Promise(r => img.onload = r);

  const tempCanvas = document.createElement('canvas');
  const tctx = tempCanvas.getContext('2d');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tctx.drawImage(img, 0, 0);

  const imgData = tctx.getImageData(0, 0, img.width, img.height);
  let pixelCount = 0;
  let minX = img.width, maxX = 0, minY = img.height, maxY = 0;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const alpha = imgData.data[i + 3];
    if (alpha > 20) {
      pixelCount++;
      const pixelIndex = i / 4;
      const x = pixelIndex % img.width;
      const y = Math.floor(pixelIndex / img.width);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const aspectRatio = width / (height || 1);

  // 🔍 กฎเพิ่มเติม
  const hasShape = pixelCount > 400;            // ต้องมีเส้นมากพอ
  const isWide = aspectRatio > 1.3;             // ต้องกว้างกว่าแนวตั้ง
  const isNotLine = width > 50 && height > 30;  // ต้องมีรูปร่าง ไม่ใช่เส้นบาง ๆ

  // ✅ ผ่านก็ต่อเมื่อ AI คิดว่าเป็นปลา และรูปร่างเข้าเกณฑ์
  return isAIThinkFish && hasShape && isWide && isNotLine;
}

// 🐟 เพิ่มปลาลงในน้ำ
function addFishToAquarium(imageData) {
  if (fishList.length >= 15) {
    fishList[0].remove();
    fishList.shift();
  }

  const fish = document.createElement('img');
  fish.src = imageData;
  fish.classList.add('fish');

  const seaTop = 40;
  const seaHeight = 60;
  fish.style.top = seaTop + Math.random() * seaHeight + '%';
  fish.style.left = Math.random() * 60 + '%';
  fish.style.animationDuration = (8 + Math.random() * 4) + 's';

  fishContainer.appendChild(fish);
  fishList.push(fish);
}

// 💾 เก็บปลาไว้ใน localStorage
function saveFish(imageData) {
  let myFish = JSON.parse(localStorage.getItem('myFish')) || [];
  myFish.push(imageData);
  localStorage.setItem('myFish', JSON.stringify(myFish));
}

// 🐠 ปุ่มดูปลา
const modal = document.getElementById('fishListModal');
const listContainer = document.getElementById('fishList');
document.getElementById('viewBtn').addEventListener('click', () => {
  listContainer.innerHTML = '';
  const storedFish = JSON.parse(localStorage.getItem('myFish')) || [];
  if (storedFish.length === 0) {
    listContainer.innerHTML = '<p>No fish yet!</p>';
  } else {
    storedFish.forEach(img => {
      const el = document.createElement('img');
      el.src = img;
      listContainer.appendChild(el);
    });
  }
  modal.style.display = 'flex';
});

document.getElementById('closeModal').addEventListener('click', () => {
  modal.style.display = 'none';
});
