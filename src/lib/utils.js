const pad = (n) => String(n).padStart(2, "0");

// Chuỗi ngày theo giờ địa phương: YYYY-MM-DD và YYYY-MM-DDTHH:mm
export function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toDateTimeStr(d) {
  return `${toDateStr(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const nowDateTime = () => toDateTimeStr(new Date());

// Mốc thời gian tương đối so với hôm nay, ví dụ at(-1, "08:00")
export function at(dayOffset, time = "00:00") {
  const d = new Date();
  const [h, m] = time.split(":").map(Number);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return toDateTimeStr(d);
}

export const day = (dayOffset) => at(dayOffset).slice(0, 10);

export function newId(prefix) {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}${Date.now().toString(36)}${rand}`.toUpperCase();
}

export function fmtDate(value) {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function fmtDateTime(value) {
  if (!value) return "—";
  return `${value.slice(11, 16)} ${fmtDate(value)}`;
}
