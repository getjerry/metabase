import React from "react";
// import React, {useEffect, useRef, useState} from 'react';
// import Cookies from "js-cookie";
// import {FullscreenOutlined, MinusOutlined, ArrowsAltOutlined} from '@ant-design/icons';
// import {Button, Modal} from 'antd';
// import Tooltip from "metabase/core/components/Tooltip";
//
// const loadingOverlayStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   background: "rgba(255, 255, 255, 0.8)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   zIndex: 9999,
// };
//
// const loadingSpinnerStyle = {
//   border: "4px solid rgba(0, 0, 0, 0.3)",
//   borderTop: "4px solid #007bff",
//   borderRadius: "50%",
//   width: "40px",
//   height: "40px",
//   animation: "spin 1s linear infinite",
// };

// eslint-disable-next-line react/prop-types
export function ChatAiSample({
  card,
  user,
  isMinimized,
  tableFunc,
  tableComponent,
}) {
  // eslint-disable-next-line react/prop-types
  // const questionName = card.name;

  // function chatDataEnv() {
  //   try {
  //     return Cookies.get("chatdata.dev") || false;
  //   } catch (e) {
  //     console.error("get chatdata dev error:", e);
  //     return false;
  //   }
  // }
  //
  // function getChatUrl(auth = "read") {
  //   if (loadIframe.open || auth === "read") {
  //     // eslint-disable-next-line react/prop-types
  //     const questionId = 1;
  //     // eslint-disable-next-line react/prop-types
  //     const userId = user.id;
  //     // eslint-disable-next-line react/prop-types
  //     const email = user.email;
  //     // eslint-disable-next-line react/prop-types
  //     const common_name = user.common_name;
  //     const crypto = require("crypto");
  //     const md5Hash = crypto.createHash("md5");
  //     const token =
  //       1 +
  //       common_name +
  //       email +
  //       userId.toString() +
  //       "jerry_data_team";
  //     md5Hash.update(token, "utf8");
  //     const md5Digest = md5Hash.digest("hex");
  //     const isDev = chatDataEnv();
  //     let page = "chat_session";
  //     if (auth === "all") {
  //       page = "chat";
  //     }
  //
  //     let baseUrl = "https://chatdata-prod.ing.getjerry.com/" + page;
  //     if (isDev === true || isDev === "true") {
  //       baseUrl = "https://chatdata.ing.getjerry.com/" + page;
  //     }
  //     baseUrl = "http://127.0.0.1:5500/" + page;
  //     // console.log("open chat ai", openUrl, iframeKey);
  //     return encodeURI(
  //       baseUrl +
  //       "?context_id=report_" +
  //       questionId +
  //       "&user_id=" +
  //       userId +
  //       "&email=" +
  //       email +
  //       "&common_name=" +
  //       common_name +
  //       "&report_name=" +
  //       questionName +
  //       "&token=" +
  //       md5Digest +
  //       "&from_metabase=true",
  //     );
  //   } else {
  //     return "";
  //   }
  // }
  //
  // const [buttonVisible, setButtonVisible] = useState(false);
  //
  // const handleMouseEnter = () => {
  //   setButtonVisible(true);
  // };
  //
  // const handleMouseLeave = () => {
  //   setButtonVisible(false);
  // };
  //
  // // full screen
  // // open ai data monkey
  //
  // const [loadIframe, setLoadIframe] = useState({
  //   open: false,
  //   isLoading: false,
  //   iframeKey: 0,
  // });
  //
  // const close = () => {
  //   setLoadIframe(prevState => ({
  //     open: false,
  //     isLoading: false,
  //     iframeKey: prevState.iframeKey,
  //   }));
  // };
  //
  // const handleIframeLoad = () => {
  //   setLoadIframe(prevState => ({
  //     open: true,
  //     isLoading: false,
  //     iframeKey: prevState.iframeKey,
  //   }));
  // };
  //
  // const handleFullScrrenClick = () => {
  //   setLoadIframe(prevState => ({
  //     open: true,
  //     isLoading: true,
  //     iframeKey: prevState.iframeKey + 1,
  //   }));
  // };
  //
  // // set minimized
  // const [minimized, setminimized] = useState(isMinimized);
  // const handleMinimizeClick = () => {
  //   setminimized(!minimized);
  //   const chatAiStyle = minimized ? 'maximized' : 'minimized';
  //   Cookies.set("chatdata.win.style", chatAiStyle, { expires: 30 });
  //   tableFunc(tableComponent, chatAiStyle);
  // };
  //
  //
  // const containerStyle = {
  //   width: minimized ? '200px' : '100%',
  //   height: minimized ? '40px' : '100%',
  //   backgroundColor: minimized ? "rgb(100, 116, 139, 0.1)" : '',
  //   zIndex: 1,
  //   transition: 'width 0.5s, height 0.5s, bottom 0.5s, right 0.5s',
  //   position: 'absolute',
  //   bottom: minimized ? '10px' : '0',
  //   right: minimized ? '0px' : '0',
  // };
  //
  // const buttonContainerStyle = {
  //   float: "right",
  //   // display: 'flex',
  //   // justifyContent: 'flex-end',
  //   marginRight: minimized ? '20px' : '30px',
  //   opacity: buttonVisible || minimized ? 1 : 0,
  //   transition: 'opacity 0.5s',
  //   zIndex: 2
  // };
  //
  // const iframeRef = useRef(null);
  //
  //
  // useEffect(() => {
  //   const handleMessage = (event) => {
  //     const message = event.data;
  //     if (message === "open chatdata full screen") {
  //       setLoadIframe(prevState => ({
  //         open: true,
  //         isLoading: true,
  //         iframeKey: prevState.iframeKey + 1,
  //       }));
  //     }
  //   };
  //
  //   window.addEventListener('message', handleMessage);
  //
  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //   };
  // }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/*<div style={containerStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>*/}
      {/*  <div style={{display: "flex", justifyContent: "space-between", marginTop: "5px"}}>*/}
      {/*    <div style={{*/}
      {/*      marginLeft: "20px", fontWeight: 800, fontSize: 20,*/}
      {/*      // margin:"0 auto",*/}
      {/*      float: "left",*/}
      {/*      // textAlign: "center"*/}
      {/*    }}>*/}
      {/*      AI analysis*/}
      {/*    </div>*/}
      {/*    <div style={buttonContainerStyle}>*/}
      {/*      {!minimized && (*/}
      {/*        <Tooltip tooltip="Full Screen">*/}
      {/*          <Button style={{marginRight: "6px", zIndex: 3}}*/}
      {/*                  icon={<FullscreenOutlined/>}*/}
      {/*                  size={"small"}*/}
      {/*                  onClick={handleFullScrrenClick}*/}
      {/*          />*/}
      {/*        </Tooltip>*/}
      {/*      )}*/}
      {/*      <Tooltip tooltip={minimized ? "Maximize" : "Minimize"}>*/}
      {/*        <Button style={{zIndex: 3}}*/}
      {/*                size={"small"}*/}
      {/*                icon={minimized ? <ArrowsAltOutlined/> : <MinusOutlined/>}*/}
      {/*                onClick={handleMinimizeClick}*/}
      {/*        />*/}
      {/*      </Tooltip>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  {!minimized && (*/}
      {/*    <div style={{width: "104%", height: "100%", marginLeft: "-16px", marginTop: "-16px", zIndex: 1}}>*/}
      {/*      <iframe*/}
      {/*        ref={iframeRef}*/}
      {/*        style={{width: "100%", height: "100%"}}*/}
      {/*        scrolling="true"*/}
      {/*        src={getChatUrl()}*/}
      {/*        frameBorder="0"*/}
      {/*        allow="clipboard-read; clipboard-write"*/}
      {/*        onClick={() => console.log('iframe clicked')}*/}
      {/*      ></iframe>*/}
      {/*    </div>*/}
      {/*  )}*/}

      {/*  <Modal*/}
      {/*    title={"ChatData - AI Data Monkey Just for You:  " + questionName}*/}
      {/*    centered*/}
      {/*    open={loadIframe.open}*/}
      {/*    onCancel={() => close()}*/}
      {/*    width="80%"*/}
      {/*    footer={[]}*/}
      {/*    bodyStyle={{height: "80vh", overflowY: "auto"}}*/}
      {/*  >*/}
      {/*    {loadIframe.isLoading && (*/}
      {/*      <div style={loadingOverlayStyle}>*/}
      {/*        <div style={loadingSpinnerStyle}></div>*/}
      {/*      </div>*/}
      {/*    )}*/}
      {/*    <div style={{height: "100%"}}>*/}
      {/*      <iframe*/}
      {/*        key={loadIframe.iframeKey}*/}
      {/*        width="98%"*/}
      {/*        style={{height: "98.5%"}}*/}
      {/*        scrolling="true"*/}
      {/*        onLoad={() => handleIframeLoad()}*/}
      {/*        src={getChatUrl("all")}*/}
      {/*        frameBorder="0"*/}
      {/*        allow="clipboard-read; clipboard-write"*/}
      {/*      ></iframe>*/}
      {/*    </div>*/}
      {/*  </Modal>*/}
      {/*</div>*/}
    </div>
  );
}
