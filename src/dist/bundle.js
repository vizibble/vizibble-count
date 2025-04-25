/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/JavaScript/graphs_maps/gauge.js":
/*!*********************************************!*\
  !*** ./src/JavaScript/graphs_maps/gauge.js ***!
  \*********************************************/
/***/ ((module) => {

/* global echarts */
var gauge = null;
var resize_gauge = function resize_gauge() {
  return gauge.resize();
};
function create_gauge(_ref, selectedTanker) {
  var fuel_level = _ref.fuel_level;
  // Destroy the previous gauge if it exists
  if (gauge) {
    gauge.dispose();
    window.removeEventListener('resize', resize_gauge);
  }
  gauge = echarts.init(document.getElementById('gauge'));
  var option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}L'
    },
    series: [{
      name: selectedTanker,
      type: 'gauge',
      min: 0,
      max: 10000,
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value} L'
      },
      data: [{
        value: volume(fuel_level).toFixed(2),
        name: 'Volume'
      }]
    }]
  };
  window.addEventListener('resize', resize_gauge);
  gauge.setOption(option);
}
var update_gauge = function update_gauge(fuel_level) {
  gauge.setOption({
    series: [{
      data: [{
        value: volume(fuel_level).toFixed(2),
        name: 'Volume'
      }]
    }]
  });
};
function volume(fuel_level) {
  var volume = -0.000005744628532 * Math.pow(fuel_level, 3) + 0.009927196796148 * Math.pow(fuel_level, 2) + 4.150072958151474 * Math.pow(fuel_level, 1) + -162.312544323069432;
  if (volume < 0) return 0;
  return volume;
}
module.exports = {
  create_gauge: create_gauge,
  update_gauge: update_gauge
};

/***/ }),

/***/ "./src/JavaScript/graphs_maps/graph.js":
/*!*********************************************!*\
  !*** ./src/JavaScript/graphs_maps/graph.js ***!
  \*********************************************/
/***/ ((module) => {

2; /* global echarts */
var chart = null;
var visibleData = [];
function resize_graph() {
  chart.resize();
}

//Function to create a graph
function create_graph(selectedTanker) {
  // Destroy the previous chart if it exists
  if (chart) {
    chart.dispose();
    window.removeEventListener('resize', resize_graph);
  }
  chart = echarts.init(document.getElementById('chart-canvas'));
  var option = {
    legend: {
      orient: 'horizontal',
      right: 'center',
      top: 20
    },
    title: {
      text: 'Tanker Level',
      left: 'center',
      top: 'top',
      textStyle: {
        color: 'blue',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontFamily: 'Arial',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      show: true
    },
    xAxis: {
      type: 'time',
      name: 'Time',
      splitLine: {
        show: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} L',
        align: 'right'
      }
    },
    series: [{
      name: selectedTanker,
      type: 'line',
      data: visibleData,
      large: true,
      showSymbol: false,
      smooth: true
    }],
    dataZoom: [{
      type: 'slider'
    }, {
      type: 'inside'
    }]
  };
  window.addEventListener('resize', resize_graph);
  chart.setOption(option);
}

// Function to update Graph with new data
function update_graph(fuel) {
  var now = new Date();
  // visibleData.shift(); // Remove the oldest data point
  visibleData.push([now.getTime(), volume(fuel).toFixed(2)]);

  // Update the chart with new data
  chart.setOption({
    series: [{
      data: visibleData
    }]
  }, false);
}

// Function to update Graph with new tanker data
function update_graph_data(values, selectedTanker) {
  // Clear previous data
  visibleData.length = 0;

  // Populate visible data with new values
  values.forEach(function (row) {
    var seconds = new Date(row.timestamp).getTime();
    var date = new Date(seconds);
    visibleData.unshift([date, volume(row.fuel_level).toFixed(2)]);
  });
  create_graph(selectedTanker);
}
function volume(fuel_level) {
  var volume = -0.000005744628532 * Math.pow(fuel_level, 3) + 0.009927196796148 * Math.pow(fuel_level, 2) + 4.150072958151474 * Math.pow(fuel_level, 1) + -162.312544323069432;
  if (volume < 0) return 0;
  return volume;
}
module.exports = {
  create_graph: create_graph,
  update_graph: update_graph,
  update_graph_data: update_graph_data
};

/***/ }),

/***/ "./src/JavaScript/graphs_maps/map.js":
/*!*******************************************!*\
  !*** ./src/JavaScript/graphs_maps/map.js ***!
  \*******************************************/
