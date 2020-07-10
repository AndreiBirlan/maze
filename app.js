const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 20;
const cellsVertical = 18;

const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false, // if true makes all shapes solid and can apply colors to them
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);


// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 3, { isStatic: true }), // top
  Bodies.rectangle(width / 2, height, width, 3, { isStatic: true }), //bottom
  Bodies.rectangle(0, height / 2, 3, height, { isStatic: true }), // left
  Bodies.rectangle(width, height / 2, 3, height, { isStatic: true }) // right
];
World.add(world, walls);

// Maze generation
const shuffle = arr => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temporary = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temporary;
  }
  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)  // creates an empty array that has 3 possible elements in it
  .map(() => Array(cellsHorizontal).fill(false)); // generates 3 new columns arrays with the false status to each element. Each with his own memory
const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);
const stepThroughCell = (row, column) => {
  // If i have visted the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }
  // Mark this cell as being visited
  grid[row][column] = true;
  // Assemble randomly-coordinates list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);
  // For each neighbor....
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
  // See if that neighbor is out of bounds
    if (
      nextRow < 0 || 
      nextRow >= cellsVertical || 
      nextColumn < 0 || 
      nextColumn >= cellsHorizontal
    ) {
      continue; // to go to the next neighbour pair
    }
  // If we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }
  // Remove a wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row -1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
  }
};
stepThroughCell(startRow, startColumn);
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return; 
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,  // center of the horizontal line on X coordinate
      rowIndex * unitLengthY + unitLengthY,        // center of the horizontal line on Y coordinate
      unitLengthX, //width of the horizontal line
      5,  // how tall the line: 5 units
      { 
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,   // center of the vertical line on X coordinate
      rowIndex * unitLengthY + unitLengthY / 2,  // center of the vertical line on Y coordinate
      5, // width of the line
      unitLengthY, // height of the line
      { 
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});
// Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,   // X coordinate
  height - unitLengthY / 2,  // Y coordinate
  unitLengthX * .7,
  unitLengthY * .7,
  { 
    isStatic: true, 
    label: 'goal',
    render: {
      fillStyle: 'green'
    }
  }
);
World.add(world, goal);
//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2, // center point: X coordinate
  unitLengthY / 2, // center point: Y coordinate
  ballRadius, 
  { 
    label: 'ball',
    render: {
      fillStyle: 'blue'
    }
  }
);
World.add(world, ball);
//Setting the keypress
var down = false;
document.addEventListener('keydown', event => {
  if(down) return;
  down = true;
  const { x, y } = ball.velocity;
  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 })  // moving the ball up
  }
  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y })  // moving the ball right
  }
  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 })  // moving the ball down
  }
  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y })  // moving the ball left
  }
}, false);

document.addEventListener('keyup', event => {
  down = false;
  const { x, y } = ball.velocity;
  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: 0 })  // moving the ball up
  }
  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: 0, y })  // moving the ball right
  }
  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: 0 })  // moving the ball down
  }
  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: 0, y })  // moving the ball left
  }
}, false);

// document.addEventListener('keyup', event => {
//   down = false;
//   const { x, y } = ball.velocity;
//   if (
//     event.keyCode === 87 || event.keyCode === 38 ||
//     event.keyCode === 68 || event.keyCode === 39 ||
//     event.keyCode === 83 || event.keyCode === 40 ||
//     event.keyCode === 65 || event.keyCode === 37
//   ) {
//     Body.setVelocity(ball, { x: 0, y: 0})
//   }
// }, false);

// Win Condition
Events.on(engine, 'collisionStart', event => {
  // console.log(event);
  event.pairs.forEach((collision) => {
    // console.log(collision);
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) && 
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector('.winner').classList.remove('hidden');
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});