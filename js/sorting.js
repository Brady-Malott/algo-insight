// Sort area container
const sortArea = document.querySelector(".sorting-container");

// Highlight colour
let highlightColour = "red";

// Delay multiplier (changes with array size)
let delayMultiplier = 10;

// Current delay var
let currDelay = 0;

// Event Listeners

// Sort Array Event
document.getElementById("sort").addEventListener("click", sortSubmit);

// Clicking Menu Dropdown Options
const dropdowns = document.querySelectorAll(".menu-dropdown");
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", function (e) {
    e.target.parentElement.previousElementSibling.textContent =
      e.target.textContent;
  });
});

function sortSubmit(e) {
  // Get size, algorithm and colour from input
  const lengthString = document
    .getElementById("length")
    .textContent.toLowerCase();

  const length = parseInt(
      lengthString.substring(
        lengthString.indexOf("(") + 1,
        lengthString.length - 1
      )
    ),
    algorithm = document.getElementById("algorithm").textContent.toLowerCase(),
    colour = document.getElementById("colour").textContent.toLowerCase();

  // If the form is filled in
  if (
    lengthString !== "array length" &&
    algorithm !== "algorithm" &&
    colour !== "highlight colour"
  ) {
    highlightColour = colour;
    const array = setupArray(length);
    setupGUIArray(array);

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
    // Setup the sidedesc in place of sidemenu
    document.querySelector(".sidemenu").style.display = "none";
    document.querySelector(".sidedesc").style.display = "block";

    switch (algorithm) {
      case "bubble sort":
        document.querySelector(".sidedesc .bubble-desc").style.display =
          "block";
        bubbleSort(array);
        break;

      case "insertion sort":
        document.querySelector(".sidedesc .insertion-desc").style.display =
          "block";
        insertionSort(array);
        break;

      case "selection sort":
        document.querySelector(".sidedesc .selection-desc").style.display =
          "block";
        selectionSort(array);
        break;

      case "quick sort":
        document.querySelector(".sidedesc .quick-desc").style.display = "block";
        quickSort(array);
        break;

      case "merge sort":
        document.querySelector(".sidedesc .merge-desc").style.display = "block";
        mergeSort(array);
        break;

      default:
        console.log("Invalid algorithm input");
        break;
    }
  }
  e.preventDefault();
}

// Utility functions (used across more than one algorithm)

