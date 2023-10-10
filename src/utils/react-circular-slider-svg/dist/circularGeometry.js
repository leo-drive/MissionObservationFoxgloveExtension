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
export function angleToValue(params) {
    var angle = params.angle, minValue = params.minValue, maxValue = params.maxValue, startAngle = params.startAngle, endAngle = params.endAngle;
    if (endAngle <= startAngle) {
        throw new Error("endAngle must be greater than startAngle");
    }
    if (angle < startAngle) {
        return minValue;
    }
    else if (angle > endAngle) {
        return maxValue;
    }
    else {
        var ratio = (angle - startAngle) / (endAngle - startAngle);
        var value = ratio * (maxValue - minValue) + minValue;
        return value;
    }
}
export function valueToAngle(params) {
    var value = params.value, minValue = params.minValue, maxValue = params.maxValue, startAngle = params.startAngle, endAngle = params.endAngle;
    if (endAngle <= startAngle) {
        throw new Error("endAngle must be greater than startAngle");
    }
    var ratio = (value - minValue) / (maxValue - minValue);
    var angle = ratio * (endAngle - startAngle) + startAngle;
    return angle;
}
function convertAngle(degree, from, to) {
    to = to || { direction: "ccw", axis: "+x" };
    if (from.direction !== to.direction) {
        degree = degree === 0 ? 0 : 360 - degree;
    }
    if (from.axis === to.axis) {
        return degree;
    }
    if (from.axis[1] === to.axis[1]) {
        return (180 + degree) % 360;
    }
    switch (to.direction + from.axis + to.axis) {
        case "ccw+x-y":
        case "ccw-x+y":
        case "ccw+y+x":
        case "ccw-y-x":
        case "cw+y-x":
        case "cw-y+x":
        case "cw-x-y":
        case "cw+x+y":
            return (90 + degree) % 360;
        case "ccw+y-x":
        case "ccw-y+x":
        case "ccw+x+y":
        case "ccw-x-y":
        case "cw+x-y":
        case "cw-x+y":
        case "cw+y+x":
        case "cw-y-x":
            return (270 + degree) % 360;
        default:
            throw new Error("Unhandled conversion");
    }
}
export function angleToPosition(angle, radius, svgSize) {
    var angleConverted = convertAngle(angle.degree, angle, {
        direction: "ccw",
        axis: "+x",
    });
    var angleInRad = (angleConverted / 180) * Math.PI;
    var dX;
    var dY;
    if (angleInRad <= Math.PI) {
        if (angleInRad <= Math.PI / 2) {
            dY = Math.sin(angleInRad) * radius;
            dX = Math.cos(angleInRad) * radius;
        }
        else {
            dY = Math.sin(Math.PI - angleInRad) * radius;
            dX = Math.cos(Math.PI - angleInRad) * radius * -1;
        }
    }
    else {
        if (angleInRad <= Math.PI * 1.5) {
            dY = Math.sin(angleInRad - Math.PI) * radius * -1;
            dX = Math.cos(angleInRad - Math.PI) * radius * -1;
        }
        else {
            dY = Math.sin(2 * Math.PI - angleInRad) * radius * -1;
            dX = Math.cos(2 * Math.PI - angleInRad) * radius;
        }
    }
    var x = dX + svgSize / 2;
    var y = svgSize / 2 - dY;
    return { x: x, y: y };
}
export function positionToAngle(position, svgSize, angleType) {
    var dX = position.x - svgSize / 2;
    var dY = svgSize / 2 - position.y;
    var theta = Math.atan2(dY, dX);
    if (theta < 0) {
        theta = theta + 2 * Math.PI;
    }
    var degree = (theta / Math.PI) * 180;
    return convertAngle(degree, {
        direction: "ccw",
        axis: "+x",
    }, angleType);
}
export function semiCircle(opts) {
    var startAngle = opts.startAngle, endAngle = opts.endAngle, radius = opts.radius, svgSize = opts.svgSize, direction = opts.direction, angleType = opts.angleType;
    var startPosition = angleToPosition(__assign({ degree: startAngle }, angleType), radius, svgSize);
    var endPosition = angleToPosition(__assign({ degree: endAngle }, angleType), radius, svgSize);
    return "\n    M ".concat(svgSize / 2, ",").concat(svgSize / 2, "\n    L ").concat(startPosition.x, ",").concat(startPosition.y, "\n    A ").concat(radius, " ").concat(radius, " 0 ").concat(direction === "cw" ? "1 1" : "0 0", "\n      ").concat(endPosition.x, " ").concat(endPosition.y, "\n    Z\n  ");
}
