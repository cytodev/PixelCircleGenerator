/** Pixel Circle Generator V0.1.3
 *
 * (c) Roel Walraven (cytodev) <mail@cytodev.io>
 *
 */

"use strict";

var pcg = {
        version: "0.1.3",
        beta: true,
        elements: {
            continuousSwitch: undefined,
            clearSwitch: undefined,
            radiusInput: undefined,
            areaInput: undefined,
            visualise: undefined,
            clearButton: undefined,
            circumference: undefined,
            canvaswrapper: undefined,
            loading: undefined,
            canvas: undefined
        },
        canvas: {
            context: undefined,
            track: function() {
                if(!this.context) {
                    window.console.error("Cannot set tracking functions on non-existant canvas!");
                    return;
                }

                var svg             = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                var xform           = svg.createSVGMatrix();
                var savedTransforms = [];
                var save            = this.context.save;
                var restore         = this.context.restore;
                var scale           = this.context.scale;
                var translate       = this.context.translate;
                var setTransform    = this.context.setTransform;
                var pt              = svg.createSVGPoint();

                this.context.save = function() {
                    savedTransforms.push(xform.translate(0, 0));
                    return save.call(this.context);
                }.bind(this);

                this.context.restore = function() {
                    xform = savedTransforms.pop();
                    return restore.call(this.context);
                }.bind(this);

                this.context.scale = function(sx, sy) {
                    xform = xform.scaleNonUniform(sx, sy);
                    return scale.call(this.context, sx, sy);
                }.bind(this);

                this.context.translate = function(dx, dy) {
                    xform = xform.translate(dx, dy);
                    return translate.call(this.context, dx, dy);
                }.bind(this);

                this.context.setTransform = function(a, b, c, d, e, f) {
                    xform.a = a;
                    xform.b = b;
                    xform.c = c;
                    xform.d = d;
                    xform.e = e;
                    xform.f = f;

                    return setTransform.call(this.context, a, b, c, d, e, f);
                }.bind(this);

                this.context.transformedPoint = function(x, y) {
                    pt.x = x;
                    pt.y = y;

                    return pt.matrixTransform(xform.inverse());
                };
            },
            scale: function() {
                if(!this.context) {
                    window.console.error("Cannot scale a non-existant canvas!");
                    return;
                }

                this.context.canvas.width = 0;
                this.context.canvas.height = 0;

                // scales correctly at times. At other times it doesn't...
                setTimeout(function() {
                    this.context.canvas.width = document.getElementById("VisualWrapper").clientWidth - 34;
                    this.context.canvas.height = this.context.canvas.width / 16 * 9;
                    setTimeout(function() {
                        this.redraw();
                    }.bind(this), 1400);
                }.bind(this), 250);
            },
            clear: function() {
                if(!this.context) {
                    window.console.error("Cannot clear a non-existant canvas!");
                    return;
                }

                var p1 = this.context.transformedPoint(0, 0);
                var p2 = this.context.transformedPoint(this.context.canvas.width, this.context.canvas.height);

                this.context.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                this.context.save();
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                this.context.restore();
            },
            drawPixel: function(x, y) {
                this.context.rect(x * 4, y * 4, 4, 4);
                this.context.fillStyle = "#212121";
                this.context.fill();
            },
            draw: function(radius) {
                if(!this.context) {
                    window.console.error("Cannot draw on a non-existant canvas!");
                    return;
                }

                radius = Math.round(parseFloat(radius));

                if(!radius || 0 === radius.length || isNaN(radius) && !isFinite(radius)) {
                    return;
                }

                var d = Math.round(Math.PI - (2 * radius));
                var x = 0;
                var y = radius;

                this.context.beginPath();
                while(x <= y) {
                    this.drawPixel(x, -y);
                    this.drawPixel(y, -x);
                    this.drawPixel(y, x);
                    this.drawPixel(x, y);
                    this.drawPixel(-x, y);
                    this.drawPixel(-y, x);
                    this.drawPixel(-y, -x);
                    this.drawPixel(-x, -y);

                    if(pcg.configuration.continuous) {
                        this.drawPixel(x + 1, -y);
                        this.drawPixel(y, -x - 1);
                        this.drawPixel(y, x + 1);
                        this.drawPixel(x + 1, y);
                        this.drawPixel(-x - 1, y);
                        this.drawPixel(-y, x + 1);
                        this.drawPixel(-y, -x - 1);
                        this.drawPixel(-x - 1, -y);
                    }

                    if (d < 0) {
                        d = d + (Math.PI * x) + (Math.PI * 2);
                    } else {
                        d = d + Math.PI * (x - y) + (Math.PI * 3);
                        y--;
                    }

                    x++;
                }
                this.context.closePath();
            },
            grid: function() {
                if(!this.context) {
                    window.console.error("Cannot draw on a non-existant canvas!");
                    return;
                }

                var maxWidth  = 2000;
                var maxHeight = 2000;
                var x         = 0;
                var y         = 0;

                this.context.beginPath();

                for(x = -maxWidth; x <= maxWidth; x += 4) {
                    this.context.moveTo(x, -maxWidth);
                    this.context.lineTo(x, maxWidth);
                }

                for(y = -maxHeight; y <= maxHeight; y += 4) {
                    this.context.moveTo(-maxHeight, y);
                    this.context.lineTo(maxHeight, y);
                }

                this.context.strokeStyle = "#E0E0E0";
                this.context.lineWidth = 0.1;
                this.context.stroke();
                this.context.closePath();
            },
            redraw: function() {
                this.clear();

                for(var i = pcg.configuration.lastRadius.length - 1; i >= 0; i--) {
                    this.draw(pcg.configuration.lastRadius[i]);
                }

                this.grid();
            }
        },
        configuration: {
            scaleFactor: 1.1,
            continuous: false,
            clearOnVisualise: true,
            lastRadius: [0],
            lastX: 0,
            lastY: 0
        },
        events: {
            touchData: {
                start: [],
                center: {
                    x: 0,
                    y: 0
                },
                offset: [],
                delta: [],
                zoom: 0,
                dragStart: null,
                dragged: false
            },
            pointerDown: function(e) {
                var touchData     = this.events.touchData;
                var configuration = this.configuration;
                var canvasElement = this.elements.canvas;
                var i             = 0;

                for(i = document.getElementsByTagName("*").length - 1; i >= 0; i--) {
                    document.getElementsByTagName("*")[i].classList.add("noselect");
                }

                if(e.type === "touchstart") {
                    e.preventDefault();

                    touchData.center.x = 0;
                    touchData.center.y = 0;

                    for(i = 0; i < e.touches.length; i++) {
                        touchData.start[i] = {};
                        touchData.start[i].x = e.touches[i].pageX;
                        touchData.start[i].y = e.touches[i].pageY;

                        touchData.center.x += touchData.start[i].x;
                        touchData.center.y += touchData.start[i].y;
                    }

                    touchData.center.x = touchData.center.x / touchData.start.length;
                    touchData.center.y = touchData.center.y / touchData.start.length;

                    configuration.lastX = touchData.center.x - canvasElement.offsetLeft;
                    configuration.lastY = touchData.center.y - canvasElement.offsetTop;
                } else {
                    configuration.lastX = e.offsetX || (e.pageX - canvasElement.offsetLeft);
                    configuration.lastY = e.offsetY || (e.pageY - canvasElement.offsetTop);
                }

                touchData.dragStart = this.canvas.context.transformedPoint(configuration.lastX, configuration.lastY);
                touchData.dragged = false;
            },
            pointerMove: function(e) {
                var touchData     = this.events.touchData;
                var configuration = this.configuration;
                var canvasElement = this.elements.canvas;
                var i             = 0;

                if(e.type === "touchmove") {
                    e.preventDefault();

                    if(e.touches.length > 1) {
                        touchData.zoom = 0;
                        touchData.dragStart = null;

                        for(i = 0; i < e.touches.length; i++) {
                            touchData.offset[i] = {};
                            touchData.offset[i].x = e.touches[i].pageX;
                            touchData.offset[i].y = e.touches[i].pageY;
                        }

                        for(i = 0; i < touchData.start.length; i++) {
                            touchData.delta[i] = {};
                            touchData.delta[i].x = Math.abs(touchData.offset[i].x - touchData.center.x) - Math.abs(touchData.start[i].x - touchData.center.x);
                            touchData.delta[i].y = Math.abs(touchData.offset[i].y - touchData.center.y) - Math.abs(touchData.start[i].y - touchData.center.y);
                            touchData.zoom += touchData.delta[i].x + touchData.delta[i].y;
                        }

                        // this.events.zoom({"wheelDelta": touchData.zoom / 5, "isTouchEvent": true});
                    } else {
                        configuration.lastX = e.touches[0].pageX - canvasElement.offsetLeft;
                        configuration.lastY = e.touches[0].pageY - canvasElement.offsetTop;
                    }
                } else {
                    configuration.lastX = e.offsetX || (e.pageX - canvasElement.offsetLeft);
                    configuration.lastY = e.offsetY || (e.pageY - canvasElement.offsetTop);
                }

                touchData.dragged = true;

                if(touchData.dragStart) {
                    var pt = this.canvas.context.transformedPoint(configuration.lastX, configuration.lastY);

                    this.canvas.context.translate(pt.x - touchData.dragStart.x, pt.y - touchData.dragStart.y);
                    this.canvas.redraw();
                }
            },
            pointerUp: function(e) {
                var touchData = this.events.touchData;
                var i         = 0;

                for(i = document.getElementsByTagName("*").length - 1; i >= 0; i--) {
                    document.getElementsByTagName("*")[i].classList.remove("noselect");
                }

                touchData.dragStart = null;

                if(!touchData.dragged) {
                    // add highlighting logic here
                }
            },
            zoom: function(e) {
                var canvas        = this.canvas;
                var configuration = this.configuration;
                var delta         = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;

                if(delta) {
                    var pt = canvas.context.transformedPoint(configuration.lastX, configuration.lastY);
                    var factor = Math.pow(configuration.scaleFactor, delta);

                    canvas.context.translate(pt.x, pt.y);
                    canvas.context.scale(factor, factor);
                    canvas.context.translate(-pt.x, -pt.y);
                    canvas.redraw();
                }

                if(!e.isTouchEvent) {
                    return e.preventDefault() && false;
                } else {
                    return false;
                }
            },
            updateValues: function(e) {
                var elements = this.elements;

                var r = 0;
                var a = 0;
                var c = 0;

                switch(e.target) {
                    case elements.radiusInput:
                        r = elements.radiusInput.value;
                        a = Math.PI * Math.pow(r, 2);
                        c = 2 * Math.PI * r;
                        break;
                    case elements.areaInput:
                        a = elements.areaInput.value;
                        r = Math.sqrt(a / Math.PI);
                        c = 2 * Math.PI * r;
                        break;
                    default:
                        break;
                }

                elements.radiusInput.value = r;
                elements.areaInput.value = a;

                elements.circumference.innerHTML = c;
            }
        },
        init: function() {
            // populate the elements object
            this.elements.continuousSwitch = document.getElementById("ContinuousSwitch");
            this.elements.clearSwitch      = document.getElementById("ClearSwitch");
            this.elements.radiusInput      = document.getElementById("radius");
            this.elements.areaInput        = document.getElementById("area");
            this.elements.clearButton      = document.getElementById("ClearButton");
            this.elements.visualise        = document.getElementById("visualise");
            this.elements.circumference    = document.getElementById("circumference");
            this.elements.canvaswrapper    = document.getElementById("VisualWrapper");
            this.elements.loading          = document.getElementById("loading");
            this.elements.canvas           = document.getElementById("Visualisation");

            // apply the contex to the canvas
            this.canvas.context = this.elements.canvas.getContext("2d");

            // set x y location at half the canvas size
            this.configuration.lastX = this.elements.canvas.width / 2;
            this.configuration.lastY = this.elements.canvas.height / 2;

            // set up listener for resizing
            window.onresize = this.canvas.scale();

            // set up listeners for input fields
            this.elements.radiusInput.addEventListener("keyup", this.events.updateValues.bind(this), false);
            this.elements.areaInput.addEventListener("keyup", this.events.updateValues.bind(this), false);

            // set up listeners for the switches
            this.elements.continuousSwitch.addEventListener("click", function(e) {
                this.configuration.continuous = this.elements.continuousSwitch.checked;
            }.bind(this), false);

            this.elements.clearSwitch.addEventListener("click", function(e) {
                this.configuration.clearOnVisualise = this.elements.clearSwitch.checked;

                if(!this.configuration.clearOnVisualise) {
                    this.elements.clearButton.style.opacity = "1";
                    this.elements.clearButton.style.marginRight = "110px";
                } else {
                    this.elements.clearButton.style = "";
                }
            }.bind(this), false);

            // and the buttons
            this.elements.clearButton.addEventListener("click", function(e) {
                this.canvas.clear();
                this.configuration.lastRadius = [];
            }.bind(this, false));

            this.elements.visualise.addEventListener("click", function(e) {
                this.canvas.clear();
                this.elements.loading.style.display = "block";

                if(this.configuration.clearOnVisualise) {
                    this.configuration.lastRadius = [];
                }

                this.configuration.lastRadius.push(this.elements.radiusInput.value);

                for(var i = this.configuration.lastRadius.length - 1; i >= 0; i--) {
                    this.canvas.draw(this.configuration.lastRadius[i]);
                }

                this.canvas.grid();
                this.elements.loading.style.display = "none";
            }.bind(this), false);

            // set up listeners on the canvas
            if(window.PointerEvent) {
                window.console.log("Pointer events are supported.");
                this.elements.canvas.addEventListener("pointerdown", this.events.pointerDown.bind(this), false);
                this.elements.canvas.addEventListener("pointermove", this.events.pointerMove.bind(this), false);
                this.elements.canvas.addEventListener("pointerup", this.events.pointerUp.bind(this), false);

                this.elements.canvas.addEventListener("DOMMouseScroll", this.events.zoom.bind(this), false);
                this.elements.canvas.addEventListener("mousewheel", this.events.zoom.bind(this), false);
            } else {
                window.console.log("Pointer events not supported. Defaulting to mouse and touch events");
                this.elements.canvas.addEventListener("mousedown", this.events.pointerDown.bind(this), false);
                this.elements.canvas.addEventListener("mousemove", this.events.pointerMove.bind(this), false);
                this.elements.canvas.addEventListener("mouseup", this.events.pointerUp.bind(this), false);

                this.elements.canvas.addEventListener("touchstart", this.events.pointerDown.bind(this), false);
                this.elements.canvas.addEventListener("touchmove", this.events.pointerMove.bind(this), false);
                this.elements.canvas.addEventListener("touchend", this.events.pointerUp.bind(this), false);

                this.elements.canvas.addEventListener("DOMMouseScroll", this.events.zoom.bind(this), false);
                this.elements.canvas.addEventListener("mousewheel", this.events.zoom.bind(this), false);
            }

            // add the beta notice
            if(this.beta) {
                var betaNotice = document.createElement("span");

                betaNotice.id = "BetaNotice";
                betaNotice.innerHTML = "βῆτα v" + this.version;
                document.getElementsByTagName("header")[0].getElementsByTagName("h1")[0].appendChild(betaNotice);
            }

            // bind custom transformation tracking function to canvas
            this.canvas.track();

            // force a resize event
            this.canvas.scale();

            // all done, remove the loading animation
            this.elements.loading.style.display = "none";
        }
    };

window.onload = function() {
    pcg.init();
};
