(async function () {
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let currentColor = "#000000";

  // ✅ ปรับขนาด canvas ให้เหมาะกับหน้าจอ
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
  function stopDraw() {
    drawing = false;
  }

  // 🖱 Mouse Events
  canvas.addEventListener("mousedown", (e) => startDraw(e.offsetX, e.offsetY));
  canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  // 📱 Touch Events (มือถือ)
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

  // 🧠 ตรวจว่ารูปคล้ายปลา (ฉลาดพอดี)
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
        if (points.length < 60) return resolve(false);
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const w = Math.max(...xs) - Math.min(...xs);
        const h = Math.max(...ys) - Math.min(...ys);
        const ratio = w / h;
        const density = points.length / (w * h);
        if (ratio < 1.1 || ratio > 4.5) return resolve(false);
        if (density < 0.01 || density > 0.5) return resolve(false);
        resolve(true);
      };
    });
  }

  // 🍽️ ปุ่ม Feed
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

  // 💬 ข้อความแสดงผล
  function showReaction(text) {
    const el = document.getElementById("reactionText");
    el.textContent = text;
    el.style.opacity = 1;
    setTimeout(() => (el.style.opacity = 0), 2000);
  }

  // 🫧 เอฟเฟกต์ฟอง
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
  console.log("✅ Firebase connected, syncing fish...");

  const dbRef = window.firebaseRef(window.db, "fishes");

  // 🐟 อัปโหลดปลาไป Firebase
  async function uploadFish(imageData) {
    try {
      const fishData = { 
        image: imageData, 
        time: Date.now(), 
        user: navigator.userAgent // ✅ บันทึกชื่อเครื่องไว้ด้วย
      };
      await window.firebasePush(dbRef, fishData);
      console.log("✅ Fish uploaded to Firebase:", fishData);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  }

  // 🐠 ดึงข้อมูลปลาจาก Firebase แบบ realtime
  const fishQuery = window.firebaseQuery(dbRef, window.firebaseLimit(30));

  window.firebaseOnValue(fishQuery, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      console.log("🐾 No fish yet");
      return;
    }

    fishContainer.innerHTML = "";
    const fishes = Object.values(data);

    fishes.forEach((fish) => {
      const fishImg = document.createElement("img");
      fishImg.src = fish.image;
      fishImg.classList.add("fish");
      fishImg.style.width = "120px";
      fishImg.style.top = 60 + Math.random() * 25 + "%";
      fishImg.style.left = Math.random() * 60 + "%";
      fishImg.style.animationDuration = (8 + Math.random() * 4) + "s";
      fishContainer.appendChild(fishImg);
    });

    console.log(`🐟 Loaded ${fishes.length} fish from Firebase`);
  });

  // ให้ปุ่ม Feed เรียกใช้ uploadFish
  window.saveFish = uploadFish;
}


  // 🎵 เพลงพื้นหลัง
  const bg = document.getElementById("bgMusic");
  if (bg) bg.volume = 0.3;
})();
