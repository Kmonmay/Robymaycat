// Drawing logic
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';

// 🎨 Change color
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.getAttribute('data-color');
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

canvas.addEventListener('mousedown', e => start(e.offsetX, e.offsetY));
canvas.addEventListener('mousemove', e => draw(e.offsetX, e.offsetY));
canvas.addEventListener('mouseup', () => drawing=false);
canvas.addEventListener('mouseleave', () => drawing=false);

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  start(t.clientX-rect.left, t.clientY-rect.top);
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  draw(t.clientX-rect.left, t.clientY-rect.top);
});
canvas.addEventListener('touchend', ()=>drawing=false);

function start(x,y){ drawing=true; ctx.beginPath(); ctx.moveTo(x,y);}
function draw(x,y){
  if(!drawing) return;
  ctx.lineTo(x,y);
  ctx.strokeStyle=currentColor;
  ctx.lineWidth=5;
  ctx.lineCap='round';
  ctx.stroke();
}

// Clear
document.getElementById('clearBtn').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));

// Fish area
const fishContainer=document.getElementById('fishContainer');
let fishList=[];

function addFishToAquarium(imageData){
  if(fishList.length>=15){ fishList[0].remove(); fishList.shift(); }
  const fish=document.createElement('img');
  fish.src=imageData; fish.classList.add('fish');
  const seaTop=60, seaHeight=25;
  fish.style.top=seaTop+Math.random()*seaHeight+'%';
  fish.style.left=Math.random()*60+'%';
  fish.style.animationDuration=(8+Math.random()*4)+'s';
  fishContainer.appendChild(fish);
  fishList.push(fish);
}
function saveFish(imageData){
  let myFish=JSON.parse(localStorage.getItem('myFish'))||[];
  myFish.push(imageData);
  localStorage.setItem('myFish',JSON.stringify(myFish));
}

// View fish
const modal=document.getElementById('fishListModal');
const list=document.getElementById('fishList');
document.getElementById('viewBtn').addEventListener('click',()=>{
  list.innerHTML='';
  const stored=JSON.parse(localStorage.getItem('myFish'))||[];
  if(stored.length===0) list.innerHTML='<p>No fish yet!</p>';
  else stored.forEach(img=>{const i=document.createElement('img');i.src=img;list.appendChild(i);});
  modal.style.display='flex';
});
document.getElementById('closeModal').addEventListener('click',()=>modal.style.display='none');

// Reactions
function showReaction(text){
  const t=document.getElementById('reactionText');
  t.textContent=text;
  t.style.opacity=1;
  setTimeout(()=>t.style.opacity=0,2500);
}
function spawnBubbles(){
  const c=document.getElementById('bubbles');
  for(let i=0;i<6;i++){
    const b=document.createElement('div');
    b.classList.add('bubble');
    const s=8+Math.random()*10;
    b.style.width=b.style.height=s+'px';
    b.style.left=Math.random()*100+'%';
    b.style.backgroundColor=`rgba(173,216,230,${0.5+Math.random()*0.3})`;
    b.style.animationDelay=Math.random()+'s';
    c.appendChild(b);
    setTimeout(()=>b.remove(),3000);
  }
}
function popBubbles(){
  const c=document.getElementById('bubbles');
  for(let i=0;i<5;i++){
    const b=document.createElement('div');
    b.classList.add('pop-bubble');
    b.style.left=Math.random()*100+'%';
    b.style.bottom=Math.random()*50+'px';
    c.appendChild(b);
    setTimeout(()=>b.remove(),600);
  }
}

// Feed button
document.getElementById('feedBtn').addEventListener('click',async()=>{
  const img=canvas.toDataURL('image/png');
  const cat=document.getElementById('cat');
  const ew=document.getElementById('catEw');

  const isFish=await checkIfFish(img);
  if(!isFish){
    cat.style.display='none';
    ew.style.display='block';
    showReaction("That’s not a fish… ew!");
    popBubbles();
    setTimeout(()=>{cat.style.display='block';ew.style.display='none';},1500);
    return;
  }

  cat.style.transform='translateY(-20px)';
  showReaction("Yummy! Thank you for the fish!");
  spawnBubbles();
  addFishToAquarium(img); saveFish(img);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  setTimeout(()=>cat.style.transform='translateY(0)',600);
});

// Check fish (medium difficulty)
async function checkIfFish(imageData){
  const API_URL="https://api-inference.huggingface.co/models/cafeai/sketch-image-classification";
  const TOKEN="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";

  let aiSaysFish=false;
  try{
    const res=await fetch(API_URL,{
      method:"POST",
      headers:{Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json"},
      body:JSON.stringify({inputs:imageData})
    });
    const data=await res.json();
    const result=data[0].find(p=>p.label.toLowerCase().includes("fish"));
    if(result&&result.score>0.3) aiSaysFish=true;
  }catch{ aiSaysFish=true; }

  const img=new Image(); img.src=imageData;
  await new Promise(r=>img.onload=r);
  const temp=document.createElement('canvas');
  const tctx=temp.getContext('2d');
  temp.width=img.width; temp.height=img.height;
  tctx.drawImage(img,0,0);
  const d=tctx.getImageData(0,0,img.width,img.height);
  let px=0,minX=img.width,maxX=0,minY=img.height,maxY=0;
  for(let i=0;i<d.data.length;i+=4){
    if(d.data[i+3]>20){
      px++;
      const idx=i/4;
      const x=idx%img.width; const y=Math.floor(idx/img.width);
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
  }
  const width=maxX-minX; const height=maxY-minY;
  const aspect=width/(height||1);
  const enough=px>220, wide=aspect>1.2, decent=width>40&&height>25;
  return aiSaysFish && enough && wide && decent;
}

// Music
const bg=document.getElementById('bgMusic');
if(bg) bg.volume=0.3;
