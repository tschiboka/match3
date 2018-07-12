// jshint esversion: 6

function start() {
    setMessageBoardSize();
    window.onresize = setMessageBoardSize;
    updateLevelPanel();
    let levelIds = document.getElementById("level-panel").getElementsByClassName("level-button");
    [...levelIds].map(el=>{
        el.addEventListener("mouseenter",function( event ) {
            el.style.border = "2px inset rgba(10,10,10,0.6)";
        }); // end of mouseenter event
        el.addEventListener("mouseleave",function( event ) {
            setTimeout(() => el.style.border = "2px outset rgba(10,10,10,0.6)",300); // button resets with small delay
        }); // end of mouseleave event
        el.addEventListener("click",function( event ) {
            if ((ind=(this.id.match(/\d+/)[0])) <= score.findIndex(el => el==0)+1) startLevel(ind); // prevent starting levels which are still unlocked
        }); // end of click event
        let button = document.getElementById("start-button");
        button.addEventListener("mouseenter",function( event ) {
            button.style.border = "2px inset rgba(10,10,10,0.6)";
        }); // end of mouseenter event
        button.addEventListener("mouseleave",function( event ) {
              setTimeout(() => button.style.border = "2px outset rgba(10,10,10,0.6)",300); // button resets with small delay
        }); // end of mouseleave event
        button.addEventListener("click",function( event ) {
            document.getElementById("message-panel").style.visibility = "hidden";
            document.getElementById("start-button").style.visibility = "hidden";
            points = 0;
            gameOn = true;
        }); // end of click event
    }); // end of map
    let fruitTds = document.getElementById("table-div").getElementsByTagName("td");
    [...fruitTds].map(el=>el.addEventListener("click",function(){ if(!pause && gameOn) select(this); }));
    //startTimer();
}

const randomBoard = (num) => {
    let b = [];  // empty board
    for (let ri=0; ri<10; ri++) {
        let row = [];
        for (let ci=0; ci<10; ci++) {
            let rNums = [...Array(num)].map((e,i) => i),
                [l2,l1,d1,d2] = [(b[ri]||[])[ci-2],(b[ri]||[])[ci-1],(b[ri-1]||[])[ci],(b[ri-2]||[])[ci]];
            if (l2==l1) { rNums = rNums.filter(el => el != l1); } // take num out of possible ones if
            if (d1==d2) { rNums = rNums.filter(el => el != d1); } // there is chance of matching three
            let cell = rNums[Math.floor(Math.random()*rNums.length)];
            if (ci == 0) b.push(row); // unconvenctional, but need to prime b in order to access it
            b[ri].push(cell);
        } // end of inner for
    } // end of outer for
    return b;
}; // end of randomBoard

