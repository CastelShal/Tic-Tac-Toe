const playarea = document.getElementById("playarea");

const flowControl = (function () {
    // Monitor play button, start game, game over, return to playmode.
    const label = document.querySelector('label[for="num"]');
    const input = document.querySelector("#num");
    const play = document.querySelector('#play');
    const startbar = document.querySelector('.start-bar');
    const playbar = document.querySelector('.playbar');
    const reset = document.querySelector('#reset');

    function init() {
        input.value = 3;
        label.textContent = 3;
        gameBoard.initBoard(3);
        playbar.style.display = "none";
        startbar.style.display = "";
        reset.style.visibility = "hidden";
        playerController.setLock(true);

        input.oninput = function () {
            gameBoard.initBoard(parseInt(this.value));
            label.textContent = this.value;
        }

        play.onclick = () => {
            startGame();
        }

        reset.onclick = init;
    }

    function startGame() {
        playerController.indicate("", "X")
        playerController.indicate("", "O")
        startbar.style.display = "none";
        playbar.style.display = "";
        playerController.setLock(false);
    }

    return { init }
})();

const gameBoard = (function () {
    const board = [];
    const cells = [];
    let gsize = 3;
    document.getElementById("num").oninput = (function () { initBoard(this.value % 2 == 1 ? this.value : parseInt(this.value) + 1) })
    //functionify that lol
    const reset = document.querySelector("#reset");
    reset.style.visibility = "hidden";

    function initBoard(size) {
        this.gsize = size;
        playarea.replaceChildren()
        board.splice(0)
        playarea.style.setProperty("--grid-size", size)
        for (let i = 0; i < size; i++) {
            board.push([])
            for (let j = 0; j < size; j++) {
                board[i].push(1);
                const elem = document.createElement('div');
                elem.setAttribute('data-id', parseInt(size * i + j));
                elem.classList.add("cell")
                elem.onclick = playerController.playMove.bind(elem, size * i + j)
                playarea.appendChild(elem)
            }
        }
        this.cells = [...playarea.querySelectorAll(".cell")]
    }

    function clearBoard() {
        this.board.fill(1, 0, 9);
        cells.forEach(cell => cell.textContent = "")
    }

    function checkWinner(x, y) {
        let xreps = 0;
        let yreps = 0;
        let xyreps = 0;
        let dreps = 0;

        let diagonal = false;
        let mark = gameBoard.board[x][y];
        let limit = gameBoard.gsize;

        if (x == y || x == (limit - 1 - y)) {
            diagonal = true;
        }
        for (let i = 0; i < limit; i++) {
            if ((gameBoard.board[x][i] == mark)) {
                xreps++;
            }
            if ((gameBoard.board[i][y] == mark)) {
                yreps++;
            }

            if (diagonal) {
                if (gameBoard.board[i][i] == mark) {
                    xyreps++;
                }
                if (gameBoard.board[i][limit - i - 1] == mark) {
                    dreps++;
                }
            }
        }

        // console.log(mark,xreps, yreps, xyreps, dreps);
        if (xreps == limit || yreps == limit || xyreps == limit || dreps == limit) {
            return mark;
        }

    }

    function placeMark(posx, posy, mark, _cpu) {
        if (_cpu) {
            this.board[posx][posy] = mark;
            return;
        }
        mark = mark.toUpperCase();
        if (this.board[posx][posy] != 1) {
            return false;
        }
        else if (mark == "O" || mark == "X") {
            this.board[posx][posy] = mark;
            this.cells[gameBoard.gsize * posx + posy].textContent = mark;
            const winner = checkWinner(posx, posy)
            if (winner) {
                playerController.gameOver(winner)
            }
        }
        return true;
    }

    return { board, gsize, initBoard, checkWinner, placeMark, clearBoard };
})();