/***/ ((module) => {

/* global L */

// Marker storage
var markers = {};
var currentRoute = null;
var animationMarker = null;
var animationInterval = null;
// Map instance
var map;

// Initialize the map only once with tanker location
function create_map(values) {
  if (!map) {
    map = L.map("map").setView([0, 0], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap"
    }).addTo(map);
  }
  update_map(values);
}

// Update the map location and marker position
function update_map(values) {
  var currentZoom = map.getZoom();
  var _values$ = values[0],
    latitude = _values$.latitude,
    longitude = _values$.longitude,
    number_plate = _values$.number_plate;
  var coordinates = values.map(function (point) {
    return [point.latitude, point.longitude];
  });
  if (currentRoute) map.removeLayer(currentRoute);
  // Draw route line
  currentRoute = L.polyline(coordinates, {
    color: 'red',
    weight: 3,
    opacity: 0.7
  }).addTo(map);
  if (markers[number_plate]) {
    markers[number_plate].setLatLng([latitude, longitude]);
  } else {
    markers[number_plate] = L.marker([latitude, longitude]).addTo(map);
  }
  map.setView([latitude, longitude], currentZoom || 16);

  // animateMarker(coordinates)
}

// Animate marker along the route
function animateMarker(coordinates) {
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6000;
  // Clear any existing animation
  if (animationInterval) {
    clearInterval(animationInterval);
  }

  // Remove existing animation marker if it exists
  if (animationMarker) {
    map.removeLayer(animationMarker);
  }

  // Create new marker with custom icon for animation
  animationMarker = L.marker(coordinates[0], {
    icon: L.divIcon({
      className: 'animated-marker',
      html: '<div style="background-color: blue; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>'
    })
  }).addTo(map);
  var step = 0;
  var numSteps = coordinates.length;
  var timePerStep = duration / numSteps;
  animationInterval = setInterval(function () {
    step++;
    if (step >= numSteps) {
      clearInterval(animationInterval);
      return;
    }
    animationMarker.setLatLng(coordinates[step]);
  }, timePerStep);
}

// Function to handle play button click
function playRouteAnimation(values) {
  var coordinates = values.map(function (point) {
    return [point.latitude, point.longitude];
  });
  animateMarker(coordinates);
}

// Stop the animation
function stopRouteAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
  }
  if (animationMarker) {
    map.removeLayer(animationMarker);
    animationMarker = null;
  }
}
module.exports = {
  update_map: update_map,
  create_map: create_map,
  playRouteAnimation: playRouteAnimation,
  stopRouteAnimation: stopRouteAnimation
};

/***/ }),

/***/ "./src/JavaScript/graphs_maps/popup.js":
/*!*********************************************!*\
  !*** ./src/JavaScript/graphs_maps/popup.js ***!
  \*********************************************/
/***/ ((module) => {

var alert_popup_container = document.querySelector(".modal");
var alert_popup_close = document.querySelector(".modal .close");
var alert_popup_heading = document.querySelector(".modal .status_alert_heading");
var alert_popup_text = document.querySelector(".modal .status_text");
function show_popup(status) {
  alert_popup_container.classList.remove('hidden');
  alert_popup_heading.textContent = status;
  alert_popup_text.textContent = "".concat(status, " Alert!");
  setTimeout(function () {
    alert_popup_container.classList.add('hidden');
  }, 10000);
}
alert_popup_close.addEventListener('click', function () {
  alert_popup_container.classList.add('hidden');
});
module.exports = {
  show_popup: show_popup
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************************************!*\
  !*** ./src/JavaScript/graphs_maps/main.js ***!
  \********************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var select_Button = document.getElementById("select");
var loading_Button = document.getElementById("loading");
var selectedTanker = "";
var factor = 1;
var _require = __webpack_require__(/*! ./graph.js */ "./src/JavaScript/graphs_maps/graph.js"),
  update_graph_data = _require.update_graph_data,
  update_graph = _require.update_graph;
var _require2 = __webpack_require__(/*! ./map.js */ "./src/JavaScript/graphs_maps/map.js"),
  update_map = _require2.update_map,
  create_map = _require2.create_map;
var _require3 = __webpack_require__(/*! ./gauge.js */ "./src/JavaScript/graphs_maps/gauge.js"),
  update_gauge = _require3.update_gauge,
  create_gauge = _require3.create_gauge;
var _require4 = __webpack_require__(/*! ./popup.js */ "./src/JavaScript/graphs_maps/popup.js"),
  show_popup = _require4.show_popup;

/* global io */
var socket = io.connect();
function initializeTankerSelection() {
  select_Button.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var range, _values$, response, values;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (document.querySelector('input[name="device"]:checked')) {
            _context.next = 3;
            break;
          }
          alert("Please select a tanker.");
          return _context.abrupt("return");
        case 3:
          selectedTanker = document.querySelector('input[name="device"]:checked').value;
          range = document.querySelector('input[name="range"]:checked').value;
          select_Button.disabled = true;
          select_Button.style.display = "none";
          loading_Button.style.display = "inline-flex";
          _context.prev = 8;
          _context.next = 11;
          return fetch("/widgets/data?tanker=".concat(selectedTanker, "&range=").concat(range));
        case 11:
          response = _context.sent;
          if (response.ok) {
            _context.next = 14;
            break;
          }
          throw new Error('Failed to fetch data from the server');
        case 14:
          _context.next = 16;
          return response.json();
        case 16:
          values = _context.sent;
          document.querySelectorAll('.widget').forEach(function (widget) {
            widget.classList.remove('hidden');
          });
          factor = ((_values$ = values[0]) === null || _values$ === void 0 ? void 0 : _values$.factor) || 1;
          create_map(values);
          update_graph_data(values, selectedTanker);
          create_gauge(values[0], selectedTanker);
          _context.next = 28;
          break;
        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](8);
          console.error("Error during API call:", _context.t0);
          show_popup("Error");
        case 28:
          _context.prev = 28;
          select_Button.disabled = false;
          select_Button.style.display = "flex";
          loading_Button.style.display = "none";
          return _context.finish(28);
        case 33:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[8, 24, 28, 33]]);
  })));
}
socket.on("Widget-Update", function (_ref2) {
  var fuel = _ref2.fuel,
    numberPlate = _ref2.numberPlate,
    longitude = _ref2.longitude,
    latitude = _ref2.latitude;
  if (numberPlate == selectedTanker) {
    update_graph(fuel * factor);
    update_map({
      latitude: latitude,
      longitude: longitude,
      numberPlate: numberPlate
    });
    update_gauge(fuel * factor);
  }
});
socket.on("Popup-Alert", function (_ref3) {
  var status = _ref3.status;
  show_popup(status);
});
initializeTankerSelection();
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map