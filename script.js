const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#000000";

// 🧠 ให้ขนาดของ canvas สอดคล้องกับจอมือถือ
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// 🎨 เลือกสี
document.querySelectorAll(".color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentColor = btn.getAttribute("data-color");
    document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// 🖱 Mouse event (คอม)
canvas.addEventListener("mousedown", (e) => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

// 📱 Touch event (มือถือ)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const pos = getTouchPos(e);
  startDraw(pos.x, pos.y);
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const pos = getTouchPos(e);
  draw(pos.x, pos.y);
});
canvas.addEventListener("touchend", stopDraw);

function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function startDraw(x, y) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
}
function draw(x, y) {
  if (!drawing) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.stroke();
}
function stopDraw() {
  drawing = false;
}

// 🧼 ล้างภาพ
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 🧠 ตรวจว่ารูปคล้ายปลา (ฉลาดพอดี)
async function checkIfFish(imageData) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      const tmpCanvas = document.createElement("canvas");
      const tmpCtx = tmpCanvas.getContext("2d");
      tmpCanvas.width = image.width;
      tmpCanvas.height = image.height;
      tmpCtx.drawImage(image, 0, 0);

      const imgData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      const w = tmpCanvas.width;
      const h = tmpCanvas.height;
      let points = [];

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const a = imgData.data[i + 3];
          if (a > 100) points.push({ x, y });
        }
      }

      // 🔹 ถ้าวาดน้อยเกินไป ไม่ใช่ปลาแน่
      if (points.length < 80) return resolve(false);

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const width = maxX - minX;
      const height = maxY - minY;

      // อัตราส่วนปลา (ยาวมากกว่ากว้าง)
      const ratio = width / height;
      if (ratio < 1.5 || ratio > 3.5) return resolve(false);

      // ความหนาแน่น (วาดบางเกินหรือทึบเกิน)
      const density = points.length / (width * height);
      if (density < 0.02 || density > 0.35) return resolve(false);

      // ความต่อเนื่องของเส้นแนวนอน (เพื่อกันเส้นมั่ว)
      let lineChanges = 0;
      let prevX = points[0].x;
      for (let i = 1; i < points.length; i++) {
        const dx = Math.abs(points[i].x - prevX);
        if (dx > 15) lineChanges++;
        prevX = points[i].x;
      }
      if (lineChanges > 40) return resolve(false); // มั่วเกินไป

      // ✅ ถ้าผ่านทุกเงื่อนไข ถือว่าเป็นปลา
      resolve(true);
    };
  });
}
document.getElementById("feedBtn").addEventListener("click", async () => {
  const img = canvas.toDataURL("image/png");

  // ตรวจว่ารูปคล้ายปลาไหม
  const isFish = await checkIfFish(img);

  if (!isFish) {
    showReaction("That’s not a fish… ew! 🐱💬");
    spawnBubblePop(); // เอฟเฟกต์ฟองแตก
    return;
  }

  showReaction("Yummy! Thank you for the fish!");
  spawnBubbles();
  addFishToAquarium(img);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (window.saveFish) window.saveFish(img);
});

// 🐟 เพิ่มปลาในตู้
const fishContainer = document.getElementById("fishContainer");
function addFishToAquarium(imageData) {
  const fish = document.createElement("img");
  fish.src = imageData;
  fish.classList.add("fish");
  fish.style.width = "120px";
  fish.style.top = 60 + Math.random() * 25 + "%";
  fish.style.left = Math.random() * 60 + "%";
  fish.style.animationDuration = (8 + Math.random() * 4) + "s";
  fishContainer.appendChild(fish);
}

// 💬 แสดงข้อความ
function showReaction(text) {
  const t = document.getElementById("reactionText");
  t.textContent = text;
  t.style.opacity = 1;
  setTimeout(() => (t.style.opacity = 0), 2000);
}

// 🫧 เอฟเฟกต์ฟอง
function spawnBubbles() {
  const c = document.getElementById("bubbles");
  for (let i = 0; i < 6; i++) {
    const b = document.createElement("div");
    b.classList.add("bubble");
    const s = 8 + Math.random() * 10;
    b.style.width = b.style.height = s + "px";
    b.style.left = Math.random() * 100 + "%";
    b.style.backgroundColor = `rgba(173,216,230,${0.5 + Math.random() * 0.3})`;
    b.style.animationDelay = Math.random() + "s";
    c.appendChild(b);
    setTimeout(() => b.remove(), 3000);
  }
}

// 🍽️ Feed ปลาลงน้ำ
document.getElementById("feedBtn").addEventListener("click", () => {
  const img = canvas.toDataURL("image/png");
  showReaction("Yummy! Thank you for the fish!");
  spawnBubbles();
  addFishToAquarium(img);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (window.saveFish) window.saveFish(img);
});

// 🌊 Firebase (แชร์ปลา)
if (window.db) {
  const dbRef = window.firebaseRef(window.db, "fishes");
  async function uploadFish(imageData) {
    await window.firebasePush(dbRef, { image: imageData, time: Date.now() });
  }
  window.firebaseOnValue(window.firebaseLimit(dbRef, 15), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    fishContainer.innerHTML = "";
    Object.values(data).forEach((fish) => {
      const fishImg = document.createElement("img");
      fishImg.src = fish.image;
      fishImg.classList.add("fish");
      fishImg.style.width = "120px";
      fishImg.style.top = 60 + Math.random() * 25 + "%";
      fishImg.style.left = Math.random() * 60 + "%";
      fishImg.style.animationDuration = (8 + Math.random() * 4) + "s";
      fishContainer.appendChild(fishImg);
    });
  });
  window.saveFish = uploadFish;
}

// 🎵 เพลง
const bg = document.getElementById("bgMusic");
if (bg) bg.volume = 0.3;
