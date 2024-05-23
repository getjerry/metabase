import axios from "axios";

export function trackEvent(event, meta) {
  try {
    axios.post(
      "/api/jerry/event",
      {
        event: event,
        meta: meta,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export const trackJerryView = (store, prevState, nextState) => {
  if (
    prevState == null ||
    prevState.location.pathname !== nextState.location.pathname
  ) {
    try {
      const currentUser = store.getState().currentUser;
      const data = {
        user_info: currentUser,
        route: nextState.location,
      };
      const event = {
        eventCategory: "Metabase",
        eventAction: "Frontend",
        eventLabel: nextState.routes[3].path,
      };
      trackEvent(event, data);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
};
