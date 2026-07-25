const MUSIC_KEY = "green_nebula_audio";
const MUSIC_TIME = "green_nebula_time";
let audio = new Audio("asset/music.mp3");
audio.loop = true;
let isPlaying = false;

// ── FIX 1: GLOBAL ABORT CONTROLLER ──
// This will sweep away old event listeners every time the page changes
let pageController = new AbortController(); 

// ── AUTOPLAY ENGINE (First Touch Interceptor) ──
const initAudio = () => {
  if (sessionStorage.getItem(MUSIC_KEY) !== "false" && !isPlaying) {
    audio
      .play()
      .then(() => {
        isPlaying = true;
        sessionStorage.setItem(MUSIC_KEY, "true");
      })
      .catch((e) => console.log("Autoplay blocked by browser policy:", e));
  }
  document.removeEventListener("click", initAudio);
  document.removeEventListener("touchstart", initAudio);
};

document.addEventListener("click", initAudio, { once: true });
document.addEventListener("touchstart", initAudio, { once: true, passive: true });

function playMusic() {
  audio
    .play()
    .then(() => {
      isPlaying = true;
      sessionStorage.setItem(MUSIC_KEY, "true");
    })
    .catch(() => console.log("Autoplay blocked by browser."));
}

// ── GLOBAL INITIALIZATION ──
document.addEventListener("DOMContentLoaded", () => {
  // Restore state if already playing
  if (sessionStorage.getItem(MUSIC_KEY) === "true") {
    audio.currentTime = parseFloat(sessionStorage.getItem(MUSIC_TIME) || "0");
    playMusic();
  }

  // SPA Page Fade In
  const overlay = document.getElementById("page-transition");
  if (overlay) {
    overlay.classList.remove("fade-in");
    document.body.style.opacity = "0";
    setTimeout(() => {
      document.body.style.opacity = "1";
      document.body.style.transition = "opacity 0.8s ease";
    }, 50);
  }

  // Init Pages
  runPageScripts();
});

window.addEventListener("beforeunload", () => {
  sessionStorage.setItem(MUSIC_TIME, audio.currentTime);
});

// Music Button Logic
document.getElementById("music-btn")?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    sessionStorage.setItem(MUSIC_KEY, "false");
  } else {
    audio
      .play()
      .then(() => {
        isPlaying = true;
        sessionStorage.setItem(MUSIC_KEY, "true");
      })
      .catch(() => {});
  }
});

// ── PAGE SCRIPT ROUTER ──
function runPageScripts() {
  if (document.getElementById("connect-canvas")) initVoidPage();
  if (document.querySelector(".solar-system-area")) initPlanetDia();
  if (document.querySelector(".map-window")) initGalaksiKita();
  if (document.querySelector(".radar-hero")) initSurat();
  if (document.querySelector(".blackhole")) initBintangUntukmu();

  // Reveal Observer
  const reveals = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.15 },
  );
  reveals.forEach((r) => obs.observe(r));
}


// ── SEAMLESS SPA ROUTER ──
document.addEventListener("click", async (e) => {
  const link = e.target.closest("a[data-nav]");
  if (!link) return;
  e.preventDefault();

  const targetUrl = link.href;
  const overlay = document.getElementById("page-transition");
  overlay.classList.add("fade-in");

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // ── FIX 3: SPA FAILSAFE ──
    const nextAppCore = doc.getElementById("app-core");
    if (!nextAppCore) throw new Error("Missing #app-core on target page");
    const newContent = nextAppCore.innerHTML;

    // ── FIX 1: ABORT OLD LISTENERS ──
    pageController.abort(); 
    pageController = new AbortController();

    setTimeout(() => {
      document.getElementById("app-core").innerHTML = newContent;
      window.scrollTo(0, 0);

      window.history.pushState({ path: targetUrl }, "", targetUrl);

      // Reboot the interactive engine for the new page
      runPageScripts();

      overlay.classList.remove("fade-in");
    }, 600);
  } catch (error) {
    console.error("SPA Navigation failed. Falling back to hard reload.", error);
    window.location.href = targetUrl;
  }
});

window.addEventListener("popstate", () => {
  window.location.reload();
});


