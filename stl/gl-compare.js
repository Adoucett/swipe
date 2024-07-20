(function () {
    function moduleLoader(modules, cache, entry) {
        function require(moduleId) {
            if (!cache[moduleId]) {
                if (!modules[moduleId]) {
                    const err = new Error(`Cannot find module '${moduleId}'`);
                    err.code = "MODULE_NOT_FOUND";
                    throw err;
                }
                const module = (cache[moduleId] = { exports: {} });
                modules[moduleId][0].call(
                    module.exports,
                    function (dependencyId) {
                        return require(modules[moduleId][1][dependencyId] || dependencyId);
                    },
                    module,
                    module.exports
                );
            }
            return cache[moduleId].exports;
        }
        for (let i = 0; i < entry.length; i++) require(entry[i]);
        return require;
    }

    moduleLoader(
        {
            1: [
                function (require, module, exports) {
                    "use strict";
                    const syncMove = require("@mapbox/mapbox-gl-sync-move");
                    const EventEmitter = require("events").EventEmitter;

                    function Compare(mapA, mapB, container, options = {}) {
                        this.options = options;
                        this._mapA = mapA;
                        this._mapB = mapB;
                        this._horizontal = this.options.orientation === "horizontal";
                        this._ev = new EventEmitter();
                        this._swiper = document.createElement("div");
                        this._swiper.className = this._horizontal
                            ? "compare-swiper-horizontal"
                            : "compare-swiper-vertical";
                        this._controlContainer = document.createElement("div");
                        this._controlContainer.className = this._horizontal
                            ? "mapboxgl-compare mapboxgl-compare-horizontal"
                            : "mapboxgl-compare";
                        this._controlContainer.appendChild(this._swiper);

                        if (typeof container === "string") {
                            const element = document.querySelector(container);
                            if (!element) throw new Error("Cannot find element with specified container selector.");
                            element.appendChild(this._controlContainer);
                        } else if (container instanceof Element) {
                            container.appendChild(this._controlContainer);
                        } else {
                            throw new Error("Invalid container specified. Must be CSS selector or HTML element.");
                        }

                        this._bounds = mapB.getContainer().getBoundingClientRect();
                        const position = (this._horizontal ? this._bounds.height : this._bounds.width) / 2;
                        this._setPosition(position);
                        this._clearSync = syncMove(mapA, mapB);
                        this._onResize = this._handleResize.bind(this);
                        mapB.on("resize", this._onResize);

                        if (this.options.mousemove) {
                            mapA.getContainer().addEventListener("mousemove", this._onMove.bind(this));
                            mapB.getContainer().addEventListener("mousemove", this._onMove.bind(this));
                        }

                        this._swiper.addEventListener("mousedown", this._onDown.bind(this));
                        this._swiper.addEventListener("touchstart", this._onDown.bind(this));
                    }

                    Compare.prototype = {
                        _setPointerEvents: function (value) {
                            this._controlContainer.style.pointerEvents = value;
                            this._swiper.style.pointerEvents = value;
                        },
                        _onDown: function (event) {
                            if (event.touches) {
                                document.addEventListener("touchmove", this._onMove.bind(this));
                                document.addEventListener("touchend", this._onTouchEnd.bind(this));
                            } else {
                                document.addEventListener("mousemove", this._onMove.bind(this));
                                document.addEventListener("mouseup", this._onMouseUp.bind(this));
                            }
                        },
                        _setPosition: function (position) {
                            position = Math.min(position, this._horizontal ? this._bounds.height : this._bounds.width);
                            const transform = this._horizontal
                                ? `translate(0, ${position}px)`
                                : `translate(${position}px, 0)`;
                            this._controlContainer.style.transform = transform;
                            this._controlContainer.style.WebkitTransform = transform;
                            const clipA = this._horizontal
                                ? `rect(0, 999em, ${position}px, 0)`
                                : `rect(0, ${position}px, ${this._bounds.height}px, 0)`;
                            const clipB = this._horizontal
                                ? `rect(${position}px, 999em, ${this._bounds.height}px, 0)`
                                : `rect(0, 999em, ${this._bounds.height}px, ${position}px)`;
                            this._mapA.getContainer().style.clip = clipA;
                            this._mapB.getContainer().style.clip = clipB;
                            this.currentPosition = position;
                        },
                        _onMove: function (event) {
                            if (this.options.mousemove) {
                                this._setPointerEvents(event.touches ? "auto" : "none");
                            }
                            this._horizontal
                                ? this._setPosition(this._getY(event))
                                : this._setPosition(this._getX(event));
                        },
                        _onMouseUp: function () {
                            document.removeEventListener("mousemove", this._onMove.bind(this));
                            document.removeEventListener("mouseup", this._onMouseUp.bind(this));
                            this._ev.emit("slideend", { currentPosition: this.currentPosition });
                        },
                        _onTouchEnd: function () {
                            document.removeEventListener("touchmove", this._onMove.bind(this));
                            document.removeEventListener("touchend", this._onTouchEnd.bind(this));
                        },
                        _getX: function (event) {
                            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
                            let x = clientX - this._bounds.left;
                            if (x < 0) x = 0;
                            if (x > this._bounds.width) x = this._bounds.width;
                            return x;
                        },
                        _getY: function (event) {
                            const clientY = event.touches ? event.touches[0].clientY : event.clientY;
                            let y = clientY - this._bounds.top;
                            if (y < 0) y = 0;
                            if (y > this._bounds.height) y = this._bounds.height;
                            return y;
                        },
                        setSlider: function (position) {
                            this._setPosition(position);
                        },
                        on: function (event, callback) {
                            this._ev.on(event, callback);
                            return this;
                        },
                        fire: function (event, data) {
                            this._ev.emit(event, data);
                            return this;
                        },
                        off: function (event, callback) {
                            this._ev.removeListener(event, callback);
                            return this;
                        },
                        remove: function () {
                            this._clearSync();
                            this._mapB.off("resize", this._onResize);
                            const mapAContainer = this._mapA.getContainer();
                            if (mapAContainer) {
                                mapAContainer.style.clip = null;
                                mapAContainer.removeEventListener("mousemove", this._onMove.bind(this));
                            }
                            const mapBContainer = this._mapB.getContainer();
                            if (mapBContainer) {
                                mapBContainer.style.clip = null;
                                mapBContainer.removeEventListener("mousemove", this._onMove.bind(this));
                            }
                            this._swiper.removeEventListener("mousedown", this._onDown.bind(this));
                            this._swiper.removeEventListener("touchstart", this._onDown.bind(this));
                            this._controlContainer.remove();
                        },
                        _handleResize: function () {
                            this._bounds = this._mapB.getContainer().getBoundingClientRect();
                            if (this.currentPosition) this._setPosition(this.currentPosition);
                        },
                    };

                    if (window.mapboxgl) {
                        mapboxgl.Compare = Compare;
                    } else if (typeof module !== "undefined") {
                        module.exports = Compare;
                    }
                },
                { "@mapbox/mapbox-gl-sync-move": 2, events: 3 },
            ],
            2: [
                function (require, module) {
                    module.exports = function (...maps) {
                        const handlers = [];

                        function addListeners() {
                            maps.forEach((map, index) => {
                                map.on("move", handlers[index]);
                            });
                        }

                        function removeListeners() {
                            maps.forEach((map, index) => {
                                map.off("move", handlers[index]);
                            });
                        }

                        maps.forEach((map, index) => {
                            handlers[index] = function () {
                                removeListeners();
                                const center = map.getCenter();
                                const zoom = map.getZoom();
                                const bearing = map.getBearing();
                                const pitch = map.getPitch();
                                maps.forEach((m) => {
                                    if (m !== map) {
                                        m.jumpTo({
                                            center,
                                            zoom,
                                            bearing,
                                            pitch,
                                        });
                                    }
                                });
                                addListeners();
                            };
                        });

                        addListeners();

                        return function () {
                            removeListeners();
                        };
                    };
                },
                {},
            ],
            3: [
                function (require, module, exports) {
                    const EventEmitter = require("events");

                    if (typeof module !== "undefined") {
                        module.exports = EventEmitter;
                    }
                },
                {},
            ],
        },
        {},
        [1]
    );
})();


// https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.4.0/mapbox-gl-compare.js