var board = [],
    selected = [],
    selectable = true,
    points = 0,
    fruitNumber = 5,
    pause = false,
    gameOn = false,
    timeFromLastMove = 0,
    chooseHint = 0,
    currentLevel = 0,
    hintsTimer = setInterval(() => {
        if (gameOn && !pause) timeFromLastMove++;
        if (timeFromLastMove == 5) chooseHint = hints[Math.floor(Math.random()*hints.length)]; // preselect hint way befor its use
        if (timeFromLastMove > 10) {  // blinking effect when no selection for xy secs
            let countBlink = 0;
                blinkElem = document.getElementById(`r${chooseHint[0]}c${chooseHint[1]}`);
                originalBackGround = blinkElem.style.backgroundColor;
            var blink = setInterval(() => {
                countBlink++;
                blinkElem.style.backgroundColor = (countBlink%2) ? "rgba(242, 86, 86, 0.5)" : originalBackGround;
                if (countBlink > 5)  {
                    clearInterval(blink);
                    timeFromLastMove = 0;
               } // end of if counBlink > 5
            },150); // end of inner setInterval
        } // end of of
    },1000), // end of hint Timer
    hints = [],
    score = [1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,
             1,1,0,0,0,0,0,
             0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,
             0,0,0,0,0,0,0], // 49 slots
    levels = [{description : "Get 300 points in 60 secounds.",
              time : 60,
              condition : [(p,b) => p >= 300,
                           (p,b) => p >= 700,
                           (p,b) => p >= 1000]},
             {description : "Get 200 points while flower has to reach the bottom. Flowers can move sideways. You have 3 minutes!",
              time : 60,
              condition : [(p,b) => p >= 200 && b[9].some(el => el == 12), // last row has flower
                           (p,b) => p >= 300 && b[9].some(el => el == 12),
                           (p,b) => p >= 500 && b[9].some(el => el == 12)]},
             {description : "Get minimum 300 points in 1 minute",
              time : 60,
              condition : [(p,b) => p >= 300,
                           (p,b) => p >= 400,
                           (p,b) => p >= 500]},
             {description : "Get at least 300 points in 1 minute",
              time : 60,
              condition : [(p,b) => p >= 300,
                           (p,b) => p >= 400,
                           (p,b) => p >= 500]},
             {description : "Get 200 points while two flowers have to reach the bottom. You have 2 minutes!",
              time : 120,
              condition : [(p,b) => p >= 200 && b[9].some(el => el == 12) && b[9].some(el => el == 13), // last row has both flowers
                           (p,b) => p >= 300 && b[9].some(el => el == 12) && b[9].some(el => el == 13),
                           (p,b) => p >= 500 && b[9].some(el => el == 12) && b[9].some(el => el == 13)]},
             {description : "Get 1000 points while all flowers have to reach the bottom. You have 3 minutes!",
              time : 180,
              condition : [(p,b) => p >= 1000 && b[9].some(el => el == 12) && b[9].some(el => el == 13) && b[9].some(el => el == 14),
                           (p,b) => p >= 1500 && b[9].some(el => el == 12) && b[9].some(el => el == 13) && b[9].some(el => el == 14),
                           (p,b) => p >= 2000 && b[9].some(el => el == 12) && b[9].some(el => el == 13) && b[9].some(el => el == 14)]},
            {description : "Get at least 300 points in 1 minute",
             time : 60,
             condition : [(p,b) => p >= 300,
                          (p,b) => p >= 400,
                          (p,b) => p >= 500]},
            {description : "Get at least 100 points in 1 minute",
             time : 60,
             condition : [(p,b) => p >= 100,
                          (p,b) => p >= 150,
                          (p,b) => p >= 200]},
            {description : "Get 100 points while flower has to reach the bottom. You have 2 minutes!",
             time : 120,
             condition : [(p,b) => p >= 100 && b[9].some(el => el == 14),
                          (p,b) => p >= 150 && b[9].some(el => el == 14),
                          (p,b) => p >= 200 && b[9].some(el => el == 14)]},
            {description : "Get at least 100 points in 1 minute",
             time : 60,
             condition : [(p,b) => p >= 100,
                          (p,b) => p >= 150,
                          (p,b) => p >= 200]},
           {description : "Get 300 points while flower has to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 300 && b[8][b[9].findIndex(e => e == 17)] == 15, // flower is above basket
                         (p,b) => p >= 450 && b[8][b[9].findIndex(e => e == 17)] == 15,
                         (p,b) => p >= 600 && b[8][b[9].findIndex(e => e == 17)] == 15]},
           {description : "Get 300 points while flower has to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 300 && b[8][b[9].findIndex(e => e == 17)] == 15, // flower is above basket
                         (p,b) => p >= 450 && b[8][b[9].findIndex(e => e == 17)] == 15,
                         (p,b) => p >= 600 && b[8][b[9].findIndex(e => e == 17)] == 15]},
           {description : "Get 300 points while all flowers have to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 300 && b[8][4] > 14 && b[8][5] > 14,
                         (p,b) => p >= 450 && b[8][4] > 14 && b[8][5] > 14,
                         (p,b) => p >= 600 && b[8][4] > 14 && b[8][5] > 14]},
           {description : "Get 300 points while all flowers have to be on the basket. You have 3 minutes!",
            time : 180,
            condition : [(p,b) => p >= 300 && b[8][2] > 13 && b[8][4] > 13 && b[8][7] > 13,
                         (p,b) => p >= 450 && b[8][2] > 13 && b[8][4] > 13 && b[8][7] > 13,
                         (p,b) => p >= 600 && b[8][2] > 13 && b[8][4] > 13 && b[8][7] > 13]},
           {description : "Get 300 points while flower has to be on the basket. You have 3 minutes!",
            time : 180,
            condition : [(p,b) => p >= 300 && (b[8][4] > 13 || b[8][5] > 13),
                         (p,b) => p >= 450 && (b[8][4] > 13 || b[8][5] > 13),
                         (p,b) => p >= 600 && (b[8][4] > 13 || b[8][5] > 13)]},
           {description : "Get 300 points while flower has to be on the basket. You have 3 minutes!",
            time : 180,
            condition : [(p,b) => p >= 300 && (b[7][1] > 13 || b[7][8] > 13),
                         (p,b) => p >= 450 && (b[7][1] > 13 || b[7][8] > 13),
                         (p,b) => p >= 600 && (b[7][1] > 13 || b[7][8] > 13)]},
           {description : "Get 200 points while all flowers have to be on the basket. You have 3 minutes!",
            time : 180,
            condition : [(p,b) => p >= 200 && b[5][3] > 13 && b[5][5] > 13 && b[5][7] > 13,
                         (p,b) => p >= 350 && b[5][3] > 13 && b[5][5] > 13 && b[5][7] > 13,
                         (p,b) => p >= 400 && b[5][3] > 13 && b[5][5] > 13 && b[5][7] > 13]},
           {description : "Get 200 points while all flowers have to be on the basket. You have 3 minutes!",
            time : 180,
            condition : [(p,b) => p >= 200 && b[7][3] > 12 && b[7][4] > 12 && b[7][5] > 12 && b[7][6] > 12,
                         (p,b) => p >= 350 && b[7][3] > 12 && b[7][4] > 12 && b[7][5] > 12 && b[7][6] > 12,
                         (p,b) => p >= 400 && b[7][3] > 12 && b[7][4] > 12 && b[7][5] > 12 && b[7][6] > 12]},
           {description : "Get 500 points while all flowers have to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 500 && b[7][0] > 12 && b[7][9] > 12,
                         (p,b) => p >= 600 && b[7][0] > 12 && b[7][9] > 12,
                         (p,b) => p >= 700 && b[7][0] > 12 && b[7][9] > 12]},
           {description : "Get 100 points. You need to be fast, you have just 2 minutes!",
            time : 60,
            condition : [(p,b) => p >= 100,
                         (p,b) => p >= 150,
                         (p,b) => p >= 200]},
           {description : "Get 200 points while all flowers have to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 200 && b[7][0] > 11 && b[7][9] > 11,
                         (p,b) => p >= 300 && b[7][0] > 11 && b[7][9] > 11,
                         (p,b) => p >= 400 && b[7][0] > 11 && b[7][9] > 11]},
           {description : "Get 200 points while all flowers have to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 200 && b[7][0] > 11 && b[7][9] > 11,
                         (p,b) => p >= 300 && b[7][0] > 11 && b[7][9] > 11,
                         (p,b) => p >= 400 && b[7][0] > 11 && b[7][9] > 11]},
           {description : "Get 200 points while all flowers have to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 200 && b[4][0] > 11 && b[4][9] > 11,
                         (p,b) => p >= 300 && b[4][0] > 11 && b[4][9] > 11,
                         (p,b) => p >= 400 && b[4][0] > 11 && b[4][9] > 11]},
           {description : "Get 200 points while all flowers have to be on the basket. You have 2 minutes!",
            time : 120,
            condition : [(p,b) => p >= 200 && b[5][4] > 11 && b[5][5] > 11,
                         (p,b) => p >= 300 && b[5][4] > 11 && b[5][5] > 11,
                         (p,b) => p >= 400 && b[5][4] > 11 && b[5][5] > 11]},
             ]; // end of levels object array


