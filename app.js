const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

document.addEventListener("DOMContentLoaded", () => {
  canvas.width = 240;
  canvas.height = 400;
});

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyA" || e.code === "ArrowLeft") playerMove(-1);
  if (e.code === "KeyD" || e.code === "ArrowRight") playerMove(1);
  if (e.code === "KeyQ" || e.code === "ShiftRight") rotatePiece(-1);
  if (e.code === "KeyE" || e.code === "ShiftLeft") rotatePiece(1);
  if (e.code === "KeyS" || e.code === "ArrowDown") dropPlayer();
});

const scoreContainer = document.querySelector(".score");

// Functions
const playerMove = (direction) => {
  player.position.x += direction;

  if (hasCollided()) player.position.x -= direction;
};

const dropPlayer = () => {
  player.position.y++;
  dropCounter = 0;

  if (hasCollided()) placePiece();
};

const placePiece = () => {
  player.position.y--;
  mergeArena();
  player.position.y = 0;
  player.tetrominoe = getRandomPiece();
  if (hasCollided()) fixPiece();
};

const rotatePiece = (direction = 1) => {
  const rotatedArray = [];
  const matrix = player.tetrominoe.matrix;

  for (let i = 0; i < matrix.length; i++) {
    rotatedArray.push(new Array([]));
  }

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      rotatedArray[i][j] = matrix[j][i];
    }
  }

  if (direction > 0) {
    rotatedArray.forEach((row) => row.reverse());
  } else {
    rotatedArray.reverse();
  }

  player.tetrominoe.matrix = rotatedArray;

  if (hasCollided() && !fixPiece()) rotatePiece(direction * -1);
};

const fixPiece = () => {
  let offset = 0;
  while (hasCollided()) {
    offset *= -1;
    offset >= 0 ? offset++ : offset--;
    player.position.x += offset;

    if (offset === -4 && hasCollided()) {
      player.position.x += 2;
      return false;
    }
  }
};

const drawPiece = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        c.strokeStyle = "black";
        c.fillStyle = player.tetrominoe.color;
        c.fillRect(
          (x + offset.x) * pixelSize,
          (y + offset.y) * pixelSize,
          pixelSize,
          pixelSize
        );
        c.strokeRect(
          (x + offset.x) * pixelSize,
          (y + offset.y) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    });
  });
};

const mergeArena = () => {
  const [matrix, position] = [player.tetrominoe.matrix, player.position];

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0)
        arena[y + position.y][x + position.x] = {
          value: 1,
          color: player.tetrominoe.color,
        };
    }
  }

  checkArena();
};

const checkArena = () => {
  let rowsRemoved = 0;

  arena.forEach((row, y) => {
    if (row.find((object) => object.value === 1) && y === 0) endGame();
    if (!row.includes(0)) clearRow(y), rowsRemoved++;
  });

  addScore(rowsRemoved);
};

const clearRow = (yIndex) => {
  while (yIndex > 0) {
    arena[yIndex] = arena[--yIndex];
  }
};

const addScore = (rowsRemoved) => {
  if (rowsRemoved === 1) score += 40;
  if (rowsRemoved === 2) score += 100;
  if (rowsRemoved === 3) score += 300;
  if (rowsRemoved === 4) score += 1200;

  scoreContainer.innerHTML = score;
};

const createMatrix = (width, height) => {
  const matrix = [];

  for (let row = 0; row < height; row++) {
    matrix.push(new Array(width).fill(0));
  }

  return matrix;
};

const hasCollided = () => {
  const [matrix, position] = [player.tetrominoe.matrix, player.position];

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (
        matrix[y][x] !== 0 &&
        (arena[y + position.y] && arena[y + position.y][x + position.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
};

const getRandomPiece = () => {
  const pieces = [
    {
      name: "I",
      color: "#09f0f0",
      matrix: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
    {
      name: "J",
      color: "#0000f0",
      matrix: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
    },
    {
      name: "L",
      color: "#eea002",
      matrix: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
    },
    {
      name: "O",
      color: "#f0f001",
      matrix: [
        [1, 1],
        [1, 1],
      ],
    },
    {
      name: "S",
      color: "#07f001",
      matrix: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
    },
    {
      name: "Z",
      color: "#f00101",
      matrix: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
    },
    {
      name: "T",
      color: "#a000f0",
      matrix: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
    },
  ];

  return pieces[Math.floor(Math.random() * pieces.length)];
};

const endGame = () => {
  const endGameContainer = document.querySelector(".end-game-container");
  const finalScoreContainer = document.querySelector(".final-score");
  const retryBtn = document.querySelector(".btn");

  gameActive = false;
  finalScoreContainer.innerHTML = score;
  endGameContainer.style.display = "flex";
  retryBtn.addEventListener("click", () => location.reload());
};

// Animate Function
const dropInterval = 1000; // drops piece 1 time every second (1000ms)
let dropCounter = 0;
let lastTime = 0;

const animate = (time = 0) => {
  if (gameActive) requestAnimationFrame(animate);

  const milliSecondsPerFrame = time - lastTime;
  lastTime = time;

  dropCounter += milliSecondsPerFrame;
  if (dropCounter > dropInterval) dropPlayer();

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  drawPiece(player.tetrominoe.matrix, player.position);

  arena.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        c.strokeStyle = "black";
        c.fillStyle = value.color;
        c.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        c.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    });
  });
};

// Game Setup

let score = 0;

let gameActive = true;
const pixelSize = 20;
const player = {
  position: { x: 5, y: 0 },
  tetrominoe: getRandomPiece(),
};
const arena = createMatrix(12, 20);

animate();
