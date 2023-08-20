const playarea = document.getElementById("playarea");

const flowControl = (function(){
    // Monitor play button, start game, game over, return to playmode.
    const label = document.querySelector('label[for="num"]');
    const input = document.querySelector("#num");
    const play = document.querySelector('#play');
    const startbar = document.querySelector('.start-bar');
    const playbar = document.querySelector('.playbar');
    const reset = document.querySelector('#reset');

    function init(){
        input.value = 3;
        label.textContent = 3;
        gameBoard.initBoard(3);
        playbar.style.display = "none";
        startbar.style.display = "";
        reset.style.visibility = "hidden";
        playerController.setLock(true);
        
        input.oninput = function(){
            gameBoard.initBoard(parseInt(this.value));
            label.textContent = this.value;
        }
        
        play.onclick = () => {
            startGame();
        }
        
        reset.onclick = init;
    }
    
    function startGame(){
        playerController.indicate("","X")
        playerController.indicate("","O")
        startbar.style.display = "none";
        playbar.style.display = "";
        playerController.setLock(false);
    }

    return {init}
})();

const gameBoard = (function(){
    const board = [];
    const cells = [];
    let gsize = 3;
    document.getElementById("num").oninput = (function(){initBoard(this.value % 2 == 1 ? this.value: parseInt(this.value) + 1)})
    //functionify that lol
    const reset = document.querySelector("#reset");
    reset.style.visibility = "hidden";
    
    function initBoard(size){
        this.gsize = size;
        playarea.replaceChildren()
        board.splice(0)
        playarea.style.setProperty("--grid-size", size)
        for(let i = 0; i < size; i++){
            board.push([])
            for(let j = 0; j<size;j++){
                board[i].push(1);
                const elem = document.createElement('div');
                elem.setAttribute('data-id',parseInt(size * i + j));
                elem.classList.add("cell")
                elem.onclick = playerController.playMove.bind(elem, size *i + j)
                playarea.appendChild(elem)
            }
        }
        this.cells = [...playarea.querySelectorAll(".cell")]
    }

    function clearBoard(){
        this.board.fill(1, 0, 9);
        cells.forEach(cell => cell.textContent = "")
    }
    
    function checkWinner(x, y){
        let xreps = 0;
        let yreps = 0;
        let xyreps = 0;
        let dreps = 0;

        let diagonal = false;
        let mark = gameBoard.board[x][y];
        let limit = gameBoard.gsize;

        if(x == y || x == (limit - 1 - y) ){
            diagonal = true;
        }
        for(let i = 0; i < limit; i++){
            if( (gameBoard.board[x][i] == mark) ){
                xreps++;
            }
            if( (gameBoard.board[i][y] == mark) ){
                yreps++;
            }

            if(diagonal){
                if(gameBoard.board[i][i] == mark){
                    xyreps++;
                }
                if(gameBoard.board[i][limit - i - 1] == mark){
                    dreps++;
                }
            }
        }

        // console.log(mark,xreps, yreps, xyreps, dreps);
        if(xreps == limit || yreps == limit|| xyreps == limit || dreps == limit){
            return mark;
        }

    }

    function placeMark(posx, posy, mark){
        mark = mark.toUpperCase();
        if(this.board[posx][posy] != 1){
            return "Invalid Move";
        }
        else if(mark == "O" || mark == "X"){
            this.board[posx][posy] = mark;
            this.cells[gameBoard.gsize * posx + posy].textContent = mark;
            const winner = checkWinner(posx, posy)
            if(winner)
            {
                playerController.gameOver(winner)
            }
        }
    }

    return {board, gsize, initBoard, placeMark, clearBoard};
})();

const playerController = (function(){
    let mark = "X";
    let num_plays = 0;
    let px = 0;
    let py = 0;
    let lock = false;

    const playerMap = {
        "X" : document.querySelector('.score[data-id="1"] > .msg'),
        "O" : document.querySelector('.score[data-id="2"] > .msg')
    }

    function setLock(bool){
        lock = bool;
    }

    function indicate(text, player){
        playerMap[player].textContent = text;
    }

    function playMove(index){
        if(lock) {  return  }
        px = Math.floor(index / gameBoard.gsize);
        py = index % gameBoard.gsize;
        console.log(px,py,mark);
        gameBoard.placeMark(px, py, mark);
        num_plays++;
        
        if(num_plays >= (gameBoard.gsize * gameBoard.gsize)){
            gameOver();
        }

        if(!lock){
            indicate("Wait", mark)
            mark = (mark == "O" ? "X" : "O");
            indicate("Your turn", mark)
        }
    }

    function gameOver(_winner){
        if( !_winner ){
            //Draw
            indicate("Draw","X")
            indicate("Draw", "O")
        }
        else{
            // console.log(_winner);
            indicate("You won",_winner)
            indicate("Skill issue", _winner == "O" ? "X" : "O")
        }
        lock = true;
        mark = "X";
        num_plays = 0;
        reset.style.visibility = "visible";
    }

    return {playMove, gameOver, setLock, indicate}
})();

flowControl.init();