function setMessageBoardSize () { // dinamically set size
    const W = document.getElementById("board").clientWidth - 2;
          H = document.getElementById("board").clientHeight - 2;
    [...document.getElementsByClassName("panel")].forEach(el => { el.style.width = W + "px"; el.style.height = H + "px"; }); // spread, because it's an HTMLCollection
    [...document.getElementsByClassName("level-button")].forEach(el => { el.style.width = (W/7)-2+"px"; el.style.height = (H/7)-7 + "px"; });
} // end of setMessageBoardSize

function updateLevelPanel() { // update the level selection board
    function setStar(id) {
        let elem = document.getElementById(id);
        elem.innerHTML = "&#9733;";
        elem.style.color = "rgba(204, 196, 145, 1)";
    } // end of setStars
    function setStarDefault(id) {
        let elem = document.getElementById(id);
        elem.innerHTML = "&#9734;";
        elem.style.color = "rgba(204, 196, 145, 0.3)";
    } // end of setStarDefault
    score.forEach((stars,lev) => {
        setStarDefault("star"+(lev+1)+"_1"); // reset all
        setStarDefault("star"+(lev+1)+"_2");
        setStarDefault("star"+(lev+1)+"_3");
        switch(true) {
            case stars == 1: { setStar("star"+(lev+1)+"_1"); break; }
            case stars == 2: { setStar("star"+(lev+1)+"_1"); setStar("star"+(lev+1)+"_2"); break; }
            case stars == 3: { setStar("star"+(lev+1)+"_1"); setStar("star"+(lev+1)+"_2"); setStar("star"+(lev+1)+"_3"); }
        } // end of switch
    }); // end of forEach
} // end of updateLevelPanel

