const playarea = document.getElementById("playarea");

const g = (function(){
    const board = [[1,1,1],[1,1,1],[1,1,1]];
    const cells = [...playarea.querySelectorAll(".cell")];
    const notice = document.querySelector("h1")
    
    function clearBoard(){
        this.board.fill(1, 0, 9);
        cells.forEach(cell => cell.textContent = "")
    }
    
    function checkWinner(){
        let reps = 0;
        let mark = 0;
        
        for(let i = 0; i < 3; i++){
            mark = g.board[i][0];
            reps = 0;
            for(let j = 0; j < 3;  j++){
                if( g.board[i][j] == mark ){
                    reps++;
                }
            }
            if(reps > 2 && mark != 1){
                return mark;
            }
        }

        for(let i = 0; i < 3; i++){
            mark = g.board[0][i];
            reps = 0;
            for(let j = 0; j < 3;  j++){
                if( g.board[j][i] == mark ){
                    reps++;
                }
            }
            if(reps > 2 && mark != 1){
                return mark;
            }
        }

        mark = g.board[0][0];
        reps = 0;
        for(let i = 0; i < 3; i++){
            if( g.board[i][i] == mark ){
                reps++;
            }
            }
        if(reps > 2 && mark != 1){
            return mark;
        }

        mark = g.board[0][2];
        reps = 0;
        for(let i = 0; i < 3; i++){
            if( g.board[i][Math.abs(i-2)] == mark ){
                console.log("Checking " + i + " and " + Math.abs(i-2) );
                reps++;
            }
        }
        if(reps > 2 && mark != 1){
            return mark;
        }


    }

    function pm(posx, posy, mark){
        mark = mark.toUpperCase();
        if(this.board[posx][posy] != 1){
            return "Invalid Move";
        }
        else if(mark == "O" || mark == "X"){
            this.board[posx][posy] = mark;
            cells[3 * posx + posy].textContent = mark;
            if(checkWinner())
            {
                notice.textContent = checkWinner();
            }
        }
    }

    return {board, cells, pm, clearBoard};
})();

const playerController = (function(){
    let mark = "X";
    let px = 0;
    let py = 0;

    function playMove(index){
        px = Math.floor(index / 3);
        py = index % 3;
        console.log({px, py});
        g.pm(px, py, mark);
        mark = (mark == "O" ? "X" : "O");
    }

    return {playMove}
})();

g.cells.forEach(cell => cell.onclick = playerController.playMove.bind(cell, cell.getAttribute('data-id')));
