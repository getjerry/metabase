import React from "react";
import PropTypes from "prop-types";
import { hideAll } from "tippy.js";

import TippyPopover, {
  ITippyPopoverProps,
} from "metabase/components/Popover/TippyPopover";
import Dimension from "metabase-lib/Dimension";

import { WidthBoundDimensionInfo } from "./DimensionInfoPopover.styled";

export const POPOVER_DELAY: [number, number] = [1000, 300];

const propTypes = {
  dimension: PropTypes.instanceOf(Dimension),
  children: PropTypes.node,
  placement: PropTypes.string,
  disabled: PropTypes.bool,
  card: PropTypes.object,
  user: PropTypes.object,
  metadata: PropTypes.object,
};

type Props = { dimension: Dimension } & Pick<
  ITippyPopoverProps,
  "children" | "placement" | "disabled" | "delay" | "card" | "user" | "metadata"
>;

const className = "dimension-info-popover";

function DimensionInfoPopover({
  dimension,
  children,
  placement,
  disabled,
  delay = POPOVER_DELAY,
  card,
  user,
  metadata,
}: Props) {
  // avoid a scenario where we may have a Dimension instance but not enough metadata
  // to even show a display name (probably indicative of a bug)
  const hasMetadata = !!(dimension && dimension.displayName());

  return hasMetadata ? (
    <TippyPopover
      className={className}
      delay={delay}
      placement={placement || "left-start"}
      disabled={disabled}
      content={
        <WidthBoundDimensionInfo
          dimension={dimension}
          card={card}
          user={user}
          metadata={metadata}
        />
      }
      onTrigger={instance => {
        const dimensionInfoPopovers = document.querySelectorAll(
          `.${className}[data-state~='visible']`,
        );

        // if a dimension info popovers are already visible, hide them and show this popover immediately
        if (dimensionInfoPopovers.length > 0) {
          hideAll({
            exclude: instance,
          });
          instance.show();
        }
      }}
    >
      {children}
    </TippyPopover>
  ) : (
    children
  );
}

DimensionInfoPopover.propTypes = propTypes;

export default DimensionInfoPopover;
