import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { t } from "ttag";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import _ from "underscore";

import { DEFAULT_SEARCH_LIMIT } from "metabase/lib/constants";
import Search from "metabase/entities/search";
import SearchResult from "metabase/search/components/SearchResult";
import EmptyState from "metabase/components/EmptyState";
import { useListKeyboardNavigation } from "metabase/hooks/use-list-keyboard-navigation";
import { trackEvent } from "metabase/event/jerry-utils";
import { EmptyStateContainer } from "./SearchResults.styled";

const propTypes = {
  list: PropTypes.array,
  onChangeLocation: PropTypes.func,
  onEntitySelect: PropTypes.func,
  searchText: PropTypes.string,
  user: PropTypes.object,
};

function trackSearchEvent(searchText, user, searchResult) {
  const event = {
    eventCategory: "Metabase",
    eventAction: "Frontend",
    eventLabel: "search input",
  };
  const meta = {
    user_info: user,
    input: searchText,
  };
  trackEvent(event, meta);
}

const SearchResults = ({
  list,
  onChangeLocation,
  onEntitySelect,
  searchText,
  user,
}) => {
  const { reset, getRef, cursorIndex } = useListKeyboardNavigation({
    list,
    onEnter: onEntitySelect
      ? onEntitySelect
      : item => onChangeLocation(item.getUrl()),
    resetOnListChange: false,
  });

  const listRef = useRef(list);
  const userRef = useRef(user);
  useEffect(() => {
    reset();
    const trackEventWithList = () => {
      trackSearchEvent(searchText, userRef.current, listRef.current);
    };
    trackEventWithList();
  }, [searchText, reset]);

  const hasResults = list.length > 0;

  const handleResultClick = (item, index) => {
    trackEvent(
      {
        eventCategory: "Metabase",
        eventAction: "Frontend",
        eventLabel: "SearchResultClick",
      },
      {
        user_info: user,
        click_index: index,
        click_item: item,
        input: searchText,
      },
    );

    if (onEntitySelect) {
      onEntitySelect(item);
    } else {
      onChangeLocation(item.getUrl());
    }
  };

  return (
    <ul data-testid="search-results-list">
      {hasResults ? (
        list.map((item, index) => (
          <li key={`${item.model}:${item.id}`} ref={getRef(item)}>
            <SearchResult
              result={item}
              compact={true}
              isSelected={cursorIndex === index}
              onClick={() => handleResultClick(item, index)}
            />
          </li>
        ))
      ) : (
        <EmptyStateContainer>
          <EmptyState message={t`Didn't find anything`} icon="search" />
        </EmptyStateContainer>
      )}
    </ul>
  );
};

SearchResults.propTypes = propTypes;

export default _.compose(
  connect(null, {
    onChangeLocation: push,
  }),
  Search.loadList({
    wrapped: true,
    reload: true,
    debounced: true,
    query: (_state, props) => ({
      q: props.searchText,
      limit: DEFAULT_SEARCH_LIMIT,
      models: props.models,
    }),
  }),
)(SearchResults);
