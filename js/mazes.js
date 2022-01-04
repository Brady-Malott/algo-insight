// Maze UI container
const mazeBoard = document.querySelector(".maze-container");

let currMaze = [];
let mazeSpecs;

// Visualizer current time delay
let currDelay = 0;

// Keep track of the class of the current description in the sidebar (may not be one)
let descClass = "";

// Event Listeners

// Generate Maze Event
document
  .getElementById("generate-maze")
  .addEventListener("click", generateMazeSubmit);

// Solve Maze Event
document
  .getElementById("solve-maze")
  .addEventListener("click", solveMazeSubmit);

// Clicking Menu Dropdown Options
const dropdowns = document.querySelectorAll(".menu-dropdown");
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", function (e) {
    e.target.parentElement.previousElementSibling.textContent =
      e.target.textContent;
  });
});

// Clicking on tiles in the maze to recolour them
mazeBoard.addEventListener("click", function (e) {
  if (e.target.classList.contains("passage")) {
    const colour = e.target.style.backgroundColor;
    const markColour = document
      .getElementById("colour")
      .textContent.toLowerCase();
    if (markColour !== "trail colour") {
      e.target.style.backgroundColor =
        colour === markColour ? "white" : markColour;
    }
  }
});

function generateMazeSubmit(e) {
  // Hide the solve maze button
  document.querySelector(".sidemenu #solve-maze").style.display = "none";

  // Get menu input
  const size = document.getElementById("size").textContent.toLowerCase();
  const algorithm = document
    .getElementById("algorithm")
    .textContent.toLowerCase();

  if (size !== "size" && algorithm !== "algorithm") {
    // Create the maze specs object
    mazeSpecs = getMazeSpecs(size, algorithm);
    // Delete an existing maze board if it exists
    deleteMazeBoard();

    // Hide sidemenu and show sidedesc
    document.querySelector(".sidemenu").style.display = "none";
    document.querySelector(".sidedesc").style.display = "block";

    switch (algorithm) {
      case "wilson":
        // Show the description for Wilson's Algorithm
        document.querySelector(".sidedesc .wilson-desc").style.display =
          "block";
        // Make a maze using Wilson's Algorithm
        currMaze = makeWilsonMaze(mazeSpecs);
        descClass = "wilson-desc";
        break;

      case "depth first search":
        // Show the description for Randomized Depth First Search
        document.querySelector(".sidedesc .dfs-desc").style.display = "block";
        // Make a maze using Depth First Search
        currMaze = makeDFSMaze(mazeSpecs);
        descClass = "dfs-desc";
        break;

      case "prim":
        // Show the description for Prim's Algorithm
        document.querySelector(".sidedesc .prim-desc").style.display = "block";
        // Make a maze using Prim's Algorithm
        currMaze = makePrimMaze(mazeSpecs);
        descClass = "prim-desc";
        break;

      case "kruskal":
        // Show the description for Kruskal's Algorithm
        document.querySelector(".sidedesc .kruskal-desc").style.display =
          "block";
        // Make a maze using Kruskal's Algorithm
        currMaze = makeKruskalMaze(mazeSpecs);
        descClass = "kruskal-desc";
        break;

      case "recursive division":
        // Show the description for Recursive Division
        document.querySelector(".sidedesc .rd-desc").style.display = "block";
        // Make a maze using Recursive Division
        currMaze = makeRDMaze(mazeSpecs);
        descClass = "rd-desc";
        break;

      default:
        console.log("Invalid Algorithm (line 67)");
    }

    // Show the menu again, this time, with the solve maze button
    setTimeout(() => {
      // Hide the description for Wilson's Algorithm and hide the side description div
      document.querySelector(`.sidedesc .${descClass}`).style.display = "none";
      document.querySelector(".sidedesc").style.display = "none";
      // Show the side menu
      document.querySelector(".sidemenu").style.display = "flex";
      // Show the solve button
      document.querySelector(".sidemenu #solve-maze").style.display = "block";

      // currDelay can be reset to 0 here because all other events that would add to the event queue were disabled up until this point
      currDelay = 0;
    }, currDelay);
  }
  e.preventDefault();
}

function solveMazeSubmit(e) {
  // Hide the side menu and show sidedesc
  document.querySelector(".sidemenu").style.display = "none";
  document.querySelector(".sidedesc").style.display = "block";
  // Show the backtrack solver description
  document.querySelector(".sidedesc .solve-desc").style.display = "block";
  // Hide the solve button
  document.querySelector(".sidemenu #solve-maze").style.display = "none";

  // Solve the maze and visualize it using a recursive backtracking algorithm
  backtrackSolve(currMaze, mazeSpecs);

  // Switch the sidebar back to the side menu after the backtrack solve visualization is complete
  setTimeout(() => {
    // Hide the solver description
    document.querySelector(".sidedesc .solve-desc").style.display = "none";
    // Hide sidedesc and show sidemenu
    document.querySelector(".sidedesc").style.display = "none";
    document.querySelector(".sidemenu").style.display = "flex";

    // currDelay can be reset to 0 here because all other events that would add to the event queue were disabled up until this point
    currDelay = 0;
  }, currDelay);

  e.preventDefault();
}

function getMazeSpecs(size, algorithm) {
  const centerTilesWide = 5;

  // Set size and number of initial tiles from input
  let width = 0,
    numInitialTiles = 1;
  switch (size) {
    case "large":
      width = 87;
      // numInitialTiles = 15;
      break;
    case "medium":
      width = 67;
      // numInitialTiles = 10;
      break;
    case "small":
      width = 47;
      // numInitialTiles = 5;
      break;
    default:
      console.log("Error occurred while setting size from input");
      break;
  }

  // If the form input is valid, setup the mazeSpecs object, delete the old grid, and make a new maze
  return {
    width: width,
    height: width,
    cWidth: centerTilesWide,
    centerRowStart: (width - centerTilesWide) / 2,
    centerRowEnd: (width + centerTilesWide) / 2,
    centerColStart: (width - centerTilesWide) / 2,
    centerColEnd: (width + centerTilesWide) / 2,
    startAtCenter: algorithm !== "recursive division",
    numInitialTiles: numInitialTiles,
  };
}

