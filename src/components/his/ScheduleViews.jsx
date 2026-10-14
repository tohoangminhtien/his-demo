"use client";

import { useMemo, useState } from "react";
import { useHis } from "@/hooks/useHisState";
import { lookup, nameOf } from "@/lib/modules";
import { buildLeaveReport } from "@/lib/reports";
import { fmtDate } from "@/lib/utils";
import Badge from "./Badge";
import Panel from "./Panel";

const LOADING = <p className="text-sm text-slate-500">Đang tải dữ liệu HIS...</p>;
const INPUT =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200";
const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500";
const TD = "px-4 py-3 text-sm text-slate-700";

const FilterInput = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
    <input {...props} className={INPUT} />
  </label>
);

// Đơn nghỉ đang chờ duyệt
export function PendingLeavesView() {
  const { state: data } = useHis();
  if (!data) return LOADING;

  const pending = data.leaves.filter((l) => l.status === "Chờ duyệt");

  return (
    <Panel title="Đơn nghỉ đang chờ duyệt">
      {pending.length === 0 ? (
        <p className="text-sm text-slate-400">Không có đơn nào chờ duyệt.</p>
      ) : (
        <div className="-m-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className={TH}>Người hành nghề</th>
                <th className={TH}>Loại nghỉ</th>
                <th className={TH}>Từ ngày</th>
                <th className={TH}>Đến ngày</th>
                <th className={TH}>Đơn vị quản lý</th>
                <th className={TH}>Lý do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pending.map((l) => (
                <tr key={l.id} className="hover:bg-sky-50/60">
                  <td className={TD}>{nameOf(data, "practitioners", l.practitionerId)}</td>
                  <td className={TD}>{l.type}</td>
                  <td className={TD}>{fmtDate(l.startDate)}</td>
                  <td className={TD}>{fmtDate(l.endDate)}</td>
                  <td className={TD}>{l.managingUnit}</td>
                  <td className={TD}>{l.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// Danh sách lịch theo loại (Ca làm việc / Lịch trực), có lọc theo mã, tên và khoảng ngày
function ScheduleList({ title, matches }) {
  const { state: data } = useHis();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const c = code.trim().toLowerCase();
    const n = name.trim().toLowerCase();
    return data.schedules
      .filter(matches)
      .map((s) => ({ s, person: lookup(data, "practitioners", s.practitionerId) }))
      .filter(({ s, person }) => {
        if (c && !person?.code.toLowerCase().includes(c)) return false;
        if (n && !person?.name.toLowerCase().includes(n)) return false;
        if (start && s.workDate < start) return false;
        if (end && s.workDate > end) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (a.person?.name ?? "").localeCompare(b.person?.name ?? "", "vi") || b.s.workDate.localeCompare(a.s.workDate),
      );
  }, [data, code, name, start, end, matches]);

  if (!data) return LOADING;

  return (
    <Panel title={title}>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <FilterInput
          label="Mã người hành nghề"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ví dụ: MDD-0001"
        />
        <FilterInput
          label="Tên người hành nghề"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn An"
        />
        <FilterInput label="Từ ngày" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <FilterInput label="Đến ngày" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>

      <p className="mb-3 text-sm text-slate-500">{rows.length} bản ghi</p>
      <div className="-m-4 max-h-[60vh] overflow-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              <th className={TH}>Mã định danh</th>
              <th className={TH}>Người hành nghề</th>
              <th className={TH}>Ngày</th>
              <th className={TH}>Ca làm việc/trực</th>
              <th className={TH}>Loại lịch</th>
              <th className={TH}>Đơn vị</th>
              <th className={TH}>Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ s, person }) => (
              <tr key={s.id} className="hover:bg-sky-50/60">
                <td className={TD}>{person?.code ?? "—"}</td>
                <td className={TD}>{person?.name ?? "—"}</td>
                <td className={TD}>{fmtDate(s.workDate)}</td>
                <td className={TD}>{s.shift}</td>
                <td className={TD}>{s.category}</td>
                <td className={TD}>{s.unit}</td>
                <td className={TD}>{s.note || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// Các hàm lọc khai báo ngoài component để giữ tham chiếu ổn định cho useMemo
const isDuty = (s) => s.category === "Lịch trực";
const isWorkShift = (s) => s.category !== "Lịch trực";

export function WorkShiftsView() {
  return <ScheduleList title="Ca làm việc" matches={isWorkShift} />;
}

export function DutyScheduleView() {
  return <ScheduleList title="Lịch trực" matches={isDuty} />;
}

// Báo cáo lịch từng ngày của người hành nghề; cập nhật ngay khi thay đổi bộ lọc
export function LeaveReportView() {
  const { state: data } = useHis();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const report = useMemo(
    () => (data ? buildLeaveReport(data, { code, name, start, end }) : { rows: [] }),
    [data, code, name, start, end],
  );

  if (!data) return LOADING;

  return (
    <Panel title="Báo cáo dữ liệu nghỉ phép">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <FilterInput
          label="Mã người hành nghề"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ví dụ: MDD-0001"
        />
        <FilterInput
          label="Tên người hành nghề"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn An"
        />
        <FilterInput label="Từ ngày" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <FilterInput label="Đến ngày" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>

      {report.error ? (
        <p className="text-sm text-rose-600">{report.error}</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">{report.rows.length} ngày nghỉ phép</p>
          <div className="-m-4 max-h-[60vh] overflow-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className={TH}>Người hành nghề</th>
                  <th className={TH}>Ngày</th>
                  <th className={TH}>Trạng thái</th>
                  <th className={TH}>Lý do</th>
                  <th className={TH}>Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.rows.map((r) => (
                  <tr key={r.id} className="hover:bg-sky-50/60">
                    <td className={TD}>
                      {r.name} <span className="text-xs text-slate-400">({r.code})</span>
                    </td>
                    <td className={TD}>{fmtDate(r.date)}</td>
                    <td className={TD}>
                      <Badge value={r.status} />
                    </td>
                    <td className={TD}>{r.reason}</td>
                    <td className={TD}>
                      <Badge value={r.approval} />
                    </td>
                  </tr>
                ))}
                {report.rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                      Không có dữ liệu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}

// Trang trống: chưa có dữ liệu chấm công
export function AttendanceReportView() {
  return <Panel title="Báo cáo dữ liệu chấm công" />;
}
