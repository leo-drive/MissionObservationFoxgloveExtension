import * as React from "react";
import { AngleDescription } from "./circularGeometry";
declare type Props = {
    size: number;
    minValue: number;
    maxValue: number;
    startAngle: number;
    endAngle: number;
    angleType: AngleDescription;
    handleSize: number;
    handle1: {
        value: number;
        onChange?: (value: number) => void;
    };
    handle2?: {
        value: number;
        onChange: (value: number) => void;
    };
    onControlFinished?: () => void;
    disabled?: boolean;
    arcColor: string;
    arcBackgroundColor: string;
    coerceToInt?: boolean;
    outerShadow?: boolean;
};
export declare class CircularSlider extends React.Component<React.PropsWithChildren<Props>> {
    static defaultProps: Pick<Props, "size" | "minValue" | "maxValue" | "startAngle" | "endAngle" | "angleType" | "arcBackgroundColor" | "handleSize">;
    svgRef: React.RefObject<SVGSVGElement>;
    onMouseEnter: (ev: React.MouseEvent<SVGSVGElement>) => void;
    onMouseDown: (ev: React.MouseEvent<SVGSVGElement>) => void;
    removeMouseListeners: () => void;
    handleMousePosition: (ev: React.MouseEvent<SVGSVGElement> | MouseEvent) => void;
    onTouch: (ev: React.TouchEvent<SVGSVGElement>) => void;
    processSelection: (x: number, y: number) => void;
    render(): JSX.Element;
}
export declare class CircularSliderWithChildren extends React.Component<React.PropsWithChildren<Props>> {
    static defaultProps: Pick<Props, "size" | "minValue" | "maxValue" | "startAngle" | "endAngle" | "angleType" | "arcBackgroundColor" | "handleSize">;
    render(): JSX.Element;
}
export default CircularSlider;