const deleteMazeBoard = () => (mazeBoard.innerHTML = "");

// Utility Maze Functions (used across more than one algorithm)

function setupMazeBoard(mazeSpecs, kruskal = false) {
  // Create the maze matrix and the mazeBoard for the UI
  // Return the maze matrix

  const maze = [];

  for (let r = 0; r < mazeSpecs.height; r++) {
    const row = document.createElement("div");
    row.className = "row";

    // Maze array row
    const arrRow = [];
    for (let c = 0; c < mazeSpecs.width; c++) {
      const square = document.createElement("div");
      square.className = `square r-${r} c-${c}`;
      // Center area is completely blank (includes breadcrumbs)
      if (
        r >= mazeSpecs.centerRowStart &&
        r < mazeSpecs.centerRowEnd &&
        c >= mazeSpecs.centerColStart &&
        c < mazeSpecs.centerColEnd
      ) {
        if (r % 2 === 1 && c % 2 === 1 && !kruskal) {
          // Breadcrumbs
          square.classList += " breadcrumb";
          arrRow.push("*");
        } else {
          // Blank
          arrRow.push(" ");
          square.classList += " passage";
        }
      } else if (r % 2 === 0 || c % 2 === 0) {
        // Walls
        square.classList += " wall";
        arrRow.push("0");
      } else {
        // Blank
        arrRow.push(" ");
        if (kruskal) {
          square.classList += " passage";
        }
      }
      row.appendChild(square);
    }
    maze.push(arrRow);
    mazeBoard.appendChild(row);
  }
  return maze;
}

function setExit(maze, mazeSpecs) {
  const wallForExit = Math.floor(Math.random() * 4 + 1);

  // Width and height in terms of breadcrumb-able tiles
  const tilesWide = Math.floor(mazeSpecs.width / 2);
  const tilesHigh = Math.floor(mazeSpecs.height / 2);

  let exitRow = 0,
    exitCol = 0;

  switch (wallForExit) {
    case 1:
      // Top wall
      exitCol = Math.floor(Math.random() * tilesWide) * 2 + 1;
      exitRow = 0;
      break;
    case 2:
      // Bottom wall
      exitCol = Math.floor(Math.random() * tilesWide) * 2 + 1;
      exitRow = mazeSpecs.height - 1;
      break;
    case 3:
      // Left wall
      exitRow = Math.floor(Math.random() * tilesHigh) * 2 + 1;
      exitCol = 0;
      break;
    case 4:
      // Right wall
      exitRow = Math.floor(Math.random() * tilesHigh) * 2 + 1;
      exitCol = mazeSpecs.width - 1;
      break;
    default:
      console.log("Random number generator error in addOuterWall()");
      break;
  }
  // Break open exit in maze matrix
  maze[exitRow][exitCol] = "E";
  // Make the tile an exit tile (with delay 250ms)
  const startTile = document.querySelector(`.r-${exitRow}.c-${exitCol}`);
  const className = `square r-${exitRow} c-${exitCol} exit`;
  addToVisualizerQueue(startTile, className, 250);
}

function removeBreadCrumbs(maze, mazeSpecs) {
  for (let r = 1; r < mazeSpecs.height; r += 2) {
    for (let c = 1; c < mazeSpecs.width; c += 2) {
      maze[r][c] = " ";
      // Remove the breadcrumb class and make the tile a passage (no delay)
      const tile = document.querySelector(`.r-${r}.c-${c}`);
      const className = `square r-${r} c-${c} passage`;

      addToVisualizerQueue(tile, className, 0);
    }
  }
}

function selectStartingPoint(maze, mazeSpecs, breadcrumb = true) {
  const possibleStartingPoints = [];
  for (let r = mazeSpecs.centerRowStart; r < mazeSpecs.centerRowEnd; r += 2) {
    possibleStartingPoints.push([r, mazeSpecs.centerColStart - 2]);
    possibleStartingPoints.push([r, mazeSpecs.centerColEnd + 1]);
  }
  for (let c = mazeSpecs.centerColStart; c < mazeSpecs.centerColEnd; c += 2) {
    possibleStartingPoints.push([mazeSpecs.centerRowStart - 2, c]);
    possibleStartingPoints.push([mazeSpecs.centerColEnd + 1, c]);
  }

  const randIndex = Math.floor(Math.random() * possibleStartingPoints.length);
  const start = possibleStartingPoints[randIndex];
  let r = start[0],
    c = start[1];

  // Determine whether or not to lay a breadcrumb
  let cls = "breadcrumb";
  if (!breadcrumb) {
    cls = "passage";
  }

  // Add starting point to the UI Maze (with 100ms delay)
  let square = document.querySelector(`.r-${r}.c-${c}`);
  // Give the starting point the breadcrumb class (or passage if specified in function call)
  let className = `square r-${r} c-${c} ${cls}`;
  addToVisualizerQueue(square, className, 100);

  if (r === mazeSpecs.centerRowStart - 2) {
    maze[++r][c] = "S";
  }
  if (r === mazeSpecs.centerRowEnd + 1) {
    maze[--r][c] = "S";
  }
  if (c === mazeSpecs.centerColStart - 2) {
    maze[r][++c] = "S";
  }
  if (c === mazeSpecs.centerColEnd + 1) {
    maze[r][--c] = "S";
  }

  // Make the broken wall (adjacent to the start) a passage in the UI maze (with 250ms delay)
  square = document.querySelector(`.r-${r}.c-${c}`);
  // Give the broken wall the start class
  className = `square r-${r} c-${c} start`;
  addToVisualizerQueue(square, className, 250);

  return start;
}

