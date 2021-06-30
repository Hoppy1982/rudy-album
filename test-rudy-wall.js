import rudyWall from "./rudy-wall/index.js";


const rudyWall1 = new rudyWall();


for (const prop in rudyWall1) {
  console.log(`${prop}: ${rudyWall1[prop]}`);
}

