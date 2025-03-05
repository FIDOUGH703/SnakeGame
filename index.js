const canvas = document.getElementById("canvas");
const pen = canvas.getContext("2d");
const cs = 30; // Cell size
const w = 1000;
const h = 600;
let food = null;
let count = 0;
let gameLoopId = null;
let gameOverFlag = false; // Flag to stop drawing after game over

// 🎵 Load sound effects
const eatSound = new Audio("eat.mp3"); // Food eaten sound
const gameOverSound = new Audio("gameover.mp3"); // Game over sound
const moveSound = new Audio("move.mp3"); // Movement sound

class Snake {
    constructor() {
        this.init_len = 5;
        this.direction = "right";
        this.cells = [];
    }

    createSnake() {
        for (let i = 0; i < this.init_len; i++) {
            this.cells.push({ x: i, y: 0 });
        }
    }

    drawSnake() {
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            pen.fillStyle = i === this.cells.length - 1 ? "#FFBF00" : "#FF5733"; // Head yellow, body red
            pen.beginPath();
            pen.roundRect(cell.x * cs, cell.y * cs, cs - 2, cs - 2, 5); // Rounded rectangle
            pen.fill();
        }
    }

    updateSnake() {
        if (gameOverFlag) return; // Stop updating if game over

        const headX = this.cells[this.cells.length - 1].x;
        const headY = this.cells[this.cells.length - 1].y;
        let nextX = headX;
        let nextY = headY;

        // 🍎 Eating food
        if (food.x === headX && food.y === headY) {
            eatSound.play();
            food = randomFood();
            count++;
        } else {
            this.cells.shift();
        }

        if (this.direction === "left") nextX--;
        if (this.direction === "right") nextX++;
        if (this.direction === "up") nextY--;
        if (this.direction === "down") nextY++;

        // 🚧 Wall Collision
        if (nextX < 0 || nextX * cs >= w || nextY < 0 || nextY * cs >= h) {
            gameOver();
            return;
        }

        // 🐍 Self-Collision
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].x === nextX && this.cells[i].y === nextY) {
                gameOver();
                return;
            }
        }

        this.cells.push({ x: nextX, y: nextY });
    }

    changeDirection(direction) {
        if (
            (direction === "left" && this.direction !== "right") ||
            (direction === "right" && this.direction !== "left") ||
            (direction === "up" && this.direction !== "down") ||
            (direction === "down" && this.direction !== "up")
        ) {
            this.direction = direction;
            moveSound.play(); // 🔊 Play movement sound
        }
    }
}

const snake = new Snake();

function init() {
    snake.createSnake();
    snake.drawSnake();
    food = randomFood();
    document.addEventListener("keydown", keyPressed);
}

function keyPressed(e) {
    if (e.key === "ArrowLeft") snake.changeDirection("left");
    if (e.key === "ArrowRight") snake.changeDirection("right");
    if (e.key === "ArrowUp") snake.changeDirection("up");
    if (e.key === "ArrowDown") snake.changeDirection("down");
}

function update() {
    snake.updateSnake();
}

function draw() {
    if (gameOverFlag) return; // Stop drawing if game is over

    pen.clearRect(0, 0, w, h);
    drawBackground();
    snake.drawSnake();
    drawFood();
    drawScore();
}

function drawBackground() {
    pen.fillStyle = "#222";
    pen.fillRect(0, 0, w, h);
    pen.strokeStyle = "#444";
    for (let x = 0; x < w; x += cs) {
        for (let y = 0; y < h; y += cs) {
            pen.strokeRect(x, y, cs, cs);
        }
    }
}

function drawFood() {
    pen.fillStyle = "lime";
    pen.beginPath();
    pen.arc(food.x * cs + cs / 2, food.y * cs + cs / 2, cs / 2 - 2, 0, Math.PI * 2);
    pen.fill();
}

function drawScore() {
    pen.fillStyle = "white";
    pen.font = "24px Arial";
    pen.fillText(`Score: ${count}`, 20, 30);
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * (w / cs)),
        y: Math.floor(Math.random() * (h / cs))
    };
}

function gameLoop() {
    if (gameOverFlag) return; // Stop further updates and rendering
    update();
    draw();
}

function gameOver() {
    clearInterval(gameLoopId);
    gameOverFlag = true; // Stop further updates and rendering
    gameOverSound.play(); // 🔊 Play game over sound

    pen.fillStyle = "white";
    pen.font = "50px Arial";
    pen.fillText("Game Over!", w / 3, h / 2);
    pen.font = "20px Arial";
    pen.fillText("Press Space to Restart", w / 3, h / 2 + 40);
    
    document.addEventListener("keydown", restartGame);
}

function restartGame(e) {
    if (e.key === " ") {
        count = 0;
        gameOverFlag = false; // Reset flag
        snake.cells = [];
        snake.createSnake();
        snake.direction = "right";
        food = randomFood();
        gameLoopId = setInterval(gameLoop, 150);
        document.removeEventListener("keydown", restartGame);
    }
}

init();
gameLoopId = setInterval(gameLoop, 150);