function getAdjacentCells(maze, wall, mazeSpecs) {
  const r = wall[0],
    c = wall[1];
  const adjCells = [];
  const cellChars = [" ", "*"];
  // Check if the adjacent cells are above and below the wall
  // Then check if the adjacent cells are to the left and right of the wall
  if (
    1 < r &&
    r < mazeSpecs.height - 2 &&
    cellChars.includes(maze[r - 1][c]) &&
    cellChars.includes(maze[r + 1][c])
  ) {
    adjCells.push([r - 1, c]);
    adjCells.push([r + 1, c]);
  } else if (
    1 < c &&
    c < mazeSpecs.width - 2 &&
    cellChars.includes(maze[r][c - 1]) &&
    cellChars.includes(maze[r][c + 1])
  ) {
    adjCells.push([r, c - 1]);
    adjCells.push([r, c + 1]);
  } else {
    console.log("Error in getAdjacentCells()");
    console.log(maze[r][c]);
  }
  return adjCells;
}

const inCenter = (row, col, mazeSpecs) => {
  return (
    mazeSpecs.centerRowStart <= row &&
    row < mazeSpecs.centerRowEnd &&
    mazeSpecs.centerColStart <= col &&
    col < mazeSpecs.centerColEnd
  );
};

// Compare the UI maze with the maze matrix
function compareMazes(maze) {
  let flag = true;
  // Compare the UI maze to the maze matrix and make sure they match
  for (let r = 0; r < mazeSpecs.height; r++) {
    for (let c = 0; c < mazeSpecs.width; c++) {
      // Get the tile from the UI maze
      const tile = document.querySelector(`.r-${r}.c-${c}`);
      if (
        (maze[r][c] === "0" && !tile.className.includes("wall")) ||
        (maze[r][c] === " " && !tile.className.includes("passage")) ||
        (maze[r][c] === "S" && !tile.className.includes("start")) ||
        (maze[r][c] === "E" && !tile.className.includes("exit"))
      ) {
        console.log(`${r}, ${c}`);
        console.log(maze[r][c]);
        console.log(tile.className);
        flag = false;
      }
    }
  }
  return flag;
}

// Wilson's Algorithm Functions

function makeWilsonMaze(mazeSpecs) {
  const wilsonMaze = setupMazeBoard(mazeSpecs);
  createWilsonMaze(wilsonMaze, mazeSpecs);
  return wilsonMaze;
}

function createWilsonMaze(maze, mazeSpecs) {
  // Get the initial tile(s)
  for (let i = 0; i < mazeSpecs.numInitialTiles; i++) {
    // Select non-breadcrumb, non-wall tile
    const initialTile = selectRandomUnvisitedCell(maze, mazeSpecs);

    // Set breadcrumb in maze matrix
    maze[initialTile[0]][initialTile[1]] = "*";

    // Get the target element and its class
    let target = document.querySelector(
      `.r-${initialTile[0]}.c-${initialTile[1]}`
    );
    let className = target.className + " breadcrumb";

    // Make the tile a breadcrumb (with delay 250ms)
    addToVisualizerQueue(target, className, 250);
  }

  while (true) {
    const cell = selectRandomUnvisitedCell(maze, mazeSpecs);

    if (cell === null) {
      break;
    }
    const startRow = cell[0];
    const startCol = cell[1];
    randomWalk(maze, startRow, startCol, [startRow, startCol], mazeSpecs);
  }
  breakStartingWall(maze, mazeSpecs);
  setExit(maze, mazeSpecs);
  removeBreadCrumbs(maze, mazeSpecs);
}

function selectRandomUnvisitedCell(maze, mazeSpecs) {
  // Return the coordinates of a tile in an array of length 2
  const unvisitedCells = [];
  for (let r = 1; r < mazeSpecs.height - 1; r += 2) {
    for (let c = 1; c < mazeSpecs.width - 1; c += 2) {
      if (maze[r][c] == " ") {
        unvisitedCells.push([r, c]);
      }
    }
  }
  if (unvisitedCells.length > 0) {
    const randIndex = Math.floor(Math.random() * unvisitedCells.length);
    return unvisitedCells[randIndex];
  }
  return null;
}

function randomWalk(maze, row, col, startPos, mazeSpecs) {
  const walkedTiles = new Set();
  // Keep track of the HTML Elements for the last 4 walked tiles, which will have a class of "recently-walked"
  const recentlyWalked = [];
  // Walk until you find a path in the maze
  while (maze[row][col] != "*") {
    walkedTiles.add([row, col]);

    const square = document.querySelector(`.r-${row}.c-${col}`);
    recentlyWalked.push(square);

    // Get the possible direction to walk to (based on board boundaries)
    const possibleDirections = getPossibleDirections(row, col, mazeSpecs);
    // Select a random direction and set the current tile to that direction's character to keep track of the walk
    const randIndex = Math.floor(Math.random() * possibleDirections.length);
    const direction = possibleDirections[randIndex];
    maze[row][col] = direction;

    // Add walked class to the maze tile
    // Get the target element and its class
    let target = document.querySelector(`.r-${row}.c-${col}`);
    let className = `square r-${row} c-${col} walked recent`;

    // Make the tile a walked tile (with delay 25ms)
    addToVisualizerQueue(target, className, 25);

    // If there are more than 6 recently-walked tiles, remove the tail tile (with no delay)
    if (recentlyWalked.length > 6) {
      const noLongerRecentlyWalked = recentlyWalked.shift();
      const className = `square r-${row} c-${col} walked`;
      addToVisualizerQueue(noLongerRecentlyWalked, className, 0);
    }

    // Move to the tile in the chosen direction for the next iteration of the loop
    switch (direction) {
      case "^":
        row -= 2;
        break;
      case "v":
        row += 2;
        break;
      case "<":
        col -= 2;
        break;
      case ">":
        col += 2;
        break;
      default:
        console.log("No direction error in randomWalk()");
        break;
    }
    // If the tile walked to is in the maze ("*"), exit the loop and cut out the tiles that are not in the main path
  }
  eraseLoopWalk(maze, startPos[0], startPos[1], walkedTiles);
}

