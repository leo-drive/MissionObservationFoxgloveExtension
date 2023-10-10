/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { awapiVehicleStatusAtom } from "../../jotai/atoms";
function SteeringWheel() {
  const awapiVehicleStatus = useAtomValue(awapiVehicleStatusAtom);
  const [steeringDeg, setSteeringDeg] = useState(0);
  useEffect(() => {
    setSteeringDeg(awapiVehicleStatus.steering as number);
    if (ref.current) {
      ref.current.style.transform = `rotate(${((steeringDeg / Math.PI) * -180 * 17).toFixed(
        1,
      )}deg)`; // 17 is the ratio of the steering wheel to the steering angle
    }
  }, [awapiVehicleStatus.steering]);

  const ref = useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={ref}
      width="69"
      height="70"
      viewBox="0 0 69 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-8 h-8 transform origin-center bg-[#903c46] rounded-full`}
    >
      <path
        d="M34.15 69.3C15.1 69.27 -0.0399792 53.87 0.0500208 34.91C0.140021 15.78 15.53 0.809976 34.36 0.829976C53.35 0.849976 68.64 16.36 68.52 35.33C68.41 54.15 52.93 69.52 34.15 69.3ZM34.71 7.02999C31.22 6.97999 26.41 7.89 23.01 9.45C20.37 10.66 17.96 12.18 15.79 14.09C13.41 16.17 11.42 18.58 9.91002 21.35C9.08002 22.88 8.43002 24.51 7.77002 26.12C7.61002 26.51 7.55002 27.11 7.74002 27.44C8.69002 29.05 11.23 30.14 13.11 29.18C15.61 27.91 18.02 26.46 20.73 25.66C22.47 25.14 24.21 24.62 25.99 24.26C27.61 23.93 29.28 23.83 30.92 23.61C34.34 23.16 37.75 23.44 41.12 23.98C43.51 24.37 45.88 25.06 48.18 25.84C50.13 26.5 51.96 27.48 53.84 28.34C54.63 28.7 55.37 29.27 56.2 29.43C58.05 29.8 59.61 29.1 60.74 27.6C60.95 27.32 61.05 26.8 60.94 26.47C60.1 24 59 21.66 57.53 19.5C54.34 14.81 50.14 11.34 44.91 9.17C41.54 7.75 38 7.05999 34.71 7.02999ZM34.06 63.06C36.92 63.09 39.44 62.85 41.86 62.01C43.81 61.33 45.71 60.52 47.62 59.73C48.16 59.51 48.25 59.07 47.9 58.71C45.23 55.97 41.96 54.3 38.25 53.57C35.19 52.97 32.12 53.06 29.08 53.89C25.89 54.75 23.14 56.31 20.8 58.62C20.34 59.07 20.38 59.47 20.99 59.74C22.6 60.46 24.2 61.26 25.87 61.81C28.61 62.7 31.45 63.17 34.06 63.06ZM8.03002 36.25C7.78002 36.25 7.52002 36.24 7.27002 36.25C6.52002 36.28 6.37001 36.48 6.40001 37.24C6.48001 39.63 7.02001 41.94 7.79001 44.19C8.81001 47.17 10.33 49.89 12.27 52.38C12.69 52.91 13.04 52.87 13.48 52.52C14.99 51.29 16.06 49.74 16.57 47.88C17.26 45.35 16.96 42.9 15.57 40.64C13.84 37.83 11.27 36.45 8.03002 36.25ZM51.65 45.31C51.63 48.05 52.99 50.81 55.12 52.53C55.62 52.93 55.99 52.84 56.27 52.42C57.22 51.02 58.19 49.61 59.04 48.15C60.15 46.23 60.94 44.16 61.43 42C61.79 40.39 61.97 38.74 62.2 37.1C62.29 36.49 61.96 36.17 61.35 36.24C60.3 36.36 59.24 36.4 58.23 36.66C54.38 37.66 51.68 41.42 51.65 45.31Z"
        fill="#222831"
      />
    </svg>
  );
}

export default SteeringWheel;