// ── PAGE 1: THE VOID ──
function initVoidPage() {
  const term = document.getElementById("terminal-text");
  const text =
    "> initiating organic nebula core...\n> coordinates locked: [ENCRYPTED]\n> finding connection...";
  let i = 0;
  function typeText() {
    if (i < text.length) {
      term.innerHTML += text.charAt(i) === "\n" ? "<br>" : text.charAt(i);
      i++;
      setTimeout(typeText, 40);
    } else {
      document.getElementById("hero-title").style.opacity = "1";
    }
  }
  setTimeout(typeText, 600);

  const canvas = document.getElementById("connect-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();

  const nodes = [
    { x: canvas.width * 0.2, y: canvas.height * 0.2, connected: false },
    { x: canvas.width * 0.8, y: canvas.height * 0.3, connected: false },
    { x: canvas.width * 0.4, y: canvas.height * 0.5, connected: false },
    { x: canvas.width * 0.3, y: canvas.height * 0.8, connected: false },
    { x: canvas.width * 0.7, y: canvas.height * 0.7, connected: false },
  ];

  let drawnLines = [];
  let isDrawing = false;
  let lastNode = null;
  let currX, currY;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 3;
    drawnLines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
    });

    if (isDrawing && lastNode) {
      ctx.beginPath();
      ctx.moveTo(lastNode.x, lastNode.y);
      ctx.lineTo(currX, currY);
      ctx.strokeStyle = "rgba(201, 168, 76, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = n.connected ? "#E8C878" : "#4A7A4C";
      ctx.fill();
      if (n.connected) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#C9A84C";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }
  draw();

  function getNode(x, y) {
    return nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 40);
  }

  const startDrag = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const node = getNode(x, y);
    if (node) {
      isDrawing = true;
      lastNode = node;
      node.connected = true;
      draw();
    }
  };

  const moveDrag = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    currX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    currY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    const node = getNode(currX, currY);
    if (node && node !== lastNode) {
      const lineExists = drawnLines.some(
        (l) =>
          (l.start === lastNode && l.end === node) ||
          (l.start === node && l.end === lastNode),
      );
      if (!lineExists) {
        drawnLines.push({ start: lastNode, end: node });
        node.connected = true;
        lastNode = node;
        if (nodes.every((n) => n.connected)) {
          isDrawing = false;
          canvas.classList.add("unlocked");
          document.getElementById("hidden-msg").style.opacity = "1";
          document.getElementById("orbit-nav").classList.add("unlocked");
          document.getElementById("canvas-hint").innerText = "SYSTEM UNLOCKED";
        }
      }
    }
    draw();
  };

  const endDrag = () => {
    isDrawing = false;
    draw();
  };

  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("mousemove", moveDrag);
  // Abort controller added to window listeners
  window.addEventListener("mouseup", endDrag, { signal: pageController.signal });
  canvas.addEventListener("touchstart", startDrag, { passive: false });
  canvas.addEventListener("touchmove", moveDrag, { passive: false });
  window.addEventListener("touchend", endDrag, { signal: pageController.signal });
}


// ── PAGE 2: PLANET DIA ──
function initPlanetDia() {
  const modal = document.getElementById("planet-modal");
  const pData = {
    p1: {
      src: "asset/1.jpg",
      txt: "Kamu yang selalu bisa mengalihkan rotasiku.",
    },
    p2: {
      src: "asset/2.jpg",
      txt: "Kamu yang entah gimana bikin waktu berhenti.",
    },
    p3: { src: "asset/3.jpg", txt: "Kamu yang dibawa jadi melodi favoritku." },
    p4: { src: "asset/4.jpg", txt: "Kamu, pusat tata suryaku." },
  };
  document.querySelectorAll(".planet").forEach((p) => {
    p.addEventListener("click", () => {
      document.getElementById("pm-img").src = pData[p.dataset.id].src;
      document.getElementById("pm-txt").innerText = pData[p.dataset.id].txt;
      modal.classList.add("show");
    });
  });
  document
    .getElementById("pm-close")
    ?.addEventListener("click", () => modal.classList.remove("show"));

  document.querySelectorAll(".fact-card").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });

  const stars = document.querySelectorAll(".star-rating span");
  const rMsg = document.getElementById("rating-result");
  const msgs = [
    "Hmm...",
    "Boleh lah...",
    "Makin bersinar...",
    "Hampir sempurna!",
    "Sempurna. Tanpa cela. ✨",
  ];
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      stars.forEach((s, i) => {
        s.classList.toggle("active", i <= index);
      });
      rMsg.innerText = msgs[index];
      if (index === 4) {
        for (let j = 0; j < 30; j++) {
          let c = document.createElement("div");
          c.style.cssText = `position:fixed; width:8px; height:8px; background:#C9A84C; border-radius:50%; top:50%; left:50%; pointer-events:none; z-index:9999;`;
          document.body.appendChild(c);
          const angle = Math.random() * Math.PI * 2;
          const velocity = 50 + Math.random() * 100;
          c.animate(
            [
              { transform: "translate(0,0) scale(1)", opacity: 1 },
              {
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                opacity: 0,
              },
            ],
            { duration: 1000, easing: "cubic-bezier(.25,.46,.45,.94)" },
          );
          setTimeout(() => c.remove(), 1000);
        }
      }
    });
  });

  document.querySelectorAll(".strip-img").forEach((item) => {
    item.addEventListener("click", () => item.classList.toggle("colorized"));
  });
}


