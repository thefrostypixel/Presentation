var main = window;
var controller;

var step = 0;
var startTime = 0;
var pausedTime = -1;
var pausedStep = -1;
var reachedEnd = false;
var timeOffset = "";
var expectedTime = [
    0,0,0,5,8,14,20,32,39,41,42,46,58,63,67,72,83,91,98,110,114,119,122,125,129,134,137,140,144,149,152,158,162,166,170,179,184,187,188,193,199,203,208,211,214,218,221,227,237,242,247,249,253,271,276,285,290,299,304,312,317,325,332,338,344,348,360,362,363,364,365,367,371,373,376,379,383,390,395,411,413,415,418,420,436,442,448,452,457,460,463,475,477,483,489,495,500,505,511,515,522,525,527,531,533,539,542,545,550,556,559,565,568,572,577,580,582,585,589,594,597,600,600,1200
];
var actualTime = [0, 0, 0];

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
    if (pausedTime > -1) {
        main.startTime = Math.floor(new Date().getTime() / 1000) - pausedTime;
        pausedTime = -1;
        pausedStep = -1;
    } else if (step > 1) {
        pausedTime = Math.floor(new Date().getTime() / 1000) - main.startTime;
        pausedStep = step;
    }
}
function onKeyPress(event) {
    var key = event.key.toUpperCase();
    if (event.key == "ArrowRight" || event.key == "ArrowUp" || event.key == "PageUp" || key == "D" || key == "W" || event.key == " ") {
        nextStep();
    } else if ((event.key == "ArrowLeft" || event.key == "ArrowDown" || event.key == "PageDown" || key == "A" || key == "S") && step > 0) {
        previousStep();
    } else if (key == "C") {
        toggleController();
    } else if (key == "F") {
        toggleFullscreen(event.target.baseURI.includes("controller") ? controller.document : document);
    } else if (key == "T") {
        toggleTestScreen();
    } else if (key == "P" || event.key == "Tab") {
        togglePause();
        event.preventDefault();
    } else if (event.key == "Enter") {
        if (pausedStep > 0) {
            goToStep(pausedStep);
            togglePause();
        } else if (reachedEnd) {
            if (step > 121) {
                goToStep(1);
                nextStep();
            } else {
                goToStep(123);
            }
        }
    }
}
document.body.addEventListener("keydown", onKeyPress);

