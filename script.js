var main = window;
var controller;
function openController() {
    document.getElementById("controller-button").innerText = "STEUERUNG SCHLIEßEN 􀺾";
    document.getElementById("controller-button").setAttribute("onclick", "main.closeController();");
    window.addEventListener("unload", closeController);
    controller = window.open("controller.html", "Controller", "width=1920,height=1080,left=" + (window.outerWidth - 1920) / 2 + ",top=" + (window.outerHeight - 1080) / 2);
}
function closeController() {
    controller.close();
    controller = undefined;
    document.getElementById("controller-button").innerText = "STEUERUNG ÖFFNEN 􀑍";
    document.getElementById("controller-button").setAttribute("onclick", "main.openController();");
}
document.body.addEventListener("keydown", onKeyPress);
document.body.addEventListener("click", onMouseClick);
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
        toggleFullscreen(event.target.baseURI.includes("controller") ? controller.document : document);
        event.preventDefault();
    }
}
function onMouseClick(event) {
    if (event.button == 0 && slide > 0) {
        nextSlide();
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

var slide = 0;
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
        if (gone[i].parentNode.children[i + 1].hasAttribute("gone")) {
            gone[i].setAttribute("long-gone", "");
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
        if (!longGone[i].parentNode.children[i + 1].hasAttribute("gone")) {
            longGone[i].removeAttribute("long-gone");
        }
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

// Debug Options
var startSlide = 0;

// Debug Code
for (var i = 0; i < startSlide; i++) {
    nextSlide();
}

/* TODO
- Add Time And Other Important Info (Like Slide Number) To Controller
*/
