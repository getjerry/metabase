import { createEntity } from "metabase/lib/entities";
import { entityTypeForObject } from "metabase/lib/schema";
import { FrequentItemSchema } from "metabase/schema";

export const getEntity = item => {
  const entities = require("metabase/entities");
  return entities[entityTypeForObject(item)];
};

export const getFrequentName = item => {
  return item.display_name || item.name;
};

export const getFrequentIcon = item => {
  const entity = getEntity(item);
  const options = { variant: "secondary" };
  return entity.objectSelectors.getIcon(item, options);
};

const FrequentItems = createEntity({
  name: "frequentItems",
  nameOne: "frequentItem",
  path: "/api/activity/frequently_view",
  schema: FrequentItemSchema,

  wrapEntity(item, dispatch = null) {
    const entity = getEntity(item);
    return entity.wrapEntity(item, dispatch);
  },

  objectSelectors: {
    getFrequentName,
    getFrequentIcon,
  },
});

export default FrequentItems;
