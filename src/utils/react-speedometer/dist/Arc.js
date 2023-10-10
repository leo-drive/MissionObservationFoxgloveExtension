import { jsx as _jsx } from "react/jsx-runtime";
import { useContext, useMemo } from "react";
import Context from "./context";
import { getCirclePath } from "./utils";
export default function Arc({
  color = "#e63946",
  opacity = 1,
  arcWidth = 2,
  lineCap,
  ...rest
}) {
  const { radius, lineCap: globalLineCap, angle } = useContext(Context);
  const secondaryPath = useMemo(
    () => getCirclePath(radius, radius, radius - 20 - arcWidth / 2, 0, angle),
    [radius, arcWidth, angle]
  );
  return _jsx("path", {
    d: secondaryPath,
    stroke: color,
    strokeOpacity: opacity,
    strokeWidth: arcWidth,
    strokeLinecap: lineCap || globalLineCap,
    fill: "transparent",
    ...rest,
  });
}
