import { Suspense } from "react";
import { CURRENT_USER, HOSPITAL_NAME } from "@/lib/constants";

// Ngày hiện tại chỉ có lúc render, nên bọc trong Suspense để không bị cố định khi prerender
function TodayLabel() {
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  return <span className="capitalize">{today}</span>;
}

export default function Header({ title }) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <div className="min-w-0">
        <div className="text-xs text-slate-500">
          {HOSPITAL_NAME} · <Suspense fallback={null}><TodayLabel /></Suspense>
        </div>
        <h1 className="truncate text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 text-sm font-medium text-slate-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-slate-500" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path strokeLinecap="round" d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
        <span>{CURRENT_USER.name}</span>
      </div>
    </header>
  );
}