function setupArray(length) {
  const array = [];
  for (let i = 1; i <= length; i++) {
    array.push(i);
  }
  shuffleArray(array);
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

function setupGUIArray(array) {
  // First, clear the old sorting area
  sortArea.innerHTML = "";
  // Second, setup the GUI Array
  for (let i = 0; i < array.length; i++) {
    // Create the column element
    const bar = document.createElement("div");
    // Make the className keep track of the height and the index
    bar.className = `bar value-${array[i]} index-${i}`;
    // Set the height based on the array value
    const percent = (array[i] / array.length) * 100;
    bar.style.height = `${percent}%`;
    sortArea.appendChild(bar);
  }
}

function visualizeSwap(array, i, j) {
  // Highlight GUI bars (with no delay)
  setTimeout(() => {
    // Get GUI bars
    const bar1 = document.querySelector(`.bar.index-${i}`),
      bar2 = document.querySelector(`.bar.index-${j}`);

    bar1.style.backgroundColor = highlightColour;
    bar2.style.backgroundColor = highlightColour;
  }, currDelay);

  // Swap the bars after twice the delayMultiplier
  currDelay += 2 * delayMultiplier;
  setTimeout(() => {
    // Get GUI bars
    const bar1 = document.querySelector(`.bar.index-${i}`),
      bar2 = document.querySelector(`.bar.index-${j}`);

    // Make a copy of bar2 to insert before bar 1
    const bar2Copy = bar2.cloneNode(false);
    // Update the index class in bar2Copy
    let valueClass = bar2.className.split(" ")[1];
    bar2Copy.className = `bar ${valueClass} index-${i}`;
    // Insert the copy of bar2 before bar1
    sortArea.insertBefore(bar2Copy, bar1);
    // Update the index class in bar1
    valueClass = bar1.className.split(" ")[1];
    bar1.className = `bar ${valueClass} index-${j}`;
    // Insert bar1 before bar2, then delete bar2
    sortArea.insertBefore(bar1, bar2);
    bar2.remove();

    // Remove highlight colour
    bar1.style.backgroundColor = "#aaa";
    bar2Copy.style.backgroundColor = "#aaa";
  }, currDelay);

  let temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}

function finalSweep(array, sortAlg) {
  // Do one last run through just for visualization after solving
  let currBar = document.querySelector(".bar.index-0");
  // First, set the initial bar to orange
  setTimeout(() => {
    currBar.style.backgroundColor = "greenyellow";
  }, currDelay);
  for (let i = 0; i < array.length; i++) {
    // Highlight bar after 1 delayMultiplier
    currDelay += delayMultiplier;
    setTimeout(() => {
      // Set the old bar to grey (currBar is still set from the sorting part)
      currBar.style.backgroundColor = "#aaa";
      // Update currBar and highlight it
      currBar = document.querySelector(`.bar.index-${i}`);
      currBar.style.backgroundColor = "greenyellow";
    }, currDelay);
  }
  // Set last bar back to grey and show the side menu again
  currDelay += delayMultiplier;
  setTimeout(() => {
    currBar.style.backgroundColor = "#aaa";
    // Hide bubble-desc and sidedesc
    document.querySelector(`.sidedesc .${sortAlg}-desc`).style.display = "none";
    document.querySelector(".sidedesc").style.display = "none";
    // Show the sidemenu (display flex)
    document.querySelector(".sidemenu").style.display = "flex";
    currDelay = 0;
  }, currDelay);
}

// Bubble Sort

function bubbleSort(array) {
  let lastUnsorted = array.length - 1;
  let solved = false;
  // Current GUI bar
  let currBar = document.querySelector(".bar.index-0");

  while (!solved) {
    solved = true;
    for (let i = 0; i < lastUnsorted; i++) {
      // Highlight the bar after half a delayMultiplier
      currDelay += delayMultiplier / 2;
      setTimeout(() => {
        // Set previous bar back to grey
        currBar.style.backgroundColor = "#aaa";
        // Set current bar to orange
        currBar = document.querySelector(`.bar.index-${i}`);
        currBar.style.backgroundColor = "teal";
      }, currDelay);

      if (array[i] > array[i + 1]) {
        visualizeSwap(array, i, i + 1);
        solved = false;
      }
    }
    lastUnsorted--;
  }
  // Make the last scanned bar grey before the final sweep
  currDelay += 50;
  setTimeout(() => (currBar.style.backgroundColor = "#aaa"), currDelay);
  finalSweep(array, "bubble");
}

// Insertion Sort

function insertionSort(array) {
  for (let i = 1; i < array.length; i++) {
    let j = i;
    // Make the first bar in the unsorted sub array (the bar at index i) orange (with no delay)
    setTimeout(() => {
      const bar = document.querySelector(`.bar.index-${i}`);
      bar.style.backgroundColor = "teal";
    }, currDelay);
    // Make the bar at index i grey again (after 2 * delayMultiplier)
    currDelay += 2 * delayMultiplier;
    setTimeout(() => {
      const bar = document.querySelector(`.bar.index-${i}`);
      bar.style.backgroundColor = "#aaa";
    }, currDelay);

    while (j > 0 && array[j - 1] > array[j]) {
      visualizeSwap(array, j - 1, j);
      j--;
    }
  }
  finalSweep(array, "insertion");
}

// Selection Sort

function selectionSort(array) {
  for (
    let firstUnsorted = 0;
    firstUnsorted < array.length - 1;
    firstUnsorted++
  ) {
    let minIdx = firstUnsorted;

    // Highlight the first bar teal to label it as the minimum (with no delay)
    setTimeout(
      (minIdx) => {
        document.querySelector(`.bar.index-${minIdx}`).style.backgroundColor =
          "teal";
      },
      currDelay,
      minIdx
    );

    // Scan the unsorted subarray to look for the minimum value
    for (let i = firstUnsorted + 1; i < array.length; i++) {
      // Highlight this bar and unhighlight the previous bar (after 2 * delayMultiplier)
      currDelay += 2 * delayMultiplier;
      setTimeout(() => {
        const currBar = document.querySelector(`.bar.index-${i}`);
        // Set the previous bar back to grey if it is not teal (i.e. the current minimum)
        if (currBar.previousElementSibling.style.backgroundColor !== "teal") {
          currBar.previousElementSibling.style.backgroundColor = "#aaa";
        }
        currBar.style.backgroundColor = highlightColour;
      }, currDelay);

      if (array[i] < array[minIdx]) {
        // Make the old min bar grey again and the new one teal (with no delay)
        setTimeout(
          (oldIdx, newIdx) => {
            document.querySelector(
              `.bar.index-${oldIdx}`
            ).style.backgroundColor = "#aaa";
            document.querySelector(
              `.bar.index-${newIdx}`
            ).style.backgroundColor = "teal";
          },
          currDelay,
          minIdx,
          i
        );

        minIdx = i;
      }
    }

    // If the last bar is not the minIdx, make it grey (after 2 * delayMultiplier)
    if (minIdx !== array.length - 1) {
      currDelay += 2 * delayMultiplier;
      setTimeout(() => {
        document.querySelector(
          `.bar.index-${array.length - 1}`
        ).style.backgroundColor = "#aaa";
      }, currDelay);
    }

    // Swap the min bar with the firstUnsorted bar
    visualizeSwap(array, firstUnsorted, minIdx);
  }
  finalSweep(array, "selection");
}

// Quick Sort

function quickSort(array) {
  quickSortRecursive(array, 0, array.length - 1);
  finalSweep(array, "quick");
}

function quickSortRecursive(array, left, right) {
  if (left >= right) {
    return;
  }

  const pivotIdx = Math.floor((left + right) / 2);
  const pivot = array[pivotIdx];

  // Set pivot bar to teal (after 100ms)
  currDelay += 100;
  setTimeout(() => {
    const pivotBar = document.querySelector(`.bar.index-${pivotIdx}`);
    pivotBar.style.backgroundColor = "teal";
  }, currDelay);

  let index = partition(array, left, right, pivot);

  // Set pivot bar to grey (after 100ms)
  currDelay += 100;
  setTimeout(() => {
    const pivotBar = document.querySelector(`.bar.index-${pivotIdx}`);
    pivotBar.style.backgroundColor = "#aaa";
  }, currDelay);

  quickSortRecursive(array, left, index - 1);
  quickSortRecursive(array, index, right);
}

function partition(array, left, right, pivot) {
  while (left <= right) {
    // Set the initial left and right bars to greenyellow
    currDelay += 50;
    setTimeout(
      (left, right) => {
        let currLeft = document.querySelector(`.bar.index-${left}`),
          currRight = document.querySelector(`.bar.index-${right}`);
        currLeft.style.backgroundColor = "greenyellow";
        currRight.style.backgroundColor = "greenyellow";
      },
      currDelay,
      left,
      right
    );

    while (array[left] < pivot) {
      left++;
      // Set the old left bar back to grey and the new one to greenyellow (after 50ms)
      currDelay += 50;
      setTimeout(
        (left) => {
          // Set the previous left bar back to grey
          let currLeft = document.querySelector(`.bar.index-${left - 1}`);
          currLeft.style.backgroundColor = "#aaa";
          // Set the current left bar to greenyellow
          currLeft = currLeft.nextElementSibling;
          currLeft.style.backgroundColor = "greenyellow";
        },
        currDelay,
        left
      );
    }
    while (array[right] > pivot) {
      right--;
      // Set the old right bar back to grey and the new one to greenyellow (after 50ms)
      currDelay += 50;
      setTimeout(
        (right) => {
          // Set the previous right bar back to grey
          let currRight = document.querySelector(`.bar.index-${right + 1}`);
          currRight.style.backgroundColor = "#aaa";
          // Set the current right bar to greenyellow
          currRight = currRight.previousElementSibling;
          currRight.style.backgroundColor = "greenyellow";
        },
        currDelay,
        right
      );
    }
    if (left <= right) {
      visualizeSwap(array, left, right);
      left++;
      right--;
    } else {
      // Set bars back to grey (after 100ms)
      currDelay += 100;
      setTimeout(
        (left, right) => {
          let currLeft = document.querySelector(`.bar.index-${left}`),
            currRight = document.querySelector(`.bar.index-${right}`);
          currLeft.style.backgroundColor = "#aaa";
          currRight.style.backgroundColor = "#aaa";
        },
        currDelay,
        left,
        right
      );
    }
  }
  return left;
}

// Merge Sort

function mergeSort(array) {
  mergeSortRecursive(array, 0, array.length - 1);
  finalSweep(array, "merge");
}

function mergeSortRecursive(array, l, r) {
  // If the subarray has more than 1 element
  if (l < r) {
    const m = Math.floor((l + r) / 2);

    // Sort left and right half
    mergeSortRecursive(array, l, m);
    mergeSortRecursive(array, m + 1, r);

    // Merge the sorted halves
    merge(array, l, m, r);
  }
}

function merge(array, l, m, r) {
  // Copy elements into a left and right subarray
  const leftArr = array.slice(l, m + 1),
    rightArr = array.slice(m + 1, r + 1);

  // Highlight the initial positions of the pointers (with no delay)
  setTimeout(() => {
    document.querySelector(
      `.bar.index-${l}`
    ).style.backgroundColor = highlightColour;
    document.querySelector(
      `.bar.index-${m + 1}`
    ).style.backgroundColor = highlightColour;
  }, currDelay);

  // Pointers for left subarray, right subarray, and the whole array
  let i = 0,
    j = 0,
    k = l;

  // Take the lower element from the sorted subarrays and advance its pointer
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      // Remove previously highlighted left bar and highlight the next left bar (after 2 * delayMultiplier)
      highlightNext(l + i, m, delayMultiplier * 2);

      // Merge value into array
      array[k] = leftArr[i];
      i++;
    } else {
      // Remove previously highlighted right bar and highlight the next right bar (after 2 * delayMultiplier)
      highlightNext(m + 1 + j, r, delayMultiplier * 2);

      // Merge value into array
      array[k] = rightArr[j];
      j++;
    }
    k++;
  }

  // Copy remaining elements of left subarray (if any)
  while (i < leftArr.length) {
    // Remove previously highlighted left bar and highlight the next left bar (after 2 * delayMultiplier)
    highlightNext(l + i, m, delayMultiplier * 2);

    // Merge value into array
    array[k] = leftArr[i];
    i++;
    k++;
  }

  // Copy remaining elements of right subarray (if any)
  while (j < rightArr.length) {
    // Remove previously highlighted right bar and highlight the next right bar (after 2 * delayMultiplier)
    highlightNext(m + 1 + j, r, delayMultiplier * 2);

    // Merge value into array
    array[k] = rightArr[j];
    j++;
    k++;
  }

  // Set the last left and right bar back to grey (after 2 * delayMultiplier)
  currDelay += 2 * delayMultiplier;
  setTimeout(
    (leftIdx, rightIdx) => {
      document.querySelector(`.bar.index-${leftIdx}`).style.backgroundColor =
        "#aaa";
      document.querySelector(`.bar.index-${rightIdx}`).style.backgroundColor =
        "#aaa";
    },
    currDelay,
    l + i,
    m + j
  );

  // Visualize the bars changing (scan through from l (inclusive) to k (exclusive))
  mergeScan(array, l, k);
}