function nextStep() {
    step++;
    if (document.querySelector(".step-" + step) == undefined) {
        step--;
        return;
    }


    // Create Times
    if (step > 121 && !reachedEnd) {
        actualTime.push(actualTime[121]);
        actualTime.push(1200);
        console.log("Times: " + JSON.stringify(actualTime));
        for (var i = 0; i < 123; i++) {
            actualTime[i] = Math.round(actualTime[i] * 600 / actualTime[122]);
        }
        console.log("Normalized Times: " + JSON.stringify(actualTime));
    } else if (!reachedEnd && actualTime.length < step + 1) {
        actualTime[step] = Math.floor(new Date().getTime() / 1000) - startTime;
    }


    if (step > 121) {
        reachedEnd = true;
    }
    var stepClass = ".step-" + step;
    querySelect(Array.from({length: step}, (_, i) => ".step-" + i).join(", ")).forEach((element) => {
        element.setAttribute("gone", "");
    })
    querySelect(".step-" + step).forEach((element) => {
        element.removeAttribute("invisible");
        var parent = element.parentNode;
        while (parent != undefined && parent.tagName != "BODY") {
            parent.removeAttribute("gone");
            parent = parent.parentNode;
        }
        if (element.tagName == "svg") {
            animate(element);
        }
        element.querySelectorAll("svg:not(.step):not(" + stepClass + " .step *)").forEach((svg) => {
            animate(svg);
        });
    });
    var gone = querySelect("center.step[gone]");
    for (var i = 0; i < gone.length; i++) {
        if (gone[i].parentNode.children[Array.from(gone[i].parentNode.children).indexOf(gone[i]) + 1].hasAttribute("gone")) {
            gone[i].setAttribute("long-gone", "");
        }
    }
    if (step == 3) {
        document.getElementById("live-sources").removeAttribute("invisible");
    } else if (step == 111) {
        document.getElementById("live-sources").setAttribute("gone", "");
    }
    document.querySelectorAll(".live-source").forEach((element) => {
        if (Number(element.getAttribute("to")) < step) {
            element.setAttribute("gone", "");
        } else if (Number(element.getAttribute("from")) <= step) {
            element.removeAttribute("invisible");
        }
    });
    if (pausedTime == -1) {
        if (step == 2 && !reachedEnd) {
            startTime = Math.floor(new Date().getTime() / 1000);
        }
        var time = Math.floor(new Date().getTime() / 1000) - startTime - expectedTime[step];
        if (time <= -5) {
            timeOffset = " (-" + Math.floor(time / -60) + ":" + (-time % 60).toString().padStart(2, "0") + ") 􀓐";
        } else if (time >= 5) {
            timeOffset = " (+" + Math.floor(time / 60) + ":" + (time % 60).toString().padStart(2, "0") + ") 􀓎";
        } else {
            timeOffset = "";
        }
    }
    document.getElementById("mobile-controls-previous").removeAttribute("style");
    if (step == 133) {
        document.getElementById("mobile-controls-next").setAttribute("style", "filter: brightness(.5);");
    }
    querySelect("body").forEach((element) => {
        element.style.cursor = "none";
    });
}
function previousStep() {
    if (--step < 0) {
        step++;
        return;
    }
    querySelect(".step-" + step).forEach((element) => {
        element.removeAttribute("gone");
        var parent = element.parentNode;
        while (parent != undefined && parent.tagName != "BODY") {
            parent.removeAttribute("gone");
            parent = parent.parentNode;
        }
    });
    querySelect(".step-" + (step + 1)).forEach((element) => {
        element.setAttribute("invisible", "");
        if (element.tagName == "svg") {
            resetAnimation(element);
        }
        element.querySelectorAll("svg:not(.step):not(.step-" + step + " .step *)").forEach((svg) => {
            resetAnimation(svg);
        });
    });
    var longGone = querySelect("center.step[long-gone]");
    for (var i = 0; i < longGone.length; i++) {
        if (!longGone[i].parentNode.children[Array.from(longGone[i].parentNode.children).indexOf(longGone[i]) + 1].hasAttribute("gone")) {
            longGone[i].removeAttribute("long-gone");
        }
    }
    if (step == 2) {
        document.getElementById("live-sources").setAttribute("invisible", "");
    } else if (step == 110) {
        document.getElementById("live-sources").removeAttribute("gone");
    }
    document.querySelectorAll(".live-source").forEach((element) => {
        if (Number(element.getAttribute("from")) > step) {
            element.setAttribute("invisible", "");
        } else if (Number(element.getAttribute("to")) >= step){
            element.removeAttribute("gone");
        }
    });
    if (pausedTime == -1) {
        var time = Math.floor(new Date().getTime() / 1000) - startTime - expectedTime[step];
        if (time <= -5) {
            timeOffset = " (-" + Math.floor(time / -60) + ":" + (-time % 60).toString().padStart(2, "0") + ") 􀓐";
        } else if (time >= 5) {
            timeOffset = " (+" + Math.floor(time / 60) + ":" + (time % 60).toString().padStart(2, "0") + ") 􀓎";
        } else {
            timeOffset = "";
        }
    }
    document.getElementById("mobile-controls-next").removeAttribute("style");
    if (step == 0) {
        document.getElementById("mobile-controls-previous").setAttribute("style", "filter: brightness(.5);");
        querySelect("body").forEach((element) => {
            element.removeAttribute("style");
        });
    }
}
function goToStep(number) {
    while (step < number) {
        nextStep();
    }
    while (step > number) {
        previousStep();
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
goToStep(0);