function startLevel(lev) {
    const levPanel = document.getElementById("level-panel");
    levPanel.style.visibility = "hidden";
    const messagePan = document.getElementById("message-panel");
    messagePan.style.visibility = "visible";
    document.getElementById("start-button").style.visibility = "visible";
    const messageParag = messagePan.getElementsByTagName("p")[0];
    messageParag.innerHTML = levels[lev-1].description;
    currentLevel = lev;
    document.getElementById("level").innerHTML = currentLevel;
    switch (lev) { // amend board according to level
        case "1": {fruitNumber = 5; displayBoard(randomBoard(fruitNumber)); break; }
        case "2": {fruitNumber = 5;
                   board = randomBoard(fruitNumber);
                   board[0][Math.floor(Math.random()*10)] = 12;
                   displayBoard(board);
                   break; }
        case "3": {fruitNumber = 6; displayBoard(randomBoard(fruitNumber)); break; }
        case "4": {fruitNumber = 7; displayBoard(randomBoard(fruitNumber)); break; }
        case "5": {fruitNumber = 7;
                   board = randomBoard(fruitNumber);
                   let ran = Math.floor(Math.random()*10);
                   board[0][ran] = 12; // place 1st flower
                   board[0][[0,1,2,3,4,5,6,7,8,9].filter(e => e != ran)[Math.floor(Math.random()*9)]] = 13; // the two flowers cant be on one cell
                   displayBoard(board);
                   break; } // end of case 5
        case "6": {fruitNumber = 5;
                   board = randomBoard(fruitNumber);
                   let ran = Math.floor(Math.random()*10);
                   board[0][0] = 12;
                   board[0][1] = 13;
                   board[0][9] = 14;
                   displayBoard(board);
                   break; } // end of case 6
        case "7": {fruitNumber = 8; displayBoard(randomBoard(fruitNumber)); break; }
        case "8": {fruitNumber = 9; displayBoard(randomBoard(fruitNumber)); break; }
        case "9": {fruitNumber = 9;
                   board = randomBoard(fruitNumber);
                   board[0][Math.floor(Math.random()*10)] = 16;
                   displayBoard(board);
                   break; }
        case "10": {fruitNumber = 10; displayBoard(randomBoard(fruitNumber)); break; }
        case "11": {fruitNumber = 7;
                    board = randomBoard(fruitNumber);
                    board[0][Math.floor(Math.random()*10)] = 15;
                    board[9][Math.floor(Math.random()*10)] = 17;
                    displayBoard(board);
                    break; }
        case "12": {fruitNumber = 6;
                    board = randomBoard(fruitNumber);
                    board[0][Math.floor(Math.random()*6)+2] = 15; // prevent colliding w wall
                    board[9][Math.floor(Math.random()*6)+2] = 17;
                    board.map((r, ri) => r.map((c,ci) => board[ri][ci] = ci<2||ci>7?18:c)); // build sidewalls
                    displayBoard(board);
                    break; }
        case "13": {fruitNumber = 6;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 15;
                    board[0][9] = 16;
                    board[9] = [18,18,18,18,17,17,18,18,18,18];
                    displayBoard(board);
                    break; }
        case "14": {fruitNumber = 6;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 15;
                    board[0][4] = 14;
                    board[0][9] = 16;
                    board[9] = [18,18,17,18,17,18,18,17,18,18];
                    displayBoard(board);
                    break; }
        case "15": {fruitNumber = 6;
                    board = randomBoard(fruitNumber);
                    board[0][4] = 14;
                    board[6][0] = board[6][9] = 18;
                    board[7][0] = board[7][1] = board[7][8] = board[7][9] = 18;
                    board[8][0] = board[8][1] = board[8][2] = board[8][7] = board[8][8] = board[8][9] = 18;
                    board[9] = [18,18,18,18,17,17,18,18,18,18];
                    displayBoard(board);
                    break; }
        case "16": {fruitNumber = 6;
                    board = randomBoard(fruitNumber);
                    board[1][1] = 14;
                    board.map((r,ri)=>r.map((c,ci)=>board[ri][ci] = ri==0||ri==9||ci==0||ci==9?18:c));
                    board[8] = [18,17,18,18,18,18,18,18,17,18];
                    displayBoard(board);
                    break; }
        case "17": {fruitNumber = 7;
                    board = randomBoard(fruitNumber);
                    board[1][1] = 14;
                    board[1][5] = 15;
                    board[1][8] = 16;
                    board.map((r,ri)=>r.map((c,ci)=>board[ri][ci] = ri==0||ri==9||ci==0||ci==9?18:c)); // wall frame
                    board[6][3] = board[6][5] = board[6][7] = 17;
                    board[7][3] = board[7][5] = board[7][7] = 18;
                    displayBoard(board);
                    break; }
        case "18": {fruitNumber = 7;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 13;
                    board[0][1] = 14;
                    board[0][8] = 15;
                    board[0][9] = 16;
                    board[8][3] = board[8][4] = board[8][5] = board[8][6] = 17;
                    board[9][3] = board[9][4] = board[9][5] = board[9][6] = 18;
                    displayBoard(board);
                    break; }
        case "19": {fruitNumber = 7;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 13;
                    board[0][9] = 14;
                    board[8][0] = board[8][9] = 17;
                    board[9][0] = board[9][9] = 18;
                    board[4] = [18,18,18,18,18,18,18,18,18,18];
                    displayBoard(board);
                    break; }
        case "20": {fruitNumber = 7;
                    board = randomBoard(fruitNumber);
                    board.map((r,ri)=>r.map((c,ci)=>board[ri][ci] = ri<2||ri>7||ci<2||ci>7?18:c)); // double wall
                    displayBoard(board);
                    break; }
        case "21": {fruitNumber = 7;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 12;
                    board[0][9] = 16;
                    board[8][0] = board[8][9] = 17;
                    board[9][0] = board[9][9] = 18;
                    board.map((r,ri)=>r.map((c,ci)=>board[ri][ci] = ci==4||ci==5?18:c));
                    displayBoard(board);
                    break; }
        case "22": {fruitNumber = 8;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 12;
                    board[0][9] = 16;
                    board[8][0] = board[8][9] = 17;
                    board[9][0] = board[9][9] = 18;
                    board[4].map((c,ci)=>board[4][ci] = ci<4||ci>5?18:c); // horizontal wall w gap
                    displayBoard(board);
                    break; }
        case "23": {fruitNumber = 8;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 15;
                    board[0][9] = 14;
                    board[4][0] = board[4][9] = 17;
                    board[5][0] = board[5][9] = 18;
                    board[6].map((c,ci)=>board[6][ci] = ci<4||ci>5?18:c); // horizontal wall w gap
                    displayBoard(board);
                    break; }        
        case "24": {fruitNumber = 8;
                    board = randomBoard(fruitNumber);
                    board[0][0] = 12;
                    board[0][9] = 13;
                    board[9][2] = board[9][3] = board[9][4] = board[9][5] = board[9][6] = board[9][7] = 18;
                    board[8][3] = board[8][4] = board[8][5] = board[8][6] = 18;
                    board[7][4] = board[7][5] = 18;
                    board[6][4] = board[6][5] = 17;
                    displayBoard(board);
                    break; }        
    } // end of switch
    startTimer(levels[lev-1].time);
} // end of startLevel

