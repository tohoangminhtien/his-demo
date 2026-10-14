import Link from "next/link";
import { HOSPITAL_NAME } from "@/lib/constants";
import { NAV } from "@/lib/modules";

export default function Sidebar({ pathname }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#0b4f8a] text-white">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-sky-200">HIS Demo</div>
        <div className="mt-0.5 text-base font-semibold leading-tight">{HOSPITAL_NAME}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((group) => (
          <div key={group.group} className="mb-4">
            <div className="px-5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sky-200/70">
              {group.group}
            </div>
            {group.items.map((item) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center border-l-4 px-5 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "border-amber-400 bg-white/15 font-semibold"
                      : "border-transparent text-sky-50 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
