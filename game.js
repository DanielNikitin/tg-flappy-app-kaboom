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

loadSprite("bird", "./sprites/rofl.png");

loadSound("score", "./sounds/score.mp3");
loadSound("jump", "./sounds/jump.mp3");
loadSound("hit", "./sounds/hit.mp3");

setGravity(GRAVITY);
setBackground(BACKGROUND_COLOR);

const randomColor = () => {
  let color = null;
  while (!color) {
    try {
      color = Color.fromHex("#" + Math.floor(Math.random()*16777215).toString(16));
    } catch (error) {
      console.error("Invalid color:", error);
    }
  }
  return color;
};
 

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
    const bottomPipeColor = randomColor();
    const topPipeColor = randomColor();
    
    const bottomPipeHeight = rand(
      PIPE_MIN_HEIGHT,
      HEIGHT - PIPE_MIN_HEIGHT - PIPE_OPEN
    );
  
    const topPipeHeight = HEIGHT - bottomPipeHeight - PIPE_OPEN;
  
    game.add([
      pos(width(), 0),
      rect(PIPE_WIDTH, bottomPipeHeight),
      color(bottomPipeColor), // Используйте цвет для нижней трубы
      outline(PIPE_BORDER),
      area(),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      "pipe",
    ]);
  
    game.add([
      pos(WIDTH, bottomPipeHeight + PIPE_OPEN),
      rect(PIPE_WIDTH, topPipeHeight),
      color(topPipeColor), // Используйте цвет для верхней трубы
      outline(PIPE_BORDER),
      area(),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      "pipe",
      { passed: false },
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
    scale(1),
    anchor("center"),
  ]);

  onKeyPress("space", startGame);
  onClick(startGame);
});

startGame();