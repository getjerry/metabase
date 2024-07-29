import PropTypes from "prop-types";
import { Tag } from "antd";
import React from "react";

LegendMetadataTag.propTypes = {
  metadata: PropTypes.object.isRequired,
};

export function LegendMetadataTag({ metadata }) {
  const tags = metadata?.metadata?.index?.tags || [];
  return (
    <div style={{ marginTop: "2px" }}>
      {tags.map(tag => (
        <Tag
          key={tag.id}
          color={tag.color}
          bordered={false}
          style={{ marginTop: "2px" }}
        >
          {tag.name}
        </Tag>
      ))}
    </div>
  );
}
