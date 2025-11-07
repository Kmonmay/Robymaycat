(async function () {
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let currentColor = "#000000";

  const db = window.db;
  const dbRef = window.firebaseRef(db, "fishes");

  // วาด
  canvas.addEventListener("mousedown", e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
  canvas.addEventListener("mousemove", e => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.strokeStyle = currentColor; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke(); }});
  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseleave", () => drawing = false);
  canvas.addEventListener("touchstart", e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); const t = e.touches[0]; drawing = true; ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); });
  canvas.addEventListener("touchmove", e => { e.preventDefault(); if (!drawing) return; const r = canvas.getBoundingClientRect(); const t = e.touches[0]; ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.strokeStyle = currentColor; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke(); });
  canvas.addEventListener("touchend", () => drawing = false);

  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentColor = btn.getAttribute("data-color");
      document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

  const fishContainer = document.getElementById("fishContainer");

  // 🐟 เพิ่มปลาในตู้
  function addFish(image) {
    const fish = document.createElement("img");
    fish.src = image;
    fish.classList.add("fish");
    fish.style.top = 50 + Math.random() * 45 + "%";
    fish.style.left = 10 + Math.random() * 70 + "%";
    fishContainer.appendChild(fish);

    const swim = () => {
      const randomX = 10 + Math.random() * 80;
      const randomY = 50 + Math.random() * 45;
      const duration = 7000 + Math.random() * 4000;
      const flip = Math.random() < 0.5 ? "scaleX(1)" : "scaleX(-1)";
      fish.style.transition = `top ${duration}ms ease-in-out, left ${duration}ms ease-in-out, transform 1s ease`;
      fish.style.top = `${randomY}%`;
      fish.style.left = `${randomX}%`;
      fish.style.transform = flip;
      setTimeout(swim, duration);
    };
    setTimeout(swim, 1000);
  }

  // 🧠 ตรวจว่าคล้ายปลา
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
        let count = 0;
        for (let i = 3; i < d.data.length; i += 4) if (d.data[i] > 100) count++;
        resolve(count > 150);
      };
    });
  }

  // 🐠 อัปโหลดปลา (จำกัดสูงสุด 20 ตัว)
  async function uploadFish(imageData) {
    const { getDatabase, ref, remove, get, orderByKey, query } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js");
    const snapshot = await get(query(dbRef, orderByKey()));
    const fishes = snapshot.exists() ? Object.entries(snapshot.val()) : [];

    if (fishes.length >= 20) {
      const oldestKey = fishes[0][0];
      await remove(ref(db, `fishes/${oldestKey}`));
      console.log("🐟 Removed oldest fish to keep limit 20");
    }

    const fishData = { image: imageData, time: Date.now() };
    await window.firebasePush(dbRef, fishData);
  }

  // 🍽️ Feed ปลาขึ้น Firebase
  document.getElementById("feedBtn").addEventListener("click", async () => {
    const img = canvas.toDataURL("image/png");
    const isFish = await checkIfFish(img);
    if (!isFish) return alert("That’s not a fish 🐱💬");
    addFish(img);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await uploadFish(img);
  });

  // 🪸 โหลดปลา realtime
  const queryRef = window.firebaseQuery(dbRef, window.firebaseLimit(20));
  window.firebaseOnValue(queryRef, snapshot => {
    const data = snapshot.val();
    fishContainer.innerHTML = "";
    if (!data) return;
    Object.values(data).forEach(f => addFish(f.image));
  });

  // 🧭 ปุ่มไปหน้า Fish List
  document.getElementById("listBtn").addEventListener("click", () => {
    window.location.href = "fishlist.html";
  });
})();
