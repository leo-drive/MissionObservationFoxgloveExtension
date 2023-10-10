import { angleToPosition } from "./circularGeometry";


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function getStartAndEndPosition(opts) {
    var startAngle = opts.startAngle, endAngle = opts.endAngle, radius = opts.radius, svgSize = opts.svgSize, angleType = opts.angleType;
    var isCircle = false;
    if (startAngle !== endAngle && startAngle % 360 === endAngle % 360) {
        isCircle = true;
    }
    var startPosition = angleToPosition(__assign({ degree: startAngle }, angleType), radius, svgSize);
    var endPosition = angleToPosition(__assign({ degree: isCircle ? endAngle - 0.001 : endAngle }, angleType), radius, svgSize);
    return { startPosition: startPosition, endPosition: endPosition, isCircle: isCircle };
}
export function pieShapedPath(opts) {
    var radius = opts.radius, svgSize = opts.svgSize, direction = opts.direction;
    var _a = getStartAndEndPosition(opts), startPosition = _a.startPosition, endPosition = _a.endPosition;
    return "\n    M ".concat(svgSize / 2, ",").concat(svgSize / 2, "\n    L ").concat(startPosition.x, ",").concat(startPosition.y, "\n    A ").concat(radius, " ").concat(radius, " 0 ").concat(direction === "cw" ? "1 1" : "0 0", "\n      ").concat(endPosition.x, " ").concat(endPosition.y, "\n    Z\n  ");
}
export function arcShapedPath(opts) {
    var startAngle = opts.startAngle, endAngle = opts.endAngle, radius = opts.radius, direction = opts.direction;
    var _a = getStartAndEndPosition(opts), startPosition = _a.startPosition, endPosition = _a.endPosition, isCircle = _a.isCircle;
    var largeArc = endAngle - startAngle >= 180;
    return "\n      M ".concat(startPosition.x, ",").concat(startPosition.y, "\n      A ").concat(radius, " ").concat(radius, " 0\n        ").concat(largeArc ? "1" : "0", "\n        ").concat(direction === "cw" ? "1" : "0", "\n        ").concat(endPosition.x, " ").concat(endPosition.y, "\n        ").concat(isCircle ? "Z" : "", "\n    ");
}
export function arcPathWithRoundedEnds(opts) {
    var startAngle = opts.startAngle, innerRadius = opts.innerRadius, thickness = opts.thickness, direction = opts.direction, angleType = opts.angleType, svgSize = opts.svgSize;
    var endAngle = opts.endAngle;
    if (startAngle % 360 === endAngle % 360 && startAngle !== endAngle) {
        endAngle = endAngle - 0.001;
    }
    var largeArc = endAngle - startAngle >= 180;
    var outerRadius = innerRadius + thickness;
    var innerArcStart = angleToPosition(__assign({ degree: startAngle }, angleType), innerRadius, svgSize);
    var startPoint = "\n    M ".concat(innerArcStart.x, ",").concat(innerArcStart.y, "\n  ");
    var innerArcEnd = angleToPosition(__assign({ degree: endAngle }, angleType), innerRadius, svgSize);
    var innerArc = "\n    A ".concat(innerRadius, " ").concat(innerRadius, " 0\n      ").concat(largeArc ? "1" : "0", "\n      ").concat(direction === "cw" ? "1" : "0", "\n      ").concat(innerArcEnd.x, " ").concat(innerArcEnd.y, "\n  ");
    var outerArcStart = angleToPosition(__assign({ degree: endAngle }, angleType), outerRadius, svgSize);
    var firstButt = "\n    A ".concat(thickness / 2, " ").concat(thickness / 2, " 0\n      ").concat(largeArc ? "1" : "0", "\n      ").concat(direction === "cw" ? "0" : "1", "\n      ").concat(outerArcStart.x, " ").concat(outerArcStart.y, "\n  ");
    var outerArcEnd = angleToPosition(__assign({ degree: startAngle }, angleType), outerRadius, svgSize);
    var outerArc = "\n    A ".concat(outerRadius, " ").concat(outerRadius, " 0\n      ").concat(largeArc ? "1" : "0", "\n      ").concat(direction === "cw" ? "0" : "1", "\n      ").concat(outerArcEnd.x, " ").concat(outerArcEnd.y, "\n  ");
    var secondButt = "\n    A ".concat(thickness / 2, " ").concat(thickness / 2, " 0\n      ").concat(largeArc ? "1" : "0", "\n      ").concat(direction === "cw" ? "0" : "1", "\n      ").concat(innerArcStart.x, " ").concat(innerArcStart.y, "\n  ");
    return startPoint + innerArc + firstButt + outerArc + secondButt + " Z";
}