function getPossibleDirections(row, col, mazeSpecs) {
  const possibleDirections = [];
  // Check up
  if (row > 1 && !inCenter(row - 2, col, mazeSpecs)) {
    possibleDirections.push("^");
  }
  // Check down
  if (row < mazeSpecs.height - 2 && !inCenter(row + 2, col, mazeSpecs)) {
    possibleDirections.push("v");
  }
  // Check left
  if (col > 1 && !inCenter(row, col - 2, mazeSpecs)) {
    possibleDirections.push("<");
  }
  // Check right
  if (col < mazeSpecs.width - 2 && !inCenter(row, col + 2, mazeSpecs)) {
    possibleDirections.push(">");
  }
  return possibleDirections;
}

function eraseLoopWalk(maze, row, col, walkedTiles) {
  // Follow the directions marked in the path until you find a *
  const dirArray = ["^", "v", "<", ">"];
  const directions = new Set(dirArray);
  while (directions.has(maze[row][col])) {
    const direction = maze[row][col];
    walkedTiles.forEach((pos) => {
      if (pos[0] === row && pos[1] === col) {
        walkedTiles.delete(pos);
      }
    });
    maze[row][col] = "*";

    // Add breadcrumb class to the maze tile
    // Get the target element and its class (excluding the walked class)
    let target = document.querySelector(`.r-${row}.c-${col}`);
    let className = `square r-${row} c-${col} breadcrumb`;

    // Make the tile a breadcrumb (with delay 0)
    addToVisualizerQueue(target, className, 0);

    let wallRow = row,
      wallCol = col;

    switch (direction) {
      case "^":
        maze[row - 1][col] = " ";
        wallRow--;
        row -= 2;
        break;
      case "v":
        maze[row + 1][col] = " ";
        wallRow++;
        row += 2;
        break;
      case "<":
        maze[row][col - 1] = " ";
        wallCol--;
        col -= 2;
        break;
      case ">":
        maze[row][col + 1] = " ";
        wallCol++;
        col += 2;
        break;
      default:
        console.log("No direction error in eraseLoopWalk()");
        break;
    }
    // Get the target element and its class (excluding the wall class)
    target = document.querySelector(`.r-${wallRow}.c-${wallCol}`);
    className = `square r-${wallRow} c-${wallCol} passage`;
    // Make the wall a passage (with delay 100ms)
    addToVisualizerQueue(target, className, 100);
  }
  // Remove the marker on any tiles that were cut out to prevent a loop
  walkedTiles.forEach((pos) => {
    maze[pos[0]][pos[1]] = " ";
    walkedTiles.delete(pos);

    // Remove walked class for this tile (with no delay)
    const tile = document.querySelector(`.r-${pos[0]}.c-${pos[1]}`);
    const className = `square r-${pos[0]} c-${pos[1]}`;
    addToVisualizerQueue(tile, className, 0);
  });
}

function breakStartingWall(maze, mazeSpecs) {
  const startWalls = [];
  // Top and bottom walls
  for (let c = mazeSpecs.centerColStart; c < mazeSpecs.centerColEnd; c += 2) {
    startWalls.push([mazeSpecs.centerRowStart - 1, c]);
    startWalls.push([mazeSpecs.centerRowEnd, c]);
  }
  // Left and right walls
  for (let r = mazeSpecs.centerRowStart; r < mazeSpecs.centerRowEnd; r += 2) {
    startWalls.push([r, mazeSpecs.centerColStart - 1]);
    startWalls.push([r, mazeSpecs.centerColEnd]);
  }
  const randIndex = Math.floor(Math.random() * startWalls.length);
  const pos = startWalls[randIndex];
  maze[pos[0]][pos[1]] = "S";

  // Make the tile a starting tile (with delay 250ms)
  const startTile = document.querySelector(`.r-${pos[0]}.c-${pos[1]}`);
  const className = `square r-${pos[0]} c-${pos[1]} start`;
  addToVisualizerQueue(startTile, className, 250);
}

// Depth First Search Maze Generator Functions

function makeDFSMaze(mazeSpecs) {
  const dfsMaze = setupMazeBoard(mazeSpecs);
  const start = selectStartingPoint(dfsMaze, mazeSpecs);
  createMazeDFS(dfsMaze, start, mazeSpecs);
  // Set the exit and remove breadcrumbs
  setExit(dfsMaze, mazeSpecs);
  removeBreadCrumbs(dfsMaze, mazeSpecs);
  return dfsMaze;
}

function createMazeDFS(maze, pos, mazeSpecs) {
  let r = pos[0],
    c = pos[1];

  maze[r][c] = "*";
  // Make the maze tile a breadcrumb (with no delay)
  const square = document.querySelector(`.r-${r}.c-${c}`);
  const className = `square r-${r} c-${c} breadcrumb`;
  addToVisualizerQueue(square, className, 0);

  while (true) {
    const unvisitedNeighbours = getUnvisitedNeighbours(maze, pos, mazeSpecs);
    if (unvisitedNeighbours.length == 0) {
      break;
    }
    const randIndex = Math.floor(Math.random() * unvisitedNeighbours.length);
    const node = unvisitedNeighbours[randIndex];
    breakWall(maze, pos, node);
    createMazeDFS(maze, node, mazeSpecs);
  }
}

