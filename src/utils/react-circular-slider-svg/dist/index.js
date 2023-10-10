import * as React from "react";
import { angleToPosition, positionToAngle, valueToAngle, angleToValue } from "./circularGeometry";

var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };

var CircularSlider = (function (_super) {
  __extends(CircularSlider, _super);
  function CircularSlider() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this;
    _this.svgRef = React.createRef();
    _this.onMouseEnter = function (ev) {
      if (ev.buttons === 1) {
        _this.onMouseDown(ev);
      }
    };
    _this.onMouseDown = function (ev) {
      var svgRef = _this.svgRef.current;
      if (svgRef) {
        svgRef.addEventListener("mousemove", _this.handleMousePosition);
        svgRef.addEventListener("mouseleave", _this.removeMouseListeners);
        svgRef.addEventListener("mouseup", _this.removeMouseListeners);
      }
      _this.handleMousePosition(ev);
    };
    _this.removeMouseListeners = function () {
      var svgRef = _this.svgRef.current;
      if (svgRef) {
        svgRef.removeEventListener("mousemove", _this.handleMousePosition);
        svgRef.removeEventListener("mouseleave", _this.removeMouseListeners);
        svgRef.removeEventListener("mouseup", _this.removeMouseListeners);
      }
      if (_this.props.onControlFinished) {
        _this.props.onControlFinished();
      }
    };
    _this.handleMousePosition = function (ev) {
      var x = ev.clientX;
      var y = ev.clientY;
      _this.processSelection(x, y);
    };
    _this.onTouch = function (ev) {
      if (ev.touches.length > 1 || ev.type === "touchend")
        if (_this.props.onControlFinished) {
          // on control finished is called when the user releases the touch
          _this.props.onControlFinished();
        }

      var touch = ev.changedTouches[0];
      var x = touch.clientX;
      var y = touch.clientY;
      _this.processSelection(x, y);
    };

    _this.processSelection = function (x, y) {
      var _a;
      var _b = _this.props,
        size = _b.size,
        maxValue = _b.maxValue,
        minValue = _b.minValue,
        angleType = _b.angleType,
        startAngle = _b.startAngle,
        endAngle = _b.endAngle,
        handle1 = _b.handle1,
        disabled = _b.disabled,
        handle2 = _b.handle2,
        coerceToInt = _b.coerceToInt;
      if (!handle1.onChange) {
        return;
      }
      var svgRef = _this.svgRef.current;
      if (!svgRef) {
        return;
      }
      var svgPoint = svgRef.createSVGPoint();
      svgPoint.x = x;
      svgPoint.y = y;
      var coordsInSvg = svgPoint.matrixTransform(
        (_a = svgRef.getScreenCTM()) === null || _a === void 0 ? void 0 : _a.inverse(),
      );
      var angle = positionToAngle(coordsInSvg, size, angleType);
      var value = angleToValue({
        angle: angle,
        minValue: minValue,
        maxValue: maxValue,
        startAngle: startAngle,
        endAngle: endAngle,
      });
      if (coerceToInt) {
        value = Math.round(value);
      }
      if (!disabled) {
        if (
          handle2 &&
          handle2.onChange &&
          Math.abs(value - handle2.value) < Math.abs(value - handle1.value)
        ) {
          handle2.onChange(value);
        } else {
          handle1.onChange(value);
        }
      }
    };
    return _this;
  }
  CircularSlider.prototype.render = function () {
    var _a = this.props,
      size = _a.size,
      handle1 = _a.handle1,
      handle2 = _a.handle2,
      handleSize = _a.handleSize,
      maxValue = _a.maxValue,
      minValue = _a.minValue,
      startAngle = _a.startAngle,
      endAngle = _a.endAngle,
      angleType = _a.angleType,
      disabled = _a.disabled,
      arcColor = _a.arcColor,
      outerShadow = _a.outerShadow;
    var trackWidth = 4;
    var shadowWidth = 20;
    var trackInnerRadius = size / 2 - trackWidth - shadowWidth;
    var handle1Angle = valueToAngle({
      value: handle1.value,
      minValue: minValue,
      maxValue: maxValue,
      startAngle: startAngle,
      endAngle: endAngle,
    });
    var handle2Angle =
      handle2 &&
      valueToAngle({
        value: handle2.value,
        minValue: minValue,
        maxValue: maxValue,
        startAngle: startAngle,
        endAngle: endAngle,
      });
    var handle1Position = angleToPosition(
      __assign({ degree: handle1Angle }, angleType),
      trackInnerRadius + trackWidth / 2,
      size,
    );
    var handle2Position =
      handle2Angle &&
      angleToPosition(
        __assign({ degree: handle2Angle }, angleType),
        trackInnerRadius + trackWidth / 2,
        size,
      );
    var controllable = !disabled && Boolean(handle1.onChange);
    return React.createElement(
      "svg",
      {
        width: size,
        height: size,
        ref: this.svgRef,
        onMouseDown: this.onMouseDown,
        onMouseEnter: this.onMouseEnter,
        onClick: function (ev) {
          return controllable && ev.stopPropagation();
        },
        onTouchStart: this.onTouch,
        onTouchEnd: this.onTouch,
        onTouchMove: this.onTouch,
        style: { touchAction: "none" },
      },
      outerShadow &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "radialGradient",
            { id: "outerShadow" },
            React.createElement("stop", { offset: "90%", stopColor: arcColor }),
            React.createElement("stop", { offset: "100%", stopColor: "white" }),
          ),
          React.createElement("circle", {
            fill: "none",
            stroke: "url(#outerShadow)",
            cx: size / 2,
            cy: size / 2,
            r: trackInnerRadius + trackWidth + shadowWidth / 2 - 1,
            strokeWidth: shadowWidth,
          }),
        ),
      controllable &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "filter",
            { id: "handleShadow", x: "-50%", y: "-50%", width: "16", height: "16" },
            React.createElement("feOffset", {
              result: "offOut",
              in: "SourceGraphic",
              dx: "0",
              dy: "0",
            }),
            React.createElement("feColorMatrix", {
              result: "matrixOut",
              in: "offOut",
              type: "matrix",
              values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0",
            }),
            React.createElement("feGaussianBlur", {
              result: "blurOut",
              in: "matrixOut",
              stdDeviation: "5",
            }),
            React.createElement("feBlend", { in: "SourceGraphic", in2: "blurOut", mode: "normal" }),
          ),
          React.createElement("circle", {
            r: handleSize + 5,
            cx: handle1Position.x,
            cy: handle1Position.y,
            fill: "#e63946",
            filter: "url(#handleShadow)",
          }),
          React.createElement("circle", {
            r: handleSize,
            cx: handle1Position.x,
            cy: handle1Position.y,
            fill: "#FFF",
            filter: "url(#handleShadow)",
          }),
          React.createElement(
            "text",
            {
              r: handleSize,
              fill: "#000",
              filter: "url(#handleShadow)",
              x: handle1Position.x,
              y: handle1Position.y,
              textAnchor: "middle",
              alignmentBaseline: "middle",
              fontSize: "10",
              fontWeight: "bold",
            },
            handle1.value,
          ),
        ),
      handle2Position &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement("circle", {
            r: handleSize,
            cx: handle2Position.x,
            cy: handle2Position.y,
            fill: "#bb2",
            filter: "url(#handleShadow)",
          }),
        ),
    );
  };
  CircularSlider.defaultProps = {
    size: 200,
    minValue: 0,
    maxValue: 100,
    startAngle: 0,
    endAngle: 360,
    angleType: {
      direction: "cw",
      axis: "-y",
    },
    handleSize: 8,
    arcBackgroundColor: "#aaa",
  };
  return CircularSlider;
})(React.Component);
export { CircularSlider };
var CircularSliderWithChildren = (function (_super) {
  __extends(CircularSliderWithChildren, _super);
  function CircularSliderWithChildren() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  CircularSliderWithChildren.prototype.render = function () {
    var size = this.props.size;
    return React.createElement(
      "div",
      {
        style: {
          width: size,
          height: size,
          position: "relative",
        },
      },
      React.createElement(CircularSlider, __assign({}, this.props)),
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        this.props.children,
      ),
    );
  };
  CircularSliderWithChildren.defaultProps = CircularSlider.defaultProps;
  return CircularSliderWithChildren;
})(React.Component);
export { CircularSliderWithChildren };
export default CircularSlider;
