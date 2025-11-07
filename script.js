const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#000000";

// ✅ ให้ขนาด canvas สอดคล้องกับหน้าจอ
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

// 🖱 Mouse events
canvas.addEventListener("mousedown", (e) => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

// 📱 Touch events
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
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
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

// 🧠 ตรวจว่ารูปคล้ายปลา (ฉลาดพอดี เวอร์ชันเบา)
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

      if (points.length < 50) return resolve(false); // วาดน้อยเกิน

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const width = maxX - minX;
      const height = maxY - minY;

      // ✅ ตรวจสัดส่วนปลา: ยาวกว่ากว้างเล็กน้อย
      const ratio = width / height;
      if (ratio < 1.2 || ratio > 4.0) return resolve(false);

      // ✅ ตรวจความหนาแน่น (กันวาดมั่ว)
      const density = points.length / (width * height);
      if (density < 0.01 || density > 0.5) return resolve(false);

      // ✅ ตรวจว่ารูปไม่กระจายเป็นเส้น ๆ หลายจุด (มั่ว)
      let verticalVar = ys.reduce((a, b) => a + Math.pow(b - (minY + height / 2), 2), 0) / ys.length;
      if (verticalVar > (height * height) / 3) return resolve(false);

      // ✅ ผ่านทั้งหมด = ถือว่าเป็นปลา
      resolve(true);
    };
  });
}

// 🍽️ ปุ่ม Feed (ตรวจว่าผ่านไหม)
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

// 🫧 ฟองปกติ
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

// 🫧 ฟองแตก (ตอนแมวไม่กิน)
function spawnBubblePop() {
  const c = document.getElementById("bubbles");
  for (let i = 0; i < 6; i++) {
    const b = document.createElement("div");
    b.classList.add("pop-bubble");
    const s = 12 + Math.random() * 14;
    b.style.width = b.style.height = s + "px";
    b.style.left = Math.random() * 100 + "%";
    b.style.backgroundColor = `rgba(255,182,193,${0.5 + Math.random() * 0.3})`;
    c.appendChild(b);
    setTimeout(() => b.remove(), 800);
  }
}

// 🌊 Firebase (Public Aquarium)
if (window.db) {
  const dbRef = window.firebaseRef(window.db, "fishes");

  // ฟังก์ชันอัปโหลดภาพปลาไป Firebase
  async function uploadFish(imageData) {
    await window.firebasePush(dbRef, { image: imageData, time: Date.now() });
  }

  // ดึงข้อมูลปลาแบบเรียลไทม์จาก Firebase
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

  // เก็บฟังก์ชัน upload ไว้ให้ปุ่ม Feed ใช้งาน
  window.saveFish = uploadFish;
}
// ✅ แสดงสถานะ Firebase
const statusBadge = document.createElement("div");
statusBadge.id = "firebaseStatus";
statusBadge.style.position = "fixed";
statusBadge.style.bottom = "15px";
statusBadge.style.right = "15px";
statusBadge.style.padding = "8px 14px";
statusBadge.style.borderRadius = "12px";
statusBadge.style.fontSize = "0.9rem";
statusBadge.style.fontWeight = "bold";
statusBadge.style.color = "white";
statusBadge.style.background = "#888";
statusBadge.textContent = "Checking Firebase...";
document.body.appendChild(statusBadge);

try {
  const testRef = window.firebaseRef(window.db, "connection_test");
  await window.firebasePush(testRef, { connected: true, time: Date.now() });
  statusBadge.style.background = "#2ecc71"; // เขียว
  statusBadge.textContent = "🟢 Connected to Firebase";
} catch (error) {
  statusBadge.style.background = "#e74c3c"; // แดง
  statusBadge.textContent = "🔴 Firebase Offline";
  console.error("Firebase connection error:", error);
}

