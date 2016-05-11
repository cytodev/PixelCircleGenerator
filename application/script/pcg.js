/** Pixel Circle Generator V0.1
 *
 * (c) Roel Walraven (cytodev) <mail@cytodev.io>
 *
 */

let isBetaVersion = true, version = 0.1;

window.onload = function() {
    var radiusInput = document.getElementById("radius");
    var areaInput = document.getElementById("area");
    var visualise = document.getElementById("visualise");
    var circumference = document.getElementById("circumference");
    var canvaswrapper = document.getElementById("VisualWrapper");
    var loading = document.getElementById("loading");
    var canvas = document.getElementById("Visualisation");
    var canvasContext = canvas.getContext("2d");
    var lastRadius = NaN;
    var lastX = canvas.width / 2;
    var lastY = canvas.height / 2;
    var dragStart;
    var dragged;
    var scaleFactor = 1.1;

    var zoom = function(clicks) {
        var pt = canvasContext.transformedPoint(lastX, lastY);
        var factor = Math.pow(scaleFactor, clicks);

        canvasContext.translate(pt.x, pt.y);
        canvasContext.scale(factor, factor);
        canvasContext.translate(-pt.x, -pt.y);
        redraw();
    };

    var handleScroll = function(e){
        var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;

        if(delta) {
            zoom(delta);
        }

        return e.preventDefault() && false;
    };

    // scales correctly at times. At other times it doesn't...
    function scaleCanvas() {
        canvas.width = 0;
        canvas.height = 0;

        setTimeout(function() {
            canvas.width = document.getElementById("VisualWrapper").clientWidth - 34;
            canvas.height = canvas.width / 16 * 9;
            loading.style.display = "block";
            setTimeout(function() {
                redraw();
            }, 1400);
        }, 250);
    }

    function updateValues(element) {
        var r = 0;
        var a = 0;
        var c = 0;

        switch(element) {
            case radiusInput:
                r = radiusInput.value;
                a = Math.PI * Math.pow(r, 2)
                c = 2 * Math.PI * r;
                break;
            case areaInput:
                a = areaInput.value;
                r = Math.sqrt(a / Math.PI);
                c = 2 * Math.PI * r;
                break;
            default:
                break;
        }

        radiusInput.value = r;
        areaInput.value = a;

        circumference.innerHTML = c;
    }

    function clearCanvas() {
        var p1 = canvasContext.transformedPoint(0, 0);
        var p2 = canvasContext.transformedPoint(canvas.width, canvas.height);
        canvasContext.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        canvasContext.save();
        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.restore();
    }

    function drawPixel(x, y) {
        canvasContext.rect(x * 4, y * 4, 4, 4);
        canvasContext.fillStyle = "#212121";
        canvasContext.fill();
    }

    function drawGrid() {
        var maxWidth = 2000;
        var maxHeight = 2000;

        canvasContext.beginPath();

        for(var x = -maxWidth; x <= maxWidth; x += 4) {
            canvasContext.moveTo(x, -maxWidth);
            canvasContext.lineTo(x, maxWidth);
        }

        for(var y = -maxHeight; y <= maxHeight; y += 4) {
            canvasContext.moveTo(-maxHeight, y);
            canvasContext.lineTo(maxHeight, y);
        }

        canvasContext.strokeStyle = "#E0E0E0";
        canvasContext.lineWidth = 0.1;
        canvasContext.stroke();
        canvasContext.closePath();

        loading.style.display = "none";
    }

    function draw(radius) {
        radius = Math.round(parseFloat(radius));

        if(!radius || 0 === radius.length || isNaN(radius) && !isFinite(radius)) {
            return;
        }

        var d = Math.round(Math.PI - (2 * radius));
        var x = 0;
        var y = radius;

        canvasContext.beginPath();
        while(x <= y) {
            drawPixel(radius + x + 1, radius - y);
            drawPixel(radius + y + 1, radius - x);
            drawPixel(radius + y + 1, radius + x + 1);
            drawPixel(radius + x + 1, radius + y + 1);
            drawPixel(radius - x, radius + y + 1);
            drawPixel(radius - y, radius + x + 1);
            drawPixel(radius - y, radius - x);
            drawPixel(radius - x, radius - y);

            if (d < 0) {
                d = d + (Math.PI * x) + (Math.PI * 2);
            } else {
                d = d + Math.PI * (x - y) + (Math.PI * 3);
                y--;
            }

            x++;
        }
        canvasContext.closePath();
    }

    function redraw() {
        clearCanvas();
        draw(lastRadius);
        drawGrid();
    }

    canvas.addEventListener('mousedown', function(e) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

        lastX = e.offsetX || (e.pageX - canvas.offsetLeft);
        lastY = e.offsetY || (e.pageY - canvas.offsetTop);
        dragStart = canvasContext.transformedPoint(lastX, lastY);
        dragged = false;
    }, false);

    canvas.addEventListener('mousemove', function(e) {
        lastX = e.offsetX || (e.pageX - canvas.offsetLeft);
        lastY = e.offsetY || (e.pageY - canvas.offsetTop);
        dragged = true;

        if(dragStart) {
            var pt = canvasContext.transformedPoint(lastX, lastY);
            canvasContext.translate(pt.x - dragStart.x, pt.y - dragStart.y);
            redraw();
        }
    }, false);

    canvas.addEventListener('mouseup', function(e) {
        dragStart = null;
        if(!dragged) {
            // add highlighting logic here
        }
    }, false);

    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);

    radiusInput.addEventListener("keyup", function(e) {
        updateValues(radiusInput);
    }, false);

    areaInput.addEventListener("keyup", function(e) {
        updateValues(areaInput);
    }, false);

    visualise.addEventListener("click", function(e) {
        clearCanvas();
        loading.style.display = "block";
        lastRadius = radiusInput.value;
        draw(lastRadius);
        drawGrid();
    }, false);

    trackTransforms(canvasContext);
    scaleCanvas();
    window.onresize = scaleCanvas();

    loading.style.display = "none";

    if(isBetaVersion) {
        var betaNotice = document.createElement('span');

        betaNotice.id = "BetaNotice";
        betaNotice.innerHTML = "βῆτα v" + version;
        document.getElementsByTagName("header")[0].getElementsByTagName("h1")[0].appendChild(betaNotice);
    }
};

function trackTransforms(canvasContext) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var xform = svg.createSVGMatrix();
    var savedTransforms = [];
    var save = canvasContext.save;
    var restore = canvasContext.restore;
    var scale = canvasContext.scale;
    var translate = canvasContext.translate;
    var setTransform = canvasContext.setTransform;
    var pt  = svg.createSVGPoint();

    canvasContext.save = function() {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(canvasContext);
    };

    canvasContext.restore = function() {
        xform = savedTransforms.pop();
        return restore.call(canvasContext);
    };

    canvasContext.scale = function(sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(canvasContext, sx, sy);
    };

    canvasContext.translate = function(dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(canvasContext, dx, dy);
    };

    canvasContext.setTransform = function(a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;

        return setTransform.call(canvasContext, a, b, c, d, e, f);
    };

    canvasContext.transformedPoint = function(x, y) {
        pt.x = x;
        pt.y = y;

        return pt.matrixTransform(xform.inverse());
    };
}
