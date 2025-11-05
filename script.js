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
