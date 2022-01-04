// Sort area container
const searchArea = document.querySelector(".searching-container");

// Highlight colour
let highlightColour = "red";

// Delay multiplier (changes with array size)
let delayMultiplier = 10;

// Current delay var
let currDelay = 0;

// Global values for algorithm, colour, and the array
let algorithm, colour, array;

// Don't allow the select bar event is a search is ongoing
let currentlySearching = false;

// Return to the menu after the search flag
let back = false;

// Event Listeners

// Search Array Event
document.getElementById("search").addEventListener("click", searchSubmit);

// Select Bar Event
document
  .querySelector(".searching-container")
  .addEventListener("click", beginSearch);

// Back to Menu Event
document.querySelector(".sidedesc #back").addEventListener("click", (e) => {
  if (!currentlySearching) {
    backToMenu();
  } else {
    back = true;
    e.target.textContent = "Waiting For Search";
    e.preventDefault();
  }
});

// Clicking Menu Dropdown Options
const dropdowns = document.querySelectorAll(".menu-dropdown");
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", function (e) {
    e.target.parentElement.previousElementSibling.textContent =
      e.target.textContent;
  });
});

function searchSubmit(e) {
  // Get size, algorithm and colour from input
  const lengthString = document
    .getElementById("length")
    .textContent.toLowerCase();

  const length = parseInt(
    lengthString.substring(
      lengthString.indexOf("(") + 1,
      lengthString.length - 1
    )
  );
  algorithm = document.getElementById("algorithm").textContent.toLowerCase();
  colour = document.getElementById("colour").textContent.toLowerCase();

  // If the form is filled in
  if (
    lengthString !== "array length" &&
    algorithm !== "algorithm" &&
    colour !== "highlight colour"
  ) {
    highlightColour = colour;

    if (algorithm === "linear search") {
      array = setupArray(length);
    } else if (algorithm === "interpolation search") {
      array = setupInterpolationSearchArray(length);
    } else {
      array = setupArray(length, (sorted = true));
    }

    setupGUIArray(array, algorithm !== "linear search");
    // Show the select prompt
    document.querySelector(".select-prompt").style.display = "block";

    // Set delayMultiplier based on array length
    switch (length) {
      case 50:
        delayMultiplier = 50;
        break;
      case 150:
        delayMultiplier = 25;
        break;
      case 300:
        delayMultiplier = 10;
        break;
    }
  }
  e.preventDefault();
}

function beginSearch(e) {
  // If a bar is clicked, begin the search
  if (e.target.className.includes("bar") && !currentlySearching) {
    // Update the search status
    currentlySearching = true;
    // Reset currDelay
    currDelay = 0;
    // Make all bars grey
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.backgroundColor = "#aaa";
    });
    // Make the clicked bar white
    e.target.style.backgroundColor = "white";
    // Hide the prompt
    document.querySelector(".select-prompt").style.display = "none";
    // Get the search value
    const valueClass = e.target.className.split(" ")[1];
    const searchFor = parseInt(
      valueClass.substring(valueClass.indexOf("-") + 1)
    );
    // Setup the sidedesc in place of sidemenu
    document.querySelector(".sidemenu").style.display = "none";
    document.querySelector(".sidedesc").style.display = "flex";

    switch (algorithm) {
      case "linear search":
        document.querySelector(".sidedesc .linear-desc").style.display =
          "block";
        linearSearch(array, searchFor);
        break;

      case "binary search":
        document.querySelector(".sidedesc .binary-desc").style.display =
          "block";
        binarySearch(array, searchFor, 0, array.length - 1);
        break;

      case "jump search":
        document.querySelector(".sidedesc .jump-desc").style.display = "block";
        jumpSearch(array, searchFor);
        break;

      case "interpolation search":
        document.querySelector(".sidedesc .interpolation-desc").style.display =
          "block";
        interpolationSearch(array, searchFor);
        break;

      case "exponential search":
        document.querySelector(".sidedesc .exponential-desc").style.display =
          "block";
        exponentialSearch(array, searchFor);
        break;

      default:
        console.log("Invalid algorithm input");
        break;
    }
    // After the search is done, set the search status back to false and set currDelay to 0 (wait 1s in case returning to menu)
    currDelay += 1000;
    setTimeout(() => {
      currentlySearching = false;
      currDelay = 0;
      // If back is true, call backToMenu
      if (back) {
        backToMenu();
      }
    }, currDelay);
  }
  e.preventDefault();
}