function getUnvisitedNeighbours(maze, pos, mazeSpecs) {
  const unvisitedNeighbours = [];
  const r = pos[0],
    c = pos[1];
  // Above neighbour
  if (r > 1 && maze[r - 2][c] !== "*") {
    unvisitedNeighbours.push([r - 2, c]);
  }
  // Below neighbour
  if (r < mazeSpecs.height - 2 && maze[r + 2][c] !== "*") {
    unvisitedNeighbours.push([r + 2, c]);
  }
  // Left neighbour
  if (c > 1 && maze[r][c - 2] !== "*") {
    unvisitedNeighbours.push([r, c - 2]);
  }
  // Right neighbour
  if (c < mazeSpecs.width - 2 && maze[r][c + 2] !== "*") {
    unvisitedNeighbours.push([r, c + 2]);
  }
  return unvisitedNeighbours;
}

function breakWall(maze, pos1, pos2) {
  let r1 = pos1[0],
    c1 = pos1[1],
    r2 = pos2[0],
    c2 = pos2[1];

  // Above wall
  if (r2 < r1) {
    maze[--r1][c1] = " ";
  }
  // Below wall
  if (r2 > r1) {
    maze[++r1][c1] = " ";
  }
  // Left wall
  if (c2 < c1) {
    maze[r1][--c1] = " ";
  }
  // Right wall
  if (c2 > c1) {
    maze[r1][++c1] = " ";
  }
  // Make the broken wall a passage tile (with 100ms delay)
  const square = document.querySelector(`.r-${r1}.c-${c1}`);
  const className = `square r-${r1} c-${c1} passage`;
  addToVisualizerQueue(square, className, 100);
}

// Prim's Algorithm Functions

function makePrimMaze(mazeSpecs) {
  const primMaze = setupMazeBoard(mazeSpecs);
  createPrimMaze(primMaze, mazeSpecs);
  return primMaze;
}

function createPrimMaze(maze, mazeSpecs) {
  // Get the starting point adjacent to the center wall
  const start = selectStartingPoint(maze, mazeSpecs);
  // Mark it as a breadcrumb (the selectStartingPoint() call already added the breadcrumb in the UI)
  maze[start[0]][start[1]] = "*";
  // Add the walls around this point to the walls list
  const walls = getNeighbourWalls(maze, start[0], start[1], mazeSpecs);

  while (walls.length > 0) {
    // Pick a random wall
    const randIndex = Math.floor(Math.random() * walls.length);
    const wall = walls.splice(randIndex, 1)[0];
    // Get the cells that are divided by this wall
    const cells = getAdjacentCells(maze, wall, mazeSpecs);

    if (!bothCellsVisited(maze, cells)) {
      // Break the wall
      maze[wall[0]][wall[1]] = " ";
      // Make this wall a passage (with 50ms delay)
      tile = document.querySelector(`.r-${wall[0]}.c-${wall[1]}`);
      className = `square r-${wall[0]} c-${wall[1]} passage`;
      addToVisualizerQueue(tile, className, 100);

      for (let cell of cells) {
        const r = cell[0],
          c = cell[1];
        if (maze[r][c] === " ") {
          // Make the previously unvisited tile visited (a breadcrumb)
          maze[r][c] = "*";
          // Make the tile a breadcrumb (with 50ms delay)
          let tile = document.querySelector(`.r-${r}.c-${c}`);
          let className = `square r-${r} c-${c} breadcrumb`;
          addToVisualizerQueue(tile, className, 50);
          // Add this cells walls to the wall list
          const newWalls = getNeighbourWalls(maze, r, c, mazeSpecs);
          newWalls.forEach((newWall) => walls.push(newWall));
        }
      }
    }
  }
  setExit(maze, mazeSpecs);
  removeBreadCrumbs(maze, mazeSpecs);
}

function getNeighbourWalls(maze, row, col, mazeSpecs) {
  const walls = [];
  // Above wall
  if (row > 1 && maze[row - 1][col] === "0") {
    walls.push([row - 1, col]);
  }
  // Below wall
  if (row < mazeSpecs.height - 2 && maze[row + 1][col] === "0") {
    walls.push([row + 1, col]);
  }
  // Left wall
  if (col > 1 && maze[row][col - 1] === "0") {
    walls.push([row, col - 1]);
  }
  // Right wall
  if (col < mazeSpecs.width - 2 && maze[row][col + 1] === "0") {
    walls.push([row, col + 1]);
  }
  return walls;
}

function bothCellsVisited(maze, cells) {
  for (let cell of cells) {
    if (maze[cell[0]][cell[1]] !== "*") {
      return false;
    }
  }
  return true;
}

// Kruskal's Algorithm Functions

function makeKruskalMaze(mazeSpecs) {
  const kruskalMaze = setupMazeBoard(mazeSpecs, (kruskal = true));
  createKruskalMaze(kruskalMaze, mazeSpecs);
  selectStartingPoint(kruskalMaze, mazeSpecs, (breadcrumb = false));
  setExit(kruskalMaze, mazeSpecs);
  return kruskalMaze;
}

