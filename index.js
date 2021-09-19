if (window.innerWidth < 900) {
  document.querySelector(
    'body'
  ).innerHTML = `<div class="center">Open on desktop for best experience. <br>OR <br>Maximize the screen and refresh if already on desktop.<br> Mobile version in work.</div>`;
} else {
  const rulesBtn = document.getElementById('rules-btn');
  const playerInfoBtn = document.getElementById('player-info-btn');
  const closeBtn = document.querySelectorAll('.close-btn');
  const rules = document.getElementById('rules');
  const info = document.getElementById('info');
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
  const menuBtn = document.getElementById('menu-btn');
  const lossOverlay = document.querySelector('.loss-overlay');
  const playerScores = document.querySelector('.player-scores');
  const playerScoresScore = document.getElementById('player-scores-score');
  const playerScoresHighscore = document.querySelector(
    '#player-scores-highscore'
  );
  const infoName = document.getElementById('info-name');
  const infoGamesPlayed = document.getElementById('info-games-played');
  const infoBeginnerHighscore = document.getElementById(
    'info-beginner-highscore'
  );
  const infoIntermediateHighscore = document.getElementById(
    'info-intermediate-highscore'
  );
  const infoAdvancedHighscore = document.getElementById(
    'info-advanced-highscore'
  );
  const infoGodHighscore = document.getElementById('info-god-highscore');

  let gameCounter = 0;
  let highscoreBeginner = 0;
  let highscoreIntermediate = 0;
  let highscoreAdvanced = 0;
  let highscoreGod = 0;

  let ballSpeed = parseInt(selectedLevel.value);

  let score = 0;
  let highscore = 0;
  let lostCount = 0;
  let nameOfPlayer = 'Buttface';

  const brickRowCount = 9;
  const brickColumnCount = 5;

  // music
  let brickMusic = document.getElementById('brick-music');
  let paddleMusic = document.getElementById('paddle-music');
  let lostMusic = document.getElementById('lost-music');
  let gameOverMusic = document.getElementById('game-over-music');

  // Create ball props
  let ball;
  let noOfBalls = 2;

  // Create paddle props
  const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    w: 100,
    h: 10,
    speed: 10,
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
  let level = 5;

  const getStoredName = JSON.parse(localStorage.getItem(`player`));
  const getStoredLevel = JSON.parse(localStorage.getItem(`level`));

  if (getStoredName === null) {
    nameLabel.classList.remove('hidden');
  } else {
    welcomeEl.classList.remove('hidden');
    welcomeEl.innerHTML = `Welcome back, ${getStoredName[0].name}!`;
  }

  // ------------------------------------ FUNCTIONS ------------------------------------

  // music playerfunction play() {
  function playBrickMusic() {
    brickMusic.play();
  }
  function playPaddleMusic() {
    paddleMusic.play();
  }
  function playLostMusic() {
    lostMusic.play();
  }
  function playGameOverMusic() {
    gameOverMusic.play();
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
    ctx.font = '20px Arial';
    ctx.fillStyle = 'hsla(355, 100%, 69%, 0.8)';
    ctx.fillText(`Score: ${score}`, canvas.width - 130, 30);
    ctx.fillText(`Balls Remaining: ${noOfBalls}`, canvas.width - 750, 30);
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
      playPaddleMusic();
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
            playBrickMusic();
            increaseScore();
          }
        }
      });
    });

    // Hit bottom wall - Lose
    if (ball.y + ball.size > canvas.height) {
      console.log('hit the bottom wall');
      if (ballSpeed === 5) {
        console.log('inside beginner');
        highscoreBeginner = getStoredName[0].highscoreBeginner;
        highscoreBeginner =
          score > highscoreBeginner ? score : highscoreBeginner;
        playerScoresHighscore.textContent = highscoreBeginner;

        highscoreIntermediate = getStoredName[0].highscoreIntermediate;
        highscoreAdvanced = getStoredName[0].highscoreAdvanced;
        highscoreGod = getStoredName[0].highscoreGod;

        gameOver();
      } else if (ballSpeed === 8) {
        highscoreIntermediate =
          score > highscoreIntermediate ? score : highscoreIntermediate;
        playerScoresHighscore.textContent = highscoreIntermediate;

        highscoreBeginner = getStoredName[0].highscoreBeginner;
        highscoreAdvanced = getStoredName[0].highscoreAdvanced;
        highscoreGod = getStoredName[0].highscoreGod;

        gameOver();
      } else if (ballSpeed === 13) {
        highscoreAdvanced =
          score > highscoreAdvanced ? score : highscoreAdvanced;
        playerScoresHighscore.textContent = highscoreAdvanced;

        highscoreBeginner = getStoredName[0].highscoreBeginner;
        highscoreIntermediate = getStoredName[0].highscoreIntermediate;
        highscoreGod = getStoredName[0].highscoreGod;

        gameOver();
      } else if (ballSpeed === 18) {
        highscoreGod = score > highscoreGod ? score : highscoreGod;
        playerScoresHighscore.textContent = highscoreGod;

        highscoreBeginner = getStoredName[0].highscoreBeginner;
        highscoreIntermediate = getStoredName[0].highscoreIntermediate;
        highscoreAdvanced = getStoredName[0].highscoreAdvanced;

        gameOver();
      }
    }
  }

  // game over function
  function gameOver() {
    console.log('gameOver called');
    playLostMusic();

    player[0] = {
      name: nameOfPlayer,
      highscoreBeginner: highscoreBeginner,
      highscoreIntermediate: highscoreIntermediate,
      highscoreAdvanced: highscoreAdvanced,
      highscoreGod: highscoreGod,
      gamesPlayed: gameCounter,
    };
    localStorage.setItem('player', JSON.stringify(player));

    lostCount++;
    noOfBalls--;
    if (noOfBalls < 0) {
      startGameCard.classList.remove('hidden');
      congo.classList.remove('hidden');
      document.getElementById('lost-para').classList.remove('hidden');
      background.classList.remove('hidden');
      content.classList.add('hidden');
      lossOverlay.classList.remove('hidden');
      playerScores.classList.remove('hidden');
      playAgainBtn.classList.add('play-again-lost-btn');
      playerScoresScore.textContent = score;
      playGameOverMusic();

      paddleMusic.muted();
      brickMusic.muted();
      lostMusic.muted();
    }
    if (lostCount > 2) {
      showAllBricks();
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
      document.getElementById('congo-para').classList.remove('hidden');
      background.classList.remove('hidden');
      content.classList.add('hidden');
      paddleMusic.muted();
      brickMusic.muted();
      lostMusic.muted();
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

  // ------------------------------------ EVENT LISTNERS ------------------------------------

  if (localStorage.getItem('level')) {
    selectedLevel.value = localStorage.getItem('level');
    for (let i = 1; i < selectedLevel.options.length; i++) {
      if (
        selectedLevel.options[i].value ===
        JSON.parse(localStorage.getItem('level'))
      ) {
        let attr = document.createAttribute('selected');
        selectedLevel.options[i].setAttributeNode(attr);
        console.log('value of the option matched');
      }
    }
  }

  startGameBtn.addEventListener('click', e => {
    e.preventDefault();

    gameCounter++;
    if (playerName.value === '' && getStoredName === null) {
      alert("You did not enter a name so your default name is 'Buttface'");
    }
    if (playerName.value !== '') {
      nameOfPlayer = playerName.value;
      player.push({
        name: nameOfPlayer,
        highscoreBeginner: highscoreBeginner,
        highscoreIntermediate: highscoreIntermediate,
        highscoreAdvanced: highscoreAdvanced,
        highscoreGod: highscoreGod,
        gamesPlayed: gameCounter,
      });
      localStorage.setItem('player', JSON.stringify(player));
    }
    if (getStoredName !== null) {
      nameOfPlayer = getStoredName[0].name;
      highscore = getStoredName[0].highscore;
      gameCounter = getStoredName[0].gamesPlayed + 1;
    }

    menuBtn.classList.remove('hidden');

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

    if (localStorage.getItem('level')) {
      selectedLevel.value = localStorage.getItem('level');
      for (let i = 1; i < selectedLevel.options.length; i++) {
        if (
          selectedLevel.options[i].value ===
          JSON.parse(localStorage.getItem('level'))
        ) {
          let attr = document.createAttribute('selected');
          selectedLevel.options[i].setAttributeNode(attr);
          console.log('value of the option matched');
        }
      }
    }
  });

  selectedLevel.addEventListener('change', e => {
    let currentLevel = e.target.value;
    localStorage.setItem('level', JSON.stringify(currentLevel));
  });

  playAgainBtn.addEventListener('click', () => {
    location.reload();
  });

  menuBtn.addEventListener('click', () => {
    location.reload();
  });

  // keyboard Event handlers
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  // Rules and close event handlers
  rulesBtn.addEventListener('click', () => {
    rules.classList.add('show');
  });

  playerInfoBtn.addEventListener('click', () => {
    info.classList.add('show');
  });

  closeBtn[0].addEventListener('click', () => {
    rules.classList.remove('show');
  });

  closeBtn[1].addEventListener('click', () => {
    info.classList.remove('show');
  });

  playerInfoBtn.addEventListener('click', () => {
    nameOfPlayer = getStoredName[0].name;
    infoName.textContent = nameOfPlayer;
    gameCounter = getStoredName[0].gamesPlayed;
    infoGamesPlayed.textContent = gameCounter;
    infoBeginnerHighscore.textContent = getStoredName[0].highscoreBeginner;
    infoIntermediateHighscore.textContent =
      getStoredName[0].highscoreIntermediate;
    infoAdvancedHighscore.textContent = getStoredName[0].highscoreAdvanced;
    infoGodHighscore.textContent = getStoredName[0].highscoreGod;
  });
}
