const windowID = "#window, #window2"; // add element ID to make it a Window
const draggableElements = document.querySelectorAll(`${windowID}`);

draggableElements.forEach((element) => {
  element.addEventListener("mousedown", (event) => onMouseDown(event, element));
  element.style.backgroundColor = getRandomColor();
  element.dataset.fullSize = "false";
});

function onMouseDown(event, targetElement) {
  const isResizing = event.target.classList.contains("resize-handle");
  const istopBar = event.target.classList.contains("topBar");
  const isClose = event.target.classList.contains("closeWindow");
  const isfullWindow = event.target.classList.contains("makefull-window");
  const isMin = event.target.classList.contains("minimize");

  const offsetX = event.clientX - targetElement.offsetLeft;
  const offsetY = event.clientY - targetElement.offsetTop;

  if (isResizing) {
    onResizeMouseDown(event, targetElement);
  } else if (istopBar || isClose || isfullWindow || isMin) {
    ontopBarMouseDown(event, targetElement, offsetX, offsetY);
  }

  setZ(targetElement);
}

function ontopBarMouseDown(event, targetElement, offsetX, offsetY) {
  if (event.target.classList.contains("closeWindow")) {
    targetElement.remove();
  } else if (event.target.classList.contains("makefull-window")) {
    let fullSize = targetElement.dataset.fullSize === "true";

    if (!fullSize) {
      targetElement.dataset.oldWidth = targetElement.offsetWidth;
      targetElement.dataset.oldHeight = targetElement.offsetHeight;
      targetElement.dataset.oldLeft = targetElement.style.left;
      targetElement.dataset.oldTop = targetElement.style.top;
      
      targetElement.style.width = window.innerWidth + "px";
      targetElement.style.height = window.innerHeight + "px";
      targetElement.style.left = "0px";
      targetElement.style.top = "0px";
      targetElement.dataset.fullSize = "true";
    } else {
      targetElement.style.width = targetElement.dataset.oldWidth + "px";
      targetElement.style.height = targetElement.dataset.oldHeight + "px";
      targetElement.style.left = targetElement.dataset.oldLeft;
      targetElement.style.top = targetElement.dataset.oldTop;
      targetElement.dataset.fullSize = "false";
    }
  } else if (event.target.classList.contains("minimize")) {
    targetElement.style.display = "none";
  }

  function onMouseMove(e) {
    targetElement.style.left = e.clientX - offsetX + "px";
    targetElement.style.top = e.clientY - offsetY + "px";
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onResizeMouseDown(event, targetElement) {
  const initialWidth = targetElement.offsetWidth;
  const initialHeight = targetElement.offsetHeight;
  const startX = event.clientX;
  const startY = event.clientY;

  function onMouseMove(e) {
    targetElement.style.width = initialWidth + (e.clientX - startX) + "px";
    targetElement.style.height = initialHeight + (e.clientY - startY) + "px";
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function setZ(targetElement) {
  const elements = document.querySelectorAll(`${windowID}`);
  elements.forEach((element) => {
    element.style.zIndex = "0";
  });
  targetElement.style.zIndex = "1";
}

// Random CSS background color
function getRandomColor() {
  let randomColor = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
  return randomColor;
}
