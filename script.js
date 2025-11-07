(async function() {
const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#000000";

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// 🎨 สี
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentColor = btn.getAttribute("data-color");
    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ✏️ วาด
function startDraw(x, y) { drawing = true; ctx.beginPath(); ctx.moveTo(x, y); }
function draw(x, y) {
  if (!drawing) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.stroke();
}
function stopDraw() { drawing = false; }

canvas.addEventListener("mousedown", e => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener("mousemove", e => draw(e.offsetX, e.offsetY));
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const t = e.touches[0];
  startDraw(t.clientX - r.left, t.clientY - r.top);
});
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const t = e.touches[0];
  draw(t.clientX - r.left, t.clientY - r.top);
});
canvas.addEventListener("touchend", stopDraw);

document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 🧠 ตรวจว่าเป็นปลาหรือไม่ (เวอร์ชันเบา)
async function checkIfFish(imageData) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      const tmp = document.createElement("canvas");
      const tctx = tmp.getContext("2d");
      tmp.width = img.width;
      tmp.height = img.height;
      tctx.drawImage(img, 0, 0);
      const d = tctx.getImageData(0, 0, tmp.width, tmp.height);
      const points = [];
      for (let y = 0; y < tmp.height; y++) {
        for (let x = 0; x < tmp.width; x++) {
          const a = d.data[(y * tmp.width + x) * 4 + 3];
          if (a > 100) points.push({x, y});
        }
      }
      if (points.length < 60) return resolve(false);
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      const ratio = w / h;
      const density = points.length / (w * h);
      if (ratio < 0.8 || ratio > 5.5) return resolve(false);
      if (density < 0.005 || density > 0.6) return resolve(false);
      resolve(true);
    };
  });
}

// 🍽️ Feed
document.getElementById("feedBtn").addEventListener("click", async () => {
  const img = canvas.toDataURL("image/png");
  const isFish = await checkIfFish(img);

  if (!isFish) {
    showReaction("That’s not a fish… ew! 🐱💬");
    spawnBubblePop();
    return;
  }

  showReaction("Yummy! Thank you for the fish!");
  spawnBubbles();
  addFishToAquarium(img);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (window.saveFish) window.saveFish(img);
});

// 🐟 แสดงปลาในตู้
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

// 💬 ข้อความ
function showReaction(text) {
  const el = document.getElementById("reactionText");
  el.textContent = text;
  el.style.opacity = 1;
  setTimeout(() => (el.style.opacity = 0), 2000);
}

// 🫧 ฟอง
function spawnBubbles() {
  const c = document.getElementById("bubbles");
  for (let i = 0; i < 6; i++) {
    const b = document.createElement("div");
    b.classList.add("bubble");
    b.style.width = b.style.height = 8 + Math.random() * 10 + "px";
    b.style.left = Math.random() * 100 + "%";
    c.appendChild(b);
    setTimeout(() => b.remove(), 3000);
  }
}
function spawnBubblePop() {
  const c = document.getElementById("bubbles");
  for (let i = 0; i < 6; i++) {
    const b = document.createElement("div");
    b.classList.add("pop-bubble");
    b.style.width = b.style.height = 12 + Math.random() * 14 + "px";
    b.style.left = Math.random() * 100 + "%";
    c.appendChild(b);
    setTimeout(() => b.remove(), 800);
  }
}

// 🌊 Firebase (Public Aquarium)
if (window.db) {
  console.log("✅ Firebase connected! Preparing fish sync...");

  // อ้างอิงตำแหน่ง fishes ในฐานข้อมูล
  const dbRef = window.firebaseRef(window.db, "fishes");

  // 🐟 ฟังก์ชันอัปโหลดปลาไป Firebase
  async function uploadFish(imageData) {
    try {
      await window.firebasePush(dbRef, {
        image: imageData,
        time: Date.now(),
      });
      console.log("✅ Fish uploaded to Firebase!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  }

  // 🐠 โหลดปลาทั้งหมดแบบเรียลไทม์
  const queryRef = window.firebaseLimit(dbRef, 15); // ดึงปลาล่าสุด 15 ตัว
  window.firebaseOnValue(queryRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      console.log("🐾 No fish data yet");
      return;
    }

    console.log("🐟 Loading fish from Firebase:", Object.keys(data).length);
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

  // เก็บไว้ให้ปุ่ม Feed เรียกใช้งาน
  window.saveFish = uploadFish;
}
