"use client";

import { useHis } from "@/hooks/useHisState";
import { MODULES } from "@/lib/modules";
import { fmtDateTime, toDateStr } from "@/lib/utils";
import Panel from "./Panel";

const TONES = {
  sky: "border-sky-500 text-sky-700",
  amber: "border-amber-500 text-amber-700",
  emerald: "border-emerald-500 text-emerald-700",
  violet: "border-violet-500 text-violet-700",
  rose: "border-rose-500 text-rose-700",
  slate: "border-slate-500 text-slate-700",
};

function StatCard({ label, value, hint, tone }) {
  return (
    <div className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${TONES[tone]}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

export default function Dashboard() {
  const { state: data } = useHis();
  if (!data) return <p className="text-sm text-slate-500">Đang tải dữ liệu HIS...</p>;

  const today = toDateStr(new Date());
  const activePractitioners = data.practitioners.filter((p) => p.status === "Đang công tác").length;
  const pendingLeaves = data.leaves.filter((l) => l.status === "Chờ duyệt");
  const todayShifts = data.schedules.filter((s) => s.workDate === today);
  const todayRecords = data.records.filter((r) => r.receivedAt.startsWith(today)).length;
  const unsignedOrders = data.orders.filter((o) => o.status === "Mới tạo").length;
  const todayLogs = data.logs.filter((l) => l.time.startsWith(today)).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Người hành nghề"
          value={activePractitioners}
          hint={`Đang công tác / ${data.practitioners.length} hồ sơ`}
          tone="sky"
        />
        <StatCard
          label="Đơn nghỉ chờ duyệt"
          value={pendingLeaves.length}
          hint="Cần phê duyệt của đơn vị quản lý"
          tone="amber"
        />
        <StatCard
          label="Ca làm việc/trực hôm nay"
          value={todayShifts.length}
          hint={`${todayShifts.filter((s) => s.category === "Lịch trực").length} ca trực`}
          tone="emerald"
        />
        <StatCard label="Hồ sơ KCB hôm nay" value={todayRecords} hint="Tiếp nhận trong ngày" tone="violet" />
        <StatCard
          label="Y lệnh chờ ký"
          value={unsignedOrders}
          hint={`Tổng ${data.orders.length} y lệnh`}
          tone="rose"
        />
        <StatCard label="Thao tác hôm nay" value={todayLogs} hint="Ghi trong nhật ký hệ thống" tone="slate" />
      </div>

      <Panel title="Nhật ký hệ thống gần đây">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Thời điểm</th>
                <th className="px-3 py-2 font-semibold">Tài khoản</th>
                <th className="px-3 py-2 font-semibold">Thao tác</th>
                <th className="px-3 py-2 font-semibold">Phân hệ</th>
                <th className="px-3 py-2 font-semibold">Đối tượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.logs.slice(0, 6).map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fmtDateTime(l.time)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.account}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.action}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.module}</td>
                  <td className="px-3 py-2 text-slate-600">{l.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Xem đầy đủ tại mục {MODULES.logs.label}.
        </p>
      </Panel>
    </div>
  );
}
