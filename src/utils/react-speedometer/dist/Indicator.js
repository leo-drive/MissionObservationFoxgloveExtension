import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import Context from "./context";
export default function Indicator({
  fontSize = 14,
  color = "white",
  fontFamily,
  children,
  ...rest
}) {
  const { value, radius, rotation, fontFamily: globalFontFamily } = useContext(Context);
  const textProps = {
    transform: `rotate(${360 - rotation}, ${radius}, ${radius})`,
  };
  const fixedValue = Number(value).toFixed();
  if (children) return children(fixedValue, textProps);
  return _jsx("text", {
    ...textProps,
    x: radius,
    y: radius + radius / 2 - 60,
    textAnchor: "middle",
    fontSize: fontSize,
    fontWeight: "bold",
    fontFamily: fontFamily || globalFontFamily,
    fill: color,
    ...rest,
    children: fixedValue,
  });
}
