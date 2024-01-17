import { PanelExtensionContext } from "@foxglove/studio";
import {
  checkpointAtom,
  followMarkerAtom,
  inputFieldsAtom,
  poseAtom,
  publishCheckpointButtonAtom,
  publishGoalPointButtonAtom,
  repeatCycleCheckpointsState,
} from "../jotai/atoms";
import { checkpointsbuttonAtom } from "../jotai/atoms";
import { goalpointbuttonAtom } from "../jotai/atoms";
import { vehicleLocationAtom } from "../jotai/atoms";
import { awapiVehicleStatusAtom } from "../jotai/atoms";
import { useAtom, useAtomValue } from "jotai";
import { DivIcon, divIcon, Map } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvent } from "react-leaflet";
// import { MissionObs } from "./newMissionObs";

function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

function getUTMZoneLetter(lat: number) {
  if (-80 <= lat && lat <= 84) {
    var letters = "CDEFGHJKLMNPQRSTUVWX";
    return letters.charAt(Math.floor((lat + 80) / 8));
  } else {
    // Outside the UTM limits
    return null;
  }
}

export function latLongToUTM(
  lat: number,
  long: number,
): { x: number; y: number; zone: number; zoneLetter: string } {
  var zone = Math.floor((long + 180) / 6) + 1;
  var a = 6378137; // radius of earth
  var f = 1 / 298.257223563; // flattening
  var e = Math.sqrt(2 * f - Math.pow(f, 2)); // eccentricity
  var eSq = Math.pow(e, 2);
  var latRad = degToRad(lat);
  var longRad = degToRad(long);
  var k0 = 0.9996; // scale factor
  var falseEasting = 500000; // in meters

  var N = a / Math.sqrt(1 - eSq * Math.sin(latRad) * Math.sin(latRad));
  var T = Math.pow(Math.tan(latRad), 2);
  var C = (eSq / (1 - eSq)) * Math.pow(Math.cos(latRad), 2);
  var A = Math.cos(latRad) * (longRad - degToRad((zone - 1) * 6 - 180 + 3));
  var M =
    a *
    ((1 - eSq / 4 - (3 * Math.pow(eSq, 2)) / 64 - (5 * Math.pow(eSq, 3)) / 256) * latRad -
      ((3 * eSq) / 8 + (3 * Math.pow(eSq, 2)) / 32 + (45 * Math.pow(eSq, 3)) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * Math.pow(eSq, 2)) / 256 + (45 * Math.pow(eSq, 3)) / 1024) * Math.sin(4 * latRad) -
      ((35 * Math.pow(eSq, 3)) / 3072) * Math.sin(6 * latRad));

  var x =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + Math.pow(T, 2) + 72 * C - 58 * eSq) * Math.pow(A, 5)) / 120) +
    falseEasting;
  var y =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        (Math.pow(A, 2) / 2 +
          ((5 - T + 9 * C + 4 * Math.pow(C, 2)) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + Math.pow(T, 2) + 600 * C - 330 * eSq) * Math.pow(A, 6)) / 720));

  var zoneLetter = getUTMZoneLetter(lat);

  return { x: x, y: y, zone: zone, zoneLetter: zoneLetter ?? "" };
}