function createKruskalMaze(maze, mazeSpecs) {
  const unvisitedWalls = getWalls(mazeSpecs);
  const cellSets = getCellSets(mazeSpecs);

  while (unvisitedWalls.length > 0) {
    // Pick an unvisited wall
    const randIndex = Math.floor(Math.random() * unvisitedWalls.length);
    const wall = unvisitedWalls[randIndex];
    // Get the cells adjacent to the wall
    const adjCells = getAdjacentCells(maze, wall, mazeSpecs);
    // Find out which cell sets contain the adjCells
    const sets = [];

    for (let cellSet of cellSets) {
      for (let cell of adjCells) {
        if (cellSet.has(`[${cell[0]}, ${cell[1]}]`)) {
          sets.push(cellSet);
        }
      }
    }

    if (!setsAreEqual(sets[0], sets[1])) {
      removeWall(maze, unvisitedWalls, wall, cellSets, sets);
    } else {
      unvisitedWalls.splice(unvisitedWalls.indexOf(wall), 1);
    }
  }
}

function getWalls(mazeSpecs) {
  const walls = [];
  for (let r = 1; r < mazeSpecs.height - 1; r++) {
    for (let c = 1; c < mazeSpecs.width - 1; c++) {
      // Exclude the center area walls
      if (
        !(
          mazeSpecs.centerRowStart - 1 <= r &&
          r <= mazeSpecs.centerRowEnd &&
          mazeSpecs.centerColStart - 1 <= c &&
          c <= mazeSpecs.centerColEnd
        )
      ) {
        // Include walls tiles (but not junctions)
        if ((r % 2 === 0 && c % 2 !== 0) || (r % 2 !== 0 && c % 2 === 0)) {
          walls.push([r, c]);
        }
      }
    }
  }
  return walls;
}

function getCellSets(mazeSpecs) {
  const cellSets = [];
  for (let r = 1; r < mazeSpecs.height - 1; r += 2) {
    for (let c = 1; c < mazeSpecs.width - 1; c += 2) {
      if (!inCenter(r, c, mazeSpecs)) {
        // Check if this works before continuing!!!
        const cellSet = new Set();
        cellSet.add(`[${r}, ${c}]`);
        cellSets.push(cellSet);
        if (cellSet.size > 1) {
          console.log("Set size is greater than 1");
        }
      }
    }
  }
  return cellSets;
}