// ── PAGE 3: GALAKSI KITA ──
function initGalaksiKita() {
  const mapWindow = document.querySelector(".map-window");
  const canvas = document.querySelector(".map-canvas");
  let isDragging = false,
    startX,
    startY,
    currentX = -200,
    currentY = -150;
    
  if(canvas) {
      canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }
  
  if(mapWindow) {
      mapWindow.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
      });
      mapWindow.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - currentX;
            startY = e.touches[0].clientY - currentY;
          }
        },
        { passive: true },
      );
  }

  // Abort controller added to window listeners
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    if(canvas) canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }, { signal: pageController.signal });
  
  window.addEventListener("mouseup", () => {
    isDragging = false;
  }, { signal: pageController.signal });
  
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
      if(canvas) canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;
    },
    { passive: true, signal: pageController.signal },
  );
  
  window.addEventListener("touchend", () => {
    isDragging = false;
  }, { signal: pageController.signal });

  document.querySelectorAll(".cluster").forEach((c) => {
    c.addEventListener("click", () => {
      document.getElementById("m-img").src = c.dataset.img;
      document.getElementById("m-txt").innerText = c.dataset.txt;
      document.getElementById("planet-modal").classList.add("show");
    });
  });

  document.querySelectorAll(".time-node").forEach((node) => {
    const holdBtn = node.querySelector(".node-hold");
    const fill = node.querySelector(".node-fill");
    let timer,
      progress = 0;
    const start = (e) => {
      if (e.cancelable) e.preventDefault();
      timer = setInterval(() => {
        progress += 5;
        fill.style.background = `conic-gradient(var(--nebula) ${progress}%, transparent 0%)`;
        if (progress >= 100) {
          clearInterval(timer);
          node.classList.add("revealed");
        }
      }, 30);
    };
    const end = () => {
      clearInterval(timer);
      if (progress < 100) {
        progress = 0;
        fill.style.background = "transparent";
      }
    };
    holdBtn.addEventListener("pointerdown", start);
    window.addEventListener("pointerup", end, { signal: pageController.signal });
    window.addEventListener("pointercancel", end, { signal: pageController.signal });
  });

  const decodeBtn = document.getElementById("decode-btn");
  const decodeTxt = document.getElementById("decoder-text");
  if (decodeBtn && decodeTxt) {
    const targetText = decodeTxt.dataset.target;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    decodeBtn.addEventListener("click", () => {
      let iter = 0;
      decodeBtn.style.pointerEvents = "none";
      const interval = setInterval(() => {
        decodeTxt.innerText = targetText
          .split("")
          .map((l, i) =>
            i < iter
              ? targetText[i]
              : chars[Math.floor(Math.random() * chars.length)],
          )
          .join("");
        if (iter >= targetText.length) clearInterval(interval);
        iter += 1 / 3;
      }, 30);
    });
  }

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelectorAll(".gyro-item").forEach((item, i) => {
      item.style.transform = `translate3d(${x * (((i % 3) + 1) * 2)}px, ${y * (((i % 3) + 1) * 2)}px, 0)`;
    });
  }, { signal: pageController.signal });
}


