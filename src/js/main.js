const submitBtn = document.getElementById("submit_btn");
const home_page = document.getElementById("home_page");
const lift_page = document.getElementById("lift_page");
const floors_container = document.getElementById("floors_container");

// inputs
let noOfFloors;
let noOfLifts;
let liftsPositions = {};

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
  } else {
    home_page.classList.add("hidden");
    lift_page.classList.remove("hidden");
    floors_container.innerHTML = createFloor(noOfFloors);
    for (let i = 0; i < noOfLifts; i++) {
      liftsPositions[i + 1] = 0;
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
    <p>${i === 0 ? "Ground Floor" : `Floor ${i}`}</p>
    <div>
    ${
      i !== num
        ? `<button id="up_btn_${i}" class="up_btn" onclick=moveLift(${i}) >up</button>`
        : ""
    }
       
    ${
      i !== 0
        ? ` <button id="down_btn_${i}" class="down_btn" onclick=moveLift(${i})>down</button>`
        : ""
    }
     
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

const moveLift = (floorNo) => {
  const nearestLift = getNearestAvailableLift(floorNo);

  if (nearestLift && floorNo) {
    const lift = document.getElementById(`lift-${nearestLift}`);
    const height = floorNo * 100;
    lift.style.transform = `translateY(${-height}px)`;
    liftsPositions[nearestLift] = floorNo;
  }
};

// const getNearestAvailableLift = (currentFloor) => {
//   let nearestLift = null;
//   let nearestDistance = noOfFloors + 1;

//   Object.keys(liftsPositions).forEach((lift) => {
//     const liftFloor = liftsPositions[+lift];

//     if (liftFloor === currentFloor) {
//       return; // Skip if lift is already on the current floor
//     }

//     const distance = Math.abs(liftFloor - currentFloor);

//     if (distance < nearestDistance) {
//       nearestLift = +lift;
//       nearestDistance = distance;
//     }
//   });

//   return nearestLift;
// };

const getNearestAvailableLift = (currentFloor) => {
  let nearestLift = null;
  let nearestDistance = noOfFloors + 1;

  for (let lift of Object.keys(liftsPositions)) {
    const liftFloor = liftsPositions[+lift];

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

  return nearestLift;
};