function displayBoard(b) {
    const fName = ["cherry","blueberry","kiwi","lemon","melone","coco","banana","strawberry","peach","lime", // 0 - 9 FRUITS
                   "explosion","transp",                                                                     // 10, 11 MISC
                   "flower_blue1","flower_camomille","flower_lightblue","flower_orange","flower_pink",       // 12 - 16 FLOWERS
                   "basket","wall"];                                                                         // 17 BASKET 18 WALL
    b.map((row,ri)=>row.map((cell,ci)=>{
        const tblCell = document.getElementById(`r${ri}c${ci}`),
              clr = (ri%2==1&&ci%2==0)||(ri%2==0&&ci%2==1)?"rgba(48,32,55,0.1)":"rgba(250,250,250,0.1)";
        tblCell.style.background = `${clr} url(images/${fName[cell]}.png)`;
        tblCell.style.backgroundSize = "cover";
    }));
    board = b;
    checkNoMoreMoves();
    return b;
} // end of displayBoard

function select(el) {
   let coord = el.id.match(/\d/g);
   if (selectable && board[coord[0]][coord[1]] != 18 && board[coord[0]][coord[1]] != 17) { // selectable and el is not a wall
   const selectedBorder = "1px double rgb(226, 230, 153)",
         normalBorder = "1px solid rgba(10,10,10,0.2)",
         deselect = () => {selected.map(e=>{
                  let td = document.getElementById(`r${e[0]}c${e[1]}`);
                  td.style.border = normalBorder;
             });
             selected = [];
         }; // end of deselect
   timeFromLastMove = 0;
   el.style.border = selectedBorder;
   selected.push(el.id.match(/\d+/g).map(Number));
   if (selected.length>1&&selected[0][0]==selected[1][0]&&selected[0][1]==selected[1][1]) deselect();   //deselect if selection is the same cell
   if (selected.length>1) {
       let [sel1x,sel1y,sel2x,sel2y] = [selected[0][0],selected[0][1],selected[1][0],selected[1][1]];
       if ((sel1x==sel2x&&Math.max(sel1y,sel2y)-Math.min(sel1y,sel2y)==1)||(sel1y==sel2y&&Math.max(sel1x,sel2x)-Math.min(sel1x,sel2x)==1)) {
              swap(sel1x,sel1y,sel2x,sel2y);
              if (!checkMatches()) {
                  if (board[sel2x][sel2y] < 10 || sel2y == sel1y) { // flowers are exception if move horizontal
                      console.log(board[sel2x][sel2y]);
                      var swapTimer = setTimeout(() => { swap(sel1x,sel1y,sel2x,sel2y); displayBoard(board); },500); // swap back in half sec
                  }
              } // end of if no matches found
              deselect();  // deselect,in order to keep selection array larger than 2
              displayBoard(board);
          } // end of if
       else deselect();
   } // end of if
 } // end of selectable
} // end of select