function setsAreEqual(set1, set2) {
  const arr1 = Array.from(set1).sort(),
    arr2 = Array.from(set2).sort();

  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function removeWall(maze, unvisitedWalls, wall, cellSets, sets) {
  // Break the wall, remove the sets in "sets" from "cellSets"
  // and add the union of the sets to "cellSets"

  maze[wall[0]][wall[1]] = " ";
  unvisitedWalls.splice(unvisitedWalls.indexOf(wall), 1);
  // Make the wall a passage (with 50ms delay)
  const tile = document.querySelector(`.r-${wall[0]}.c-${wall[1]}`);
  const className = `square r-${wall[0]} c-${wall[1]} passage`;
  addToVisualizerQueue(tile, className, 50);

  const newSet = new Set([...sets[0], ...sets[1]]);

  for (let item of sets) {
    cellSets.splice(cellSets.indexOf(item), 1);
  }
  cellSets.push(newSet);
}

// Recursive Division Maze Generator Functions

function makeRDMaze(mazeSpecs) {
  const rdMaze = setupMazeBoardRD(mazeSpecs);
  createRDMaze(
    rdMaze,
    [1, mazeSpecs.height - 1],
    [1, mazeSpecs.width - 1],
    mazeSpecs,
    (equalDiv = true)
  );
  breakStartAndExitRD(rdMaze, mazeSpecs);
  return rdMaze;
}

function setupMazeBoardRD(mazeSpecs) {
  const maze = [];
  for (let r = 0; r < mazeSpecs.height; r++) {
    const row = document.createElement("div");
    row.className = "row";

    const arrRow = [];
    for (let c = 0; c < mazeSpecs.width; c++) {
      const square = document.createElement("div");
      square.className = `square r-${r} c-${c}`;

      if (
        r === 0 ||
        r === mazeSpecs.height - 1 ||
        c === 0 ||
        c === mazeSpecs.width - 1
      ) {
        arrRow.push("0");
        square.className += " wall";
      } else {
        arrRow.push(" ");
        square.className += " passage";
      }
      row.appendChild(square);
    }
    maze.push(arrRow);
    mazeBoard.appendChild(row);
  }
  return maze;
}

function createRDMaze(maze, rowBounds, colBounds, mazeSpecs, equalDiv = false) {
  // Unpack the bounds of this chamber from the parameters
  const rowStart = rowBounds[0],
    rowEnd = rowBounds[1],
    colStart = colBounds[0],
    colEnd = colBounds[1];

  // 1. Find out how many vertical and horizontal walls can divide this chamber
  const vWallOptions = Math.floor((colEnd - colStart - 1) / 2),
    hWallOptions = Math.floor((rowEnd - rowStart - 1) / 2);

  // 2. If there are no horizontal or vertical options, then this chamber is 1x1, so return.
  if (vWallOptions === 0 || hWallOptions === 0) {
    return;
  }

  // 3. Divide the maze with a horizontal and vertical wall
  const wallIndeces = divideMaze(
    maze,
    rowBounds,
    colBounds,
    hWallOptions,
    vWallOptions,
    equalDiv
  );

  // 4. Pick one wall segment to not have a hole, and make a hole in the other 3 wall segments
  breakThreeWalls(maze, rowBounds, colBounds, wallIndeces);

  // Recursive calls
  // Top left chamber
  rowBounds = [rowStart, wallIndeces.hWallIndex];
  colBounds = [colStart, wallIndeces.vWallIndex];
  createRDMaze(maze, rowBounds, colBounds, mazeSpecs, (equalDiv = equalDiv));
  // Top right chamber
  rowBounds = [rowStart, wallIndeces.hWallIndex];
  colBounds = [wallIndeces.vWallIndex + 1, colEnd];
  createRDMaze(maze, rowBounds, colBounds, mazeSpecs, (equalDiv = equalDiv));
  // Bottom left chamber
  rowBounds = [wallIndeces.hWallIndex + 1, rowEnd];
  colBounds = [colStart, wallIndeces.vWallIndex];
  createRDMaze(maze, rowBounds, colBounds, mazeSpecs, (equalDiv = equalDiv));
  // Bottom right chamber
  rowBounds = [wallIndeces.hWallIndex + 1, rowEnd];
  colBounds = [wallIndeces.vWallIndex + 1, colEnd];
  createRDMaze(maze, rowBounds, colBounds, mazeSpecs, (equalDiv = equalDiv));
}

function divideMaze(
  maze,
  rowBounds,
  colBounds,
  hWallOptions,
  vWallOptions,
  equalDiv
) {
  // Unpack the bounds of this chamber from the parameters
  const rowStart = rowBounds[0],
    rowEnd = rowBounds[1],
    colStart = colBounds[0],
    colEnd = colBounds[1];

  let vWallIndex, hWallIndex;

  // If equalDiv, divide the maze down the middle, otherwise, divide it randomly
  if (equalDiv) {
    hWallIndex = rowStart + hWallOptions;
    vWallIndex = colStart + vWallOptions;
    if (hWallOptions % 2 === 0) {
      hWallIndex--;
    }
    if (vWallOptions % 2 === 0) {
      vWallIndex--;
    }
  } else {
    const hOffset = Math.floor(Math.random() * hWallOptions) * 2 + 1;
    const vOffset = Math.floor(Math.random() * vWallOptions) * 2 + 1;
    hWallIndex = rowStart + hOffset;
    vWallIndex = colStart + vOffset;
  }

  // Make each wall in 100ms
  currDelay += 100;
  for (let r = rowStart; r < rowEnd; r++) {
    maze[r][vWallIndex] = "0";
    // Make this tile a wall (with no delay)
    const tile = document.querySelector(`.r-${r}.c-${vWallIndex}`);
    const className = `square r-${r} c-${vWallIndex} wall`;
    addToVisualizerQueue(tile, className, 0);
  }
  currDelay += 100;
  for (let c = colStart; c < colEnd; c++) {
    maze[hWallIndex][c] = "0";
    // Make this tile a wall (with no delay)
    const tile = document.querySelector(`.r-${hWallIndex}.c-${c}`);
    const className = `square r-${hWallIndex} c-${c} wall`;
    addToVisualizerQueue(tile, className, 0);
  }

  // Return an object containing the horizontal wall index and the vertical wall index
  return {
    hWallIndex,
    vWallIndex,
  };
}

function breakThreeWalls(maze, rowBounds, colBounds, wallIndeces) {
  const rowStart = rowBounds[0],
    rowEnd = rowBounds[1],
    colStart = colBounds[0],
    colEnd = colBounds[1];

  const noHoleWall = Math.floor(Math.random() * 4);
  let row, col;
  // Hole in top wall
  if (noHoleWall != 0) {
    const range = getRange(rowStart, wallIndeces.hWallIndex, 2);
    const holeRowIndex = range[Math.floor(Math.random() * range.length)];
    breakWallRD(maze, holeRowIndex, wallIndeces.vWallIndex);
  }
  // Hole in bottom wall
  if (noHoleWall != 1) {
    const range = getRange(wallIndeces.hWallIndex + 1, rowEnd, 2);
    const holeRowIndex = range[Math.floor(Math.random() * range.length)];
    breakWallRD(maze, holeRowIndex, wallIndeces.vWallIndex);
  }
  // Hole in left wall
  if (noHoleWall != 2) {
    const range = getRange(colStart, wallIndeces.vWallIndex, 2);
    const holeColIndex = range[Math.floor(Math.random() * range.length)];
    breakWallRD(maze, wallIndeces.hWallIndex, holeColIndex);
  }
  // Hole in right wall
  if (noHoleWall != 3) {
    const range = getRange(wallIndeces.vWallIndex + 1, colEnd, 2);
    const holeColIndex = range[Math.floor(Math.random() * range.length)];
    breakWallRD(maze, wallIndeces.hWallIndex, holeColIndex);
  }
}

function getRange(start, end, inc) {
  const returnVal = [];
  for (let i = start; i < end; i += inc) {
    returnVal.push(i);
  }
  return returnVal;
}

function breakWallRD(maze, row, col) {
  maze[row][col] = " ";
  // Make this tile a passage (with 100ms delay)
  const tile = document.querySelector(`.r-${row}.c-${col}`);
  const className = `square r-${row} c-${col} passage`;
  addToVisualizerQueue(tile, className, 100);
}

function breakStartAndExitRD(maze, mazeSpecs) {
  // Pick 2 random walls
  let start, exit, randIndex;
  const walls = ["top", "bottom", "left", "right"];
  randIndex = Math.floor(Math.random() * walls.length);
  start = walls.splice(randIndex, 1)[0];
  breakOuterWall(maze, mazeSpecs, start, "start");
  randIndex = Math.floor(Math.random() * walls.length);
  exit = walls.splice(randIndex, 1)[0];
  breakOuterWall(maze, mazeSpecs, exit, "exit");
}

function breakOuterWall(maze, mazeSpecs, wallStr, exitType) {
  let row, col, range;

  switch (wallStr) {
    case "top":
      range = getRange(1, mazeSpecs.width - 1, 2);
      col = range[Math.floor(Math.random() * range.length)];
      row = 0;
      break;
    case "bottom":
      range = getRange(1, mazeSpecs.width - 1, 2);
      col = range[Math.floor(Math.random() * range.length)];
      row = mazeSpecs.height - 1;
      break;
    case "left":
      range = getRange(1, mazeSpecs.height - 1, 2);
      row = range[Math.floor(Math.random() * range.length)];
      col = 0;
      break;
    case "right":
      range = getRange(1, mazeSpecs.height - 1, 2);
      row = range[Math.floor(Math.random() * range.length)];
      col = mazeSpecs.width - 1;
      break;
    default:
      console.log("No wall error in breakOuterWall()");
  }

  // Make the tile the start or exit (with 250ms delay)
  const tile = document.querySelector(`.r-${row}.c-${col}`);
  const className = `square r-${row} c-${col} ${exitType}`;
  addToVisualizerQueue(tile, className, 0);

  maze[row][col] = exitType === "start" ? "S" : "E";
}

// Recursive Backtrack Solver

function backtrackSolve(maze, mazeSpecs) {
  const startAndExit = findStartAndExit(maze, mazeSpecs);
  const start = startAndExit.start;
  const allowCenter = !mazeSpecs.startAtCenter;

  // Backtrack solve messes up if the start tile is on the outer wall, so move it in
  moveStartFromOuterWall(start, mazeSpecs);

  if (recursiveBacktrackSolve(maze, start, mazeSpecs, allowCenter)) {
    // Remove solve classes (with no delay)
    for (let r = 1; r < mazeSpecs.height - 1; r++) {
      for (let c = 1; c < mazeSpecs.width - 1; c++) {
        if (maze[r][c] === "V") {
          const tile = document.querySelector(`.r-${r}.c-${c}`);
          const className = `square r-${r} c-${c} passage`;
          addToVisualizerQueue(tile, className, 0);
        }
      }
    }

    // Add solution colour to the start tile (with no delay) and reset the currDelay var
    const tile = document.querySelector(`.r-${start[0]}.c-${start[1]}`);
    const className = `square r-${start[0]} c-${start[1]} solution`;
    addToVisualizerQueue(tile, className, 0);
  }
}

function moveStartFromOuterWall(start, mazeSpecs) {
  if (start[0] === 0) {
    start[0]++;
  }
  if (start[0] === mazeSpecs.height - 1) {
    start[0]--;
  }
  if (start[1] === 0) {
    start[1]++;
  }
  if (start[1] === mazeSpecs.width - 1) {
    start[1]--;
  }
}

function recursiveBacktrackSolve(maze, coord, mazeSpecs, allowCenter) {
  const row = coord[0],
    col = coord[1];

  if (maze[row][col] === "E") {
    return true;
  }

  maze[row][col] = "V";
  const unvisitedNeighbours = getNeighbourPassages(
    maze,
    row,
    col,
    mazeSpecs,
    allowCenter
  );

  // Add the solve class to the tile (with 100ms delay)
  let tile = document.querySelector(`.r-${row}.c-${col}`);
  let className = `square r-${row} c-${col} solve`;
  addToVisualizerQueue(tile, className, 100);

  // Search the unvisited neighbours and check whether they lead to an exit
  let solved = false;
  for (let neighbour of unvisitedNeighbours) {
    if (recursiveBacktrackSolve(maze, neighbour, mazeSpecs, allowCenter)) {
      // If this tile leads to the solution, add the solution class (with 50ms delay)
      tile = document.querySelector(`.r-${neighbour[0]}.c-${neighbour[1]}`);
      className = `square r-${neighbour[0]} c-${neighbour[1]} solution`;
      addToVisualizerQueue(tile, className, 50);
      // Add solution marker to the maze matrix
      maze[row][col] = "S";
      // Don't explore more neighbours when the solution is found
      solved = true;
      break;
    }
  }
  return solved;
}

function getNeighbourPassages(maze, row, col, mazeSpecs, allowCenter) {
  // Return the neighbour passage tiles, where a passage
  // is an unvisited tile (white tiles in the UI maze)

  // First check the adjacent tiles for the exit. If it is found, return an array that only contains this coord (a length 2 array)
  if (maze[row - 1][col] === "E") {
    return [[row - 1, col]];
  }
  if (maze[row + 1][col] === "E") {
    return [[row + 1, col]];
  }
  if (maze[row][col - 1] === "E") {
    return [[row, col - 1]];
  }
  if (maze[row][col + 1] === "E") {
    return [[row, col + 1]];
  }

  let returnVal = [];
  // Top Neighbour
  if (
    row > 1 &&
    maze[row - 1][col] === " " &&
    (!inCenter(row - 1, col, mazeSpecs) || allowCenter)
  ) {
    returnVal.push([row - 1, col]);
  }
  // Bottom Neighbour
  if (
    row < mazeSpecs.height - 2 &&
    maze[row + 1][col] === " " &&
    (!inCenter(row + 1, col, mazeSpecs) || allowCenter)
  ) {
    returnVal.push([row + 1, col]);
  }
  // Left Neighbour
  if (
    col > 1 &&
    maze[row][col - 1] === " " &&
    (!inCenter(row, col - 1, mazeSpecs) || allowCenter)
  ) {
    returnVal.push([row, col - 1]);
  }
  // Right Neighbour
  if (
    col < mazeSpecs.width - 2 &&
    maze[row][col + 1] === " " &&
    (!inCenter(row, col + 1, mazeSpecs) || allowCenter)
  ) {
    returnVal.push([row, col + 1]);
  }
  return returnVal;
}

function findStartAndExit(maze, mazeSpecs) {
  let returnVal = { start: null, exit: null };
  for (let r = 0; r < mazeSpecs.height; r++) {
    for (let c = 0; c < mazeSpecs.width; c++) {
      if (maze[r][c] === "S") {
        returnVal.start = [r, c];
      }
      if (maze[r][c] === "E") {
        returnVal.exit = [r, c];
      }
    }
  }
  return returnVal;
}

// Delay UI changes for visualizer

function addToVisualizerQueue(square, newClassName, delay) {
  currDelay += delay;
  setTimeout(() => {
    square.className = newClassName;
  }, currDelay);
}
