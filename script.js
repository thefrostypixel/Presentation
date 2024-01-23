var controllerWindow;
var controller;
function openController() {
    controllerWindow = window.open("controller.html", "Controller", "width=1920,height=1080,left=" + (window.outerWidth - 1920) / 2 + ",top=" + (window.outerHeight - 1080) / 2);
    window.addEventListener("unload", closeController);
    document.getElementById("open-controller-button").innerText = "STEUERUNG SCHLIEßEN 􀺾";
    document.getElementById("open-controller-button").onclick = closeController;
}
function closeController() {
    controllerWindow.close();
    controllerWindow = undefined;
    controller = undefined;
    document.getElementById("open-controller-button").innerText = "STEUERUNG ÖFFNEN 􀑍";
    document.getElementById("open-controller-button").onclick = openController;
}
document.addEventListener("keydown", onKeyPress);
document.addEventListener("click", onMouseClick);
function onKeyPress(event) {
    if (event.key == " " || event.key == "Enter" || event.key == "Tab" || event.key == "D" || event.key == "d" || event.key == "W" || event.key == "w" || event.key == "ArrowRight" || event.key == "ArrowUp") {
        nextSlide();
        event.preventDefault();
    } else if ((event.key == "ArrowLeft" || event.key == "ArrowDown" || event.key == "A" || event.key == "a" || event.key == "S" || event.key == "s") && slide > 0) {
        previousSlide();
        event.preventDefault();
    } else if (event.key == "c") {
        if (controller == undefined) {
            openController();
        } else {
            closeController();
        }
        event.preventDefault();
    } else if (event.key == "f") {
        if (event.target.baseURI.includes("controller")) {
            if (controller.fullscreenElement) {
                controller.exitFullscreen();
                controller.getElementById("fullscreen-button").innerText = "VOLLBLID AKTIVIEREN 􀅊";
            } else {
                controller.documentElement.requestFullscreen();
                controller.getElementById("fullscreen-button").innerText = "VOLLBLID DEAKTIVIEREN 􀅋";
            }
        } else {
            toggleFullscreen();
        }
        event.preventDefault();
    }
}
function onMouseClick(event) {
    if (event.button == 0 && slide > 0) {
        nextSlide();
    }
}
function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        document.getElementById("fullscreen-button").innerText = "VOLLBLID AKTIVIEREN 􀅊";
    } else {
        document.documentElement.requestFullscreen();
        document.getElementById("fullscreen-button").innerText = "VOLLBLID DEAKTIVIEREN 􀅋";
    }
}

var slide = 0;
/* function displaySlide() {
    if (document.querySelector(".slide-" + slide) == undefined) {
        slide--;
        return;
    }
    var slideClass = ".slide-" + slide;
    document.body.setAttribute("slide", slide);
    document.body.setAttribute("style", "--slide: " + slide);
    if (controller != undefined) {
        controller.body.setAttribute("slide", slide);
        controller.body.setAttribute("style", "--slide: " + slide);
    }
     // Not Using :has(), Works For Older Browsers
    for (var i = 0; i < slide; i++) {
        querySelect(".slide-" + i).forEach((element) => {
            element.setAttribute("gone", "");
        });
    }
    // Using :has(), Does Not Work For Older Browsers
    //querySelect(".slide:has(.slide-" + (slide - 1) + "), .slide-" + (slide - 1)).forEach((element) => {
    //    element.setAttribute("gone", "");
    //});
    querySelect(".slide-" + slide).forEach((element) => {
        element.removeAttribute("invisible");
        element.removeAttribute("gone");
        // Not Using :has(), Works For Older Browsers
        var parent = element.parentNode;
        while (parent != undefined && parent.tagName != "BODY") {
            parent.removeAttribute("gone");
            parent = parent.parentNode;
        }
        // Using :has(), Does Not Work For Older Browsers
        //querySelect(".slide:has(.slide-" + slide + "), .slide-" + slide).forEach((element) => {
        //    element.removeAttribute("gone");
        //});
        if (element.tagName == "svg") {
            animate(element);
        }
        element.querySelectorAll("svg:not(.slide):not(" + slideClass + " .slide *)").forEach((svg) => {
            animate(svg);
        });
    });
    querySelect(".slide-" + (slide + 1)).forEach((element) => {
        element.setAttribute("invisible", "");
        if (element.tagName == "svg") {
            resetAnimation(element);
        }
        element.querySelectorAll("svg:not(.slide):not(.slide-" + slide + " .slide *)").forEach((svg) => {
            resetAnimation(svg);
        });
    });
} */
function nextSlide() {
    slide++;
    if (document.querySelector(".slide-" + slide) == undefined) {
        slide--;
        return;
    }
    var slideClass = ".slide-" + slide;
    querySelect(Array.from({length: slide}, (_, i) => ".slide-" + i).join(", ")).forEach((element) => {
        element.setAttribute("gone", "");
    })
    querySelect(".slide-" + slide).forEach((element) => {
        element.removeAttribute("invisible");
        var parent = element.parentNode;
        while (parent != undefined && parent.tagName != "BODY") {
            parent.removeAttribute("gone");
            parent = parent.parentNode;
        }
        if (element.tagName == "svg") {
            animate(element);
        }
        element.querySelectorAll("svg:not(.slide):not(" + slideClass + " .slide *)").forEach((svg) => {
            animate(svg);
        });
    });
}
function previousSlide() {
    if (--slide < 0) {
        slide++;
        return;
    }
    querySelect(".slide-" + slide).forEach((element) => {
        element.removeAttribute("gone");
        var parent = element.parentNode;
        while (parent != undefined && parent.tagName != "BODY") {
            parent.removeAttribute("gone");
            parent = parent.parentNode;
        }
    });
    querySelect(".slide-" + (slide + 1)).forEach((element) => {
        element.setAttribute("invisible", "");
        if (element.tagName == "svg") {
            resetAnimation(element);
        }
        element.querySelectorAll("svg:not(.slide):not(.slide-" + slide + " .slide *)").forEach((svg) => {
            resetAnimation(svg);
        });
    });
}

function querySelect(selector) {
    if (controller == undefined) {
        return Array.from(document.querySelectorAll(selector));
    } else {
        return Array.from(document.querySelectorAll(selector)).concat(Array.from(controller.querySelectorAll(selector)));
    }
}
function animate(svg) {
    svg.querySelectorAll("animate, animateColor, animateMotion, animateTransform").forEach((anim) => setTimeout(() => {
        anim.beginElement();
    }, Number(anim.getAttribute("start")) * 1000));
}
function resetAnimation(svg) {
    svg.querySelectorAll("animate, animateColor, animateMotion, animateTransform").forEach((anim) => {
        anim.parentNode.replaceChild(anim.cloneNode(), anim);
    });
}

// Debug Options
var startSlide = 73;

// Debug Code
for (var i = 0; i < startSlide; i++) {
    nextSlide();
}
