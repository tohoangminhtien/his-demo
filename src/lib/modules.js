import {
  DEPARTMENTS,
  FACILITIES,
  GENDERS,
  LOG_ACTIONS,
  ORDER_TYPES,
  PRACTITIONER_STATUSES,
  RECORD_TYPES,
  TITLES,
} from "./constants";
import { fmtDateTime, nowDateTime } from "./utils";

export const lookup = (data, key, id) => data[key].find((row) => row.id === id);
export const nameOf = (data, key, id, field = "name") => lookup(data, key, id)?.[field] ?? "—";

const practitionerOptions = (data) =>
  data.practitioners.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }));

const recordOptions = (data) =>
  data.records.map((r) => ({ value: r.id, label: `${r.code} - ${r.patientName}` }));

// Mỗi phân hệ: columns (value trả về chuỗi để hiển thị và tìm kiếm), fields (form), filters, rowActions
export const MODULES = {
  practitioners: {
    label: "Người hành nghề",
    prefix: "NHN",
    describe: (r) => `${r.code} - ${r.name}`,
    columns: [
      { key: "code", label: "Mã định danh" },
      { key: "name", label: "Họ và tên" },
      { key: "facility", label: "Cơ sở công tác" },
      { key: "department", label: "Khoa/Phòng" },
      { key: "title", label: "Chức danh" },
      { key: "specialty", label: "Chuyên môn" },
      { key: "status", label: "Trạng thái", badge: true },
    ],
    fields: [
      { key: "code", label: "Mã định danh", required: true },
      { key: "name", label: "Họ và tên", required: true },
      { key: "facility", label: "Cơ sở công tác", type: "select", options: FACILITIES, required: true },
      { key: "department", label: "Khoa/Phòng", type: "select", options: DEPARTMENTS },
      { key: "title", label: "Chức danh", type: "select", options: TITLES },
      { key: "specialty", label: "Chuyên môn" },
      { key: "status", label: "Trạng thái", type: "select", options: PRACTITIONER_STATUSES },
    ],
    filters: [
      { key: "code", type: "text", label: "Mã định danh", placeholder: "Ví dụ: MDD-0001", value: (r) => r.code },
      { key: "name", type: "text", label: "Họ và tên", placeholder: "Ví dụ: Nguyễn Văn An", value: (r) => r.name },
      { key: "status", label: "Trạng thái", options: PRACTITIONER_STATUSES },
    ],
  },

  records: {
    label: "Hồ sơ KCB",
    prefix: "HS",
    describe: (r) => `${r.code} - ${r.patientName}`,
    columns: [
      { key: "code", label: "Mã hồ sơ" },
      { key: "facility", label: "Cơ sở KCB" },
      { key: "type", label: "Loại KCB" },
      { key: "patientName", label: "Người bệnh" },
      { key: "cccd", label: "CCCD" },
      { key: "phone", label: "Điện thoại" },
      { key: "receivedAt", label: "Tiếp nhận", value: (r) => fmtDateTime(r.receivedAt) },
      { key: "performedAt", label: "Thực hiện", value: (r) => fmtDateTime(r.performedAt) },
      { key: "practitionerId", label: "Bác sĩ phụ trách", value: (r, c) => c.nameOf("practitioners", r.practitionerId) },
    ],
    fields: [
      { key: "code", label: "Mã hồ sơ", required: true },
      { key: "facility", label: "Cơ sở KCB", type: "select", options: FACILITIES, required: true },
      { key: "type", label: "Loại KCB", type: "select", options: RECORD_TYPES },
      { key: "department", label: "Khoa", type: "select", options: DEPARTMENTS },
      { key: "patientCode", label: "Mã người bệnh" },
      { key: "patientName", label: "Họ tên người bệnh", required: true },
      { key: "gender", label: "Giới tính", type: "select", options: GENDERS },
      { key: "dob", label: "Ngày sinh", type: "date" },
      { key: "phone", label: "Số điện thoại" },
      { key: "cccd", label: "CCCD" },
      { key: "practitionerId", label: "Bác sĩ phụ trách", type: "select", options: practitionerOptions },
      { key: "receivedAt", label: "Thời gian tiếp nhận", type: "datetime", default: "now", required: true },
      { key: "performedAt", label: "Thời gian thực hiện", type: "datetime", default: "now" },
    ],
    filters: [{ key: "type", label: "Loại KCB", options: RECORD_TYPES }],
  },

  orders: {
    label: "Y lệnh",
    prefix: "YL",
    describe: (r) => `${r.id} - ${r.orderType}`,
    // Trạng thái suy ra từ mốc thời gian ký/thực hiện, không cho nhập tay
    normalize: (row) => ({
      ...row,
      status: row.executedAt ? "Đã thực hiện" : row.signedAt ? "Đã ký" : "Mới tạo",
    }),
    columns: [
      { key: "id", label: "Mã y lệnh" },
      { key: "recordId", label: "Mã hồ sơ", value: (r, c) => c.nameOf("records", r.recordId, "code") },
      { key: "orderType", label: "Loại y lệnh" },
      { key: "content", label: "Nội dung" },
      { key: "createdAt", label: "Tạo lúc", value: (r) => fmtDateTime(r.createdAt) },
      { key: "creatorId", label: "Người lập", value: (r, c) => c.nameOf("practitioners", r.creatorId) },
      { key: "signedAt", label: "Ký lúc", value: (r) => fmtDateTime(r.signedAt) },
      { key: "signerId", label: "Người ký", value: (r, c) => c.nameOf("practitioners", r.signerId) },
      { key: "executedAt", label: "Thực hiện lúc", value: (r) => fmtDateTime(r.executedAt) },
      { key: "executorId", label: "Người thực hiện", value: (r, c) => c.nameOf("practitioners", r.executorId) },
      { key: "status", label: "Trạng thái", badge: true },
    ],
    fields: [
      { key: "recordId", label: "Hồ sơ KCB", type: "select", options: recordOptions, required: true },
      { key: "orderType", label: "Loại y lệnh", type: "select", options: ORDER_TYPES, required: true },
      { key: "content", label: "Nội dung y lệnh", type: "textarea", required: true },
      { key: "createdAt", label: "Thời điểm tạo", type: "datetime", default: "now", required: true },
      { key: "creatorId", label: "Người lập", type: "select", options: practitionerOptions },
      { key: "signedAt", label: "Thời điểm ký", type: "datetime" },
      { key: "signerId", label: "Người ký", type: "select", options: practitionerOptions },
      { key: "executedAt", label: "Thời điểm thực hiện", type: "datetime" },
      { key: "executorId", label: "Người thực hiện", type: "select", options: practitionerOptions },
    ],
    validate: (v) => (v.executedAt && !v.signedAt ? "Y lệnh chưa ký thì chưa thể ghi nhận thực hiện." : ""),
    filters: [
      { key: "id", type: "text", label: "Mã y lệnh", placeholder: "Ví dụ: YL001", value: (r) => r.id },
      {
        key: "recordCode",
        type: "text",
        label: "Mã hồ sơ",
        placeholder: "Ví dụ: HSBA-260001",
        value: (r, c) => c.nameOf("records", r.recordId, "code"),
      },
      {
        // Khớp tên người lập, người ký hoặc người thực hiện
        key: "person",
        type: "text",
        label: "Người thực hiện",
        placeholder: "Tên người lập/ký/thực hiện",
        value: (r, c) =>
          [c.nameOf("practitioners", r.creatorId), c.nameOf("practitioners", r.signerId), c.nameOf("practitioners", r.executorId)].join(" "),
      },
      // Lọc theo thời điểm tạo y lệnh
      { key: "from", type: "date", label: "Từ ngày", match: (r, v) => r.createdAt.slice(0, 10) >= v },
      { key: "to", type: "date", label: "Đến ngày", match: (r, v) => r.createdAt.slice(0, 10) <= v },
    ],
    rowActions: [
      {
        label: "Ký",
        tone: "blue",
        when: (r) => r.status === "Mới tạo",
        run: (r, a) => a.patch("orders", r, { signedAt: nowDateTime() }, "Ký"),
      },
      {
        label: "Thực hiện",
        tone: "green",
        when: (r) => r.status === "Đã ký",
        run: (r, a) => a.patch("orders", r, { executedAt: nowDateTime() }, "Thực hiện"),
      },
    ],
  },

  logs: {
    label: "Nhật ký hệ thống",
    readOnly: true,
    columns: [
      { key: "time", label: "Thời điểm", value: (r) => fmtDateTime(r.time) },
      { key: "account", label: "Tài khoản thao tác" },
      { key: "action", label: "Thao tác" },
      { key: "module", label: "Phân hệ" },
      { key: "target", label: "Đối tượng" },
      { key: "detail", label: "Lịch sử cập nhật" },
    ],
    filters: [{ key: "action", label: "Thao tác", options: LOG_ACTIONS }],
  },
};