const swap = (...a) => { [board[a[0]][a[1]],board[a[2]][a[3]]] = [board[a[2]][a[3]],board[a[0]][a[1]]]; };

function checkMatches() {
  let MATCHES = [];
  board.map((row,ri) => row.map((_,ci) => {
      const b = (x,y) => (board[x]||[])[y]; // avoid undefined rows, undefined colums work though
      const [c,u1,u2,l1,l2] = [b(ri,ci),b(ri-1,ci),b(ri-2,ci),b(ri,ci-1),b(ri,ci-2)]; // cause here youll hit problems then: (b[-1][0]) reference error
      if (c == u1 && c == u2 && c != 18 && c != 17) MATCHES.push(...[`${ri}${ci}`,`${ri-1}${ci}`,`${ri-2}${ci}`]); // check vertical matches dont match WALLS and BASKET!
      if (c == l1 && c == l2 && c != 18 && c != 17) MATCHES.push(...[`${ri}${ci}`,`${ri}${ci-1}`,`${ri}${ci-2}`]); // and horizontal ones3
  })); // end of map board
  const idsToFade = [...new Set(MATCHES)].map(e => {
      selectable = false; // disallow selection while board rearrangement is in prossess
      board[e[0]][e[1]] = 10;
      return `r${e[0]}c${e[1]}`; });
  if (idsToFade.length>0) {
      let opacity = 1;
      const timer = setInterval(() => opacity >= 0 ?
          (() => { idsToFade.map(e => document.getElementById(e).style.opacity = opacity); opacity-=0.1; })() :
          (() => { dripDown(idsToFade); clearInterval(timer); })(),
      40);  // end of setInterval
  } // end of if idsToFade
  return !!idsToFade.length;
} // end of checkMatches

