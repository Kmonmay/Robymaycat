(async function () {
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let currentColor = "#000000";

  // ✅ ปรับขนาด canvas ให้เหมาะกับจอ
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

  // ✏️ วาดเส้น
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
  function stopDraw() { drawing = false; }

  canvas.addEventListener("mousedown", (e) => startDraw(e.offsetX, e.offsetY));
  canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  // 📱 Touch (มือถือ)
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    startDraw(t.clientX - rect.left, t.clientY - rect.top);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    draw(t.clientX - rect.left, t.clientY - rect.top);
  });
  canvas.addEventListener("touchend", stopDraw);

  // 🧼 ปุ่ม Clear
  document.getElementById("clearBtn").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // 🧠 ตรวจว่ารูปคล้ายปลา (เวอร์ชันสมดุล)
  async function checkIfFish(imageData) {
    return new Promise((resolve) => {
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
            if (a > 100) points.push({ x, y });
          }
        }

        if (points.length < 150) return resolve(false);
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const w = Math.max(...xs) - Math.min(...xs);
        const h = Math.max(...ys) - Math.min(...ys);
        const ratio = w / h;
        const density = points.length / (w * h);

        if (ratio < 1.3 || ratio > 3.5) return resolve(false);
        if (density < 0.02 || density > 0.25) return resolve(false);

        const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
        const varianceY = ys.reduce((a, b) => a + Math.pow(b - avgY, 2), 0) / ys.length;
        const continuity = Math.sqrt(varianceY) / h;
        if (continuity > 0.45) return resolve(false);

        resolve(true);
      };
    });
  }

  const fishContainer = document.getElementById("fishContainer");

  // 💬 ฟังก์ชันแสดงข้อความ (Reaction)
  function showReaction(text) {
    const el = document.getElementById("reactionText");
    if (!el) return;
    el.textContent = text;
    el.style.opacity = 1;
    el.style.transition = "opacity 0.5s ease";
    setTimeout(() => (el.style.opacity = 0), 2000);
  }

  // 🐟 เพิ่มปลาในตู้ (พร้อมแตะให้ว่ายเร็วขึ้น)
  function addFishToAquarium(imageData) {
    const fish = document.createElement("img");
    fish.src = imageData;
    fish.classList.add("fish");
    fish.style.position = "absolute";
    fish.style.width = 80 + Math.random() * 60 + "px";
    fish.style.top = 50 + Math.random() * 45 + "%"; // ครึ่งล่างของจอ
    fish.style.left = 10 + Math.random() * 70 + "%";
    fish.style.opacity = 0.9;
    fish.style.transition = "top 8s ease-in-out, left 8s ease-in-out, transform 1s ease";
    fishContainer.appendChild(fish);

    function swim() {
      const randomX = 10 + Math.random() * 80;
      const randomY = 50 + Math.random() * 45;
      const duration = 7000 + Math.random() * 5000;
      const flip = Math.random() < 0.5 ? "scaleX(1)" : "scaleX(-1)";
      fish.style.transition = `top ${duration}ms ease-in-out, left ${duration}ms ease-in-out, transform 1s ease`;
      fish.style.top = `${randomY}%`;
      fish.style.left = `${randomX}%`;
      fish.style.transform = flip;

      if (Math.random() > 0.6) spawnTinyBubble(fish);
      setTimeout(swim, duration);
    }

    // 🩵 แตะแล้วว่ายเร็วขึ้น 2 วิ
    function speedBoost() {
      fish.style.transition = `top 2000ms ease-in-out, left 2000ms ease-in-out, transform 0.6s ease`;

      const randomX = 10 + Math.random() * 80;
      const randomY = 50 + Math.random() * 45;
      const flip = Math.random() < 0.5 ? "scaleX(1)" : "scaleX(-1)";
      fish.style.top = `${randomY}%`;
      fish.style.left = `${randomX}%`;
      fish.style.transform = flip;

      spawnTinyBubble(fish, true);

      setTimeout(() => {
        fish.style.transition = "top 8s ease-in-out, left 8s ease-in-out, transform 1s ease";
      }, 2000);
    }

    // 🎈 ฟองน้ำรอบปลา
    function spawnTinyBubble(fish, boosted = false) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
      bubble.style.position = "absolute";
      bubble.style.width = bubble.style.height = (boosted ? 8 : 4) + Math.random() * (boosted ? 8 : 4) + "px";
      bubble.style.left = fish.style.left;
      bubble.style.top = fish.style.top;
      bubble.style.backgroundColor = "rgba(173,216,230,0.6)";
      bubble.style.borderRadius = "50%";
      fishContainer.appendChild(bubble);

      bubble.animate(
        [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-40px)", opacity: 0 }],
        { du
