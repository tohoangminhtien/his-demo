const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
};

const TONE_BY_STATUS = {
  "Đang công tác": "green",
  "Tạm ngưng": "gray",
  "Chờ duyệt": "amber",
  "Đã duyệt": "green",
  "Từ chối": "red",
  "Mới tạo": "amber",
  "Đã ký": "blue",
  "Đã thực hiện": "green",
  "Đi làm": "green",
  "Nghỉ phép": "blue",
  "Chưa duyệt": "amber",
};

export default function Badge({ value }) {
  const tone = TONES[TONE_BY_STATUS[value]] ?? TONES.gray;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {value}
    </span>
  );
}