function dripDown(ids) {
    ids.forEach(e => {
        item = document.getElementById(e);
        item.style.opacity = 1;  // reset opacity on ids
    }); // end of forEach ids
    const rearrangeCol = (O) => {
        const W = O.reduce((p,c,i) => c==18?[...p,[i,18]]:c==17?[...p,[i,17]]:p, []); // wall, basket [index, num]
        let NW = [...(O.filter(e=>e==10)),...(O.filter(e=>e!=10&&e!=18&&e!=17))]; // spread empties and concat w left (not walls and baskets!)
        W.forEach((wInd)=>NW.splice(wInd[0],0,wInd[1])); // paste walls back to their original space
        return NW;
    }; // end of rearrangeCol
    [...Array(10)].map((col,ci) => [...Array(10)].map((_,ri) => board[ri][ci]))      // check array by columns, push empty spaces up, walls stay
        .map(col => col.every(e => e!=10).length == 10 ? col : rearrangeCol(col))
        //.map(col => col.filter(e => e!=10).length == 10 ? col : [...(col.filter(e => e == 10)),...(col.filter(e => e != 10))])
        .map((col,ci) => col.map((cell,ri) => board[ri][ci] = cell));
    let newEmptys = [], count = 0;
    board.map((row,ri) => row.map((cell,ci) => {    // empty background pics, and push an array of the empty's indices
        if (cell == 10) {
            board[ri][ci] = 11;    // makes it transparent, explosion png disappears
            newEmptys.push([ri,ci]);
        } // end of if
    } )); // end of newEmptys
    displayBoard(board);
    collectPoints(ids);
    var timer = setInterval(() => {   // create new random tiles with timing animation
        if (count >= newEmptys.length) {
            clearInterval(timer);
            checkMatches(); // recheck for further matches on the newly created board
            selectable = true; // allow selection when all checking is done
            timeFromLastMove = 0;
        } // end of if
        else {
            board[newEmptys[count][0]][newEmptys[count][1]] = Math.floor(Math.random()*fruitNumber);
            displayBoard(board);
            //checkNoMoreMoves();
        } // end of else
        count++;
    },70); // end of timer
} // end of dripDown

function collectPoints(ids) {
    const p = [0,0,5,15,50,70,100][(l=ids.length-1)>6?6:l]; // 100 point is the max per turn
    points+=p;
    document.getElementById("points").innerHTML = points;
} // end of collectPoints

function startTimer(mps=60) {
    let percent = 100, dmps = mps * 10; timeLeft = dmps;
        bar = document.getElementById("progress");
    var countBack = setInterval(() => {
        if (!timeLeft) {
            clearInterval(countBack);
            bar.style.visibility = "hidden"; // some leftover was always visible for unknown reasons
            gameOn = false;
            displayResult();
        } // end of if
        else if (!pause && gameOn) {
        timeLeft--;
        let width = document.getElementById("signature").offsetWidth; // workaround: absolut positioning made bar wider
        bar.style.visibility = "visible";
        bar.style.width = `${(width/100*percent)-(2.5*document.getElementById("signature").offsetLeft)}px`;
        percent = (100/dmps)*timeLeft;
      } // end of else
    },100); // end of setInterval
} // end of startTimer

