/* eslint-disable react/prop-types */
import React, { useMemo, useState, useEffect } from "react";
import cx from "classnames";

import { msgid, ngettext } from "ttag";
import { Tooltip } from "antd";
import Icon from "metabase/components/Icon";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "metabase/components/sortable";
import { getVisibleParameters } from "metabase/parameters/utils/ui";
import { FilterButton } from "metabase/query_builder/components/ResponsiveParametersList.styled";
import StaticParameterWidget from "./ParameterWidget";

const StaticParameterWidgetList = ({
  children,
  onSortStart,
  onSortEnd,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};

const SortableParameterHandle = SortableHandle(() => (
  <div className="flex layout-centered cursor-grab text-inherit">
    <Icon name="grabber2" size={12} />
  </div>
));

const SortableParameterWidget = SortableElement(StaticParameterWidget);
const SortableParameterWidgetList = SortableContainer(
  StaticParameterWidgetList,
);

function ParametersList({
  className,

  parameters,
  question,
  dashboard,
  editingParameter,

  isFullscreen,
  isNightMode,
  hideParameters,
  isEditing,
  vertical,
  commitImmediately,

  setParameterValue,
  setParameterIndex,
  removeParameter,
  setEditingParameter,
}) {
  const handleSortStart = () => {
    document.body.classList.add("grabbing");
  };

  const handleSortEnd = ({ oldIndex, newIndex }) => {
    document.body.classList.remove("grabbing");
    if (setParameterIndex) {
      setParameterIndex(parameters[oldIndex].id, newIndex);
    }
  };

  const visibleValuePopulatedParameters = getVisibleParameters(
    parameters,
    hideParameters,
  );

  let ParameterWidget;
  let ParameterWidgetList;
  if (isEditing) {
    ParameterWidget = SortableParameterWidget;
    ParameterWidgetList = SortableParameterWidgetList;
  } else {
    ParameterWidget = StaticParameterWidget;
    ParameterWidgetList = StaticParameterWidgetList;
  }

  const parameterSize = visibleValuePopulatedParameters.length;

  const activeFilters = useMemo(() => {
    return parameters.filter(p => !!p.value);
  }, [parameters]);

  const [isDisplay, setIsDisplay] = useState(false);

  const queryFilterElement = document.querySelector(".query_filters");
  const nativeQueryBar = document.getElementById("native-query-bar");
  const visibilityTogger = document.getElementById("visibility-toggler");
  const nativeQueryBarWidth =
    nativeQueryBar === null ? 0 : nativeQueryBar.offsetWidth;
  const visibilityToggerWidth =
    visibilityTogger === null ? 0 : visibilityTogger.offsetWidth;

  const nativeEditElement = document.getElementById("nativeQueryEditor-full");
  const nativeEditWidth =
    nativeEditElement === null ? 0 : nativeEditElement.offsetWidth;
  const filterMaxWidth =
    nativeEditWidth - nativeQueryBarWidth - visibilityToggerWidth;
  const lineMaxNum = parseInt((filterMaxWidth - 16) / 194);
  let lineNum = parseInt((filterMaxWidth - 16) / 194) - 1;

  const filterElements = document.querySelectorAll(".field_set");
  const filterSize = Math.max(filterElements.length, 1000);
  const displayList = Array(filterSize).fill("block");
  if (queryFilterElement !== null && lineMaxNum < parameterSize) {
    const activeName = activeFilters.map(one => one.name);
    if (!isDisplay) {
      filterElements.forEach((element, index) => {
        if (activeName.includes(element.id)) {
          lineNum--;
        }
      });
      filterElements.forEach((element, index) => {
        if (!activeName.includes(element.id) && lineNum > 0) {
          lineNum--;
        } else if (!activeName.includes(element.id)) {
          displayList[index] = "none";
        }
      });
    }
  }

  function handleActiveFilterButtonClick() {
    const filterElements = document.querySelectorAll(".field_set");
    if (isDisplay) {
      // need to display
      filterElements.forEach(element => {
        element.style.display = "block";
      });
    } else {
      // need to hide
      filterElements.forEach((element, index) => {
        element.style.display = displayList[index];
      });
    }
    setIsDisplay(!isDisplay);
  }

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleVisibleChange = newVisible => {
    setVisible(newVisible);
  };

  return visibleValuePopulatedParameters.length > 0 ? (
    <ParameterWidgetList
      className={cx(
        className,
        "flex align-end flex-wrap",
        vertical ? "flex-column" : "flex-row",
      )}
      axis="x"
      distance={9}
      onSortStart={handleSortStart}
      onSortEnd={handleSortEnd}
    >
      {visibleValuePopulatedParameters.map((valuePopulatedParameter, index) => (
        <ParameterWidget
          key={valuePopulatedParameter.id}
          className={cx({ mb2: vertical })}
          isEditing={isEditing}
          isFullscreen={isFullscreen}
          isNightMode={isNightMode}
          parameter={valuePopulatedParameter}
          parameters={parameters}
          question={question}
          dashboard={dashboard}
          editingParameter={editingParameter}
          setEditingParameter={setEditingParameter}
          index={index}
          display={displayList[index]}
          setValue={
            setParameterValue &&
            (value => setParameterValue(valuePopulatedParameter.id, value))
          }
          commitImmediately={commitImmediately}
          dragHandle={
            isEditing && setParameterIndex ? <SortableParameterHandle /> : null
          }
        />
      ))}
      {lineMaxNum < parameterSize && (
        <Tooltip
          title={isDisplay ? "Fold Filters" : "Expand Filters"}
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
          <FilterButton
            borderless
            primary
            icon={isDisplay ? "chevronup" : "chevrondown"}
            onClick={handleActiveFilterButtonClick}
          >
            {activeFilters.length > 0
              ? ngettext(
                  msgid`${activeFilters.length} active filter`,
                  `${activeFilters.length} active filters`,
                  activeFilters.length,
                )
              : `Filters`}
          </FilterButton>
        </Tooltip>
      )}
    </ParameterWidgetList>
  ) : null;
}

ParametersList.defaultProps = {
  vertical: false,
  commitImmediately: false,
};

export default ParametersList;
