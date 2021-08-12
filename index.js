const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startGameBtn = document.getElementById('start-game-btn');
const startGameCard = document.querySelector('.start-game-card');
const playerName = document.getElementById('name');
const playAgainBtn = document.getElementById('play-again-btn');
const congo = document.querySelector('.congo');
const background = document.querySelector('.background');
const content = document.querySelector('.content');
const selectedLevel = document.getElementById('selected-level');

let ballSpeed = parseInt(selectedLevel.value);

let score = 0;
let highscore = 0;
let nameOfPlayer = 'Buttface';

const brickRowCount = 9;
const brickColumnCount = 5;

// Create ball props
let ball;

// Create paddle props
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 100,
  h: 10,
  speed: 8,
  dx: 0,
};

// Create brick props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// create bricks
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

const nameLabel = document.getElementById('name-label');
const welcomeEl = document.querySelector('.welcome-el');

const player = [];

const getStoredName = JSON.parse(localStorage.getItem(`player`));

if (getStoredName === null) {
  nameLabel.classList.remove('hidden');
} else {
  welcomeEl.classList.remove('hidden');
  welcomeEl.innerHTML = `Welcome back, ${getStoredName[0].name}!`;
}

// Draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = 'hsl(355, 91%, 55%)';
  ctx.fill();
  ctx.closePath();
}

// Draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = 'hsl(355, 91%, 55%)';
  ctx.fill();
  ctx.closePath();
}

// draw score on canvas
function drawPlayerInfo() {
  ctx.font = '14px Arial';
  ctx.fillStyle = 'hsla(355, 100%, 69%, 0.8)';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
  ctx.fillText(`highscore: ${highscore}`, canvas.width - 250, 30);
  ctx.fillText(`Name: ${nameOfPlayer}`, canvas.width - 750, 30);
  ctx.fill();
}

// draw bricks on canvas
function drawBricks() {
  bricks.forEach(column => {
    column.forEach(brick => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? 'hsl(355, 91%, 55%)' : 'transparent';
      ctx.fill();
      ctx.closePath();
    });
  });
}

// Move paddle on canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

// Move ball on canvas
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // wall collision (right/left)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  // wall collision (top/bottom)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // paddle collision
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
  }

  // brick collision
  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x &&
          ball.x + ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h
        ) {
          ball.dy *= -1;
          brick.visible = false;

          increaseScore();
        }
      }
    });
  });

  // Hit bottom wall - Lose
  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    highscore = score > highscore ? score : highscore;
    player[0] = {
      name: nameOfPlayer,
      highscore: highscore,
    };
    localStorage.setItem('player', JSON.stringify(player));
    score = 0;
  }
}

// Increase score
function increaseScore() {
  score++;
  if (score % (brickRowCount * brickRowCount) === 0) {
    showAllBricks();
  }
  if (score === 45) {
    startGameCard.classList.remove('hidden');
    congo.classList.remove('hidden');
    background.classList.remove('hidden');
    content.classList.add('hidden');
  }
}

// Make all bricks appear
function showAllBricks() {
  bricks.forEach(column => {
    column.forEach(brick => (brick.visible = true));
  });
}

// Draw everything
function draw() {
  // clear cavas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawPlayerInfo();
  drawBricks();
}

// Update canvas drwain and animation
function update() {
  movePaddle();
  moveBall();

  // Draw everything
  draw();

  requestAnimationFrame(update);
}

startGameBtn.addEventListener('click', e => {
  e.preventDefault();
  if (playerName.value === '' && getStoredName === null) {
    alert("You did not enter a name so your default name is 'Buttface'");
  }
  if (playerName.value !== '') {
    nameOfPlayer = playerName.value;
    player.push({
      name: nameOfPlayer,
      highscore: highscore,
    });
    localStorage.setItem('player', JSON.stringify(player));
  }
  if (getStoredName !== null) {
    nameOfPlayer = getStoredName[0].name;
    highscore = getStoredName[0].highscore;
  }

  startGameCard.classList.add('hidden');

  setTimeout(update, 2500);
  function dot1() {
    document.getElementById('loading').innerHTML = `Starting.`;
  }
  function dot2() {
    document.getElementById('loading').innerHTML = `Starting..`;
  }
  function dot3() {
    document.getElementById('loading').innerHTML = `Starting...`;
  }
  setTimeout(dot1, 100);
  setTimeout(dot2, 900);
  setTimeout(dot3, 1700);

  setTimeout(function () {
    document.getElementById('loading').innerHTML = '';
  }, 2500);
});

selectedLevel.addEventListener('click', () => {
  ballSpeed = parseInt(selectedLevel.value);
  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    speed: ballSpeed,
    dx: 4,
    dy: -4,
  };
  highscore = 0;
});

// keydown Event
function keyDown(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  }
}

// keyup event
function keyUp(e) {
  if (
    e.key === 'Right' ||
    e.key === 'ArrowRight' ||
    e.key === 'Left' ||
    e.key === 'ArrowLeft'
  ) {
    paddle.dx = 0;
  }
}

playAgainBtn.addEventListener('click', () => {
  location.reload();
});

// keyboard Event handlers
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Rules and close event handlers
rulesBtn.addEventListener('click', () => {
  rules.classList.add('show');
});

closeBtn.addEventListener('click', () => {
  rules.classList.remove('show');
});
