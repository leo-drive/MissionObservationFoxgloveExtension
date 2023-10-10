/* eslint-disable no-lone-blocks */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import CircularSlider from "../utils/react-circular-slider-svg/dist";
import {
  JSXElementConstructor,
  ReactElement,
  ReactPortal,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAtom } from "jotai";

import {
  awapiVehicleStatusAtom,
  VehicleStateState,
  localeAtom,
  publishProcessAtom,
  processAtom,
  limitVelocityValueAtom,
} from "../jotai/atoms";
import Speedometer, {
  Arc,
  Background,
  Indicator,
  Marks,
  Progress,
} from "../utils/react-speedometer/dist";

import Lang from "../languages/lang.json";
import SteeringWheel from "./wheel/steeringwheel";
import { PanelExtensionContext } from "@foxglove/studio";

export const MissionObs = ({ context }: { context: PanelExtensionContext }) => {
  const [awapiVehicleStatus, _setAwapiVehicleStatus] = useAtom(awapiVehicleStatusAtom);
  const [velocityLimit, _setVelocityLimit] = useAtom(limitVelocityValueAtom);
  const [vehicleState, _setVehicleState] = useAtom(VehicleStateState);

  const [locale, _setLocale] = useAtom(localeAtom);

  let gear = awapiVehicleStatus.gear;

  const gearInfo: () =>
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactPortal
    | null
    | undefined = () => {
    return gear === 0 ? "N" : gear === 1 ? "P" : gear === 2 ? "R" : gear === 4 ? "D" : "N/A";
  };

  function radToDeg(rad: number): number {
    return rad * (180 / Math.PI);
  }
  const [_steeringDeg, setSteeringDeg] = useState(0);
  useEffect(() => {
    setSteeringDeg(radToDeg(awapiVehicleStatus.steering as number));
  }, [awapiVehicleStatus.steering]);

  const [velocity, setVelocity] = useState(0);
  useEffect(() => {
    if (awapiVehicleStatus.velocity !== undefined)
      setVelocity(awapiVehicleStatus.velocity as number);
  }, [awapiVehicleStatus.velocity]);

  const vehicleStateInfo = () => {
    {
      return vehicleState === 1
        ? Lang.buttons.Initializing[locale]
        : vehicleState === 2
        ? Lang.buttons.WaitingForGoal[locale]
        : vehicleState === 3
        ? Lang.buttons.Planning[locale]
        : vehicleState === 4
        ? Lang.buttons.ReadyForEngage[locale]
        : vehicleState === 5
        ? Lang.buttons.Driving[locale]
        : vehicleState === 6
        ? Lang.buttons.ArrivedGoal[locale]
        : Lang.buttons.Unknown[locale];
    }
  };

  const turnSignalInfo = useCallback(() => {
    return awapiVehicleStatus.turn_signal === 0
      ? "No Command"
      : awapiVehicleStatus.turn_signal === 1
      ? "Left"
      : awapiVehicleStatus.turn_signal === 2
      ? "Right"
      : awapiVehicleStatus.turn_signal === 3
      ? "Hazard On"
      : "Unknown";
  }, [awapiVehicleStatus.turn_signal]);

  // function getIndex(str: string | any[], substr: any, ind: number) {
  //   var Len = str.length,
  //     i = -1;
  //   while (ind-- && i++ < Len) {
  //     i = str.indexOf(substr, i);
  //     if (i < 0) break;
  //   }
  //   return i;
  // }

  const [_processButton, _setProcessButton] = useAtom(publishProcessAtom);
  const [_processValue, _setProcessValue] = useAtom(processAtom);

  const leftSignalRef = useRef<SVGPathElement>(null);
  const rightSignalRef = useRef<SVGPathElement>(null);

  const [previousTurnSignal, setPreviousTurnSignal] = useState("No Command");

  useEffect(() => {
    if (leftSignalRef.current !== null && rightSignalRef.current !== null) {
      const leftSignal = leftSignalRef.current;
      const rightSignal = rightSignalRef.current;
      if (turnSignalInfo() === "Left") {
        leftSignal.classList.add("emergencyRed");
        rightSignal.classList.remove("emergencyRed");
        setPreviousTurnSignal("Left");
      }
      if (turnSignalInfo() === "Right") {
        rightSignal.classList.add("emergencyRed");
        leftSignalRef.current.classList.remove("emergencyRed");
        setPreviousTurnSignal("Right");
      }
      if (turnSignalInfo() === "Hazard On") {
        if (previousTurnSignal !== "Hazard On") {
          leftSignal?.classList.remove("emergencyRed");
          rightSignal?.classList.remove("emergencyRed");
          setPreviousTurnSignal("Hazard On");
        }

        setTimeout(() => {
          leftSignal?.classList.add("emergencyRed");
          rightSignal?.classList.add("emergencyRed");
        }, 500);
      }
      if (turnSignalInfo() === "No Command") {
        leftSignal.classList.remove("emergencyRed");
        rightSignal.classList.remove("emergencyRed");
        setPreviousTurnSignal("No Command");
      }
    }
  }, [turnSignalInfo, previousTurnSignal]);

  const callService = useCallback(
    async (serviceName: string, request: any) => {
      if (!context.callService) {
        return;
      }

      try {
        const response = await context.callService(serviceName, request);
        console.log(`Service ${serviceName} response:`, response);
        return response;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [context.callService],
  );

  return (
    <div className="flex flex-col w-full h-full z-[1] font-prompt relative">
      {/* <Subscriber
          topic="/planning/scenario_planning/max_velocity_default"
          messageType="tier4_planning_msgs/VelocityLimit"
          customCallback={(msg) => {
            console.log(msg.max_velocity);
            setVelocityLimit(msg.max_velocity);
          }}
        /> */}

      {/* <Subscriber
          topic="/ui/ui_process_manager_prime_node/ui_process_diagnostic"
          messageType="std_msgs/UInt8"
          customCallback={(msg) => {
            let newState = msg as any;
            console.log(msg);
            if (newState.data === 0) {
              // set all to false
              setRecEngage(false);
              setRecEmergency(false);
              setRecVelocityLimit(30);
              setVelocityLimit(8.333333333);
              setVehicleState(0);
              setVelocity(0);
            }
          }}
        /> */}

      <div className="relative flex flex-col h-full items-center -z-10">
        <div className="absolute bottom-8 right-4 flex flex-col">
          <div className="h-28 w-22 p-2 bg-[#4e4e4e] text-white rounded-xl flex flex-col items-center justify-center">
            <span className="text-2xl leading-6 font-semibold ">Speed</span>{" "}
            <span className="text-lg ">Limit</span>{" "}
            <span className="text-4xl font-semibold ">{(velocityLimit * 3.6).toFixed(0)}</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 flex flex-col">
          <div
            id="speedometer"
            className="flex flex-col items-center h-48 relative rounded-full aspect-square mx-auto"
          >
            {/* <div className="absolute center -top-12">
                <CircularSlider
                  handle1={{
                    value: recVelocityLimit,
                    onChange: (v) => {
                      // round v to nearest 5 and set it to state
                      setRecVelocityLimit(Math.round(v / 5) * 5);
                      console.log(Math.round(v / 5) * 5);
                    },
                  }}
                  arcColor="#97cadb"
                  coerceToInt
                  angleType={{
                    direction: "cw",
                    axis: "-y",
                  }}
                  onControlFinished={() => {
                    setVelocityPublish(true);
                    setTimeout(() => {
                      setVelocityPublish(false);
                    }, 500);
                  }}
                  handleSize={15}
                  minValue={0}
                  maxValue={30}
                  size={350}
                  startAngle={40}
                  endAngle={160}
                />
              </div> */}
            <div className="absolute center bottom-6 bg-[#903C46] rounded-full p-2">
              <div className="bg-gradient-to-b from-gray-600 to-[#e63946] opacity-50 blur-md z-[-1.5] h-[6rem] w-[6rem] absolute center rounded-full left-0 bottom-0"></div>
              <SteeringWheel />
            </div>

            <div className="absolute center top-[3.75rem] left-[4.5rem] rounded-full">
              <svg
                width="24"
                height="27"
                viewBox="0 0 24 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
              >
                <path
                  ref={leftSignalRef}
                  // opacity="0.7"
                  // className={`${
                  //   turnSignalInfo() === "Left" ||
                  //   turnSignalInfo() === "Hazard On"
                  //     ? "emergencyRed"
                  //     : ""
                  // }`}
                  d="M23.77 24.09V2.19998C23.77 0.659976 22.1 -0.30002 20.77 0.46998L1.82001 11.41C0.49001 12.18 0.49001 14.1 1.82001 14.87L20.77 25.81C22.1 26.59 23.77 25.63 23.77 24.09Z"
                  fill="black"
                />
              </svg>
            </div>
            <div className="absolute center top-[3.75rem] right-[4.5rem] rounded-full">
              <svg
                width="24"
                height="27"
                viewBox="0 0 27 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 rotate-180"
              >
                <path
                  ref={rightSignalRef}
                  // className={`${
                  //   turnSignalInfo() === "Right" ||
                  //   turnSignalInfo() === "Hazard On"
                  //     ? "emergencyRed"
                  //     : ""
                  // }`}
                  d="M23.77 24.09V2.19998C23.77 0.659976 22.1 -0.30002 20.77 0.46998L1.82001 11.41C0.49001 12.18 0.49001 14.1 1.82001 14.87L20.77 25.81C22.1 26.59 23.77 25.63 23.77 24.09Z"
                  fill="black"
                />
              </svg>
            </div>
            <div className="absolute center top-[4.75rem] text-xs rounded-full text-white">
              km/h
            </div>
            <div className="absolute center top-[5.75rem] font-bold text-xs rounded-full text-white">
              {gearInfo()}
            </div>
            <Speedometer
              width={175}
              value={
                velocity >= 0
                  ? parseInt((velocity * 3.6).toFixed(1))
                  : parseInt((velocity * -3.6).toFixed(1))
              }
              // value={18}
              min={0}
              max={70}
              angle={280}
              fontFamily="Prompt"
            >
              <Background color="#222831" opacity={1} />
              <Arc />
              <Progress color="#00ADB5" />
              <Marks />
              <Indicator />
            </Speedometer>
            <div className="bg-gradient-to-b from-gray-600 to-black opacity-75 blur-xl -z-10 h-[9rem] w-[9rem] absolute center top-1 rounded-full"></div>
          </div>
        </div>
        <div className="w-full h-full flex flex-col items-center absolute top-4">
          <div
            className={`w-72 
          ${
            vehicleStateInfo() === Lang.buttons.Driving[locale]
              ? "bg-[#E63946]"
              : vehicleStateInfo() !== Lang.buttons.ReadyForEngage[locale]
              ? "bg-[#00adb5] opacity-25"
              : "bg-[#00adb5]"
          }
          
           transition-all duration-300 XlRounded h-12 flex justify-between items-center relative`}
          >
            <div
              className={`bg-gradient-to-b from-gray-600 
          ${
            vehicleStateInfo() === Lang.buttons.Driving[locale]
              ? "to-[#E63946]"
              : vehicleStateInfo() === Lang.buttons.WaitingForGoal[locale]
              ? "to-[#E63946]"
              : "to-[#00adb5]"
          }
           opacity-50 blur-xl -z-10 h-[110%] w-[110%] absolute center XlRounded
           `}
            ></div>

            {vehicleStateInfo() === Lang.buttons.Driving[locale] ? (
              <button
                onClick={async () => {
                  await callService("/api/autoware/set/engage", { engage: false });
                }}
                // disabled={vehicleStateInfo() !== "Driving"}
                className={`px-4 py-2 h-14 w-full leading-5 text-sm  font-semibold transition-colors duration-200
              ${vehicleStateInfo() === Lang.buttons.Driving[locale] && "bg-[#E63946]"}
                    transform XlRounded focus:outline-none`}
              >
                {Lang.buttons.stop[locale]}
              </button>
            ) : (
              <button
                onClick={async () => {
                  await callService("/api/autoware/set/engage", { engage: true });
                }}
                disabled={vehicleStateInfo() !== Lang.buttons.ReadyForEngage[locale]}
                className={`px-4 py-2 h-14 w-full text-sm leading-5 
               font-semibold transition-colors duration-200
                transform XlRounded focus:outline-none`}
              >
                {Lang.buttons.start[locale]}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
