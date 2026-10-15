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
  const state = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");

  if (!state) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const rows = state.practitioners
      .filter((p) => has(p.code, code) && has(p.name, name) && has(p.status, status))
      .map((p) => ({
        "Mã định danh": p.code,
        "Họ và tên": p.name,
        "Cơ sở công tác": p.facility,
        "Khoa/Phòng": p.department,
        "Chức danh": p.title,
        "Chuyên môn": p.specialty,
        "Trạng thái": p.status,
      }));
    console.log(JSON.stringify(rows));
  }
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
  const state = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");

  if (!state) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const rows = state.schedules
      .filter((s) => s.category !== "Lịch trực")
      .map((s) => ({ s, p: state.practitioners.find((x) => x.id === s.practitionerId) ?? {} }))
      .filter(({ s, p }) => has(p.code, code) && has(p.name, name) && (!from || s.workDate >= from) && (!to || s.workDate <= to))
      .sort((a, b) => (a.p.name ?? "").localeCompare(b.p.name ?? "", "vi") || b.s.workDate.localeCompare(a.s.workDate))
      .map(({ s, p }) => ({
        "Mã định danh": p.code ?? "—",
        "Người hành nghề": p.name ?? "—",
        Ngày: s.workDate,
        "Ca làm việc/trực": s.shift,
        "Loại lịch": s.category,
        "Đơn vị": s.unit,
        "Ghi chú": s.note || "—",
      }));
    console.log(JSON.stringify(rows));
  }
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
  const state = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");

  if (!state) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const rows = state.schedules
      .filter((s) => s.category === "Lịch trực")
      .map((s) => ({ s, p: state.practitioners.find((x) => x.id === s.practitionerId) ?? {} }))
      .filter(({ s, p }) => has(p.code, code) && has(p.name, name) && (!from || s.workDate >= from) && (!to || s.workDate <= to))
      .sort((a, b) => (a.p.name ?? "").localeCompare(b.p.name ?? "", "vi") || b.s.workDate.localeCompare(a.s.workDate))
      .map(({ s, p }) => ({
        "Mã định danh": p.code ?? "—",
        "Người hành nghề": p.name ?? "—",
        Ngày: s.workDate,
        "Ca làm việc/trực": s.shift,
        "Loại lịch": s.category,
        "Đơn vị": s.unit,
        "Ghi chú": s.note || "—",
      }));
    console.log(JSON.stringify(rows));
  }
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
  const state = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");

  if (!state) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const dates = [...state.leaves.flatMap((l) => [l.startDate, l.endDate]), ...state.schedules.map((s) => s.workDate)]
      .filter(Boolean)
      .sort();
    const start = from || dates[0];
    const end = to || dates[dates.length - 1];

    if (start > end) console.warn("Ngày bắt đầu phải trước hoặc trùng ngày kết thúc.");
    else {
      // Liệt kê từng ngày trong khoảng, tính theo UTC để tránh lệch múi giờ
      const days = [];
      for (let d = new Date(`${start}T00:00:00Z`); d.toISOString().slice(0, 10) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        days.push(d.toISOString().slice(0, 10));
      }

      const rows = [];
      for (const p of state.practitioners.filter((p) => has(p.code, code) && has(p.name, name))) {
        const leaves = state.leaves.filter((l) => l.practitionerId === p.id && l.status !== "Từ chối");
        for (const day of days) {
          const cover = leaves.filter((l) => l.startDate <= day && day <= l.endDate);
          if (cover.length === 0) continue;
          rows.push({
            "Mã định danh": p.code,
            "Họ và tên": p.name,
            Ngày: day,
            "Trạng thái": "Nghỉ phép",
            "Lý do": cover.map((l) => (l.reason ? `${l.type} - ${l.reason}` : l.type)).join("; "),
            Duyệt: cover.some((l) => l.status === "Đã duyệt") ? "Đã duyệt" : "Chưa duyệt",
          });
        }
      }
      rows.sort((a, b) => a["Họ và tên"].localeCompare(b["Họ và tên"], "vi") || b.Ngày.localeCompare(a.Ngày));

      console.log(JSON.stringify(rows));
    }
  }
}
```

## 5. Y lệnh — `/kham-chua-benh/y-lenh`

```js
{
  // Điều kiện lọc, để "" nếu không lọc
  const id = ""; // Mã y lệnh, ví dụ YL001
  const recordCode = ""; // Mã hồ sơ, ví dụ HSBA-260001
  const person = ""; // Tên người lập/ký/thực hiện
  const status = ""; // Mới tạo / Đã ký / Đã thực hiện

  const has = (v, q) => !q || String(v ?? "").toLowerCase().includes(q.trim().toLowerCase());
  const state = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");

  if (!state) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const nameOf = (pid) => state.practitioners.find((p) => p.id === pid)?.name ?? "—";
    const codeOf = (rid) => state.records.find((r) => r.id === rid)?.code ?? "—";
    // Trạng thái suy ra từ mốc thời gian, giống MODULES.orders.normalize
    const statusOf = (o) => (o.executedAt ? "Đã thực hiện" : o.signedAt ? "Đã ký" : "Mới tạo");

    const rows = state.orders
      .filter(
        (o) =>
          has(o.id, id) &&
          has(codeOf(o.recordId), recordCode) &&
          has([o.creatorId, o.signerId, o.executorId].map(nameOf).join(" "), person) &&
          has(statusOf(o), status),
      )
      .map((o) => ({
        "Mã y lệnh": o.id,
        "Mã hồ sơ": codeOf(o.recordId),
        "Loại y lệnh": o.orderType,
        "Nội dung": o.content,
        "Tạo lúc": o.createdAt,
        "Người lập": nameOf(o.creatorId),
        "Ký lúc": o.signedAt || "—",
        "Người ký": nameOf(o.signerId),
        "Thực hiện lúc": o.executedAt || "—",
        "Người thực hiện": nameOf(o.executorId),
        "Trạng thái": statusOf(o),
      }));
    console.log(JSON.stringify(rows));
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
  const state = JSON.parse(localStorage.getItem("his-demo:state:v1") ?? "null");

  if (!state) console.warn("Chưa có dữ liệu HIS, hãy mở trang HIS trước.");
  else {
    const rows = state.logs
      .filter(
        (l) =>
          has(l.account, account) &&
          has(l.action, action) &&
          has(l.target, target) &&
          (!from || l.time.slice(0, 10) >= from) &&
          (!to || l.time.slice(0, 10) <= to),
      )
      .map((l) => ({
        "Thời điểm": l.time.replace("T", " "),
        "Tài khoản thao tác": l.account,
        "Thao tác": l.action,
        "Phân hệ": l.module,
        "Đối tượng": l.target,
        "Lịch sử cập nhật": l.detail,
      }));
    console.log(JSON.stringify(rows));
  }
}
```

## Lưu ý

- Mỗi khối code chỉ dùng trên trang tương ứng. Tải lại trang (F5) thì phải dán lại khối code.
- Code chỉ đọc dữ liệu, không thay đổi `localStorage`.
- Nếu console báo "Chưa có dữ liệu HIS", hãy mở trang HIS trước để seed dữ liệu được nạp.
