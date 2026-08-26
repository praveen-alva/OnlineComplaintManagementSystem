import React, { useState } from "react";
import axios from "axios";
import {
  FiMessageCircle,
  FiX,
  FiMinus,
  FiSend,
} from "react-icons/fi";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 How can I help you with your complaint?",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/chat`, {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            res.data.reply ||
            "Sorry, I didn't get a response.",
        },
      ]);
    } catch (error) {
      console.error(
        "❌ Gemini Chat Error:",
        error.response?.data || error.message
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Sorry 😔 I couldn't process your request right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // =====================================================
  // OPEN CHAT
  // =====================================================

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  // =====================================================
  // CLOSE CHAT
  // =====================================================

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // =====================================================
  // MINIMIZE CHAT
  // =====================================================

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  // =====================================================
  // CHAT ICON
  // =====================================================

  if (!isOpen) {
    return (
      <button
        onClick={openChat}
        className="
          fixed
          bottom-6
          right-6
          z-50
          w-16
          h-16
          rounded-full
          bg-blue-600
          hover:bg-blue-700
          text-white
          shadow-xl
          flex
          items-center
          justify-center
          transition-all
          duration-200
          hover:scale-110
        "
        title="Open AI Assistant"
      >
        <FiMessageCircle size={30} />
      </button>
    );
  }

  // =====================================================
  // MINIMIZED CHAT
  // =====================================================

  if (isMinimized) {
    return (
      <div
        className="
          fixed
          bottom-6
          right-6
          z-50
          bg-white
          rounded-xl
          shadow-2xl
          border
          overflow-hidden
          w-72
        "
      >
        <div
          className="
            bg-blue-600
            text-white
            px-4
            py-3
            flex
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-2">
            <FiMessageCircle size={20} />

            <div>
              <h3 className="font-semibold text-sm">
                ResolveNow AI
              </h3>

              <p className="text-[10px] opacity-80">
                Complaint Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="
                p-1.5
                rounded
                hover:bg-blue-700
                transition
              "
              title="Open"
            >
              <FiMessageCircle size={16} />
            </button>

            <button
              onClick={closeChat}
              className="
                p-1.5
                rounded
                hover:bg-blue-700
                transition
              "
              title="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // FULL CHATBOX
  // =====================================================

  return (
    <div
      className="
        fixed
        bottom-6
        right-6
        z-50
        w-[360px]
        max-w-[calc(100vw-30px)]
        bg-white
        rounded-2xl
        shadow-2xl
        border
        overflow-hidden
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          bg-blue-600
          text-white
          px-4
          py-3
          flex
          items-center
          justify-between
        "
      >
        {/* Logo + Title */}

        <div className="flex items-center gap-3">
          <div
            className="
              w-9
              h-9
              rounded-full
              bg-white/20
              flex
              items-center
              justify-center
            "
          >
            🤖
          </div>

          <div>
            <h3 className="font-semibold">
              ResolveNow AI
            </h3>

            <p className="text-xs opacity-80">
              Complaint Assistant
            </p>
          </div>
        </div>

        {/* Header buttons */}

        <div className="flex items-center gap-1">
          {/* Minimize */}

          <button
            onClick={minimizeChat}
            className="
              p-2
              rounded-lg
              hover:bg-blue-700
              transition
            "
            title="Minimize"
          >
            <FiMinus size={18} />
          </button>

          {/* Close */}

          <button
            onClick={closeChat}
            className="
              p-2
              rounded-lg
              hover:bg-blue-700
              transition
            "
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      <div
        className="
          h-[360px]
          overflow-y-auto
          p-4
          space-y-3
          bg-gray-50
        "
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[80%]
                px-3
                py-2
                rounded-2xl
                text-sm
                break-words
                ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white border text-gray-800 rounded-bl-md shadow-sm"
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading */}

        {loading && (
          <div className="flex justify-start">
            <div
              className="
                bg-white
                border
                px-4
                py-2
                rounded-2xl
                text-sm
                text-gray-500
              "
            >
              <span className="animate-pulse">
                Gemini is typing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          INPUT
      ================================================= */}

      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">

          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask something..."
            disabled={loading}
            className="
              flex-1
              border
              border-gray-300
              rounded-xl
              px-3
              py-2.5
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500
              disabled:bg-gray-100
            "
          />

          <button
            onClick={sendMessage}
            disabled={
              loading || !message.trim()
            }
            className="
              w-10
              h-10
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              flex
              items-center
              justify-center
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
            title="Send"
          >
            <FiSend size={18} />
          </button>

        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2">
          AI Assistant • ResolveNow
        </p>
      </div>
    </div>
  );
};

export default ChatBot;