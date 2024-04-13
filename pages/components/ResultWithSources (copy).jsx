import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const MessageItem = ({ message, pngFile, isLast }) => {
  const userImage = "/assets/images/dani.png";
  const botImage = `/assets/images/itaca_logo_2.png`;
  const [showSources, setShowSources] = useState(false);

  // Define styles for messages
  const messageStyles = {
    user: "bg-white text-black rounded",
    bot: "bg-cyan-600 text-white rounded",
  };

  return (
    <div className={`flex flex-col ${isLast ? "flex-grow" : ""}`}>
      <div
        className={`flex items-center mb-4 ${
          message.type === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <div className="rounded-full mr-4 h-10 relative overflow-hidden">
          <Image
            src={message.type === "user" ? userImage : botImage}
            alt={`${message.type}'s profile`}
            width={40}
            height={40}
            className="rounded"
            priority
            unoptimized
          />
        </div>
        <p
          className={`p-2 ${messageStyles[message.type]}`}
          style={{ maxWidth: "90%" }}
        >
          {message.text}
        </p>
      </div>

      {message.sourceDocuments && (
        <div className="mb-6">
          <button
            className="text-gray-600 text-sm font-bold"
            onClick={() => setShowSources(!showSources)}
          >
            Source Documents {showSources ? "(Hide)" : "(Show)"}
          </button>
          {showSources &&
            message.sourceDocuments.map((document, docIndex) => (
              <div key={docIndex}>
                <h3 className="text-gray-600 text-sm font-bold">
                  Source {docIndex + 1}:
                </h3>
                <p className="text-gray-800 text-sm mt-2">
                  {document.pageContent}
                </p>
                <pre className="text-xs text-gray-500 mt-2">
                  {JSON.stringify(document.metadata, null, 2)}
                </pre>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const ResultWithSources = ({ messages, pngFile, maxMsgs }) => {
  const messagesContainerRef = useRef();

  useEffect(() => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const maxMsgToScroll = maxMsgs || 5;

  return (
    <div
      ref={messagesContainerRef}
      className={`bg-white p-10 rounded-sm shadow-md mb-8 overflow-y-auto h-[500px] max-h-[500px] flex flex-col space-y-4 ${
        messages && messages.length < maxMsgToScroll ? "justify-end" : ""
      }`}
    >
      {messages && // Added check for messages to be defined
        messages.map((message, index) => (
          <MessageItem key={index} message={message} pngFile={pngFile} />
        ))}
    </div>
  );
};

export default ResultWithSources;
