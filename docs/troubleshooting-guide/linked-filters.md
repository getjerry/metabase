# Linked filters

FIXME: overview

## Specific Problems

### My cards are empty when I apply linked filters

FIXME: example

**How to detect this:** Some data shows up when the first filter is applied, but nothing shows up when the second (dependent) filter is added.

**How to fix this:** Check that there actually _is_ data.

### My linked filter seems to have no effect

- make sure it will (see https://github.com/metabase/metabase/issues/14595)

## FIXME

- https://metabase.zendesk.com/agent/tickets/4829 seems to be a bug we fixed (though if someone renames a column that's being used in a filter, linked or otherwise, will Metabase adapt to the change?)

- https://metabase.zendesk.com/agent/tickets/5808 is more a how-to than a troubleshooting

- https://metabase.zendesk.com/agent/tickets/3907 - need to do more with Field Filters

- https://github.com/metabase/metabase/issues/16872 (look at the answer at the bottom) - linked filters only work when there's an explicit foreign key definition (?)

- https://github.com/metabase/metabase/issues/15860 is a bug (but I need to learn more about locking parameters)
