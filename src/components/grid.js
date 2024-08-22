import React, { useState } from 'react';
import './grid.css';

const Grid = () => {
  const [grid, setGrid] = useState(createInitialGrid());
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [tooltip, setTooltip] = useState('');

  const handleMouseEnter = (row, col) => {
    const cellType = grid[row][col];
    setTooltip(getTooltipText(cellType));
  };

  const handleMouseLeave = () => {
    setTooltip('');
  };

  const handleClick = (row, col) => {
    if (isRunning) return;

    if (!start) {
      setStart({ row, col });
      updateGrid(row, col, 'start');
    } else if (!end) {
      setEnd({ row, col });
      updateGrid(row, col, 'end');
    } else {
      toggleObstacle(row, col);
    }
  };

  const updateGrid = (row, col, type) => {
    const newGrid = grid.map(r => r.slice());
    newGrid[row][col] = type;
    setGrid(newGrid);
  };

  const toggleObstacle = (row, col) => {
    const newGrid = grid.map(r => r.slice());
    newGrid[row][col] = newGrid[row][col] === 'obstacle' ? 'empty' : 'obstacle';
    setGrid(newGrid);
  };

  const clearGrid = () => {
    setGrid(createInitialGrid());
    setStart(null);
    setEnd(null);
    setSteps(0);
  };

  const runAlgorithm = () => {
    if (!start || !end) {
      alert('Please set both start and end points.');
      return;
    }

    setIsRunning(true);
    const path = algorithms[algorithm](grid, start, end);
    if (path.length === 0) {
      alert('No path found. Please adjust the obstacles.');
    } else {
      visualizePath(path);
    }
    setIsRunning(false);
  };

  const visualizePath = (path) => {
    const newGrid = grid.map(row => row.slice());
    path.forEach(([row, col]) => {
      if (grid[row][col] !== 'start' && grid[row][col] !== 'end') {
        newGrid[row][col] = 'path';
      }
    });
    setGrid(newGrid);
    setSteps(path.length);
  };

  const getTooltipText = (cellType) => {
    switch (cellType) {
      case 'start':
        return 'Start Point';
      case 'end':
        return 'End Point';
      case 'obstacle':
        return 'Obstacle';
      case 'path':
        return 'Path';
      default:
        return 'Empty Cell';
    }
  };

  return (
    <div>
      <div className="controls">
        <select onChange={(e) => setAlgorithm(e.target.value)} value={algorithm}>
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
          <option value="dijkstra">Dijkstra</option>
          <option value="aStar">A*</option>
        </select>
        <button onClick={runAlgorithm} disabled={isRunning}>Run Algorithm</button>
        <button onClick={clearGrid} disabled={isRunning}>Clear Grid</button>
      </div>
      <div className="steps-count">
        <p>Number of steps: {steps}</p>
      </div>
      <div className="grid-container" style={{ position: 'relative' }}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`grid-cell ${cell}`}
                onClick={() => handleClick(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onMouseLeave={handleMouseLeave}
              ></div>
            ))}
          </div>
        ))}
        {tooltip && (
          <div
            className="tooltip"
            style={{
              top: '10px',
              left: '10px', // Adjust as necessary
              display: 'block'
            }}
          >
            {tooltip}
          </div>
        )}
      </div>
    </div>
  );
};

const createInitialGrid = () => {
  return Array.from({ length: 20 }, () => Array.from({ length: 50 }, () => 'empty'));
};

// Pathfinding algorithms (unchanged)

const algorithms = {
  bfs: (grid, start, end) => {
    const path = [];
    const queue = [start];
    const visited = new Set();
    const parent = {};

    visited.add(`${start.row},${start.col}`);

    while (queue.length > 0) {
      const { row, col } = queue.shift();
      if (row === end.row && col === end.col) break;

      for (const [r, c] of getNeighbors(row, col)) {
        if (!visited.has(`${r},${c}`) && grid[r][c] !== 'obstacle') {
          visited.add(`${r},${c}`);
          queue.push({ row: r, col: c });
          parent[`${r},${c}`] = { row, col };
        }
      }
    }

    let current = `${end.row},${end.col}`;
    while (current) {
      const [r, c] = current.split(',').map(Number);
      path.unshift([r, c]);
      current = parent[current] ? `${parent[current].row},${parent[current].col}` : null;
    }

    return path;
  },
  
  dfs: (grid, start, end) => {
    const path = [];
    const stack = [start];
    const visited = new Set();
    const parent = {};

    visited.add(`${start.row},${start.col}`);

    while (stack.length > 0) {
      const { row, col } = stack.pop();
      if (row === end.row && col === end.col) break;

      for (const [r, c] of getNeighbors(row, col)) {
        if (!visited.has(`${r},${c}`) && grid[r][c] !== 'obstacle') {
          visited.add(`${r},${c}`);
          stack.push({ row: r, col: c });
          parent[`${r},${c}`] = { row, col };
        }
      }
    }

    let current = `${end.row},${end.col}`;
    while (current) {
      const [r, c] = current.split(',').map(Number);
      path.unshift([r, c]);
      current = parent[current] ? `${parent[current].row},${parent[current].col}` : null;
    }

    return path;
  },
  
  dijkstra: (grid, start, end) => {
    const path = [];
    const queue = [[start.row, start.col, 0]];
    const distances = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));
    distances[start.row][start.col] = 0;
    const parent = {};

    while (queue.length > 0) {
      const [row, col, dist] = queue.shift();
      if (row === end.row && col === end.col) break;

      for (const [r, c] of getNeighbors(row, col)) {
        const newDist = dist + 1;
        if (newDist < distances[r][c] && grid[r][c] !== 'obstacle') {
          distances[r][c] = newDist;
          queue.push([r, c, newDist]);
          parent[`${r},${c}`] = { row, col };
        }
      }
    }

    let current = `${end.row},${end.col}`;
    while (current) {
      const [r, c] = current.split(',').map(Number);
      path.unshift([r, c]);
      current = parent[current] ? `${parent[current].row},${parent[current].col}` : null;
    }

    return path;
  },
  
  aStar: (grid, start, end) => {
    const path = [];
    const openSet = [start];
    const cameFrom = {};
    const gScore = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));
    const fScore = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));

    gScore[start.row][start.col] = 0;
    fScore[start.row][start.col] = heuristic(start, end);

    while (openSet.length > 0) {
      openSet.sort((a, b) => fScore[a.row][a.col] - fScore[b.row][b.col]);
      const current = openSet.shift();
      if (current.row === end.row && current.col === end.col) break;

      for (const [r, c] of getNeighbors(current.row, current.col)) {
        if (grid[r][c] !== 'obstacle') {
          const tentativeGScore = gScore[current.row][current.col] + 1;
          if (tentativeGScore < gScore[r][c]) {
            cameFrom[`${r},${c}`] = current;
            gScore[r][c] = tentativeGScore;
            fScore[r][c] = gScore[r][c] + heuristic({ row: r, col: c }, end);
            if (!openSet.find(cell => cell.row === r && cell.col === c)) {
              openSet.push({ row: r, col: c });
            }
          }
        }
      }
    }

    let current = end;
    while (current) {
      path.unshift([current.row, current.col]);
      current = cameFrom[`${current.row},${current.col}`];
    }

    return path;
  },
};

const getNeighbors = (row, col) => {
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];
  const neighbors = [];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < 20 && c >= 0 && c < 50) {
      neighbors.push([r, c]);
    }
  }
  return neighbors;
};

const heuristic = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

export default Grid;