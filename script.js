const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let drawing = false;
let currentColor = "#000000";

// ✅ ขนาดคงที่เพื่อความเสถียร (ไม่ต้อง resize อัตโนมัติ)
canvas.width = 400;
canvas.height = 300;

// 🎨 ตั้งสีเริ่มต้นเป็นดำ
document.querySelector(".color-btn.black").classList.add("active");

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

// 📱 Touch events (มือถือ)
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
  ctx.lineJoin = "round";
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
      tmpCanvas.width = i
