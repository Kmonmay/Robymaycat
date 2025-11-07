(async function () {
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

  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentColor = btn.getAttribute("data-color");
      document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  document.getElementById("feedBtn").addEventListener("click", async () => {
  console.log("🐾 Feed button clicked!");
});


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

  document.getElementById("clearBtn").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // 🧠 ตรวจว่ารูปคล้ายปลา (ฉลาดพอดี เวอร์ชันสมดุล)
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

      if (points.length < 150) return resolve(false); // ต้องมีเส้นเพียงพอ

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      const ratio = w / h;
      const density = points.length / (w * h);

      // ✅ เงื่อนไข "สมดุล" สำหรับรูปร่างปลา
      // ยาวกว่าเล็กน้อย, ไม่หนาแน่นเกินไป, มีความต่อเนื่อง
      if (ratio < 1.3 || ratio > 3.5) return resolve(false);
      if (density < 0.02 || density > 0.25) return resolve(false);

      // ✅ ตรวจสอบความต่อเนื่อง (ไม่กระจายเป็นหลายก้อน)
      const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
      const varianceY = ys.reduce((a, b) => a + Math.pow(b - avgY, 2), 0) / ys.length;
      const continuity = Math.sqrt(varianceY) / h;
      if (continuity > 0.45) return resolve(false);

      resolve(true);
    };
  });
}

  const fishContainer = document.getElementById("fishContainer");
 // 🐟 เพิ่มปลาในตู้ (ว่ายไป-ว่ายมาในพื้นที่ของตัวเอง)
function addFishToAquarium(imageData) {
  const fish = document.createElement("img");
  fish.src = imageData;
  fish.classList.add("fish");
  fish.style.position = "absolute";
  fish.style.width = 80 + Math.random() * 60 + "px"; // ขนาดต่างกัน
  fish.style.top = 40 + Math.random() * 40 + "%"; // กระจายตำแหน่งแนวตั้ง
  fish.style.left = 10 + Math.random() * 70 + "%"; // เริ่มตรงไหนก็ได้
  fish.style.opacity = 0.9;
  fish.style.transition = "transform 1s linear";
  fishContainer.appendChild(fish);

  // 🐠 ฟังก์ชันว่ายไปมาแบบสุ่ม
  function swim() {
    const randomX = 10 + Math.random() * 80; // %
    const randomY = 40 + Math.random() * 40; // %
    const duration = 6000 + Math.random() * 4000; // 6–10 วินาที
    const flip = Math.random() < 0.5 ? "scaleX(1)" : "scaleX(-1)";

    // ใช้ CSS transition เดินทางอย่างลื่น
    fish.style.transition = `top ${duration}ms ease-in-out, left ${duration}ms ease-in-out, transform 1s ease`;
    fish.style.top = `${randomY}%`;
    fish.style.left = `${randomX}%`;
    fish.style.transform = flip;

    // สั่งให้มันว่ายต่อเนื่อง
    setTimeout(swim, duration);
  }

  // เริ่มว่ายหลังเพิ่มลง DOM
  setTimeout(swim, 1000 + Math.random() * 2000);
}


  function showReaction(text) {
    const el = document.getElementById("reactionText");
    el.textContent = text;
    el.style.opacity = 1;
    setTimeout(() => (el.style.opacity = 0), 2000);
  }

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
    console.log("✅ Firebase connected successfully");
    const db = window.db;
    const dbRef = window.firebaseRef(db, "fishes");

    const { query, limitToLast } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js");

    async function uploadFish(imageData) {
      try {
        const fishData = { image: imageData, time: Date.now(), user: navigator.userAgent };
        await window.firebasePush(dbRef, fishData);
        console.log("✅ Fish uploaded successfully");
      } catch (err) {
        console.error("❌ Upload failed:", err);
      }
    }

    const queryRef = query(dbRef, limitToLast(20));
    window.firebaseOnValue(queryRef, (snapshot) => {
      const data = snapshot.val();
      fishContainer.innerHTML = "";
      if (!data) return;
      Object.values(data).forEach((fish) => addFishToAquarium(fish.image));
    });

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
      await uploadFish(img);
    });
  }

  const bg = document.getElementById("bgMusic");
  if (bg) bg.volume = 0.3;
})();