function mergeScan(array, start, end) {
  // Visualize the bars changing (scan through from start (inclusive) to end (exclusive))
  for (let i = start; i < end; i++) {
    // Highlight the bar (with no delay)
    setTimeout(
      (i) => {
        document.querySelector(
          `.bar.index-${i}`
        ).style.backgroundColor = highlightColour;
      },
      currDelay,
      i
    );
    // After the bar is highlighted for 1 * delayMultiplier, change the height of the bar and set it back to grey
    currDelay += delayMultiplier;
    setTimeout(
      (i, value) => {
        // Select the bar at index i on the GUI Array
        const bar = document.querySelector(`.bar.index-${i}`);
        // Change the classname to include the new value
        bar.className = `bar value-${value} index-${i}`;
        // Change the height
        const percent = (value / array.length) * 100;
        bar.style.height = `${percent}%`;
        // Set the bar back to grey
        bar.style.backgroundColor = "#aaa";
      },
      currDelay,
      i,
      array[i]
    );
  }
}

function highlightNext(index, lastIndex, delay) {
  currDelay += delay;
  setTimeout(
    (index) => {
      const prevBar = document.querySelector(`.bar.index-${index}`);
      prevBar.style.backgroundColor = "#aaa";
      if (index < lastIndex) {
        prevBar.nextElementSibling.style.backgroundColor = highlightColour;
      }
    },
    currDelay,
    index
  );
}
