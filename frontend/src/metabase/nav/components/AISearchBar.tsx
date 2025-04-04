import React, {
  MouseEvent,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { Modal, Button, List, Spin, Typography } from "antd";
import {
  BulbOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import _ from "underscore";
import { t } from "ttag";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { withRouter } from "react-router";
import { Location, LocationDescriptorObject } from "history";
import ReactMarkdown from "react-markdown";

import { usePrevious } from "react-use";
import Icon from "metabase/components/Icon";

import { useKeyboardShortcut } from "metabase/hooks/use-keyboard-shortcut";
import { useOnClickOutside } from "metabase/hooks/use-on-click-outside";
import { useToggle } from "metabase/hooks/use-toggle";
import { isSmallScreen } from "metabase/lib/dom";

import SearchResults from "./SearchResults";
import RecentsList from "./RecentsList";
import {
  SearchInputContainer,
  SearchIcon,
  CloseSearchButton,
  SearchInput,
  SearchResultsFloatingContainer,
  SearchResultsContainer,
  SearchBarRoot,
} from "./SearchBar.styled";

const ALLOWED_SEARCH_FOCUS_ELEMENTS = new Set(["BODY", "A"]);

type SearchAwareLocation = Location<{ q?: string }>;

type RouterProps = {
  location: SearchAwareLocation;
};

type DispatchProps = {
  onChangeLocation: (nextLocation: LocationDescriptorObject) => void;
};

type OwnProps = {
  onSearchActive?: () => void;
  onSearchInactive?: () => void;
};

type UserProps = {
  user: object;
};

type Props = RouterProps & DispatchProps & OwnProps & UserProps;

function isSearchPageLocation(location: Location) {
  const components = location.pathname.split("/");
  return components[components.length - 1];
}

function getSearchTextFromLocation(location: SearchAwareLocation) {
  if (isSearchPageLocation(location)) {
    return location.query.q || "";
  }
  return "";
}

const mapDispatchToProps = {
  onChangeLocation: push,
};

interface Answer {
  type: "text" | "markdown" | "link" | "button" | "image" | "error";
  content?: string;
  href?: string;
  src?: string;
  alt?: string;
  onClick?: string;
}

interface ResultItem {
  question: string;
  index: number;
  status: string;
  answers: Answer[];
}

function AISearchBar({
  location,
  onSearchActive,
  onSearchInactive,
  onChangeLocation,
  user,
}: Props) {
  const [searchText, setSearchText] = useState<string>(() =>
    getSearchTextFromLocation(location),
  );
  const [searchIndex, setSearchIndex] = useState<number>(0);

  const [isActive, { turnOn: setActive, turnOff: setInactive }] =
    useToggle(false);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAISearch, setAISearch] = useState<boolean>(false);

  const wasActive = usePrevious(isActive);
  const previousLocation = usePrevious(location);
  const container = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  const onInputContainerClick = useCallback(() => {
    searchInput.current?.focus();
    setActive();
  }, [setActive]);

  const onTextChange = useCallback(e => {
    setSearchText(e.target.value);
  }, []);

  useOnClickOutside(container, setInactive);

  useKeyboardShortcut("Escape", setInactive);

  useEffect(() => {
    if (!wasActive && isActive) {
      onSearchActive?.();
    } else if (wasActive && !isActive) {
      if (isSmallScreen()) {
        setSearchText("");
      }
      onSearchInactive?.();
    }
    if (isModalVisible) {
      setTimeout(() => {
        searchInput.current?.focus();
      }, 100);
    }
  }, [wasActive, isActive, isModalVisible, onSearchActive, onSearchInactive]);

  useEffect(() => {
    function focusOnForwardSlashPress(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName &&
        ALLOWED_SEARCH_FOCUS_ELEMENTS.has(document.activeElement.tagName)
      ) {
        searchInput.current?.focus();
        setActive();
      }
    }

    window.addEventListener("keyup", focusOnForwardSlashPress);
    return () => window.removeEventListener("keyup", focusOnForwardSlashPress);
  }, [setActive]);

  useEffect(() => {
    if (previousLocation?.pathname !== location.pathname) {
      setSearchText(getSearchTextFromLocation(location));
    }
  }, [previousLocation, location]);

  useEffect(() => {
    if (previousLocation !== location) {
      // deactivate search when page changes
      setInactive();
    }
  }, [previousLocation, location, setInactive]);

  const hasSearchText = searchText.trim().length > 0;

  const handleClickOnClose = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setInactive();
    },
    [setInactive],
  );

  const handleInputClick = () => {
    setIsModalVisible(true);
  };

  const [loadingQuestions, setLoadingQuestions] = useState<
    Record<number, boolean>
  >({});
  const [results, setResults] = useState<ResultItem[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = async (value: string, searchIndex: number) => {
    setLoadingQuestions(prev => ({ ...prev, [searchIndex]: true }));
    setResults(prev => [
      ...prev,
      { question: value, answers: [], index: searchIndex, status: "success" },
    ]);
    let data: Answer[] = [
      {
        type: "error",
        content: "Server error, please ask again.",
      },
    ];
    let answerStatus = "failed";
    try {
      const filteredResults = results
        .filter(item => item.status === "success")
        .slice(-50)
        .map(({ question, answers }) => ({ question, answers }));

      const response = await fetch(`/api/jerry/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          call: "post",
          service_name: "ai_search",
          body: {
            question: value,
            history: filteredResults,
          },
          timeout: 60000,
        }),
      });
      const responseData = await response.json();
      const responseResult: Answer[] = responseData?.answers;
      if (response.ok && responseResult.length > 0) {
        data = responseResult;
        answerStatus = "success";
      }
      let index = 0;
      const interval = setInterval(() => {
        if (index < data.length) {
          setResults(prev =>
            prev.map(item =>
              item.index === searchIndex
                ? { ...item, answers: [...item.answers, data[index]] }
                : item,
            ),
          );
          index++;
        } else {
          clearInterval(interval);
          setResults(prev =>
            prev.map(item =>
              item.index === searchIndex
                ? {
                    ...item,
                    answers: [...item.answers, data[index]],
                    status: answerStatus,
                  }
                : item,
            ),
          );
          setLoadingQuestions(prev => ({ ...prev, [searchIndex]: false }));
        }
      }, 800);
    } catch (error) {
      console.error("请求失败:", error);
      setResults(prev =>
        prev.map(item =>
          item.index === searchIndex
            ? { ...item, answers: data, status: answerStatus }
            : item,
        ),
      );
      setLoadingQuestions(prev => ({ ...prev, [searchIndex]: false }));
    }
  };

  const renderItem = (item: Answer) => {
    if (item === undefined) {
      return null;
    }
    switch (item.type) {
      case "text":
        return <Typography.Text>{item.content}</Typography.Text>;
      case "markdown":
        return (
          <ReactMarkdown
            components={{
              // eslint-disable-next-line react/prop-types,react/display-name
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  {children}
                </a>
              ),
            }}
          >
            {item.content || ""}
          </ReactMarkdown>
        );
      case "link":
        return (
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.content}
          </a>
        );
      case "button":
        return (
          <Button onClick={() => eval(item.onClick || "")}>
            {item.content}
          </Button>
        );
      case "image":
        return (
          <img src={item.src} alt={item.alt} style={{ maxWidth: "100%" }} />
        );
      case "error":
        return (
          <div>
            <Typography.Text>{item.content}</Typography.Text>
          </div>
        );
      default:
        return null;
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setAISearch(false);
    setResults([]);
    setSearchIndex(0);
  };

  const onAISearchClick = useCallback(() => {
    setAISearch(true);
    setSearchIndex(searchIndex + 1);
    handleSearch(searchText.trim(), searchIndex);
    console.log("on ai search click");
    setSearchText("");
  }, [searchIndex, handleSearch, searchText]);

  const handleInputKeyPress = useCallback(
    e => {
      const hasSearchQuery = searchText.trim().length > 0;
      if (e.key === "Enter" && hasSearchQuery) {
        if (!isModalVisible) {
          onChangeLocation({
            pathname: "search",
            query: { q: searchText.trim() },
          });
        } else {
          onAISearchClick();
        }
      }
    },
    [searchText, isModalVisible, onAISearchClick, onChangeLocation],
  );

  const searchInputTip = isAISearch
    ? t`Ask a follow up question...`
    : t`Search or ask...`;

  return (
    <>
      <style>
        {`
          .ai-modal .ant-modal-content {
            padding: 14px !important;
          }
        `}
      </style>

      <SearchBarRoot data-custom="search bar" ref={container}>
        <SearchInputContainer
          isActive={isActive}
          onClick={handleInputClick}
          style={{ maxWidth: "80em" }}
        >
          <SearchIcon name="search" isActive={isActive} />
          <SearchInput
            isActive={isActive}
            value={searchText}
            placeholder={t`Search` + "…"}
            maxLength={200}
            onChange={onTextChange}
            onKeyPress={handleInputKeyPress}
            // ref={searchInput}
          />
          {isSmallScreen() && isActive && (
            <CloseSearchButton onClick={handleClickOnClose}>
              <Icon name="close" />
            </CloseSearchButton>
          )}
        </SearchInputContainer>

        <Modal
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={"35%"}
          destroyOnClose={true}
          closable={false}
          className="ai-modal"
          bodyStyle={{
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <SearchInputContainer
            style={{ maxWidth: "80em" }}
            isActive={isActive}
            onClick={onInputContainerClick}
          >
            <SearchIcon name="search" isActive={isActive} />
            <SearchInput
              isActive={isActive}
              value={searchText}
              placeholder={searchInputTip}
              maxLength={500}
              onChange={onTextChange}
              onKeyPress={handleInputKeyPress}
              ref={searchInput}
              style={{ height: "48px", fontSize: "16px" }}
            />
            {isSmallScreen() && isActive && (
              <CloseSearchButton onClick={handleClickOnClose}>
                <Icon name="close" />
              </CloseSearchButton>
            )}
          </SearchInputContainer>
          {isModalVisible &&
            (isAISearch ? (
              <List
                style={{ marginTop: 20 }}
                bordered
                dataSource={results.slice().reverse()}
                renderItem={item => (
                  <List.Item key={item.index}>
                    <div>
                      {loadingQuestions[item.index] ? (
                        <div
                          style={{
                            textAlign: "left",
                            marginTop: 10,
                            marginBottom: 10,
                            paddingBottom: 10,
                          }}
                        >
                          <div style={{ display: "flex" }}>
                            <Spin size="default" />
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                marginTop: "-6px",
                                marginLeft: "10px",
                              }}
                            >
                              {item.question}
                            </div>
                          </div>
                          {item.answers.map((answer, index) => (
                            <div key={index}>{renderItem(answer)}</div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              textAlign: "left",
                              paddingTop: 10,
                              paddingBottom: 10,
                            }}
                          >
                            {item.status === "success" ? (
                              <CheckCircleTwoTone style={{ fontSize: 24 }} />
                            ) : (
                              <CloseCircleTwoTone
                                style={{ fontSize: 24 }}
                                twoToneColor="#eb2f96"
                              />
                            )}
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                marginTop: "-4px",
                                marginLeft: "10px",
                              }}
                            >
                              {item.question}
                            </div>
                          </div>
                          {item.answers.map((answer, index) => (
                            <div key={index}>{renderItem(answer)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <SearchResultsFloatingContainer style={{ marginTop: "25px" }}>
                {hasSearchText ? (
                  <div>
                    <Button
                      icon={
                        <BulbOutlined
                          style={{
                            fontSize: "22px",
                            marginLeft: "5px",
                            color: "#1594C3FF",
                          }}
                        />
                      }
                      iconPosition={"start"}
                      style={{
                        width: "100%",
                        fontSize: "16px",
                        backgroundColor: "#FFFFFF",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        maxHeight: "500px",
                        borderBottomLeftRadius: "0px",
                        borderBottomRightRadius: "0px",
                        minHeight: "68px",
                        height: "auto",
                        marginBottom: "-5px",
                      }}
                      onClick={() => onAISearchClick()}
                    >
                      <div
                        style={{
                          width: "100%",
                          display: "block",
                          textAlign: "left",
                          marginLeft: "5px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            marginTop: "4px",
                            marginBottom: "2px",
                            color: "black",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          Can you tell me about{" "}
                          <span style={{ color: "#1594C3FF" }}>
                            {searchText.trim()}
                          </span>
                          ?
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "gray",
                            marginTop: "4px",
                            marginLeft: "2px",
                          }}
                        >
                          Use AI to answer your question
                        </div>
                      </div>
                    </Button>
                    <SearchResultsContainer
                      style={{
                        border: "0px",
                        boxShadow: "none",
                        borderBottomLeftRadius: "8px",
                        borderBottomRightRadius: "8px",
                      }}
                      onClick={handleModalClose}
                    >
                      <SearchResults
                        searchText={searchText.trim()}
                        user={user}
                        version={2}
                      />
                    </SearchResultsContainer>
                  </div>
                ) : (
                  <div onClick={handleModalClose}>
                    <RecentsList
                      style={{
                        border: "0px",
                        boxShadow: "none",
                        borderBottomLeftRadius: "8px",
                        borderBottomRightRadius: "8px",
                      }}
                    />
                  </div>
                )}
              </SearchResultsFloatingContainer>
            ))}
        </Modal>
      </SearchBarRoot>
    </>
  );
}

export default _.compose(
  withRouter,
  connect(null, mapDispatchToProps),
)(AISearchBar);
