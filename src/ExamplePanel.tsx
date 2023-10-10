import { Immutable, MessageEvent, PanelExtensionContext, Topic } from "@foxglove/studio";
import { useEffect, useLayoutEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./styles/globals.css";
import MissionObservation from "./components/missionobs";
import { useSetAtom } from "jotai";
import {
  VehicleStateState,
  awapiAWStatusAtom,
  awapiVehicleStatusAtom,
  emergencyStateAtom,
  engageReceivedAtom,
  poseAtom,
  vehicleLocationAtom,
  velocityLimitValueAtom,
} from "./jotai/atoms";

function ExamplePanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [_topics, setTopics] = useState<undefined | Immutable<Topic[]>>();
  const [messages, setMessages] = useState<undefined | Immutable<MessageEvent[]>>();

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
  useLayoutEffect(() => {
    // The render handler is run by the broader studio system during playback when your panel
    // needs to render because the fields it is watching have changed. How you handle rendering depends on your framework.
    // You can only setup one render handler - usually early on in setting up your panel.
    //
    // Without a render handler your panel will never receive updates.
    //
    // The render handler could be invoked as often as 60hz during playback if fields are changing often.
    context.onRender = (renderState, done) => {
      // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
      // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
      // rendering before the next render call, studio shows a notification to the user that your panel is delayed.
      //
      // Set the done callback into a state variable to trigger a re-render.
      setRenderDone(() => done);

      // We may have new topics - since we are also watching for messages in the current frame, topics may not have changed
      // It is up to you to determine the correct action when state has not changed.
      setTopics(renderState.topics);

      // currentFrame has messages on subscribed topics since the last render call
      setMessages(renderState.currentFrame);
    };

    // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
    // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

    // tell the panel context that we care about any update to the _topic_ field of RenderState
    context.watch("topics");

    // tell the panel context we want messages for the current frame for topics we've subscribed to
    // This corresponds to the _currentFrame_ field of render state.
    context.watch("currentFrame");

    // subscribe to some topics, you could do this within other effects, based on input fields, etc
    // Once you subscribe to topics, currentFrame will contain message events from those topics (assuming there are messages).
    context.subscribe([
      { topic: "/autoware/state" },
      { topic: "/api/autoware/get/emergency" },
      { topic: "/api/autoware/get/engage" },
      { topic: "/awapi/autoware/get/status" },
      { topic: "/awapi/vehicle/get/status" },
      { topic: "/planning/scenario_planning/max_velocity_default" },
      { topic: "/gps_coordinates" },
    ]);

    // To publish messages, you must advertise the topic first.
    context.advertise?.("/gps_coordinates", "std_msgs/msg/String");
  }, [context]);

  const setVehicleState = useSetAtom(VehicleStateState);
  const setRecEmergency = useSetAtom(emergencyStateAtom);
  const setEngageReceived = useSetAtom(engageReceivedAtom);
  const setAwapiAWStatus = useSetAtom(awapiAWStatusAtom);
  const setVehicleLocation = useSetAtom(vehicleLocationAtom);
  const setAwapiVehicleStatus = useSetAtom(awapiVehicleStatusAtom);
  const setVelocityLimit = useSetAtom(velocityLimitValueAtom);
  const setPose = useSetAtom(poseAtom);

  useEffect(() => {
    if (!messages) return;
    if (messages && messages[0])
      switch (messages[0].topic) {
        case "/gps_coordinates":
          // @ts-ignore
          setPose(messages[0].message.data);
          break;
        case "/planning/scenario_planning/max_velocity_default":
          // @ts-ignore
          setVelocityLimit(messages[0].message.max_velocity);
          break;
        case "/autoware/state":
          // @ts-ignore
          setVehicleState(messages[0].message.state);
          break;
        case "/api/autoware/get/emergency":
          // @ts-ignore
          setRecEmergency(messages[0].message.emergency);
          break;
        case "/api/autoware/get/engage":
          // @ts-ignore
          setEngageReceived(messages[0].message.engage);
          break;
        case "/awapi/autoware/get/status":
          // @ts-ignore
          setAwapiAWStatus(messages[0].message);
          break;
        case "/awapi/vehicle/get/status":
          // @ts-ignore
          setAwapiVehicleStatus(messages[0].message);
          setVehicleLocation({
            // @ts-ignore
            longitude: messages[0].message.geo_point.longitude,
            // @ts-ignore
            latitude: messages[0].message.geo_point.latitude,
          });
          break;
        default:
          break;
      }
  }, [messages]);

  // invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div className="min-h-screen w-full">
      <MissionObservation context={context} />
    </div>
  );
}

export function initExamplePanel(context: PanelExtensionContext): () => void {
  ReactDOM.render(<ExamplePanel context={context} />, context.panelElement);

  // Return a function to run when the panel is removed
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}
