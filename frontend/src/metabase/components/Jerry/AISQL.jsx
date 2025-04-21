import React, { useState, useCallback } from "react";
import { t } from "ttag";
import cx from "classnames";
import PropTypes from "prop-types";

import { Modal, Input, Button, message, Spin, Alert } from "antd";
import Tooltip from "metabase/core/components/Tooltip";
import Icon from "metabase/components/Icon";
import CodeDiff from "metabase/components/Jerry/CodeDiff";

const AISQL = ({ editor, className, size }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSql, setGeneratedSql] = useState(null);
  const [originalSql, setOriginalSql] = useState(null);

  const showModal = useCallback(() => {
    const currentEditorSql = editor?.getValue ? editor.getValue() : "";
    setOriginalSql(currentEditorSql);

    setInputValue("");
    setGeneratedSql(null);
    setIsLoading(false); // Ensure loading is reset
    setIsModalVisible(true);
  }, [editor]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    // Optionally reset input value on cancel if desired
    // setInputValue("");
  }, []);

  const handleInputChange = useCallback(e => {
    setInputValue(e.target.value);
  }, []);

  const handleSend = useCallback(async () => {
    // Trim input to check if it's just whitespace
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      message.warning(t`Please enter a description first.`);
      return; // Don't send if input is empty or only whitespace
    }

    setIsLoading(true);
    // setGeneratedSql(null); // Reset previous results if needed

    try {
      const response = await fetch(`/api/jerry/extend`, {
        // Replace with your actual API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any other necessary headers like Authorization if needed
        },
        body: JSON.stringify({
          call: "post",
          service_name: "ai_sql",
          body: {
            prompt: trimmedInput,
          },
          timeout: 60000,
        }),
      });

      if (!response.ok) {
        // Try to get error message from backend response body
        let errorDetail = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || errorDetail;
        } catch (e) {
          // Ignore if response body is not JSON or empty
        }
        throw new Error(errorDetail);
      }

      const result = await response.json();

      const newSql = result.sql || (typeof result === "string" ? result : ""); // Extract SQL safely
      if (typeof newSql !== "string") {
        console.error(
          "API response did not contain a valid SQL string:",
          result,
        );
        throw new Error(t`Received invalid format from AI.`);
      }
      setGeneratedSql(newSql);

      message.success(t`SQL generated successfully!`);
      // setIsModalVisible(false); // Close modal on success
      // setInputValue(""); // Clear input field on success
    } catch (error) {
      console.error("Error fetching generated SQL:", error);
      message.error(t`Failed to generate SQL: ${error.message}`);
      setGeneratedSql(null);
      setOriginalSql(null);
    } finally {
      setIsLoading(false); // Ensure loading state is turned off
    }
  }, [inputValue]);

  // const handleKeyPress = useCallback((e) => {
  //   // Check if Enter is pressed (without Shift for multiline input)
  //   // and if the input is not empty and not currently loading
  //   if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isLoading) {
  //     e.preventDefault(); // Prevent default Enter behavior (like adding a newline)
  //     handleSend(); // Trigger the send action
  //   }
  // }, [handleSend, inputValue, isLoading]);

  const isSendDisabled = !inputValue.trim() || isLoading;
  const showDiffView = generatedSql !== null && !isLoading;

  const handleDone = useCallback(() => {
    if (generatedSql !== null && editor?.setValue) {
      try {
        editor.setValue(generatedSql, 1); // Use setValue or equivalent method of your editor
        message.success(t`SQL updated successfully!`);
        setIsModalVisible(false); // Close modal after applying
      } catch (error) {
        console.error("Error setting editor value:", error);
        message.error(t`Failed to update editor content.`);
      }
    } else {
      message.error(
        t`Cannot apply SQL. No generated SQL or editor unavailable.`,
      );
      console.error("handleDone called incorrectly:", { generatedSql, editor });
    }
  }, [generatedSql, editor]);

  const handleBackToEdit = useCallback(() => {
    setGeneratedSql(null);
  }, []);

  const getModalFooter = () => {
    if (showDiffView) {
      // Footer for Diff View: Cancel and Done
      return [
        <Button key="back" onClick={handleCancel}>
          {t`Cancel`}
        </Button>,
        // *** NEW BUTTON ***
        <Button key="edit" onClick={handleBackToEdit}>
          {t`Back to Edit`}
        </Button>,
        <Button
          key="done"
          type="primary"
          onClick={handleDone}
          disabled={!editor?.setValue}
        >
          {t`Done`}
        </Button>,
      ];
    } else {
      // Footer for Input View: Cancel and Send
      return [
        <Button key="back" onClick={handleCancel} disabled={isLoading}>
          {t`Cancel`}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSend}
          disabled={isSendDisabled}
        >
          {/* Button text changes slightly during loading */}
          {isLoading ? t`Generating...` : t`Send`}
        </Button>,
      ];
    }
  };

  return (
    <>
      <Tooltip tooltip={t`Open Metabase SQL AI`}>
        <a className={cx(className, "transition-color text-brand-hover")}>
          <Icon name="insight" size={size} onClick={showModal} />
        </a>
      </Tooltip>

      <Modal
        title={t`Generate SQL with AI`}
        width={"50%"}
        visible={isModalVisible}
        onCancel={handleCancel} // Handle closing the modal
        // We use a custom footer for more control over the Send button
        footer={getModalFooter()}
      >
        {isLoading && (
          // Loading State
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Spin size="large" />
            <p
              style={{ marginTop: "10px" }}
            >{t`Generating SQL, please wait...`}</p>
          </div>
        )}

        {!isLoading && !showDiffView && (
          // Input State
          <Input.TextArea
            rows={4}
            placeholder={t`Describe what data you want to query... (e.g., 'Show total users created last month')`}
            value={inputValue}
            onChange={handleInputChange}
            disabled={isLoading} // Should always be false here, but safe check
          />
        )}

        {showDiffView && (
          // Diff View State
          <>
            <Alert
              message={t`Generated SQL based on your request.`}
              description={t`Review the differences below. Click 'Done' to replace the editor content or 'Cancel' to discard.`}
              type="info"
              showIcon
              style={{ marginBottom: "15px" }}
            />
            <CodeDiff
              oldValue={originalSql ?? ""}
              newValue={generatedSql ?? ""}
            />
          </>
        )}
      </Modal>
    </>
  );
};

AISQL.propTypes = {
  editor: PropTypes.object,
  className: PropTypes.string,
  size: PropTypes.number,
};

export default AISQL;
