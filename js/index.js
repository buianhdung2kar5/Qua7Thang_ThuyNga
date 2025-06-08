// ----------------- Đếm thời gian -----------------

const date = document.getElementById("date-time");
const startDay = new Date("2024-11-09T12:02:00");

function updateTime() {
  const today = new Date();
  const diffTime = Math.abs(today - startDay);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffTime - diffDays * 24 * 60 * 60 * 1000) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor(
    (diffTime - diffDays * 24 * 60 * 60 * 1000 - diffHours * 60 * 60 * 1000) /
      (1000 * 60)
  );
  const diffSeconds = Math.floor(
    (diffTime -
      diffDays * 24 * 60 * 60 * 1000 -
      diffHours * 60 * 60 * 1000 -
      diffMinutes * 1000 * 60) /
      1000
  );

  date.innerHTML = `
        <div class="day time"><p>${diffDays} ngày</p></div>
        <div class="hour time"><p>${diffHours} giờ</p></div>
        <div class="minute time"><p>${diffMinutes} phút</p></div>
        <div class="second time"><p>${diffSeconds} giây</p></div>`;
}
updateTime();
setInterval(updateTime, 1000);

// ----------------- VẼ CANVAS -----------------

window.addEventListener("load", () => {
  const canvas = document.getElementById("connector");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    requestAnimationFrame(loop);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function getRectPoint(el, pos) {
    const rect = el.getBoundingClientRect();
    switch (pos) {
      case "topCenter":
        return { x: rect.left + rect.width / 2, y: rect.top };
      case "middleRight":
        return { x: rect.right, y: rect.top + rect.height / 2 };
      case "middleLeft":
        return { x: rect.left, y: rect.top + rect.height / 2 };
    }
  }

  const numDots = 25;
  let leftDots = [],
    rightDots = [],
    middleDots = [];

  for (let i = 0; i < numDots; i++) {
    leftDots.push({ t: i / numDots, speed: 0.002 + Math.random() * 0.002 });
    rightDots.push({ t: i / numDots, speed: 0.002 + Math.random() * 0.002 });
    middleDots.push({ t: i / numDots, speed: 0.003 + Math.random() * 0.002 });
  }

  function getPointOnBezier(t, p0, cp1, cp2, p1) {
    const x =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * cp1.x +
      3 * (1 - t) * Math.pow(t, 2) * cp2.x +
      Math.pow(t, 3) * p1.x;
    const y =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * cp1.y +
      3 * (1 - t) * Math.pow(t, 2) * cp2.y +
      Math.pow(t, 3) * p1.y;
    return { x, y };
  }

  function drawHeart() {
    const el1 = document.getElementById("avatar1");
    const el2 = document.getElementById("avatar2");
    const dateTime = document.getElementById("date-fake");

    const p1 = getRectPoint(el1, "topCenter");
    const p2 = getRectPoint(el2, "topCenter");
    const rect = dateTime.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const midX = (p1.x + p2.x) / 2;

    const isMobile = window.innerWidth <= 992;
    const offsetY = isMobile ? 60 : 100;

    const endPoint = { x: midX, y: centerY + offsetY };
    const leftCP1 = {
      x: p1.x - (isMobile ? 100 : 200),
      y: p1.y - (isMobile ? 100 : 150),
    };
    const leftCP2 = {
      x: p1.x - (isMobile ? 130 : 260),
      y: centerY - (isMobile ? 30 : 50),
    };
    const rightCP1 = {
      x: p2.x + (isMobile ? 100 : 200),
      y: p2.y - (isMobile ? 100 : 150),
    };
    const rightCP2 = {
      x: p2.x + (isMobile ? 130 : 260),
      y: centerY - (isMobile ? 30 : 50),
    };

    // Trái tim trái
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(
      leftCP1.x,
      leftCP1.y,
      leftCP2.x,
      leftCP2.y,
      endPoint.x,
      endPoint.y
    );
    ctx.strokeStyle = "#ff66cc";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ff66cc";
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Trái tim phải
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.bezierCurveTo(
      rightCP1.x,
      rightCP1.y,
      rightCP2.x,
      rightCP2.y,
      endPoint.x,
      endPoint.y
    );
    ctx.stroke();

    // Dot trái + phải
    [...leftDots, ...rightDots].forEach((dot, idx) => {
      dot.t += dot.speed;
      if (dot.t > 1) dot.t = 0;
      for (let i = 0; i < 5; i++) {
        const fadeT = dot.t - i * 0.02;
        if (fadeT < 0) continue;

        const pos = getPointOnBezier(
          fadeT,
          idx < numDots ? p1 : p2,
          idx < numDots ? leftCP1 : rightCP1,
          idx < numDots ? leftCP2 : rightCP2,
          endPoint
        );

        const alpha = 1 - i * 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 102, 204, ${alpha})`;
        ctx.arc(pos.x, pos.y, 3 - i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawZigzag() {
    const el1 = document.getElementById("avatar1");
    const el2 = document.getElementById("avatar2");
    const start = getRectPoint(el1, "middleRight");
    const end = getRectPoint(el2, "middleLeft");

    const segments = 20;
    const amplitude = 10;
    const dx = (end.x - start.x) / segments;
    const dy = (end.y - start.y) / segments;

    let points = [start];
    for (let i = 1; i <= segments; i++) {
      const x = start.x + dx * i;
      const y = start.y + dy * i + (i % 2 === 0 ? amplitude : -amplitude);
      points.push({ x, y });
    }

    // Vẽ đường zigzag
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#ff99ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ff99ff";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot chạy
    middleDots.forEach((dot) => {
      dot.t += dot.speed;
      if (dot.t > 1) dot.t = 0;

      const total = points.length - 1;
      const pathT = dot.t * total;
      const index = Math.floor(pathT);
      const localT = pathT - index;

      if (index >= total) return;
      const p0 = points[index];
      const p1 = points[index + 1];
      const x = p0.x + (p1.x - p0.x) * localT;
      const y = p0.y + (p1.y - p0.y) * localT;

      for (let i = 0; i < 5; i++) {
        const alpha = 1 - i * 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 153, 255, ${alpha})`;
        ctx.arc(x, y, 3 - i * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHeart();
    drawZigzag();
    requestAnimationFrame(loop);
  }
});
