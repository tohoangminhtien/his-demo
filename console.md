# Mã console truy vấn dữ liệu HIS

Dùng trong DevTools (F12 → Console) trên đúng trang HIS. Dữ liệu đọc từ `localStorage` (key `his-demo:state:v1`), không ghi gì vào dữ liệu.

## Cách dùng

1. Mở trang HIS cần tra cứu, ví dụ `/nhan-su/nguoi-hanh-nghe`.
2. Sửa các dòng điều kiện ở đầu khối code (ví dụ `const code = "MDD-0001";`). Để trống `""` nghĩa là không lọc theo điều kiện đó.
3. Copy cả khối code, dán vào Console và nhấn Enter. Kết quả hiện dạng bảng.

Quy tắc khớp:

- Chuỗi (mã, tên, trạng thái...) khớp nếu chứa từ khóa, không phân biệt hoa thường. Ví dụ `name = "an"` khớp "Nguyễn Văn An".
- Ngày dùng dạng `YYYY-MM-DD`. `from` là từ ngày, `to` là đến ngày (gồm cả hai đầu).
- Mỗi khối nằm trong `{ ... }` nên có thể dán nhiều lần mà không bị lỗi khai báo trùng.

## 1. Người hành nghề — `/nhan-su/nguoi-hanh-nghe`

```js
{
  // Điều kiện lọc, để "" nếu không lọc
  const code = "";
  const name = "";
  const status = ""; // Đang công tác / Tạm ngưng
  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const d = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");
  if (!d) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else console.log(JSON.stringify(d.practitioners.filter((p) => has(p.code, code) && has(p.name, name) && has(p.status, status)).map((p) => ({ "Mã định danh": p.code, "Họ và tên": p.name, "Cơ sở công tác": p.facility, "Khoa/Phòng": p.department, "Chức danh": p.title, "Chuyên môn": p.specialty, "Trạng thái": p.status }))));
}
```

## 2. Ca làm việc — `/lich-lam-viec/ca-lam-viec`

```js
{
  // Điều kiện lọc, để "" nếu không lọc. Ngày dạng YYYY-MM-DD
  const code = "";
  const name = "";
  const from = "";
  const to = "";
  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const d = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");
  if (!d) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else console.log(JSON.stringify(d.schedules.filter((s) => s.category !== "Lịch trực").map((s) => ({ s, p: d.practitioners.find((x) => x.id === s.practitionerId) ?? {} })).filter(({ s, p }) => has(p.code, code) && has(p.name, name) && (!from || s.workDate >= from) && (!to || s.workDate <= to)).sort((a, b) => (a.p.name ?? "").localeCompare(b.p.name ?? "", "vi") || b.s.workDate.localeCompare(a.s.workDate)).map(({ s, p }) => ({ "Mã định danh": p.code ?? "—", "Người hành nghề": p.name ?? "—", Ngày: s.workDate, "Ca làm việc/trực": s.shift, "Loại lịch": s.category, "Đơn vị": s.unit, "Ghi chú": s.note || "—" }))));
}
```

## 3. Lịch trực — `/lich-lam-viec/lich-truc`

Giống Ca làm việc, khác đúng một dòng lọc (chỉ lấy lịch trực):

```js
{
  // Điều kiện lọc, để "" nếu không lọc. Ngày dạng YYYY-MM-DD
  const code = "";
  const name = "";
  const from = "";
  const to = "";
  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const d = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");
  if (!d) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else console.log(JSON.stringify(d.schedules.filter((s) => s.category === "Lịch trực").map((s) => ({ s, p: d.practitioners.find((x) => x.id === s.practitionerId) ?? {} })).filter(({ s, p }) => has(p.code, code) && has(p.name, name) && (!from || s.workDate >= from) && (!to || s.workDate <= to)).sort((a, b) => (a.p.name ?? "").localeCompare(b.p.name ?? "", "vi") || b.s.workDate.localeCompare(a.s.workDate)).map(({ s, p }) => ({ "Mã định danh": p.code ?? "—", "Người hành nghề": p.name ?? "—", Ngày: s.workDate, "Ca làm việc/trực": s.shift, "Loại lịch": s.category, "Đơn vị": s.unit, "Ghi chú": s.note || "—" }))));
}
```

## 4. Báo cáo nghỉ phép — `/lich-lam-viec/bao-cao-nghi-phep`

Liệt kê từng ngày nghỉ phép, đơn bị "Từ chối" không tính. Nếu không điền `from`/`to` thì lấy theo phạm vi dữ liệu có sẵn, giống trang.

