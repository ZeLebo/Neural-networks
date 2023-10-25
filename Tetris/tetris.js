const canvas = document.getElementById("tetris");
const ctx = canvas.getContext('2d');
const scale = 40;

ctx.scale(scale, scale);

const tWidth = canvas.width / scale;
const tHeight = canvas.height / scale;

const score = 0;
const div = document.getElementById('score');
div.innerText = " score: " + score;

const pieces = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0]
    ],
    [
        [0, 0, 0],
        [3, 3, 0],
        [0, 3, 3]
    ],
    [
        [0, 0, 0],
        [0, 4, 4],
        [4, 4, 0]
    ],
    [
        [5, 0, 0],
        [5, 0, 0],
        [5, 5, 0]
    ],
    [
        [0, 0, 6],
        [0, 0, 6],
        [0, 6, 6]
    ],
    [
        [0, 0, 0],
        [7, 7, 7],
        [0, 7, 0]
    ]
];

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF'
];

let arena = [];

let rand;

const player = {
    pos: {x: 0, y: 1},
    matrix: null,
    color: null,
    score: 0
}

rand = Math.floor(Math.random() * pieces.length);
player.matrix = pieces[rand];
player.color = colors[rand+1];
player.score = 0;

function updateScore(newScore) {
    div.innerText = " score: " + newScore;
}

function drawMatrix(matrix, x, y) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j])
                ctx.fillRect(x + j, y + i, 1, 1);
        }
    }
}

function rotateMatrix(matrix, dir) {
    let newMatrix = [];

    for (let i in matrix)
        newMatrix.push([]);

    if (dir === 1) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                newMatrix[j][matrix.length - i - 1] = matrix[i][j];
            }
        }
    } else {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                newMatrix[matrix.length - j - 1][i] = matrix[i][j];
            }
        }
    }

    return newMatrix;
}

function collides(player, arena) {
    for (let i = 0; i < player.matrix.length; i++) {
        for (let j = 0; j < player.matrix[i].length; j++) {
            if (player.matrix[i][j] && arena[player.pos.y + i + 1][player.pos.x + j + 1])
                return 1;
        }
    }

    return 0;
}

function mergeArena(matrix, x, y) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            arena[y+i+1][x+j+1] = arena[y+i+1][x+j+1] || matrix[i][j];
        }
    }
}

function clearBlocks() {
    let cnt = 0
    for (let i = 1; i < arena.length-2; i++) {
        let clear = 1;

        for (let j = 1; j < arena[i].length-1; j++) {
            if (!arena[i][j])
                clear = 0;
        }

        if (clear) {
            let r = new Array(tWidth).fill(0);
            r.push(1);
            r.unshift(1);
            cnt += 1;

            arena.splice(i, 1);
            arena.splice(1, 0, r);
        }
    }
    player.score += cnt * (player.score + 1); 
    updateScore(player.score);
}

function drawArena() {
    for (let i = 1; i < arena.length-2; i++) {
        for (let j = 1; j < arena[i].length-1; j++) {
            if (arena[i][j]) {
                ctx.fillStyle = colors[arena[i][j]];
                ctx.fillRect(j-1, i-1, 1, 1);
            }
        }
    }
}

function initArena() {
    arena = [];

    const r = new Array(tWidth + 2).fill(1);
    arena.push(r);

    for (let i = 0; i < tHeight; i++) {
        let row = new Array(tWidth).fill(0);
        row.push(1);
        row.unshift(1);

        arena.push(row);
    }

    arena.push(r);
    arena.push(r);
}


function gameOver() {
    player.score = 0;
    for (let j = 1; j < arena[1].length-1; j++)
        if (arena[1][j])
            return initArena();

    return;
}

let interval = 500;
let lastTime = 0;
let count = 0;
let isPaused = false;

function update(time = 0) {
    if (isPaused) {
        requestAnimationFrame(update);
        return;
    }
    const dt = time - lastTime;
    lastTime = time;
    count += dt;

    if (count >= interval) {
        player.pos.y++;
        count = 0;
    }

    if (collides(player, arena)) {
        mergeArena(player.matrix, player.pos.x, player.pos.y-1);
        clearBlocks();
        gameOver();

        player.pos.y = 1;
        player.pos.x = 0;

        rand = Math.floor(Math.random() * pieces.length);
        player.matrix = pieces[rand];
        player.color = colors[rand+1];

        interval = 1000;
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawArena();
    ctx.fillStyle = player.color;
    drawMatrix(player.matrix, player.pos.x, player.pos.y);

    requestAnimationFrame(update);
}


document.addEventListener("keydown", event => {
    if (isPaused) {
        if (event.keyCode === 13) {
            isPaused = false;
            update();
        }
        return;
    }
    if (event.keyCode === 13) {
        isPaused = true;
        return;
    } else if (event.keyCode === 37 && interval-1) {
        player.pos.x--;
        if (collides(player, arena))
            player.pos.x++;
    } else if (event.keyCode === 39 && interval-1) {
        player.pos.x++;
        if (collides(player, arena))
            player.pos.x--;
    } else if (event.keyCode === 40) {
        player.pos.y++;
        count = 0;
    } else if (event.keyCode === 38) {
        player.matrix = rotateMatrix(player.matrix, 1);
        if (collides(player, arena))
            player.matrix = rotateMatrix(player.matrix, -1);
    } else if (event.keyCode === 32) {
        interval = 1;
    }
});

initArena();
update();