import { SHIFTS } from "./constants";
import { MODULES } from "./modules";

const FAC1 = "BVĐK Hòa An - Cơ sở chính";
const FAC2 = "BVĐK Hòa An - Cơ sở 2";

const practitioners = [
  { id: "NHN001", code: "MDD-0001", name: "Nguyễn Văn An", facility: FAC1, department: "Khoa Nội tổng hợp", title: "Bác sĩ chuyên khoa I", specialty: "Nội tim mạch", status: "Đang công tác" },
  { id: "NHN002", code: "MDD-0002", name: "Trần Thị Lan", facility: FAC1, department: "Khoa Cấp cứu", title: "Điều dưỡng", specialty: "Hồi sức cấp cứu", status: "Đang công tác" },
  { id: "NHN003", code: "MDD-0003", name: "Phạm Quốc Huy", facility: FAC2, department: "Khoa Ngoại", title: "Bác sĩ", specialty: "Ngoại tiêu hóa", status: "Đang công tác" },
  { id: "NHN004", code: "MDD-0004", name: "Lê Thu Hà", facility: FAC1, department: "Khoa Dược", title: "Dược sĩ", specialty: "Dược lâm sàng", status: "Đang công tác" },
  { id: "NHN005", code: "MDD-0005", name: "Võ Minh Tuấn", facility: FAC1, department: "Khoa Chẩn đoán hình ảnh", title: "Kỹ thuật viên CĐHA", specialty: "Siêu âm", status: "Đang công tác" },
  { id: "NHN006", code: "MDD-0006", name: "Đặng Ngọc Mai", facility: FAC2, department: "Khoa Nhi", title: "Bác sĩ", specialty: "Nhi sơ sinh", status: "Tạm ngưng" },
  { id: "NHN007", code: "MDD-0007", name: "Hoàng Đức Long", facility: FAC1, department: "Khoa Cấp cứu", title: "Bác sĩ", specialty: "Cấp cứu ngoại", status: "Đang công tác" },
  { id: "NHN008", code: "MDD-0008", name: "Bùi Thị Hương", facility: FAC1, department: "Khoa Sản", title: "Hộ sinh", specialty: "Sản phụ khoa", status: "Đang công tác" },
];

// ---------------------------------------------------------------------------
// Dữ liệu giả lập 01/07/2026 - 16/10/2026. Sinh bằng PRNG cố định nên mỗi lần nạp đều giống nhau.
// ---------------------------------------------------------------------------

const START = "2026-07-01";
const END = "2026-10-16";
// Thời điểm "hiện tại" của dữ liệu demo; không sinh mốc thời gian sau đó
const NOW = "2026-10-16T10:30";
// Nghỉ lễ Quốc khánh: không xếp ca hành chính
const HOLIDAYS = new Set(["2026-09-01", "2026-09-02"]);

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n, len = 2) => String(n).padStart(len, "0");

