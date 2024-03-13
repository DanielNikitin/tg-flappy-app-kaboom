/* eslint-disable no-undef */
kaboom();

const WIDTH = width();
const HEIGHT = height();

const BACKGROUND_COLOR = Color.fromHex("#b6e5ea");
const PIPE_COLOR = Color.fromHex("#74c02e");

const PIPE_WIDTH = 64;
const PIPE_BORDER = 4;
const PIPE_OPEN = 240;
const PIPE_MIN_HEIGHT = 60;

const GRAVITY = 2500;
const JUMP_FORCE = 700;
const SPEED = 150;

const CEILING = -60;  // потолок

loadSprite("bird", "./sprites/bird.png");

loadSound("score", "./sounds/score.mp3");
loadSound("jump", "./sounds/jump.mp3");
loadSound("hit", "./sounds/hit.mp3");

setGravity(GRAVITY);
setBackground(BACKGROUND_COLOR);

const startGame = () => {
  go("game");
}

scene("game", () => {
  let score = 0;
  const game = add([timer()]);

  const createBird = () => {
    const bird = game.add([
      sprite("bird"),
      pos(WIDTH / 4, 0),
      area(),
      body(),
    ]);

    return bird;
  };

  const bird = createBird();

  const jump = () => {
    bird.jump(JUMP_FORCE);
    play("jump");
  }

  onKeyPress("space", jump);
  onClick(jump);

  const createPipes = () => {
    const bottomPipeHeight = rand(
      PIPE_MIN_HEIGHT,
      HEIGHT - PIPE_MIN_HEIGHT - PIPE_OPEN
    );

    const topPipeHeight = HEIGHT - bottomPipeHeight - PIPE_OPEN;

    game.add([
      pos(width(), 0), // начальная позиция трубы за пределами экрана по оси X
      rect(PIPE_WIDTH, bottomPipeHeight), // создание нижней трубы
      color(PIPE_COLOR),
      outline(PIPE_BORDER),
      area(),
      move(LEFT, SPEED), // движение трубы влево со скоростью SPEED
      offscreen({ destroy: true }), // удаление трубы, когда она выходит за пределы экрана
      "pipe",
    ]);

    game.add([
      pos(WIDTH, bottomPipeHeight + PIPE_OPEN), // начальная позиция верхней трубы за пределами экрана по оси X
      rect(PIPE_WIDTH, topPipeHeight), // создание верхней трубы
      color(PIPE_COLOR),
      outline(PIPE_BORDER),
      area(),
      move(LEFT, SPEED), // движение трубы влево со скоростью SPEED
      offscreen({ destroy: true }), // удаление трубы, когда она выходит за пределы экрана
      "pipe",
      { passed: false }, // свойство, которое указывает, прошла ли птичка эту трубу
    ]);
  };

  game.loop(1.5, createPipes); // каждые 1.5 игровые единицы времени спавн труб

  bird.onUpdate(() => {
    const birdPosY = bird.pos.y;

    if (birdPosY >= HEIGHT || birdPosY <= CEILING) {
      go("lose", score);
    }
  });

  bird.onCollide("pipe", () => {
    play("hit");
    go("lose", score);
  });

  onUpdate("pipe", (pipe) => {
    if (pipe.pos.x + pipe.width <= bird.pos.x && pipe.passed === false) {
      addScore();

      pipe.passed = true;
    }
  });

  const createScoreLabel = () => {
    const scoreLabel = game.add([
      text(score),
      anchor("center"),
      pos(WIDTH / 2, 80),
      scale(2),
      fixed(),
      z(100),
    ]);

    return scoreLabel;
  };

  const scoreLabel = createScoreLabel();

  const addScore = () => {
    score++;
    scoreLabel.text = score;

    play("score");
  };
});

scene("lose", (score) => {
  add([
    text("Набрано очков: " + score),
    pos(center()),
    scale(0.5),
    anchor("center"),
  ]);

  onKeyPress("space", startGame);
  onClick(startGame);
});

startGame();