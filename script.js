var main = window;
var controller;

var slide = 0;
var startTime = 0;
var pausedTime = -1;
var timeOffset = "";
var expectedTime = [0, 0, 0]; // TODO Fill this with all 140 times :(

function toggleController() {
    if (controller == undefined) {
        document.getElementById("controller-button").innerText = "STEUERUNG SCHLIEßEN 􀑧";
        window.addEventListener("unload", () => {
            toggleController();
        });
        controller = window.open("controller.html", "Controller", "width=1920,height=1080,left=" + (window.outerWidth - 1920) / 2 + ",top=" + (window.outerHeight - 1080) / 2);
    } else {
        controller.close();
        controller = undefined;
        document.getElementById("controller-button").innerText = "STEUERUNG ÖFFNEN 􀑨";
    }
}
function toggleFullscreen(doc) {
    if (doc.fullscreenElement) {
        doc.exitFullscreen();
        doc.getElementById("fullscreen-button").innerText = "VOLLBLID AKTIVIEREN 􀅊";
    } else {
        doc.documentElement.requestFullscreen();
        doc.getElementById("fullscreen-button").innerText = "VOLLBLID DEAKTIVIEREN 􀅋";
    }
}
function toggleTestScreen() {
    querySelect("body").forEach((element) => {
        element.toggleAttribute("test-screen");
    });
    querySelect("#test-screen-button").forEach((element) => {
        if (document.body.hasAttribute("test-screen")) {
            element.innerText = "TEST-BILD VERSTECKEN 􀺾";
        } else {
            element.innerText = "TEST-BILD ZEIGEN 􀑍";
        }
    });
}
function togglePause() {
    if (pausedTime == -1) {
        pausedTime = Math.floor(new Date().getTime() / 1000) - main.startTime;
    } else {
        main.startTime = Math.floor(new Date().getTime() / 1000) - pausedTime;
        pausedTime = -1;
    }
}
function onKeyPress(event) {
    var key = event.key.toUpperCase();
    event.preventDefault();
    if (event.key == "ArrowRight" || event.key == "ArrowUp" || event.key == "PageUp" || key == "D" || key == "W" || event.key == " ") {
        nextSlide();
    } else if ((event.key == "ArrowLeft" || event.key == "ArrowDown" || event.key == "PageDown" || event.key == "A" || key == "S") && slide > 0) {
        previousSlide();
    } else if (key == "C") {
        toggleController();
    } else if (key == "F") {
        toggleFullscreen(event.target.baseURI.includes("controller") ? controller.document : document);
    } else if (key == "T") {
        toggleTestScreen();
    } else if (key == "P" || event.key == "Tab") {
        togglePause();
    }
}
document.body.addEventListener("keydown", onKeyPress);

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
    var gone = querySelect("center.slide[gone]");
    for (var i = 0; i < gone.length; i++) {
        if (gone[i].parentNode.children[Array.from(gone[i].parentNode.children).indexOf(gone[i]) + 1].hasAttribute("gone")) {
            gone[i].setAttribute("long-gone", "");
        }
    }
    if (slide == 3) {
        document.getElementById("live-sources").removeAttribute("invisible");
    } else if (slide == 120) {
        document.getElementById("live-sources").setAttribute("gone", "");
    }
    document.querySelectorAll(".live-source").forEach((element) => {
        if (Number(element.getAttribute("to")) < slide) {
            element.setAttribute("gone", "");
        } else if (Number(element.getAttribute("from")) <= slide) {
            element.removeAttribute("invisible");
        }
    });
    if (pausedTime == -1) {
        if (slide == 2) {
            startTime = Math.floor(new Date().getTime() / 1000);
        }
        var time = Math.floor(new Date().getTime() / 1000) - startTime - expectedTime[slide];
        if (time <= -5) {
            timeOffset = " (-" + Math.floor(time / -60) + ":" + (-time % 60).toString().padStart(2, "0") + ") 􀓐";
        } else if (time >= 5) {
            timeOffset = " (+" + Math.floor(time / 60) + ":" + (time % 60).toString().padStart(2, "0") + ") 􀓎";
        } else {
            timeOffset = "";
        }
    }
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
    var longGone = querySelect("center.slide[long-gone]");
    for (var i = 0; i < longGone.length; i++) {
        if (!longGone[i].parentNode.children[Array.from(longGone[i].parentNode.children).indexOf(longGone[i]) + 1].hasAttribute("gone")) {
            longGone[i].removeAttribute("long-gone");
        }
    }
    if (slide == 2) {
        document.getElementById("live-sources").setAttribute("invisible", "");
    } else if (slide == 119) {
        document.getElementById("live-sources").removeAttribute("gone");
    }
    document.querySelectorAll(".live-source").forEach((element) => {
        if (Number(element.getAttribute("from")) > slide) {
            element.setAttribute("invisible", "");
        } else if (Number(element.getAttribute("to")) >= slide){
            element.removeAttribute("gone");
        }
    });
    if (pausedTime == -1) {
        var time = Math.floor(new Date().getTime() / 1000) - startTime - expectedTime[slide];
        if (time <= -5) {
            timeOffset = " (-" + Math.floor(time / -60) + ":" + (-time % 60).toString().padStart(2, "0") + ") 􀓐";
        } else if (time >= 5) {
            timeOffset = " (+" + Math.floor(time / 60) + ":" + (time % 60).toString().padStart(2, "0") + ") 􀓎";
        } else {
            timeOffset = "";
        }
    }
}
function goToSlide(number) {
    while (slide < number) {
        nextSlide();
    }
    while (slide > number) {
        previousSlide();
    }
}

function querySelect(selector) {
    if (controller == undefined) {
        return Array.from(document.querySelectorAll(selector));
    } else {
        return Array.from(document.querySelectorAll(selector)).concat(Array.from(controller.document.querySelectorAll(selector)));
    }
}
function animate(svg) {
    svg.querySelectorAll("animate, animateColor, animateMotion, animateTransform").forEach((anim) => {
        if (anim.hasAttribute("start")) {
            setTimeout(() => {
                anim.beginElement();
            }, Number(anim.getAttribute("start")) * 1000);
        }
    });
}
function resetAnimation(svg) {
    svg.querySelectorAll("animate, animateColor, animateMotion, animateTransform").forEach((anim) => {
        if (anim.hasAttribute("start")) {
            anim.parentNode.replaceChild(anim.cloneNode(), anim);
        }
    });
}

// Debug
goToSlide(0);
while (expectedTime.length < 142) {
    expectedTime.push(expectedTime[expectedTime.length - 1] + 4);
}