```js
{
  // Điều kiện lọc, để "" nếu không lọc. Ngày dạng YYYY-MM-DD
  const code = "";
  const name = "";
  const from = "";
  const to = "";
  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const d = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");
  const all = d ? [...d.leaves.flatMap((l) => [l.startDate, l.endDate]), ...d.schedules.map((s) => s.workDate)].filter(Boolean).sort() : [];
  const start = from || all[0] || "";
  const end = to || all[all.length - 1] || "";
  if (!d) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else if (start > end) console.warn("Ngày bắt đầu phải trước hoặc trùng ngày kết thúc.");
  else {
    const days = [];
    for (let t = new Date(`${start}T00:00:00Z`); t.toISOString().slice(0, 10) <= end; t.setUTCDate(t.getUTCDate() + 1)) days.push(t.toISOString().slice(0, 10));
    console.log(JSON.stringify(d.practitioners.filter((p) => has(p.code, code) && has(p.name, name)).flatMap((p) => { const lv = d.leaves.filter((l) => l.practitionerId === p.id && l.status !== "Từ chối"); return days.flatMap((day) => { const c = lv.filter((l) => l.startDate <= day && day <= l.endDate); return c.length ? [{ "Mã định danh": p.code, "Họ và tên": p.name, Ngày: day, "Trạng thái": "Nghỉ phép", "Lý do": c.map((l) => (l.reason ? `${l.type} - ${l.reason}` : l.type)).join("; "), Duyệt: c.some((l) => l.status === "Đã duyệt") ? "Đã duyệt" : "Chưa duyệt" }] : []; }); }).sort((a, b) => a["Họ và tên"].localeCompare(b["Họ và tên"], "vi") || b.Ngày.localeCompare(a.Ngày))));
  }
}
```

## 5. Y lệnh — `/kham-chua-benh/y-lenh`

```js
{
  // Điều kiện lọc, để "" nếu không lọc. Ngày dạng YYYY-MM-DD
  const executor = ""; // Tên khớp người lập, người ký hoặc người thực hiện
  const from = "";
  const to = "";
  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const d = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");
  if (!d) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const nameOf = (pid) => d.practitioners.find((p) => p.id === pid)?.name ?? "—";
    const codeOf = (rid) => d.records.find((r) => r.id === rid)?.code ?? "—";
    console.log(JSON.stringify(d.orders.filter((o) => [o.creatorId, o.signerId, o.executorId].some((pid) => has(nameOf(pid), executor)) && (!from || o.createdAt.slice(0, 10) >= from) && (!to || o.createdAt.slice(0, 10) <= to)).map((o) => ({ "Mã y lệnh": o.id, "Mã hồ sơ": codeOf(o.recordId), "Loại y lệnh": o.orderType, "Nội dung": o.content, "Tạo lúc": o.createdAt, "Người lập": nameOf(o.creatorId), "Ký lúc": o.signedAt || "—", "Người ký": nameOf(o.signerId), "Thực hiện lúc": o.executedAt || "—", "Người thực hiện": nameOf(o.executorId), "Trạng thái": o.executedAt ? "Đã thực hiện" : o.signedAt ? "Đã ký" : "Mới tạo" }))));
  }
}
```

## 6. Nhật ký hệ thống — `/quan-tri/nhat-ky-he-thong`

```js
{
  // Điều kiện lọc, để "" nếu không lọc. Ngày dạng YYYY-MM-DD
  const account = ""; // Tài khoản thao tác
  const action = ""; // Tạo / Sửa / Xóa / Duyệt / Từ chối / Ký / Thực hiện
  const target = ""; // Đối tượng, ví dụ MDD-0001
  const from = "";
  const to = "";
  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const d = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");
  if (!d) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else console.log(JSON.stringify(d.logs.filter((l) => has(l.account, account) && has(l.action, action) && has(l.target, target) && (!from || l.time.slice(0, 10) >= from) && (!to || l.time.slice(0, 10) <= to)).map((l) => ({ "Thời điểm": l.time.replace("T", " "), "Tài khoản thao tác": l.account, "Thao tác": l.action, "Phân hệ": l.module, "Đối tượng": l.target, "Lịch sử cập nhật": l.detail }))));
}
```

## Lưu ý

- Mỗi khối code chỉ dùng trên trang tương ứng. Tải lại trang (F5) thì phải dán lại khối code.
- Code chỉ đọc dữ liệu, không thay đổi `localStorage`.
- Nếu console báo "Chưa có dữ liệu HIS", hãy mở trang HIS trước để seed dữ liệu được nạp.