// Phần còn lại của file là hàm thuần, được bọc để mỗi lần createSeed() có PRNG mới và kết quả ổn định
function generate() {
  const rand = mulberry32(20260716);
  const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const addDays = (s, n) => {
    const d = new Date(`${s}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const dow = (s) => new Date(`${s}T00:00:00Z`).getUTCDay();
  const isWorkday = (d) => dow(d) >= 1 && dow(d) <= 5 && !HOLIDAYS.has(d);
  // Mốc theo phút kể từ 00:00 của ngày `day`; quá 1440 thì sang ngày kế tiếp
  const stamp = (day, minutes) => `${addDays(day, Math.floor(minutes / 1440))}T${pad(Math.floor((minutes % 1440) / 60))}:${pad(minutes % 60)}`;

  const DAYS = [];
  for (let d = START; d <= END; d = addDays(d, 1)) DAYS.push(d);

  const byId = Object.fromEntries(practitioners.map((p) => [p.id, p]));
  const active = practitioners.filter((p) => p.status === "Đang công tác");

  // Ca cố định: 1 = ca sáng, 2 = ca chiều (chỉ số trong SHIFTS)
  const FIXED_SHIFT = { NHN001: 1, NHN002: 2, NHN003: 1, NHN004: 1, NHN005: 2, NHN007: 1, NHN008: 2 };
  const SHIFT_WINDOW = { 1: [420, 780], 2: [780, 1140] };
  const DUTY_WINDOW = [1140, 1860]; // 19:00 -> 07:00 hôm sau

  // Ngày gắn với tình huống vi phạm: không xếp nghỉ, trực hay nghỉ sau trực vào các ngày này
  const reserved = {
    NHN001: ["2026-08-17", "2026-08-18", "2026-08-19"],
    NHN002: ["2026-08-26", "2026-09-24", "2026-10-08"],
    NHN003: ["2026-09-14", "2026-09-15"],
    NHN005: ["2026-08-26", "2026-10-08"],
    NHN007: ["2026-07-21", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-09", "2026-10-12", "2026-10-13", "2026-10-14"],
    NHN008: ["2026-08-26"],
  };
  const reservedSets = Object.fromEntries(practitioners.map((p) => [p.id, new Set(reserved[p.id] ?? [])]));

  // ----- Nghỉ phép -----
  const leaveDays = Object.fromEntries(practitioners.map((p) => [p.id, new Set()]));
  const leaves = [];
  const isBlocked = (pid, d) => leaveDays[pid].has(d) || reservedSets[pid].has(d);
  const addLeave = (pid, type, startDate, endDate, reason, status = "Đã duyệt") => {
    leaves.push({ id: "", practitionerId: pid, type, startDate, endDate, status, managingUnit: byId[pid].department, reason });
    if (status !== "Đã duyệt") return;
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) leaveDays[pid].add(d);
  };

  addLeave("NHN006", "Nghỉ thai sản", "2026-06-15", "2026-12-15", "Nghỉ thai sản theo quy định");
  addLeave("NHN001", "Nghỉ phép năm", "2026-08-17", "2026-08-19", "Nghỉ phép năm 2026, về quê");
  addLeave("NHN003", "Nghỉ ốm", "2026-09-14", "2026-09-15", "Có giấy nghỉ ốm, xác nhận của cơ sở KCB");

  const LEAVE_REASONS = {
    "Nghỉ phép năm": ["Việc gia đình", "Nghỉ phép năm 2026", "Đưa con đi khám", "Về quê", "Nghỉ dưỡng cùng gia đình"],
    "Nghỉ ốm": ["Có giấy nghỉ ốm", "Sốt siêu vi, có giấy ra viện", "Viêm họng cấp, có đơn thuốc"],
    "Nghỉ bù": ["Bù ngày trực lễ", "Bù ca trực đêm cuối tuần"],
    "Đi học/Đi công tác": ["Tham dự hội thảo chuyên môn", "Tập huấn cập nhật phác đồ điều trị"],
  };
  const pickLeaveType = () => {
    const r = rand();
    return r < 0.55 ? "Nghỉ phép năm" : r < 0.8 ? "Nghỉ ốm" : r < 0.95 ? "Nghỉ bù" : "Đi học/Đi công tác";
  };

  const MONTHS = ["2026-07", "2026-08", "2026-09", "2026-10"];
  active.forEach((p) => {
    MONTHS.forEach((m) => {
      const days = DAYS.filter((d) => d.startsWith(m) && isWorkday(d));
      const target = m === "2026-10" ? between(1, 2) : between(1, 3);
      let remaining = target - days.filter((d) => leaveDays[p.id].has(d)).length;
      for (let tries = 0; remaining > 0 && tries < 40; tries++) {
        const len = remaining >= 2 && rand() < 0.5 ? 2 : 1;
        const i = between(0, days.length - len);
        const span = days.slice(i, i + len);
        const consecutive = span.every((d, k) => k === 0 || addDays(span[k - 1], 1) === d);
        if (!consecutive || span.some((d) => isBlocked(p.id, d))) continue;
        const type = pickLeaveType();
        addLeave(p.id, type, span[0], span[len - 1], pick(LEAVE_REASONS[type]));
        remaining -= len;
      }
    });
  });

  // Đơn chờ duyệt: các đơn vừa nộp cho những ngày sắp tới
  addLeave("NHN005", "Nghỉ bù", "2026-10-19", "2026-10-19", "Bù ngày trực lễ", "Chờ duyệt");
  addLeave("NHN001", "Đi học/Đi công tác", "2026-10-22", "2026-10-23", "Tham dự hội nghị tim mạch toàn quốc", "Chờ duyệt");
  addLeave("NHN004", "Nghỉ phép năm", "2026-10-26", "2026-10-27", "Việc gia đình", "Chờ duyệt");

  // ----- Lịch trực đêm (cố định 19:00-07:00), nghỉ ngày kế tiếp -----
  const dutyDays = {};
  const restDays = {};
  active.forEach((p, i) => {
    dutyDays[p.id] = new Set();
    restDays[p.id] = new Set();
    let idx = i * 2;
    while (idx < DAYS.length) {
      let k = idx;
      while (k < DAYS.length && (isBlocked(p.id, DAYS[k]) || isBlocked(p.id, addDays(DAYS[k], 1)))) k++;
      if (k >= DAYS.length) break;
      dutyDays[p.id].add(DAYS[k]);
      restDays[p.id].add(addDays(DAYS[k], 1));
      idx = k + between(8, 11);
    }
  });

  // ----- Ca làm việc và lịch trực -----
  const schedules = [];
  const windows = new Map();
  const addWindow = (pid, day, w) => {
    const key = `${pid}|${day}`;
    windows.set(key, [...(windows.get(key) ?? []), w]);
  };
  const addSchedule = (p, workDate, shift, category, note) => {
    schedules.push({ id: "", practitionerId: p.id, workDate, shift, category, unit: p.department, note });
  };

  active.forEach((p) => {
    const base = FIXED_SHIFT[p.id];
    const other = base === 1 ? 2 : 1;
    DAYS.forEach((day) => {
      if (dutyDays[p.id].has(day)) {
        addSchedule(p, day, SHIFTS[3], "Lịch trực", "");
        addWindow(p.id, day, DUTY_WINDOW);
        return;
      }
      if (!isWorkday(day) || leaveDays[p.id].has(day) || restDays[p.id].has(day)) return;
      // Ngày gắn tình huống vi phạm giữ đúng ca cố định để ngoại lệ đúng như thiết kế
      if (!reservedSets[p.id].has(day) && rand() < 0.04) {
        addSchedule(p, day, SHIFTS[other], "Đổi ca", "Đổi ca với đồng nghiệp cùng khoa");
        addWindow(p.id, day, SHIFT_WINDOW[other]);
        return;
      }
      addSchedule(p, day, SHIFTS[base], "Lịch làm việc", "");
      addWindow(p.id, day, SHIFT_WINDOW[base]);
      if (rand() < 0.05) {
        addSchedule(p, day, SHIFTS[other], "Làm thêm", "Tăng ca do lượng người bệnh tăng");
        addWindow(p.id, day, SHIFT_WINDOW[other]);
      }
    });
  });

  // Một vài ngày điều động hỗ trợ khoa khác
  [
    ["NHN005", "2026-08-12", "Khoa Cấp cứu", "Hỗ trợ siêu âm tại Khoa Cấp cứu"],
    ["NHN005", "2026-09-17", "Khoa Cấp cứu", "Hỗ trợ siêu âm tại Khoa Cấp cứu"],
    ["NHN002", "2026-08-05", "Khoa Nội tổng hợp", "Điều động hỗ trợ Khoa Nội tổng hợp"],
  ].forEach(([pid, day, unit, note]) => {
    const s = schedules.find((x) => x.practitionerId === pid && x.workDate === day && x.category === "Lịch làm việc");
    if (s) Object.assign(s, { category: "Điều động", unit, note });
  });

  // ----- Hồ sơ KCB và y lệnh -----
  const records = [];
  const orders = [];

  const FAMILY = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Võ", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý"];
  const MIDDLE = { Nam: ["Văn", "Quốc", "Minh", "Đức", "Hữu", "Thanh"], Nữ: ["Thị", "Ngọc", "Thu", "Kim", "Mỹ", "Thanh"] };
  const GIVEN = {
    Nam: ["Bình", "Cường", "Dũng", "Hải", "Khoa", "Nam", "Phúc", "Sơn", "Tài", "Việt", "Thắng", "Hiếu"],
    Nữ: ["Anh", "Châu", "Dung", "Hoa", "Linh", "Ngọc", "Phương", "Thảo", "Trang", "Uyên", "Vy", "Yến"],
  };
  const RECORD_TYPES_BY_PERSON = {
    NHN001: ["Khám ngoại trú", "Điều trị nội trú", "Khám ban đầu"],
    NHN002: ["Cấp cứu", "Cấp cứu", "Điều trị nội trú"],
    NHN003: ["Điều trị nội trú", "Khám ngoại trú"],
    NHN004: ["Khám ngoại trú"],
    NHN005: ["Khám ngoại trú"],
    NHN007: ["Cấp cứu"],
    NHN008: ["Khám ban đầu", "Khám ngoại trú", "Điều trị nội trú"],
  };
  const ORDER_PROFILE = {
    NHN001: ["Thuốc", "Xét nghiệm", "Chẩn đoán hình ảnh", "Chăm sóc điều dưỡng"],
    NHN002: ["Chăm sóc điều dưỡng", "Truyền dịch", "Thủ thuật", "Thuốc"],
    NHN003: ["Thủ thuật", "Thuốc", "Xét nghiệm", "Chẩn đoán hình ảnh"],
    NHN004: ["Thuốc"],
    NHN005: ["Chẩn đoán hình ảnh"],
    NHN007: ["Xét nghiệm", "Truyền dịch", "Thuốc", "Thủ thuật", "Chẩn đoán hình ảnh"],
    NHN008: ["Xét nghiệm", "Chăm sóc điều dưỡng", "Thuốc", "Chẩn đoán hình ảnh"],
  };
  const CONTENTS = {
    "Thuốc": [
      "Amlodipine 5mg, 1 viên/ngày buổi sáng",
      "Metformin 500mg, 2 viên/ngày sau ăn",
      "Paracetamol 500mg, 1 viên khi sốt trên 38,5°C",
      "Omeprazole 20mg, 1 viên trước ăn sáng",
      "Ceftriaxone 1g truyền tĩnh mạch, 2 lần/ngày",
      "Atorvastatin 20mg, 1 viên buổi tối",
      "Losartan 50mg, 1 viên/ngày",
      "Amoxicillin 500mg, 3 viên/ngày chia 3 lần",
      "Salbutamol khí dung 2,5mg, 2 lần/ngày",
    ],
    "Xét nghiệm": [
      "Công thức máu",
      "Sinh hóa máu: ure, creatinin, AST, ALT",
      "Đường huyết mao mạch, HbA1c",
      "Tổng phân tích nước tiểu",
      "Điện giải đồ",
      "CRP định lượng",
      "Nhóm máu ABO, Rh",
      "Đông máu cơ bản",
    ],
    "Chẩn đoán hình ảnh": [
      "X-quang ngực thẳng",
      "Siêu âm ổ bụng tổng quát",
      "Siêu âm tim",
      "Siêu âm tuyến giáp",
      "CT sọ não không thuốc",
      "Điện tim đồ 12 chuyển đạo",
      "X-quang cột sống thắt lưng",
    ],
    "Thủ thuật": ["Thay băng vết mổ", "Khâu vết thương phần mềm", "Đặt sonde tiểu", "Chọc dịch màng bụng", "Cắt chỉ vết mổ", "Nẹp cố định cẳng tay"],
    "Truyền dịch": [
      "Truyền NaCl 0,9% 500ml trong 30 phút",
      "Truyền Ringer lactat 500ml, 40 giọt/phút",
      "Truyền Glucose 5% 500ml",
      "Truyền Paracetamol 1g/100ml",
    ],
    "Chăm sóc điều dưỡng": [
      "Theo dõi dấu hiệu sinh tồn 4 giờ/lần",
      "Theo dõi cân nặng và cho bú",
      "Chăm sóc vệ sinh cá nhân, thay ga giường",
      "Theo dõi SpO2 liên tục",
      "Hướng dẫn người bệnh tập vận động sớm",
    ],
  };

  function newRecord(p, receivedAt, performedAt) {
    const gender = rand() < 0.5 ? "Nam" : "Nữ";
    const year = between(1948, 2018);
    const dob = `${year}-${pad(between(1, 12))}-${pad(between(1, 28))}`;
    const centuryDigit = (year >= 2000 ? 2 : 0) + (gender === "Nam" ? 0 : 1);
    const rec = {
      id: "",
      code: "",
      facility: p.facility,
      type: pick(RECORD_TYPES_BY_PERSON[p.id]),
      department: p.department,
      patientCode: "",
      patientName: `${pick(FAMILY)} ${pick(MIDDLE[gender])} ${pick(GIVEN[gender])}`,
      gender,
      dob,
      phone: `09${pad(between(0, 99999999), 8)}`,
      cccd: `079${centuryDigit}${pad(year % 100)}${pad(between(0, 999999), 6)}`,
      practitionerId: p.id,
      receivedAt,
      performedAt,
    };
    records.push(rec);
    return rec;
  }

  // Mặc định cùng một người lập, ký, thực hiện; `extra` ghi đè cho các trường hợp bất thường
  function newOrder(rec, p, orderType, content, createdAt, signedAt, executedAt, extra = {}) {
    orders.push({
      id: "",
      _rec: rec,
      orderType,
      content,
      createdAt,
      creatorId: p.id,
      signedAt,
      signerId: signedAt ? p.id : "",
      executedAt,
      executorId: signedAt ? p.id : "",
      ...extra,
    });
  }

  // Y lệnh bình thường: nằm trọn trong ca làm việc hoặc ca trực của chính người đó
  active.forEach((p) => {
    DAYS.forEach((day) => {
      (windows.get(`${p.id}|${day}`) ?? []).forEach(([ws, we]) => {
        const isNight = ws === DUTY_WINDOW[0];
        if (rand() > (isNight ? 0.4 : 0.6)) return;
        let t = between(ws + 30, we - 70);
        const received = t - between(8, 25);
        const performed = Math.min(t, received + between(5, 15));
        const rec = newRecord(p, stamp(day, received), stamp(day, performed));
        const count = 1 + (rand() < 0.5 ? 1 : 0) + (rand() < 0.2 ? 1 : 0);
        for (let k = 0; k < count; k++) {
          t += k === 0 ? 0 : between(2, 5);
          const type = pick(ORDER_PROFILE[p.id]);
          const content = pick(CONTENTS[type]);
          const signed = t + between(2, 12);
          const executed = Math.min(signed + between(10, 60), we - 1);
          let signedAt = stamp(day, signed);
          let executedAt = stamp(day, executed);
          const createdAt = stamp(day, t);
          if (createdAt > NOW) continue;
          if (day >= "2026-10-14" && rand() < 0.2) {
            signedAt = "";
            executedAt = "";
          } else if (signedAt > NOW) {
            signedAt = "";
            executedAt = "";
          } else if (executedAt > NOW || rand() < 0.07) {
            executedAt = "";
          }
          newOrder(rec, p, type, content, createdAt, signedAt, executedAt);
        }
      });
    });
  });

  // Tình huống vi phạm theo bảng quy tắc D52
  function event(pid, day, receivedHm, performedHm, createdHm, signedAt, executedAt, type, content, extra) {
    const p = byId[pid];
    const at = (hm) => `${day}T${hm}`;
    const rec = newRecord(p, at(receivedHm), at(performedHm));
    newOrder(rec, p, type, content, at(createdHm), signedAt, executedAt, extra);
  }
  // R02: y lệnh trong khoảng nghỉ phép năm đã duyệt (17-19/08)
  event("NHN001", "2026-08-18", "10:10", "10:18", "10:20", "2026-08-18T10:25", "2026-08-18T10:50", "Thuốc", "Amlodipine 5mg, 1 viên/ngày buổi sáng");
  // R01: y lệnh trong khoảng nghỉ ốm đã xác minh (14-15/09)
  event("NHN003", "2026-09-15", "08:55", "09:00", "09:05", "2026-09-15T09:12", "2026-09-15T09:40", "Thủ thuật", "Thay băng vết mổ");
  // R03: y lệnh ngoài ca chiều 13:00-19:00 và không có lịch trực
  event("NHN002", "2026-09-24", "21:05", "21:10", "21:15", "2026-09-24T21:20", "2026-09-24T21:40", "Truyền dịch", "Truyền NaCl 0,9% 500ml trong 30 phút");
  // R03: y lệnh ngoài ca sáng 07:00-13:00 và không có lịch trực
  event("NHN007", "2026-07-21", "20:20", "20:25", "20:30", "2026-07-21T20:35", "2026-07-21T21:00", "Xét nghiệm", "Công thức máu");
  // R04: người ký khác người lập, nhật ký ký thao tác bằng tài khoản khác
  event("NHN008", "2026-08-26", "14:00", "14:05", "14:10", "2026-08-26T15:40", "2026-08-26T16:10", "Xét nghiệm", "Nhóm máu ABO, Rh", {
    signerId: "NHN002",
    executorId: "NHN008",
    _signAccount: "Lê Hoàng Minh",
  });
  // R04: người thực hiện khác người lập, nhật ký thực hiện bằng tài khoản khác
  event("NHN005", "2026-10-08", "13:55", "14:00", "14:05", "2026-10-08T14:10", "2026-10-08T15:30", "Chẩn đoán hình ảnh", "Siêu âm ổ bụng tổng quát", {
    executorId: "NHN002",
    _execAccount: "Lê Hoàng Minh",
  });
  // R05: nhiều y lệnh lặp lại khoảng cách lập - ký - thực hiện kéo dài nhiều ngày
  [
    ["2026-10-05", "2026-10-06T08:40", "2026-10-06T09:30", "Xét nghiệm", "Điện giải đồ"],
    ["2026-10-07", "2026-10-09T08:20", "2026-10-09T10:00", "Thuốc", "Ceftriaxone 1g truyền tĩnh mạch, 2 lần/ngày"],
    ["2026-10-09", "2026-10-12T08:30", "2026-10-12T09:15", "Chẩn đoán hình ảnh", "X-quang ngực thẳng"],
    ["2026-10-13", "2026-10-14T08:15", "2026-10-14T09:00", "Truyền dịch", "Truyền Ringer lactat 500ml, 40 giọt/phút"],
  ].forEach(([day, signedAt, executedAt, type, content]) => {
    event("NHN007", day, "09:00", "09:10", "09:20", signedAt, executedAt, type, content);
  });

  // ----- Gán mã -----
  // Bỏ hồ sơ không còn y lệnh nào (do vượt mốc thời điểm hiện tại)
  const usedRecords = new Set(orders.map((o) => o._rec));
  const keptRecords = records.filter((r) => usedRecords.has(r));
  keptRecords.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
  keptRecords.forEach((r, i) => {
    r.id = `HS${pad(i + 1, 3)}`;
    r.code = `HSBA-26${pad(i + 1, 4)}`;
    r.patientCode = `BN26${pad(i + 1, 4)}`;
  });

  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  orders.forEach((o, i) => {
    o.id = `YL${pad(i + 1, 3)}`;
    o.recordId = o._rec.id;
  });

  schedules.sort((a, b) => a.workDate.localeCompare(b.workDate) || a.practitionerId.localeCompare(b.practitionerId));
  schedules.forEach((s, i) => {
    s.id = `LV${pad(i + 1, 4)}`;
  });

  leaves.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.practitionerId.localeCompare(b.practitionerId));
  leaves.forEach((l, i) => {
    l.id = `NP${pad(i + 1, 3)}`;
  });

  // ----- Nhật ký hệ thống -----
  const ACCOUNT = {
    NHN001: "BS. Nguyễn Văn An",
    NHN002: "ĐD. Trần Thị Lan",
    NHN003: "BS. Phạm Quốc Huy",
    NHN004: "DS. Lê Thu Hà",
    NHN005: "KTV. Võ Minh Tuấn",
    NHN006: "BS. Đặng Ngọc Mai",
    NHN007: "BS. Hoàng Đức Long",
    NHN008: "HS. Bùi Thị Hương",
  };
  const logs = [];
  const log = (time, account, action, module, target, detail) => logs.push({ id: "", time, account, action, module, target, detail });

  orders.forEach((o) => {
    const target = `${o.id} - ${o.orderType}`;
    log(o.createdAt, ACCOUNT[o.creatorId], "Tạo", "Y lệnh", target, "Tạo mới");
    if (o.signedAt) log(o.signedAt, o._signAccount ?? ACCOUNT[o.signerId], "Ký", "Y lệnh", target, "Ký y lệnh");
    if (o.executedAt) log(o.executedAt, o._execAccount ?? ACCOUNT[o.executorId], "Thực hiện", "Y lệnh", target, "Thực hiện y lệnh");
  });
  leaves
    .filter((l) => l.status === "Đã duyệt")
    .forEach((l) => {
      const time = `${addDays(l.startDate, -3)}T09:00`;
      if (time <= NOW) log(time, "Quản trị HIS", "Duyệt", "Nghỉ phép/Vắng mặt", `${l.id} - ${byId[l.practitionerId].name}`, "Cập nhật: Trạng thái");
    });

  logs.sort((a, b) => b.time.localeCompare(a.time));
  const recentLogs = logs.slice(0, 500);
  recentLogs.forEach((l, i) => {
    l.id = `LOG${pad(i + 1, 3)}`;
  });

  return {
    leaves,
    schedules,
    records: keptRecords,
    orders: orders.map((o) => {
      const row = { ...o };
      // Bỏ trường tạm chỉ dùng để sinh nhật ký
      delete row._rec;
      delete row._signAccount;
      delete row._execAccount;
      return MODULES.orders.normalize(row);
    }),
    logs: recentLogs,
  };
}

// Bản ghi demo đi qua cùng hàm chuẩn hóa như khi người dùng nhập liệu
export function createSeed() {
  return { practitioners, ...generate() };
}