function backToMenu() {
  // Set the button text back to "Back To Menu"
  document.querySelector(".sidedesc #back").textContent = "Back To Menu";
  // Return to the menu after the search
  switch (algorithm) {
    case "linear search":
      document.querySelector(".sidedesc .linear-desc").style.display = "none";
      break;

    case "binary search":
      document.querySelector(".sidedesc .binary-desc").style.display = "none";
      break;

    case "jump search":
      document.querySelector(".sidedesc .jump-desc").style.display = "none";
      break;

    case "interpolation search":
      document.querySelector(".sidedesc .interpolation-desc").style.display =
        "none";
      break;

    case "exponential search":
      document.querySelector(".sidedesc .exponential-desc").style.display =
        "none";
      break;

    default:
      console.log("Could not find algorithm description.");
      break;
  }
  document.querySelector(".sidedesc").style.display = "none";
  document.querySelector(".sidemenu").style.display = "flex";

  // Clear the bars
  searchArea.innerHTML = "";
}

// Utility functions (used in more than one algorithm)

function setupArray(length, sorted = false) {
  const array = [];
  for (let i = 1; i <= length; i++) {
    array.push(i);
  }
  if (!sorted) {
    shuffleArray(array);
  }
  return array;
}

function shuffleArray(array) {
  let temp, j;
  for (let i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function setupGUIArray(array, sorted) {
  // First, clear the old sorting area
  searchArea.innerHTML = "";
  // Second, setup the GUI Array
  for (let i = 0; i < array.length; i++) {
    // Create the column element
    const bar = document.createElement("div");
    // Make the className keep track of the height and the index
    bar.className = `bar value-${array[i]} index-${i}`;
    // Set the height based on the array value
    // Get the max (at the end for sorted arrays)
    let max = array[array.length - 1];
    if (!sorted) {
      // Find the max
      for (let j = 0; j < array.length - 1; j++) {
        if (array[j] > max) {
          max = array[j];
        }
      }
    }
    let percent = (array[i] / max) * 100;

    bar.style.height = `${percent}%`;
    searchArea.appendChild(bar);
  }
}

// Linear Search

function linearSearch(array, target) {
  // Highlight the initial bar (with no delay)
  setTimeout(() => {
    array[0] === target
      ? (document.querySelector(".bar.index-0").style.backgroundColor = "teal")
      : (document.querySelector(
          ".bar.index-0"
        ).style.backgroundColor = highlightColour);
  }, currDelay);
  for (let i = 1; i < array.length; i++) {
    // Highlight the current bar and make the previous one grey (with 5 * delayMultiplier)
    currDelay += 5 * delayMultiplier;
    setTimeout(() => {
      const currBar = document.querySelector(`.bar.index-${i}`);
      currBar.previousElementSibling.style.backgroundColor = "#aaa";
      currBar.style.backgroundColor = highlightColour;
    }, currDelay);
    if (array[i] === target) {
      // Found the target, highlight it (with no delay)
      setTimeout(() => {
        document.querySelector(`.bar.index-${i}`).style.backgroundColor =
          "teal";
      }, currDelay);
      return i;
    }
  }
}

// Binary Search

function binarySearch(array, target, left, right) {
  // Highlight the initial left and right bounds (with no delay)
  setTimeout(
    (left, right) => {
      document.querySelector(`.bar.index-${left}`).style.backgroundColor =
        "greenyellow";
      document.querySelector(`.bar.index-${right}`).style.backgroundColor =
        "greenyellow";
    },
    currDelay,
    left,
    right
  );

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // Highlight the mid bar (with no delay)
    setTimeout(
      (mid) => {
        document.querySelector(
          `.bar.index-${mid}`
        ).style.backgroundColor = highlightColour;
      },
      currDelay,
      mid
    );
    if (target === array[mid]) {
      // Found the target, highlight it (with no delay)
      setTimeout(
        (mid) => {
          document.querySelector(`.bar.index-${mid}`).style.backgroundColor =
            "teal";
        },
        currDelay,
        mid
      );
      // Set the bounds back to grey (after 500ms)
      currDelay += 500;
      setTimeout(
        (left, right, mid) => {
          if (left !== mid) {
            document.querySelector(`.bar.index-${left}`).style.backgroundColor =
              "#aaa";
          }
          if (right !== mid) {
            document.querySelector(
              `.bar.index-${right}`
            ).style.backgroundColor = "#aaa";
          }
        },
        currDelay,
        left,
        right,
        mid
      );
      return mid;
    } else if (target > array[mid]) {
      // Set the old left bound to grey, the current mid bar to grey, and highlight the new one (after 1s)
      currDelay += 1000;
      setTimeout(
        (left, mid) => {
          document.querySelector(`.bar.index-${left}`).style.backgroundColor =
            "#aaa";
          document.querySelector(`.bar.index-${mid}`).style.backgroundColor =
            "#aaa";
          document.querySelector(
            `.bar.index-${mid + 1}`
          ).style.backgroundColor = "greenyellow";
        },
        currDelay,
        left,
        mid
      );
      left = mid + 1;
    } else {
      // Set the old right bound to grey, the current mid bar to grey and highlight the new one (after 1s)
      currDelay += 1000;
      setTimeout(
        (right, mid) => {
          document.querySelector(`.bar.index-${right}`).style.backgroundColor =
            "#aaa";
          document.querySelector(`.bar.index-${mid}`).style.backgroundColor =
            "#aaa";
          document.querySelector(
            `.bar.index-${mid - 1}`
          ).style.backgroundColor = "greenyellow";
        },
        currDelay,
        right,
        mid
      );
      right = mid - 1;
    }
  }
}

// Jump Search

function jumpSearch(array, target) {
  const jumpSize = Math.floor(Math.sqrt(array.length));

  // Highlight the first bar (with no delay)
  setTimeout(() => {
    document.querySelector(
      ".bar.index-0"
    ).style.backgroundColor = highlightColour;
  }, currDelay);

  // If the first bar is the target, return
  if (array[0] === target) {
    // Make the first bar teal (with no delay)
    setTimeout(() => {
      document.querySelector(".bar.index-0").style.backgroundColor = "teal";
    }, currDelay);
    return 0;
  }

  let i = jumpSize;
  for (; array[i] < target; i += jumpSize) {
    // Highlight the jumped to bar and make the previous bar grey (after 500ms)
    currDelay += 500;
    setTimeout(
      (index, prevIndex) => {
        document.querySelector(
          `.bar.index-${index}`
        ).style.backgroundColor = highlightColour;
        document.querySelector(
          `.bar.index-${prevIndex}`
        ).style.backgroundColor = "#aaa";
      },
      currDelay,
      i,
      i - jumpSize
    );
  }
  let endBound = i - jumpSize;

  // Make the last jump bar and the bar after the second last jump bar greenyellow (to act as bounds)
  // Also, make the second last jump bar grey
  currDelay += 500;
  setTimeout(
    (index, endBound) => {
      document.querySelector(`.bar.index-${endBound}`).style.backgroundColor =
        "#aaa";
      document.querySelector(`.bar.index-${index}`).style.backgroundColor =
        "greenyellow";
      document.querySelector(
        `.bar.index-${endBound + 1}`
      ).style.backgroundColor = "greenyellow";
    },
    currDelay,
    i,
    endBound
  );

  let firstStepBack = true;
  for (; i >= endBound; i--) {
    // Highlight the current bar and make the previous bar grey (after 500ms)
    currDelay += 500;
    setTimeout(
      (index, firstStepBack) => {
        document.querySelector(
          `.bar.index-${index}`
        ).style.backgroundColor = highlightColour;
        if (!firstStepBack) {
          document.querySelector(
            `.bar.index-${index + 1}`
          ).style.backgroundColor = "#aaa";
        }
      },
      currDelay,
      i,
      firstStepBack
    );
    firstStepBack = false;

    if (array[i] === target) {
      // Found the target, highlight it (with no delay)
      setTimeout(
        (index) => {
          document.querySelector(`.bar.index-${index}`).style.backgroundColor =
            "teal";
        },
        currDelay,
        i
      );
      return i;
    }
  }
}

// Interpolation Search

function interpolationSearch(array, target) {
  let low = 0,
    high = array.length - 1;

  // Make the low and high bounds greenyellow (with no delay)
  setTimeout(
    (low, high) => {
      document.querySelector(`.bar.index-${low}`).style.backgroundColor =
        "greenyellow";
      document.querySelector(`.bar.index-${high}`).style.backgroundColor =
        "greenyellow";
    },
    currDelay,
    low,
    high
  );

  while (low <= high && target >= array[low] && target <= array[high]) {
    if (low === high) {
      if (array[low] === target) {
        // Found the target, make it teal (after 500ms)
        currDelay += 500;
        setTimeout(
          (index) => {
            document.querySelector(
              `.bar.index-${index}`
            ).style.backgroundColor = "teal";
          },
          currDelay,
          low
        );
        return low;
      }
      console.log("Interpolation Search failed");
      return -1;
    }
    // Select a new position with uniform distribution in mind
    let pos =
      low +
      Math.floor(
        ((high - low) / (array[high] - array[low])) * (target - array[low])
      );

    // Highlight the pos bar (after 500ms)
    currDelay += 500;
    setTimeout(
      (index) => {
        document.querySelector(
          `.bar.index-${index}`
        ).style.backgroundColor = highlightColour;
      },
      currDelay,
      pos
    );

    if (array[pos] === target) {
      // Found the target, make it teal (after 500ms)
      // Also, make the low and high bounds grey
      currDelay += 500;
      setTimeout(
        (index, low, high) => {
          document.querySelector(`.bar.index-${low}`).style.backgroundColor =
            "#aaa";
          document.querySelector(`.bar.index-${high}`).style.backgroundColor =
            "#aaa";
          document.querySelector(`.bar.index-${index}`).style.backgroundColor =
            "teal";
        },
        currDelay,
        pos,
        low,
        high
      );
      return pos;
    }

    if (array[pos] < target) {
      // Make the old low bound grey and make the new one greenyellow (after 500ms)
      currDelay += 500;
      setTimeout(
        (oldIndex, newIndex) => {
          document.querySelector(
            `.bar.index-${oldIndex}`
          ).style.backgroundColor = "#aaa";
          document.querySelector(
            `.bar.index-${newIndex}`
          ).style.backgroundColor = "greenyellow";
        },
        currDelay,
        low,
        pos + 1
      );
      low = pos + 1;
    } else {
      // Make the old high bound grey and make the new one greenyellow (after 500ms)
      currDelay += 500;
      setTimeout(
        (oldIndex, newIndex) => {
          document.querySelector(
            `.bar.index-${oldIndex}`
          ).style.backgroundColor = "#aaa";
          document.querySelector(
            `.bar.index-${newIndex}`
          ).style.backgroundColor = "greenyellow";
        },
        currDelay,
        high,
        pos - 1
      );
      high = pos - 1;
    }
    // Make the old pos bar grey (with no delay)
    setTimeout(
      (index) => {
        document.querySelector(`.bar.index-${index}`).style.backgroundColor =
          "#aaa";
      },
      currDelay,
      pos
    );
  }
}

function setupInterpolationSearchArray(length) {
  const array = [];
  let value = 1;
  for (let i = 1; i <= length; i++) {
    array.push(value);
    value += Math.floor(Math.random() * (array.length / 25)) + 1;
  }
  return array;
}

// Exponential Search (calls binarySearch())

function exponentialSearch(array, target) {
  if (array[0] === target) {
    // Found the target, make it teal (with 500ms delay)
    currDelay += 500;
    setTimeout(() => {
      document.querySelector(".bar.index-0").style.backgroundColor = "teal";
    }, currDelay);
    return 0;
  }
  let i;
  for (i = 1; i < array.length && array[i] <= target; i *= 2) {
    // Make the current bar for i the highlight colour and make the previous bar (i / 2) grey (with 500ms delay)
    currDelay += 500;
    setTimeout(
      (index) => {
        document.querySelector(
          `.bar.index-${index}`
        ).style.backgroundColor = highlightColour;
        // Only make the previous bar grey if there is a previous bar
        if (index > 1) {
          document.querySelector(
            `.bar.index-${index / 2}`
          ).style.backgroundColor = "#aaa";
        }
      },
      currDelay,
      i
    );
  }

  currDelay += 1000;
  binarySearch(array, target, i / 2, Math.min(i, array.length - 1));
}
