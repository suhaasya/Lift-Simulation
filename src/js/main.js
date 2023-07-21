const submitBtn = document.getElementById("submit_btn");
const home_page = document.getElementById("home_page");
const lift_page = document.getElementById("lift_page");
const floors_container = document.getElementById("floors_container");
const backBtn = document.getElementById("back-btn");

// inputs
let noOfFloors;
let noOfLifts;
let liftsPositions = new Map();
let maxLifts = 6;
let screenSize;
let liftQueue = [];

const upBtnSVG = `<svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m7.5 3 7.5 8H0l7.5-8Z" fill="#000"/></svg>`;

const downBtnSVG = `<svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 12 0 4h15l-7.5 8Z" fill="#000"/></svg>`;

window.onload = () => {
  // testing in browser
  screenSize = window.innerWidth;

  if (screenSize < 350) {
    maxLifts = 1;
  }
  if (screenSize > 350 && screenSize < 500) {
    maxLifts = 2;
  }
  if (screenSize > 500 && screenSize < 700) {
    maxLifts = 3;
  }
  if (screenSize > 700 && screenSize < 1000) {
    maxLifts = 5;
  }
  if (screenSize > 1000 && screenSize < 700) {
    maxLifts = 6;
  }

  const liftsInp = document.getElementById("lifts-inp");
  liftsInp.placeholder += ` (max ${maxLifts})`;
};

window.addEventListener("resize", function (event) {
  var changeInWidth = event.currentTarget.innerWidth;
  if (
    (screenSize < 500) & (changeInWidth > 500) ||
    (screenSize > 500 && changeInWidth < 500) ||
    (screenSize < 700) & (changeInWidth > 700) ||
    (screenSize > 700 && changeInWidth < 700) ||
    (screenSize < 1000 && changeInWidth > 1000) ||
    (screenSize > 1000 && changeInWidth < 1000) ||
    (screenSize < 1400 && changeInWidth > 1400) ||
    (screenSize > 1400 && changeInWidth < 1400)
  ) {
    this.location.reload();
  }
});

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  generateUi();
});

backBtn.addEventListener("click", (e) => {
  location.reload();
});

const generateUi = () => {
  noOfFloors = parseInt(document.getElementById("floors-inp").value);
  noOfLifts = parseInt(document.getElementById("lifts-inp").value);

  if (!noOfFloors) {
    alert("No of Floors can't be empty!");
  } else if (!noOfLifts) {
    alert("No of Lifts can't be empty");
  } else if (noOfFloors < 1) {
    alert("No of Floors can't be less than 1");
  } else if (noOfLifts < 1) {
    alert("No of Lifts can't be less than 1");
  } else if (noOfLifts > maxLifts) {
    alert(`Number of lifts can't be greater than ${maxLifts}`);
  } else {
    home_page.classList.add("hidden");
    lift_page.classList.remove("hidden");
    floors_container.innerHTML = createFloor(noOfFloors);
    for (let i = 0; i < noOfLifts; i++) {
      liftsPositions.set(i + 1, { position: 0, free: true });
    }
  }
};

const createFloor = (num) => {
  let floorHTML = "";
  for (let i = num; i >= 0; i--) {
    floorHTML =
      floorHTML +
      `
    <div class="floor">
    <div class="floor-title-container">
      <p>${i === 0 ? "Ground </br> Floor" : `Floor ${i}`}</p>
    </div>
    <div class="floors-btns">
    <div class="floors-btn-container">
    ${
      i !== num
        ? `<button id="up_btn_${i}" class="up_btn" onclick=moveLift(${i}) >${upBtnSVG}</button>`
        : ""
    }
       
    ${
      i !== 0
        ? ` <button id="down_btn_${i}" class="down_btn" onclick=moveLift(${i})>${downBtnSVG}</button>`
        : ""
    }
     
    </div>
    </div>

    <div class="lift-container">
      ${i === 0 ? createLift(noOfLifts) : ""}
    </div>
  </div>`;
  }

  return floorHTML;
};

const createLift = (num) => {
  let liftHTML = "";
  for (let i = 0; i < num; i++) {
    liftHTML =
      liftHTML +
      `<div class="lift" id="lift-${i + 1}">
    <div id="lift-left-door-${i + 1}" class="lift-door left-door "></div>
    <div id="lift-right-door-${i + 1}" class="lift-door right-door "></div>
  </div>`;
  }

  return liftHTML;
};

const moveLift = async (floorNo) => {
  liftQueue.push(floorNo);
  processLiftOperation();
};

const isLiftAvailable = (map) => {
  for (const value of map.values()) {
    if (value.free === true) {
      return true;
    }
  }
  return false;
};

const processLiftOperation = async () => {
  const isLiftFree = isLiftAvailable(liftsPositions);

  if (liftQueue.length > 0 && isLiftFree) {
    const floorNo = liftQueue.shift();
    const { nearestLift, nearestDistance } = await getNearestAvailableLift(
      floorNo
    );

    if (nearestLift !== null) {
      const liftObj = liftsPositions.get(nearestLift);
      liftsPositions.set(nearestLift, { ...liftObj, free: false });

      const lift = document.getElementById(`lift-${nearestLift}`);
      const height = floorNo * 100;
      const transitionDuration = nearestDistance * 2;

      lift.style.transitionDuration = `${transitionDuration}s`;
      lift.style.transform = `translateY(${-height}px)`;

      const newliftObj = liftsPositions.get(nearestLift);
      liftsPositions.set(nearestLift, { ...newliftObj, position: floorNo });

      setTimeout(() => {
        openDoors(nearestLift);
      }, transitionDuration * 1000);
    }

    processLiftOperation();
  }
};

const getNearestAvailableLift = (currentFloor) => {
  let nearestLift = null;
  let nearestDistance = noOfFloors + 1;
  const lifts = [];

  liftsPositions.forEach((value, key) => {
    lifts.push(key);
  });

  for (let i = 0; i < lifts.length; i++) {
    const liftObj = liftsPositions.get(lifts[i]);

    if (liftObj.free) {
      const liftFloor = liftObj.position;

      if (liftFloor === currentFloor) {
        nearestLift = lifts[i];
        nearestDistance = 0;
        break;
      }

      const distance = Math.abs(liftFloor - currentFloor);

      if (distance < nearestDistance) {
        nearestLift = lifts[i];
        nearestDistance = distance;
      }
    }
  }

  return { nearestLift, nearestDistance };
};

const openDoors = (lift) => {
  const leftDoor = document.getElementById(`lift-left-door-${lift}`);
  const rightDoor = document.getElementById(`lift-right-door-${lift}`);

  leftDoor.classList.add("open-left");
  rightDoor.classList.add("open-right");

  const doorOpenTime = 2500;

  setTimeout(function () {
    leftDoor.classList.remove("open-left");
    rightDoor.classList.remove("open-right");

    setTimeout(function () {
      const liftObj = liftsPositions.get(lift);
      liftsPositions.set(lift, { ...liftObj, free: true });
      processLiftOperation();
    }, doorOpenTime);
  }, doorOpenTime);
};
