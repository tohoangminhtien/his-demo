import { toDateStr } from "./utils";

// Các ngày từ `from` đến `to` (gồm cả hai đầu), dạng YYYY-MM-DD
function eachDay(from, to) {
  const days = [];
  for (const d = new Date(`${from}T00:00`); toDateStr(d) <= to; d.setDate(d.getDate() + 1)) {
    days.push(toDateStr(d));
  }
  return days;
}

// Báo cáo các ngày nghỉ phép của người hành nghề theo khoảng ngày.
// Chỉ liệt kê ngày có trạng thái Nghỉ phép; đơn bị từ chối không tính. Thiếu ngày bắt đầu/kết thúc thì lấy theo phạm vi dữ liệu có sẵn.
export function buildLeaveReport(data, { code = "", name = "", start = "", end = "" }) {
  const dataDates = [
    ...data.leaves.flatMap((l) => [l.startDate, l.endDate]),
    ...data.schedules.map((s) => s.workDate),
  ].filter(Boolean);
  const from = start || dataDates.reduce((min, d) => (d < min ? d : min), "9999-12-31");
  const to = end || dataDates.reduce((max, d) => (d > max ? d : max), "0000-01-01");

  if (from > to) return { error: "Ngày bắt đầu phải trước hoặc trùng ngày kết thúc.", rows: [] };

  const codeKey = code.trim().toLowerCase();
  const nameKey = name.trim().toLowerCase();
  const people = data.practitioners.filter(
    (p) => (!codeKey || p.code.toLowerCase().includes(codeKey)) && (!nameKey || p.name.toLowerCase().includes(nameKey)),
  );
  const days = eachDay(from, to);

  const rows = [];
  for (const person of people) {
    const leaves = data.leaves.filter((l) => l.practitionerId === person.id && l.status !== "Từ chối");
    for (const day of days) {
      const covering = leaves.filter((l) => l.startDate <= day && day <= l.endDate);
      if (covering.length === 0) continue;
      rows.push({
        id: `${person.id}-${day}`,
        name: person.name,
        code: person.code,
        date: day,
        status: "Nghỉ phép",
        reason: covering.map((l) => (l.reason ? `${l.type} - ${l.reason}` : l.type)).join("; "),
        approval: covering.some((l) => l.status === "Đã duyệt") ? "Đã duyệt" : "Chưa duyệt",
      });
    }
  }

  // Tên tăng dần, cùng người thì ngày giảm dần
  rows.sort((a, b) => a.name.localeCompare(b.name, "vi") || a.code.localeCompare(b.code) || b.date.localeCompare(a.date));
  return { rows };
}
