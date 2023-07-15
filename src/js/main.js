const submitBtn = document.getElementById("submit_btn");
const home_page = document.getElementById("home_page");
const lift_page = document.getElementById("lift_page");
const floors_container = document.getElementById("floors_container");

// inputs
let noOfFloors;
let noOfLifts;
let liftsPositions = {};
let maxLifts = 6;
let screenSize;

const upBtnSVG = `<svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m7.5 3 7.5 8H0l7.5-8Z" fill="#000"/></svg>`;

const downBtnSVG = `<svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 12 0 4h15l-7.5 8Z" fill="#000"/></svg>`;

window.onload = () => {
  // testing in browser
  screenSize = window.innerWidth;
  console.log(screenSize);
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
      liftsPositions[i + 1] = { position: 0, free: true };
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
    <div class="lift-door left-door lift-left-door-${i + 1}"></div>
    <div class="lift-door right-door lift-right-door-${i + 1}"></div>
  </div>`;
  }

  return liftHTML;
};

const moveLift = async (floorNo) => {
  const { nearestLift, nearestDistance } = getNearestAvailableLift(floorNo);

  if (nearestLift && floorNo >= 0) {
    openDoors(nearestLift); // Open the doors
    liftsPositions[nearestLift].free = false;
    const lift = document.getElementById(`lift-${nearestLift}`);
    const height = floorNo * 100;

    // const obj = {
    //   nearestLift: nearestLift,
    //   nearestDistance: nearestDistance,
    //   floorNo: floorNo,
    // };

    // console.log(obj);
    // console.log(liftsPositions[nearestLift].position);

    setTimeout(() => {
      if (liftsPositions[nearestLift].position !== floorNo) {
        lift.style.transitionDuration = `${nearestDistance * 2}s`;
        lift.style.transform = `translateY(${-height}px)`;
        liftsPositions[nearestLift].position = floorNo;

        setTimeout(() => {
          openDoors(nearestLift);
          liftsPositions[nearestLift].free = true;
        }, nearestDistance * 1000 * 2);
      } else {
        liftsPositions[nearestLift].free = true;
      }
    }, 5000);
  }
};

const getNearestAvailableLift = (currentFloor) => {
  let nearestLift = null;
  let nearestDistance = noOfFloors + 1;

  for (let lift of Object.keys(liftsPositions)) {
    if (liftsPositions[+lift].free) {
      const liftFloor = liftsPositions[+lift].position;

      if (liftFloor === currentFloor) {
        nearestLift = +lift;
        break; // Exit the loop since a lift on the current floor is found
      }

      const distance = Math.abs(liftFloor - currentFloor);

      if (distance < nearestDistance) {
        nearestLift = +lift;
        nearestDistance = distance;
      }
    }
  }

  return { nearestLift, nearestDistance };
};

function openDoors(lift) {
  const leftDoor = document.querySelector(`.lift-left-door-${lift}`);
  const rightDoor = document.querySelector(`.lift-right-door-${lift}`);

  leftDoor.classList.add("open-left");
  rightDoor.classList.add("open-right");

  setTimeout(function () {
    leftDoor.classList.remove("open-left");
    rightDoor.classList.remove("open-right");
  }, 2500);
}
