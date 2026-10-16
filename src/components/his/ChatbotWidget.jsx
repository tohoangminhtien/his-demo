"use client";

import { useState } from "react";

const CHATBOT_URL =
  "https://staging-tester-cagent-frontend.3hhgm5.easypanel.host/chatbot/3ed680cf-2635-461d-8599-04706ce8d36b";

// Nút chatbot nổi ở góc phải dưới; bấm để mở/đóng khung iframe
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  // Chỉ nạp iframe lần đầu mở, sau đó giữ lại để không mất hội thoại khi đóng
  const [loaded, setLoaded] = useState(false);

  function toggle() {
    setLoaded(true);
    setOpen((v) => !v);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {loaded && (
        <div
          className={`h-[600px] max-h-[calc(100vh-6rem)] w-[400px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl ${
            open ? "block" : "hidden"
          }`}
        >
          <iframe
            src={CHATBOT_URL}
            title="Chatbot"
            className="h-full w-full border-0"
            allow="microphone; clipboard-write"
          />
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Đóng chatbot" : "Mở chatbot"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:bg-sky-700"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="8" width="16" height="11" rx="3" />
            <path d="M12 8V4M9 13h.01M15 13h.01M9.5 16.5h5" />
            <circle cx="12" cy="3.5" r="1" />
          </svg>
        )}
      </button>
    </div>
  );
}