function checkNoMoreMoves() {    // check all possible moves
    hints = []; // global!!
    let moves = 0,
    b = board;
    const isValidMove = (x1,y1,x2,y2,x3,y3) => (new Set([(b[x1]||[])[y1],(b[x2]||[])[y2],(b[x3]||[])[y3]]).size==1 &&
        typeof (b[x1]||[])[y1]!=="undefined") && (b[x1]||[])[y1] != 17 && (b[x1]||[])[y1] != 18 ?1:0;
    b.map((row,ri) => row.map((c,ci) => {
        if (c != 18 && c != 17) { // skip walls and baskets
            const before = moves;
            moves += isValidMove(ri,ci-2,ri,ci-1,ri,ci+1) + isValidMove(ri,ci-2,ri,ci-1,ri-1,ci) + isValidMove(ri,ci-2,ri,ci-1,ri+1,ci); // variations for horizontal 1
            moves += isValidMove(ri,ci+2,ri,ci+1,ri,ci-1) + isValidMove(ri,ci+2,ri,ci+1,ri-1,ci) + isValidMove(ri,ci+2,ri,ci+1,ri+1,ci); // and 2
            moves += isValidMove(ri-2,ci,ri-1,ci,ri+1,ci) + isValidMove(ri-2,ci,ri-1,ci,ri,ci-1) + isValidMove(ri-2,ci,ri-1,ci,ri,ci+1); // variations for vertical 1
            moves += isValidMove(ri+2,ci,ri+1,ci,ri-1,ci) + isValidMove(ri+2,ci,ri+1,ci,ri,ci-1) + isValidMove(ri+2,ci,ri+1,ci,ri,ci+1); // and 2
            if (moves > before) hints.push([ri,ci]);
        } // end if not wall
    }));
    console.log("MOVES",JSON.stringify(hints));
    if  (moves == 0) {
        const flowers = []; // save flowers to put them back when new board is called
        board.map((row,ri) => row.map((cell,ci) => { if (cell > 10) flowers.push([ri,ci,cell]); } ));
        pause = true;
        panel = document.getElementById("no-more-moves");
        panel.style.visibility = "visible";
        const timer = setTimeout(() => {
            panel.style.visibility = "hidden";
            pause = false;
        },2000); // end of timer
        displayBoard(randomBoard(fruitNumber));
        flowers.forEach(e => board[e[0]][e[1]] = e[2]);
    } // end of if no moves
} // end of checkNoMoreMoves

function displayResult() {
    document.getElementById("message-panel").style.visibility = "visible";
    document.getElementById("start-button").style.visibility = "hidden"; // in order not to fire start button again
    let starsGiven = 0;
    if (levels[currentLevel-1].condition[2](points,board)) starsGiven = 3;
    else if (levels[currentLevel-1].condition[1](points,board)) starsGiven = 2;
    else if (levels[currentLevel-1].condition[0](points,board)) starsGiven = 1;
    if (score[currentLevel-1] < starsGiven) score[currentLevel-1] = starsGiven;
    let counter = 1;
    var timer = setInterval(() => {
       if (!starsGiven) {
           clearInterval(timer);
           document.getElementById("message-panel").style.visibility = "hidden";
           document.getElementById("result-star1").style.color = "rgb(20,20,20)";
           document.getElementById("result-star2").style.color = "rgb(20,20,20)";
           document.getElementById("result-star3").style.color = "rgb(20,20,20)";
           updateLevelPanel();
           document.getElementById("level-panel").style.visibility = "visible";
       } // end of escape timer
       else {
         document.getElementById("result-star"+counter).style.color = "rgb(204, 196, 145)";
         starsGiven--;
         counter++;
       } // end of else
    }, 700); // end of timer
} // end of displayResult