import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CURRENT_USER } from "@/lib/constants";
import { MODULES } from "@/lib/modules";
import { createSeed } from "@/lib/seed";
import { loadState, saveState } from "@/lib/storage";
import { newId, nowDateTime } from "@/lib/utils";

const MAX_LOGS = 500;
const FIELD_LABELS = { status: "Trạng thái" };

// Tóm tắt những trường thay đổi để ghi vào nhật ký
function changeSummary(before, after, mod) {
  const changed = Object.keys(after).filter(
    (k) => k !== "id" && String(before[k] ?? "") !== String(after[k] ?? ""),
  );
  if (changed.length === 0) return "Không thay đổi nội dung";
  const labels = changed.map((k) => FIELD_LABELS[k] ?? mod.fields?.find((f) => f.key === k)?.label ?? k);
  return `Cập nhật: ${labels.join(", ")}`;
}

function withLog(state, { action, moduleKey, target, detail }) {
  const entry = {
    id: newId("LOG"),
    time: nowDateTime(),
    account: CURRENT_USER.name,
    action,
    module: MODULES[moduleKey].label,
    target,
    detail,
  };
  return { ...state, logs: [entry, ...state.logs].slice(0, MAX_LOGS) };
}

export function useHisState() {
  // Chỉ đọc localStorage sau khi mount để tránh lệch nội dung khi SSR
  const [state, setState] = useState(null);

  useEffect(() => {
    // Cần setState sau mount: localStorage không tồn tại trên server nên không thể đọc lúc render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState() ?? createSeed());
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const save = useCallback((moduleKey, values, editing) => {
    setState((prev) => {
      const mod = MODULES[moduleKey];
      if (editing) {
        const row = mod.normalize ? mod.normalize({ ...editing, ...values }) : { ...editing, ...values };
        const next = { ...prev, [moduleKey]: prev[moduleKey].map((r) => (r.id === editing.id ? row : r)) };
        return withLog(next, {
          action: "Sửa",
          moduleKey,
          target: mod.describe(row, next),
          detail: changeSummary(editing, row, mod),
        });
      }
      const created = { id: newId(mod.prefix), ...values };
      const row = mod.normalize ? mod.normalize(created) : created;
      const next = { ...prev, [moduleKey]: [row, ...prev[moduleKey]] };
      return withLog(next, { action: "Tạo", moduleKey, target: mod.describe(row, next), detail: "Tạo mới" });
    });
  }, []);

  // Thay đổi một phần bản ghi, dùng cho các nút Duyệt/Ký/Thực hiện
  const patch = useCallback((moduleKey, row, changes, action) => {
    setState((prev) => {
      const mod = MODULES[moduleKey];
      const updated = mod.normalize ? mod.normalize({ ...row, ...changes }) : { ...row, ...changes };
      const next = { ...prev, [moduleKey]: prev[moduleKey].map((r) => (r.id === row.id ? updated : r)) };
      return withLog(next, {
        action,
        moduleKey,
        target: mod.describe(updated, next),
        detail: changeSummary(row, updated, mod),
      });
    });
  }, []);

  const remove = useCallback((moduleKey, row) => {
    setState((prev) => {
      const mod = MODULES[moduleKey];
      const next = { ...prev, [moduleKey]: prev[moduleKey].filter((r) => r.id !== row.id) };
      return withLog(next, { action: "Xóa", moduleKey, target: mod.describe(row, prev), detail: `Xóa bản ghi ${row.id}` });
    });
  }, []);

  return { state, save, patch, remove };
}

// Được cung cấp bởi HisShell (layout), nên state không bị nạp lại khi chuyển trang
export const HisContext = createContext(null);

export function useHis() {
  const value = useContext(HisContext);
  if (!value) throw new Error("useHis phải được dùng bên trong HisShell");
  return value;
}