// ── PAGE 4: TRANSMISI (SURAT) ──
function initSurat() {
  const bars = document.querySelectorAll(".s-bar");
  let tapCount = 0;
  document.querySelector(".bars-container")?.addEventListener("click", () => {
    if (tapCount < 3) {
      bars[tapCount].classList.add("active");
      tapCount++;
      if (tapCount === 3) startTypingLetter();
    }
  });

  function startTypingLetter() {
    document.getElementById("transmission-letter").classList.add("unlocked");
    const txt =
      "> SINYAL TERKUNCI.\n\nHai, Dear.\n\nAku gak pernah pinter ngerangkai kata, tapi lewat semesta kecil ini, aku mau jujur.\nSemenjak ada kamu, duniaku yang gelap tiba-tiba punya warnanya sendiri.\n\nSetiap tawamu, setiap ceritamu... semuanya kasih warna di hidupku.\n\nTerima kasih udah ada, udah mau bareng-bareng sama aku sampai sejauh ini. \n\nWords can't even describe how much im grateful for every time we choose each other.\n\nLet's keep making more memories in our little universe! Happy Mensive, Love.";
    let i = 0;
    function type() {
      if (i < txt.length) {
        document.getElementById("t-text").innerHTML +=
          txt.charAt(i) === "\n" ? "<br>" : txt.charAt(i);
        i++;
        if (i === 80 && document.getElementById("w-img-1"))
          document.getElementById("w-img-1").style.opacity = "1";
        setTimeout(type, 30);
      } else {
        document.getElementById("response-btns").style.opacity = "1";
      }
    }
    setTimeout(type, 1000);
  }

  document.getElementById("btn-baca-lagi")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("morse-btn")?.addEventListener("click", () => {
    document.getElementById("morse-text").innerText = "I LOVE YOU";
  });
}


// ── PAGE 5: BINTANG UNTUKMU & EVENT HORIZON ──
function initBintangUntukmu() {
  // Fog Wipe Logic
  const canvas = document.getElementById("fog-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    function setCanvasSize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width === 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grd.addColorStop(0, "rgba(42, 74, 44, 1)");
      grd.addColorStop(1, "rgba(23, 38, 25, 1)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 14px 'Space Mono'";
      ctx.fillStyle = "#E8C878";
      ctx.textAlign = "center";
      ctx.fillText("SWIPE TO CLEAR FOG", canvas.width / 2, canvas.height / 2);
    }
    setTimeout(setCanvasSize, 200);
    window.addEventListener("resize", setCanvasSize, { signal: pageController.signal });

    let isWiping = false;
    function wipe(e) {
      if (!isWiping) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
    canvas.addEventListener("mousedown", () => (isWiping = true));
    window.addEventListener("mouseup", () => (isWiping = false), { signal: pageController.signal });
    canvas.addEventListener("mousemove", wipe);
    canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.cancelable) e.preventDefault();
        isWiping = true;
        wipe(e);
      },
      { passive: false },
    );
    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (e.cancelable) e.preventDefault();
        wipe(e);
      },
      { passive: false },
    );
    window.addEventListener("touchend", () => (isWiping = false), { signal: pageController.signal });
  }

  // Wish Sender
  document.getElementById("send-wish")?.addEventListener("click", () => {
    const input = document.getElementById("wish-input");
    if (!input.value) return;
    const orb = document.createElement("div");
    orb.className = "wish-orb float-up";
    orb.style.left = "50%";
    orb.style.top = "70%";
    document.body.appendChild(orb);
    input.value = "";
    input.placeholder = "Wish sent to the stars...";
    setTimeout(() => orb.remove(), 3000);
  });

  // THE EVENT HORIZON ENGINE
  const bh = document.getElementById("blackhole");
  const overlay = document.getElementById("bh-overlay");
  
  if (bh && overlay) {
      let eventHorizonTimer;
      let isConsumed = false;

      bh.addEventListener("contextmenu", (e) => e.preventDefault());

      const startPull = (e) => {
        if (isConsumed) return;
        if (e && e.cancelable) e.preventDefault();

        bh.classList.add("is-active");
        overlay.classList.add("is-pulling");

        eventHorizonTimer = setTimeout(() => {
          isConsumed = true; 
          setTimeout(() => {
            overlay.classList.add("consume");
            bh.style.display = "none"; 
          }, 500);
        }, 400);
      };

      const stopPull = (e) => {
        if (isConsumed) return; 
        if (e && e.cancelable) e.preventDefault();

        clearTimeout(eventHorizonTimer);
        bh.classList.remove("is-active");
        overlay.classList.remove("is-pulling");
      };

      bh.addEventListener("pointerdown", startPull);
      window.addEventListener("pointerup", stopPull, { signal: pageController.signal });
      window.addEventListener("pointercancel", stopPull, { signal: pageController.signal });
      window.addEventListener("pointerout", stopPull, { signal: pageController.signal }); 
  }
}
