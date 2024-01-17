import MapMain from "./leafMap";
import { useEffect, useState, useCallback } from "react";
import {
  inputFieldsAtom,
  localeAtom,
  vehicleHazardStatusAtom,
  autowareProcessDiagAtom,
  VehicleStateState,
  publishCheckpointButtonLeftAtom,
  repeatCycleCheckpointsState,
} from "../jotai/atoms";
import Lang from "../languages/a.json";
import { useAtom } from "jotai";
import { PanelExtensionContext } from "@foxglove/studio";
import toast from "react-hot-toast";

const MissionObservation = ({ context }: { context: PanelExtensionContext }) => {
  const [recInputFields, _setRecInputFields] = useAtom(inputFieldsAtom);
  const [_hazardStatus, _setHazardStatus] = useAtom(vehicleHazardStatusAtom);

  const [vehicleState, _setVehicleState] = useAtom(VehicleStateState);
  const [locale, _setLocale] = useAtom(localeAtom);
  const [autowareProcess, _setAutowareProcess] = useAtom(autowareProcessDiagAtom);

  const [publishCheckpoint, setPublishCheckpoint] = useAtom(publishCheckpointButtonLeftAtom);
  const [hasArrived, setHasArrived] = useState(false);
  const [_conditionToCycle, setConditionToCycle] = useState(false);

  const [returnedValue, setReturnedValue] = useState(0);
  const [bufferValue, setBufferValue] = useState(0);
  const [isWaitingForCheckpoint, setIsWaitingForCheckpoint] = useState(false);

  const [unchangedCheckpoints, setUnchangedCheckpoints] = useAtom(repeatCycleCheckpointsState);

  const notifyWarningAutowareStatus = useCallback(
    () =>
      toast(Lang.missionCont.notifyWarningAutowareStatus[locale], {
        duration: 4000,
        iconTheme: {
          primary: "#f7df1e",
          secondary: "#f7df1e",
        },
        id: "warningAutowareStatus",
      }),
    [locale],
  );
  const notifySuccessAutowareStatus = useCallback(
    () =>
      toast(Lang.missionCont.notifySuccessAutowareStatus[locale], {
        duration: 4000,
        iconTheme: {
          primary: "#f7df1e",
          secondary: "#f7df1e",
        },
        id: "successAutowareStatus",
      }),
    [locale],
  );

  useEffect(() => {
    if (autowareProcess === 1) {
      notifySuccessAutowareStatus();
    } else if (autowareProcess === 0) {
      notifyWarningAutowareStatus();
    }
  }, [autowareProcess, notifySuccessAutowareStatus, notifyWarningAutowareStatus]);

  // const vehicleStateInfo = useCallback(() => {
  //   {
  //     return vehicleState === 1
  //       ? Lang.missionCont.buttons.Initializing[locale]
  //       : vehicleState === 2
  //       ? Lang.missionCont.buttons.WaitingForGoal[locale]
  //       : vehicleState === 3
  //       ? Lang.missionCont.buttons.Planning[locale]
  //       : vehicleState === 4
  //       ? Lang.missionCont.buttons.ReadyForEngage[locale]
  //       : vehicleState === 5
  //       ? Lang.missionCont.buttons.Driving[locale]
  //       : vehicleState === 6
  //       ? Lang.missionCont.buttons.ArrivedGoal[locale]
  //       : Lang.missionCont.buttons.Unknown[locale];
  //   }
  // }, [vehicleState, locale]);

  useEffect(() => {
    if (returnedValue === 0 && vehicleState === 6 && !hasArrived) {
      setConditionToCycle(false);
      setReturnedValue(1);
    }
    if (returnedValue === 1 && vehicleState === 2) {
      setConditionToCycle(true);
      setHasArrived(true);
    }
    if (vehicleState === 5) {
      setConditionToCycle(false);
      setReturnedValue(0);
      setHasArrived(false);
    }
  }, [hasArrived, returnedValue, vehicleState]);

  // TODO: have to figure out how to send checkpoints in correct order and timing
  const handleSetCheckpoint = useCallback(() => {
    setPublishCheckpoint(true);
    setBufferValue(1);
    setTimeout(() => {
      setIsWaitingForCheckpoint(false);
    }, 250);
  }, []);

  const handleSetOffCheckpoint = useCallback(() => {
    setPublishCheckpoint(false);
    setBufferValue(0);
    const temp = [...unchangedCheckpoints];
    temp.splice(temp.length - 1, 1);
    setUnchangedCheckpoints(temp);
    setIsWaitingForCheckpoint(true);
  }, []);

  const handleBufferCheckpoint = () => {
    setBufferValue(2);
  };

  useEffect(() => {
    if (vehicleState === 4 && bufferValue === 0 && isWaitingForCheckpoint) {
      handleSetCheckpoint();
    }
    if (bufferValue === 1) {
      handleBufferCheckpoint();
    }
    if (bufferValue === 2 && (vehicleState === 3 || publishCheckpoint) && !isWaitingForCheckpoint) {
      handleSetOffCheckpoint();
    }
  }, [
    bufferValue,
    handleSetCheckpoint,
    handleSetOffCheckpoint,
    isWaitingForCheckpoint,
    publishCheckpoint,
    vehicleState,
  ]);

  useEffect(() => {
    if (vehicleState === 5) {
      setUnchangedCheckpoints(recInputFields);
    }
  });

  return (
    <div className="flex h-screen bg-[#fff]">
      <MapMain context={context} />
    </div>
  );
};

export default MissionObservation;
