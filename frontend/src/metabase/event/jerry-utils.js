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
  }
}

export const trackJerryView = (store, prevState, nextState, loadTime = 0) => {
  if (
    prevState == null ||
    prevState.location.pathname !== nextState.location.pathname
  ) {
    try {
      const currentUser = store.getState().currentUser;
      const data = {
        user_info: currentUser,
        route: nextState.location,
        load_time: loadTime,
      };
      const event = {
        eventCategory: "Metabase",
        eventAction: "Frontend",
        eventLabel: nextState.routes[3].path,
      };
      trackEvent(event, data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

export const trackQuery = (queryResult, card) => {
  try {
    const event = {
      eventCategory: "Metabase",
      eventAction: "Frontend",
      eventLabel: "Query",
    };
    const data = {
      result: queryResult,
      card: card,
    };
    trackEvent(event, data);
  } catch (error) {
    console.error("Error", error);
  }
};
