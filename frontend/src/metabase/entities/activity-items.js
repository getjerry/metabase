import { createEntity } from "metabase/lib/entities";
import { entityTypeForObject } from "metabase/lib/schema";
import { ActivityItemSchema } from "metabase/schema";

export const getEntity = item => {
  const entities = require("metabase/entities");
  return entities[entityTypeForObject(item)];
};

export const getActivitytName = item => {
  return item.display_name || item.name;
};

export const getActivityIcon = item => {
  const entity = getEntity(item);
  const options = { variant: "secondary" };
  return entity.objectSelectors.getIcon(item, options);
};

const ActivityItems = createEntity({
  name: "activityItems",
  nameOne: "activityItem",
  path: "/api/activity/recent_activity",
  schema: ActivityItemSchema,

  wrapEntity(item, dispatch = null) {
    const entity = getEntity(item);
    return entity.wrapEntity(item, dispatch);
  },

  objectSelectors: {
    getActivitytName,
    getActivityIcon,
  },
});

export default ActivityItems;
