import { registerLevel, buildBorderWalls, rectWall, COLS, ROWS, CELL }
  from '/team_portfolio/Voidgamestuff/assets/js/void-core.js';

registerLevel({
  walls: buildBorderWalls(COLS,ROWS).concat([
    ...rectWall(2,2,18,1),...rectWall(2,13,18,1),
    ...rectWall(2,3,1,4),...rectWall(2,9,1,4),...rectWall(19,3,1,10),
    ...rectWall(5,4,12,1),...rectWall(5,11,12,1),...rectWall(5,5,1,6),
    ...rectWall(16,5,1,2),...rectWall(16,9,1,2),
    ...rectWall(7,6,8,1),...rectWall(7,9,8,1),...rectWall(14,7,1,2),
  ]),
  start:{x:1,y:7}, goal:{x:9,y:7,w:4,h:2},
  coins:[
    {x:3,y:3},{x:12,y:3},{x:18,y:3},{x:3,y:12},{x:12,y:12},{x:18,y:12},
    {x:8,y:5},{x:12,y:5},{x:15,y:5},{x:8,y:10},{x:12,y:10},{x:15,y:10},
  ],
  enemies:[
    {x:10*CELL+CELL/2,y:3*CELL+CELL/2,  vx:0,  vy:4.8},
    {x:17*CELL+CELL/2,y:11*CELL+CELL/2, vx:0,  vy:-4.8},
    {x:4*CELL+CELL/2, y:3*CELL+CELL/2,  vx:4.8,vy:0},
    {x:4*CELL+CELL/2, y:9*CELL+CELL/2,  vx:0,  vy:4.8},
    {x:8*CELL+CELL/2, y:7*CELL+CELL/2,  vx:4.8,vy:0},
  ]
});
