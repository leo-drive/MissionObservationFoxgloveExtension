import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useMemo } from "react";
import { polarToCartesian } from "./utils";
import Context from "./context";
const getMarkPosition = (angle, offset, radius) => {
  return polarToCartesian(radius, radius, radius + offset, angle);
};
export default function Marks({
  step = 5,
  lineCap = "butt",
  lineColor = "white",
  lineOpacity = 1,
  numbersRadius = 17,
  fontSize = 12,
  lineSize = 12,
  children,
}) {
  const { rotation, min, max, angle, radius, fontFamily } = useContext(Context);
  const marks = useMemo(() => {
    const stepsLength = Math.round((max - min) / step);
    const gap = angle / stepsLength;
    return [...Array(stepsLength + 1)].map((val, index) => {
      const actualAngle = gap * index;
      const isEven = index % 2 === 0;
      const size = isEven ? lineSize - 8 : lineSize - 12;
      const { x: x1, y: y1 } = getMarkPosition(actualAngle, -20, radius);
      const { x: x2, y: y2 } = getMarkPosition(actualAngle, -size - 30, radius);
      const { x, y } = getMarkPosition(actualAngle, -lineSize - numbersRadius, radius);
      return {
        coordinates: { x1, y1, x2, y2 },
        isEven,
        textProps: {
          x,
          y,
          transform: `scale(0.7),rotate(${360 - rotation}, ${x}, ${y}), translate(-5, -50)`,
        },
        value: Math.round(index * step + min),
      };
    });
  }, [max, min, step, angle, lineSize, radius, numbersRadius, rotation]);
  if (children) return _jsx(_Fragment, { children: marks.map(children) });
  return _jsx(_Fragment, {
    children: marks.map((mark, i) =>
      _jsxs(
        "g",
        {
          children: [
            _jsx("line", {
              ...mark.coordinates,
              stroke: "#E63946",
              strokeWidth: mark.isEven ? 2 : 1.5,
              strokeOpacity: lineOpacity,
              strokeLinecap: lineCap,
            }),
            mark.isEven &&
              _jsx("text", {
                ...mark.textProps,
                x: mark.textProps.x,
                y: mark.textProps.y,
                fill: "#fff",
                textAnchor: "middle",
                alignmentBaseline: "middle",
                fontFamily: fontFamily,
                fontWeight: "bold",
                opacity: 1,
                fontSize: fontSize,
                children: mark.value,
              }),
          ],
        },
        i,
      ),
    ),
  });
}
