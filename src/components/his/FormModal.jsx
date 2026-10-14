import { useState } from "react";
import { nowDateTime, toDateStr } from "@/lib/utils";

const INPUT =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200";

const resolveOptions = (field, data) => {
  const raw = typeof field.options === "function" ? field.options(data) : field.options ?? [];
  return raw.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
};

function initialValues(mod, row, data) {
  return Object.fromEntries(
    mod.fields.map((f) => {
      if (row) return [f.key, row[f.key] ?? ""];
      if (f.default === "now") return [f.key, nowDateTime()];
      if (f.default === "today") return [f.key, toDateStr(new Date())];
      if (f.type === "select") return [f.key, resolveOptions(f, data)[0]?.value ?? ""];
      return [f.key, ""];
    }),
  );
}

function Field({ field, value, data, onChange }) {
  const label = (
    <span className="mb-1 block text-xs font-medium text-slate-600">
      {field.label}
      {field.required && <span className="text-rose-500"> *</span>}
    </span>
  );

  let input;
  if (field.type === "select") {
    input = (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
        {!field.required && <option value="">— Chọn —</option>}
        {resolveOptions(field, data).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "textarea") {
    input = <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT} />;
  } else {
    const htmlType = field.type === "datetime" ? "datetime-local" : field.type === "date" ? "date" : "text";
    input = <input type={htmlType} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT} />;
  }

  return (
    <label className={`block ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
      {label}
      {input}
    </label>
  );
}

export default function FormModal({ mod, row, data, onSave, onClose }) {
  const [values, setValues] = useState(() => initialValues(mod, row, data));
  const [error, setError] = useState("");

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = mod.fields.find((f) => f.required && !String(values[f.key] ?? "").trim());
    if (missing) return setError(`Vui lòng nhập ${missing.label.toLowerCase()}.`);
    const problem = mod.validate?.(values);
    if (problem) return setError(problem);
    onSave(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-800">
            {row ? `Sửa ${mod.label.toLowerCase()}` : `Thêm ${mod.label.toLowerCase()}`}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {mod.fields.map((f) => (
            <Field key={f.key} field={f} value={values[f.key]} data={data} onChange={(v) => setField(f.key, v)} />
          ))}
        </div>

        {error && <p className="px-5 pb-2 text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button type="submit" className="rounded-md bg-[#0b4f8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#093f6e]">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
