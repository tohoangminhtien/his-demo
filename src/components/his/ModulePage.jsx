"use client";

import { useState } from "react";
import { useHis } from "@/hooks/useHisState";
import { MODULES, nameOf, valueOf } from "@/lib/modules";
import Badge from "./Badge";
import FormModal from "./FormModal";

const ACTION_TONES = {
  green: "bg-emerald-600 text-white hover:bg-emerald-700",
  blue: "bg-sky-600 text-white hover:bg-sky-700",
  red: "bg-rose-600 text-white hover:bg-rose-700",
};

const BUTTON = "rounded px-2.5 py-1 text-xs font-medium transition-colors";

// Trang danh mục dùng chung cho 6 phân hệ: tìm kiếm, lọc, thêm/sửa/xóa và thao tác theo trạng thái
export default function ModulePage({ moduleKey }) {
  const { state: data, save, patch, remove } = useHis();
  const [filterValues, setFilterValues] = useState({});
  const [editor, setEditor] = useState(null); // null: đóng; {}: thêm mới; {row}: sửa

  // Kiểm tra sau mọi hook để số lượng hook không đổi khi dữ liệu nạp xong
  if (!data) return <p className="text-sm text-slate-500">Đang tải dữ liệu HIS...</p>;

  const actions = { save, patch, remove };
  const ctx = { data, nameOf: (key, id, field) => nameOf(data, key, id, field) };
  const mod = MODULES[moduleKey];
  const rows = data[moduleKey];

  const visible = rows.filter((row) =>
    (mod.filters ?? []).every((f) => {
      const value = (filterValues[f.key] ?? "").trim();
      if (!value) return true;
      if (f.type === "text") return f.value(row, ctx).toLowerCase().includes(value.toLowerCase());
      if (f.type === "date") return f.match(row, value, ctx);
      return row[f.key] === value;
    }),
  );

  const handleRemove = (row) => {
    if (window.confirm(`Xóa "${mod.describe(row, data)}"?`)) actions.remove(moduleKey, row);
  };

  const handleSave = (values) => {
    actions.save(moduleKey, values, editor.row);
    setEditor(null);
  };

  const colSpan = mod.columns.length + (mod.readOnly ? 0 : 1);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {(mod.filters ?? []).map((f) => {
          const setValue = (value) => setFilterValues((prev) => ({ ...prev, [f.key]: value }));
          if (f.type === "text" || f.type === "date") {
            return (
              <label key={f.key} className="flex items-center gap-2 text-sm text-slate-600">
                {f.label}
                <input
                  type={f.type === "date" ? "date" : "text"}
                  value={filterValues[f.key] ?? ""}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={f.placeholder}
                  className="h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-500"
                />
              </label>
            );
          }
          return (
            <select
              key={f.key}
              value={filterValues[f.key] ?? ""}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="">{f.label}: Tất cả</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          );
        })}
        <span className="text-sm text-slate-500">
          Hiển thị {visible.length}/{rows.length} bản ghi
        </span>
        {!mod.readOnly && (
          <button
            type="button"
            onClick={() => setEditor({})}
            className="ml-auto h-9 rounded-md bg-[#0b4f8a] px-4 text-sm font-medium text-white hover:bg-[#093f6e]"
          >
            + Thêm mới
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {mod.columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              {!mod.readOnly && <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((row) => (
              <tr key={row.id} className="hover:bg-sky-50/60">
                {mod.columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {c.badge ? <Badge value={valueOf(c, row, ctx)} /> : valueOf(c, row, ctx)}
                  </td>
                ))}
                {!mod.readOnly && (
                  <td className="whitespace-nowrap px-4 py-2">
                    <div className="flex justify-end gap-1.5">
                      {(mod.rowActions ?? [])
                        .filter((a) => a.when(row))
                        .map((a) => (
                          <button
                            key={a.label}
                            type="button"
                            onClick={() => a.run(row, actions)}
                            className={`${BUTTON} ${ACTION_TONES[a.tone]}`}
                          >
                            {a.label}
                          </button>
                        ))}
                      <button
                        type="button"
                        onClick={() => setEditor({ row })}
                        className={`${BUTTON} border border-slate-300 text-slate-700 hover:bg-slate-50`}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(row)}
                        className={`${BUTTON} border border-rose-200 text-rose-600 hover:bg-rose-50`}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editor && (
        <FormModal
          mod={mod}
          row={editor.row}
          data={data}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </section>
  );
}