const playerController = (function () {
    let mark = "X";
    let num_plays = 0;
    let px = 0;
    let py = 0;
    let lock = false;

    const playerMap = {
        "X": document.querySelector('.score[data-id="1"] > .msg'),
        "O": document.querySelector('.score[data-id="2"] > .msg')
    }

    function setLock(bool) {
        lock = bool;
    }

    function indicate(text, player) {
        playerMap[player].textContent = text;
    }

    function getMove(){
        return num_plays;
    }

    function playMove(index) {
        if (lock) { return }
        px = Math.floor(index / gameBoard.gsize);
        py = index % gameBoard.gsize;
        //console.log(px,py,mark);
        let valid = gameBoard.placeMark(px, py, mark);
        if (!valid) return;
        console.log("Playing move ",num_plays);
        num_plays++;
        
        if (num_plays >= (gameBoard.gsize * gameBoard.gsize)) {
            gameOver();
        }
        
        if (!lock) {
            indicate("Wait", mark)
            mark = (mark == "O" ? "X" : "O");
            indicate("Your turn", mark)
        }
        
        if (mark == 'O') {
            valid = gameBoard.placeMark(...cpuPlayer.findBestMove(), 'O')
            if (!valid) return;
            console.log("Played move ",num_plays);
            num_plays++;
        }
        
        if (!lock) {
            indicate("Wait", mark)
            mark = (mark == "O" ? "X" : "O");
            indicate("Your turn", mark)
        }
    }
    
    function gameOver(_winner) {
        if (!_winner) {
            //Draw
            indicate("Draw", "X")
            indicate("Draw", "O")
        }
        else {
            // console.log(_winner);
            indicate("You won", _winner)
            indicate("Skill issue", _winner == "O" ? "X" : "O")
        }
        lock = true;
        mark = "X";
        num_plays = 0;
        reset.style.visibility = "visible";
    }

    return { getMove, playMove, gameOver, setLock, indicate }
})();
let logNow = false;
const cpuPlayer = (function () {
    // requires access to board state
    function minimax(x, y, depth, isMax) {
        if (logNow) {
            // console.log(gameBoard.board[0], gameBoard.board[1], gameBoard.board[2]);
            console.log(`Number of plays done is ${depth} + ${playerController.getMove()} = ${depth + playerController.getMove() + 1}`);
        }
        let score;
        let winMark = gameBoard.checkWinner(x, y);
        if (winMark == "X") { score = -10 };
        if (winMark == "O") { score = 10 };

        // If Maximizer has won the game 
        // return his/her evaluated score 
        if (score == 10) {
            if (logNow) console.log("--".repeat(depth), { x, y, depth, score: (score -X depth) }, "CPU win")
            return 10 - depth;
        }

        // If Minimizer has won the game 
        // return his/her evaluated score 
        if (score == -10) {
            if (logNow) console.log("--".repeat(depth), { x, y, depth, score: (depth - score) }, "Player win")
            return depth - 10;
        }
        // If there are no more moves and 
        // no winner then it is a tie 
        if (playerController.getMove() + depth + 1 >= gameBoard.gsize * gameBoard.gsize) {
            if (logNow) console.log("Draw")
            return 0;
        }
        if (logNow) {
            // console.log(gameBoard.board[0], gameBoard.board[1], gameBoard.board[2]);
            console.log("--".repeat(depth), { x, y, depth, isMax, score });
        }
        // If this maximizer's move 
        if (isMax) {
            let best = -100;
            // Traverse all cells 
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    // Check if cell is empty 
                    if (gameBoard.board[i][j] == 1) {
                        // Make the move 
                        gameBoard.board[i][j] = 'O';
                        // Call minimax recursively  
                        // and choose the maximum value 
                        best = Math.max(best, minimax(i, j, depth + 1, !isMax));
                        // console.log(best)
                        // Undo the move 
                        gameBoard.board[i][j] = 1;
                    }
                }
            }
            return best;
        }

        // If this minimizer's move 
        else {
            let best = 100;
            // Traverse all cells 
            for (let i = 0; i < gameBoard.gsize; i++) {
                for (let j = 0; j < gameBoard.gsize; j++) {
                    // Check if cell is empty 
                    if (gameBoard.board[i][j] == 1) {
                        // Make the move 
                        gameBoard.board[i][j] = 'X';
                        // Call minimax recursively and  
                        // choose the minimum value 
                        best = Math.min(best, minimax(i, j, depth + 1, !isMax));
                        // console.log(best);
                        // Undo the move 
                        gameBoard.board[i][j] = 1;
                    }
                }
            }
            return best;
        }

    }

    function findBestMove() {
        let row, col;
        let bestVal = -100;
        for (let i = 0; i < gameBoard.gsize; i++) {
            for (let j = 0; j < gameBoard.gsize; j++) {
                if (gameBoard.board[i][j] == 1) {
                    console.log(i, j);
                    gameBoard.placeMark(i, j, 'O', true);
                    // console.log(gameBoard.board[0],gameBoard.board[1], gameBoard.board[2])
                    let moveval = minimax(i, j, 0, false)
                    console.log(moveval)
                    gameBoard.placeMark(i, j, 1, true);
                    if (moveval > bestVal) {
                        row = i;
                        col = j;
                        bestVal = moveval
                    }
                }
            }
        }
        // gameBoard.placeMark(1, 2, 'O', true);
        // console.log(gameBoard.board[0], gameBoard.board[1], gameBoard.board[2]);
        // let moveval = minimax(1, 2, 0, false);
        // console.log(moveval);
        // gameBoard.placeMark(1, 2, 1, true);
        console.log("bestval", bestVal);
        console.log([row, col])
        return [row, col]
    }

    function findSpecificMove(x, y) {
        let row, col;
        gameBoard.placeMark(x, y, 'O', true);
        console.log(gameBoard.board[0], gameBoard.board[1], gameBoard.board[2]);
        let moveval = minimax(x, y, 0, false);
        console.log(moveval);
        gameBoard.placeMark(x, y, 1, true);
        return [row, col]
    }

    return { findBestMove, findSpecificMove }
})();

flowControl.init();