function MapMain({ context }: { context: PanelExtensionContext }) {
  const vehiclePosition = useAtomValue(awapiVehicleStatusAtom).geo_point;
  const eulAng = useAtomValue(awapiVehicleStatusAtom).eulerangle.yaw;
  const [recVehicleLocation, _setRecVehicleLocation] = useAtom(vehicleLocationAtom);
  const [recInputFields, setRecInputFields] = useAtom(inputFieldsAtom);
  const [unchangedCheckpoints, setUnchangedCheckpoints] = useAtom(repeatCycleCheckpointsState);
  const [pose, setPose] = useAtom(poseAtom);

  const [markerAngle, setMarkerAngle] = useState("0deg");
  const mapRef = useRef<Map>(null);

  const [goalpointButton, setGoalpointButton] = useAtom(goalpointbuttonAtom);
  const [checkpointButton, setCheckpointButton] = useAtom(checkpointsbuttonAtom);
  const [_publishGoalpoint, setPublishGoalpoint] = useAtom(publishGoalPointButtonAtom);
  const [_publishCheckpoint, setPublishCheckpoint] = useAtom(publishCheckpointButtonAtom);
  const [_checkPoint, setCheckPoint] = useAtom(checkpointAtom);

  // This code will allow the map to pan to the vehicle's position
  // and follow the marker with the correct angle

  const [followMarker, setFollowMarker] = useAtom(followMarkerAtom);
  const MarkerLocationFollow = () => {
    useEffect(() => {
      if (followMarker && mapRef.current) {
        mapRef.current.panTo([recVehicleLocation.latitude, recVehicleLocation.longitude]);
        mapRef.current.dragging.disable();
      }
      setMarkerAngle(`${eulAng * -57.2957795 + 95}deg`);
    }, []);
    return null;
  };

  useEffect(() => {
    if (pose[0] !== 0) {
      setFollowMarker(true);
    }
  }, [pose]);

  const MouseLocationInfo = () => {
    const map = useMap();
    if (goalpointButton || checkpointButton) {
      map.dragging.disable();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useMapEvent("contextmenu", (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const goal = [lat, lng, 48.35];
        if (goalpointButton) {
          // console.log("gp", goal);
          context.publish?.("/gps_coordinates", { data: JSON.stringify(goal) });
          setPose([lat, lng, 48.35]);
          setGoalpointButton(false);
          setCheckpointButton(false);
          if (pose[0] !== 0 && recInputFields.length > 0) {
            const newGoalPoints = [goal];
            newGoalPoints.splice(0, recInputFields.length);
            setRecInputFields(newGoalPoints);
          }
          setPublishGoalpoint(true);
          setTimeout(() => {
            setPublishGoalpoint(false);
          }, 250);
        }
        if (checkpointButton) {
          // console.log("cp", goal);

          setRecInputFields([goal, ...recInputFields]);
          setUnchangedCheckpoints([goal, ...unchangedCheckpoints]);
          setCheckPoint([lat, lng, 48.35]);
          setGoalpointButton(false);
          setCheckpointButton(false);
          setPublishCheckpoint(true);
          setTimeout(() => {
            setPublishCheckpoint(false);
          }, 250);
        }
      });
    } else {
      map.dragging.enable();
    }

    return null;
  };

  return (
    <div className="relative h-full w-full">
      <div className="text-black h-full w-full flex flex-col items-center justify-center">
        <MapContainer
          ref={mapRef}
          center={[41.0196, 28.8894]}
          zoom={16}
          style={{
            userSelect: "none",
            height: "100%",
            width: "100%",
            backgroundColor: "white",
            // borderRadius: "2rem",
          }}
          attributionControl={false}
          zoomControl={false}
        >
          {/* {osm ? (
          ) : ( */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            minZoom={16}
          />
          {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" minZoom={16} /> */}
          {/* )} */}
          <Marker
            position={[vehiclePosition.latitude, vehiclePosition.longitude]}
            // position={[41.0287, 28.9769]}
            icon={divIcon({
              className: "bg-transparent",
              html: `
                      <svg
                      style="transform: rotate(${markerAngle});"
                      id="Layer_2"
                      data-name="Layer 2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 56.57 56.57"
                      >
                          <defs>
                          <style>
                          .cls-1 {
                              fill: #2bd1e5;
                          }
        
                          .cls-2 {
                              fill: #ffffff;
                              opacity: 0.4;
                          }
                          </style>
                      </defs>
                      <g id="Layer_1-2" data-name="Layer 1">
                          <circle class="cls-2" cx="28.28" cy="28.28" r="28.28"/>
                          <path d="M28.28,11.01l-12,34.55,11.92-5.81,12.08,5.81L28.28,11.01Z" class="cls-1"/>
                      </g>
                      </svg>`,
              iconSize: [32, 32],
            })}
          >
            <Popup className="request-popup">
              <div className="m-0 h-full w-64 rounded-md bg-emerald-800 p-3 text-center text-white">
                This is where you are !
              </div>
            </Popup>
          </Marker>
          <MarkerLocationFollow />
          <MouseLocationInfo />
          {pose[0] !== 0 ? (
            <Marker
              position={[pose[0]!, pose[1]!]}
              icon={
                new DivIcon({
                  className: "bg-transparent",
                  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="#e63946" d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.42 9.92 6.24 12.11.4.48 1.13.48 1.53 0C14.58 18.92 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="color000000 svgShape" style="stroke: rgb(0,0,0); stroke-width:1.5px;"/></svg>`,
                  iconSize: [48, 48],
                  iconAnchor: [24, 48],
                })
              }
            />
          ) : null}
          {recVehicleLocation.latitude !== 9999 && (
            <Marker
              position={[
                // 40.808, 29.3588,
                recVehicleLocation.latitude,
                recVehicleLocation.longitude,
              ]}
              icon={
                new DivIcon({
                  className: "bg-transparent",
                  // html: `<svg style="transform: rotate(${markerAngle}); " width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  // <path d="M256 0.959991L0 511.04L256 354.096L512 511.04L256 0.959991Z" fill="#ffffff"/>
                  // </svg>`,
                  html: `
                  <svg style="transform: rotate(${markerAngle}); " id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.57 56.57">
          <g id="Layer_1-2" data-name="Layer 1">
            <circle
          fill=#fff
          opacity=.5
          cx="28.28" cy="28.28" r="28.28"/>
            <path fill=#e63946 d="M28.28,11.01l-12,34.55,11.92-5.81,12.08,5.81L28.28,11.01Z" style="stroke: rgb(0,0,0); stroke-width:1.5px;"/>
          </g>
        </svg>`,
                  iconSize: [36, 36],
                })
              }
            />
          )}
          {recInputFields.map((inputField, index) => {
            return (
              <Marker
                key={index}
                position={[inputField[0] ?? 0, inputField[1] ?? 0]}
                icon={
                  new DivIcon({
                    className: "bg-transparent border-1 border-white ",
                    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="#00adb5" d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.42 9.92 6.24 12.11.4.48 1.13.48 1.53 0C14.58 18.92 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="color000000 svgShape" style="stroke: rgb(0,0,0); stroke-width:1.5px;"/></svg>`,
                    iconSize: [48, 48],
                    iconAnchor: [24, 48],
                  })
                }
              />
            );
          })}
        </MapContainer>
        {/* <MissionObs context={context} /> */}
      </div>
    </div>
  );
}

export default MapMain;