// Mỗi mục sidebar gắn với một URL; nhóm "Lịch làm việc" gồm các tab con
export const NAV = [
  { group: "Tổng quan", items: [{ href: "/", label: "Tổng quan" }] },
  {
    group: "Nhân sự",
    items: [{ href: "/practitioners", label: MODULES.practitioners.label }],
  },
  {
    group: "Lịch làm việc",
    items: [
      { href: "/lich-lam-viec/don-nghi-cho-duyet", label: "Đơn nghỉ đang chờ duyệt" },
      { href: "/lich-lam-viec/ca-lam-viec", label: "Ca làm việc" },
      { href: "/lich-lam-viec/lich-truc", label: "Lịch trực" },
      { href: "/lich-lam-viec/bao-cao-nghi-phep", label: "Báo cáo dữ liệu nghỉ phép" },
      { href: "/lich-lam-viec/bao-cao-cham-cong", label: "Báo cáo dữ liệu chấm công" },
    ],
  },
  {
    group: "Khám chữa bệnh",
    items: [
      { href: "/records", label: MODULES.records.label },
      { href: "/kham-chua-benh/y-lenh", label: MODULES.orders.label },
    ],
  },
  { group: "Quản trị", items: [{ href: "/logs", label: MODULES.logs.label }] },
];

const NAV_ITEMS = NAV.flatMap((g) => g.items);

export const titleOf = (pathname) => NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Không tìm thấy";

// Chuỗi hiển thị của một ô; dùng chung cho bảng và tìm kiếm
export function valueOf(column, row, ctx) {
  if (column.value) return String(column.value(row, ctx) ?? "");
  return String(row[column.key] ?? "");
}
