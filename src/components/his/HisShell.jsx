"use client";

import { usePathname } from "next/navigation";
import { HisContext, useHisState } from "@/hooks/useHisState";
import { titleOf } from "@/lib/modules";
import ChatbotWidget from "./ChatbotWidget";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Khung chung của ứng dụng: sidebar, header và state HIS. Layout này không remount khi chuyển trang.
export default function HisShell({ children }) {
  const his = useHisState();
  const pathname = usePathname();

  // Luôn render children, kể cả khi dữ liệu chưa nạp xong; từng trang tự hiển thị trạng thái đang tải
  return (
    <HisContext.Provider value={his}>
      <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-800">
        <Sidebar pathname={pathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={titleOf(pathname)} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <ChatbotWidget />
    </HisContext.Provider>
  );
}
