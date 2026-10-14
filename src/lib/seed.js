import { SHIFTS } from "./constants";
import { MODULES } from "./modules";
import { at, day } from "./utils";

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

const leaves = [
  { id: "NP001", practitionerId: "NHN006", type: "Nghỉ thai sản", startDate: day(-30), endDate: day(60), status: "Đã duyệt", managingUnit: "Phòng Tổ chức cán bộ", reason: "Nghỉ thai sản theo quy định" },
  { id: "NP002", practitionerId: "NHN002", type: "Nghỉ phép năm", startDate: day(2), endDate: day(4), status: "Chờ duyệt", managingUnit: "Khoa Cấp cứu", reason: "Việc gia đình" },
  { id: "NP003", practitionerId: "NHN003", type: "Đi học/Đi công tác", startDate: day(5), endDate: day(6), status: "Chờ duyệt", managingUnit: "Khoa Ngoại", reason: "Tham dự hội thảo ngoại khoa" },
  { id: "NP004", practitionerId: "NHN004", type: "Nghỉ ốm", startDate: day(-2), endDate: day(-1), status: "Đã duyệt", managingUnit: "Khoa Dược", reason: "Có giấy nghỉ ốm" },
  { id: "NP005", practitionerId: "NHN005", type: "Nghỉ bù", startDate: day(-7), endDate: day(-7), status: "Đã duyệt", managingUnit: "Khoa Chẩn đoán hình ảnh", reason: "Bù ngày trực lễ" },
  { id: "NP006", practitionerId: "NHN007", type: "Nghỉ phép năm", startDate: day(10), endDate: day(14), status: "Chờ duyệt", managingUnit: "Khoa Cấp cứu", reason: "Nghỉ phép năm 2026" },
  { id: "NP007", practitionerId: "NHN008", type: "Nghỉ không lương", startDate: day(20), endDate: day(21), status: "Từ chối", managingUnit: "Khoa Sản", reason: "Việc cá nhân" },
  { id: "NP008", practitionerId: "NHN001", type: "Nghỉ phép năm", startDate: day(-10), endDate: day(-8), status: "Đã duyệt", managingUnit: "Khoa Nội tổng hợp", reason: "Nghỉ phép năm" },
];

// Lịch làm việc xen kẽ ca hành chính/sáng/chiều và ca trực đêm cho nhân sự đang công tác
const schedules = [];
practitioners
  .filter((p) => p.status === "Đang công tác")
  .forEach((p, i) => {
    for (let d = -2; d <= 3; d++) {
      const isDuty = (i + d) % 3 === 0;
      schedules.push({
        id: `LV${i}-${d + 3}`,
        practitionerId: p.id,
        workDate: day(d),
        shift: isDuty ? SHIFTS[3] : SHIFTS[[0, 1, 2][(i + d + 6) % 3]],
        category: isDuty ? "Lịch trực" : "Lịch làm việc",
        unit: p.department,
        note: "",
      });
    }
  });
schedules.push(
  { id: "LVX1", practitionerId: "NHN005", workDate: day(1), shift: SHIFTS[1], category: "Điều động", unit: "Khoa Cấp cứu", note: "Hỗ trợ siêu âm tại Khoa Cấp cứu" },
  { id: "LVX2", practitionerId: "NHN002", workDate: day(2), shift: SHIFTS[2], category: "Đổi ca", unit: "Khoa Cấp cứu", note: "Đổi ca với ca sáng ngày mai" },
  { id: "LVX3", practitionerId: "NHN001", workDate: day(-1), shift: SHIFTS[0], category: "Làm thêm", unit: "Khoa Nội tổng hợp", note: "Làm thêm giờ đợt khám sàng lọc" },
);

const records = [
  { id: "HS001", code: "HSBA-260001", facility: FAC1, type: "Cấp cứu", department: "Khoa Cấp cứu", patientCode: "BN260001", patientName: "Nguyễn Thị Hoa", gender: "Nữ", dob: "1968-03-12", phone: "0912345678", cccd: "079168001234", practitionerId: "NHN007", receivedAt: at(-1, "08:15"), performedAt: at(-1, "08:30") },
  { id: "HS002", code: "HSBA-260002", facility: FAC1, type: "Khám ngoại trú", department: "Khoa Nội tổng hợp", patientCode: "BN260002", patientName: "Trần Văn Bình", gender: "Nam", dob: "1985-07-21", phone: "0903112233", cccd: "079085005678", practitionerId: "NHN001", receivedAt: at(0, "07:50"), performedAt: at(0, "08:10") },
  { id: "HS003", code: "HSBA-260003", facility: FAC1, type: "Điều trị nội trú", department: "Khoa Nội tổng hợp", patientCode: "BN260003", patientName: "Lê Minh Châu", gender: "Nam", dob: "1956-11-02", phone: "0988765432", cccd: "079056009012", practitionerId: "NHN001", receivedAt: at(-3, "14:20"), performedAt: at(-3, "15:00") },
  { id: "HS004", code: "HSBA-260004", facility: FAC2, type: "Khám ngoại trú", department: "Khoa Ngoại", patientCode: "BN260004", patientName: "Phạm Đức Anh", gender: "Nam", dob: "1999-01-15", phone: "0977001122", cccd: "079099003344", practitionerId: "NHN003", receivedAt: at(0, "09:05"), performedAt: at(0, "09:20") },
  { id: "HS005", code: "HSBA-260005", facility: FAC1, type: "Khám ban đầu", department: "Khoa Sản", patientCode: "BN260005", patientName: "Hoàng Thị Thu", gender: "Nữ", dob: "1994-05-30", phone: "0969555666", cccd: "079194007788", practitionerId: "NHN008", receivedAt: at(0, "10:40"), performedAt: at(0, "10:55") },
  { id: "HS006", code: "HSBA-260006", facility: FAC1, type: "Cấp cứu", department: "Khoa Cấp cứu", patientCode: "BN260006", patientName: "Vũ Quang Khải", gender: "Nam", dob: "1977-09-09", phone: "0935443322", cccd: "079077002211", practitionerId: "NHN007", receivedAt: at(0, "11:30"), performedAt: at(0, "11:35") },
  { id: "HS007", code: "HSBA-260007", facility: FAC2, type: "Khám ngoại trú", department: "Khoa Nhi", patientCode: "BN260007", patientName: "Đỗ Thị Ngọc", gender: "Nữ", dob: "2020-02-14", phone: "0911223344", cccd: "", practitionerId: "NHN006", receivedAt: at(-2, "08:00"), performedAt: at(-2, "08:20") },
  { id: "HS008", code: "HSBA-260008", facility: FAC1, type: "Điều trị nội trú", department: "Khoa Ngoại", patientCode: "BN260008", patientName: "Bùi Văn Tài", gender: "Nam", dob: "1962-12-25", phone: "0918877665", cccd: "079062004455", practitionerId: "NHN003", receivedAt: at(-5, "16:00"), performedAt: at(-5, "16:30") },
];

const orders = [
  { id: "YL001", recordId: "HS001", orderType: "Xét nghiệm", content: "Công thức máu, sinh hóa máu cấp cứu", createdAt: at(-1, "08:35"), creatorId: "NHN007", signedAt: at(-1, "08:40"), signerId: "NHN007", executedAt: at(-1, "08:55"), executorId: "NHN002" },
  { id: "YL002", recordId: "HS001", orderType: "Chẩn đoán hình ảnh", content: "X-quang ngực thẳng", createdAt: at(-1, "08:36"), creatorId: "NHN007", signedAt: at(-1, "08:41"), signerId: "NHN007", executedAt: at(-1, "09:10"), executorId: "NHN005" },
  { id: "YL003", recordId: "HS001", orderType: "Thuốc", content: "Ceftriaxone 1g truyền tĩnh mạch, 2 lần/ngày", createdAt: at(-1, "08:45"), creatorId: "NHN007", signedAt: at(-1, "08:50"), signerId: "NHN007", executedAt: "", executorId: "NHN002" },
  { id: "YL004", recordId: "HS002", orderType: "Xét nghiệm", content: "Đường huyết mao mạch, HbA1c", createdAt: at(0, "08:00"), creatorId: "NHN001", signedAt: at(0, "08:05"), signerId: "NHN001", executedAt: "", executorId: "NHN002" },
  { id: "YL005", recordId: "HS002", orderType: "Thuốc", content: "Metformin 500mg, 2 viên/ngày sau ăn", createdAt: at(0, "08:00"), creatorId: "NHN001", signedAt: "", signerId: "", executedAt: "", executorId: "" },
  { id: "YL006", recordId: "HS003", orderType: "Chăm sóc điều dưỡng", content: "Theo dõi dấu hiệu sinh tồn 4 giờ/lần", createdAt: at(-3, "15:10"), creatorId: "NHN001", signedAt: at(-3, "15:20"), signerId: "NHN001", executedAt: at(-3, "18:00"), executorId: "NHN002" },
  { id: "YL007", recordId: "HS004", orderType: "Chẩn đoán hình ảnh", content: "Siêu âm ổ bụng tổng quát", createdAt: at(0, "09:25"), creatorId: "NHN003", signedAt: "", signerId: "", executedAt: "", executorId: "" },
  { id: "YL008", recordId: "HS005", orderType: "Xét nghiệm", content: "Nhóm máu, công thức máu", createdAt: at(0, "10:45"), creatorId: "NHN008", signedAt: at(0, "10:50"), signerId: "NHN008", executedAt: "", executorId: "NHN005" },
  { id: "YL009", recordId: "HS006", orderType: "Truyền dịch", content: "Truyền NaCl 0,9% 500ml trong 30 phút", createdAt: at(0, "11:35"), creatorId: "NHN007", signedAt: at(0, "11:37"), signerId: "NHN007", executedAt: at(0, "11:50"), executorId: "NHN002" },
  { id: "YL010", recordId: "HS008", orderType: "Thủ thuật", content: "Thay băng vết mổ", createdAt: at(-4, "16:45"), creatorId: "NHN003", signedAt: at(-4, "16:50"), signerId: "NHN003", executedAt: at(-4, "17:00"), executorId: "NHN002" },
  { id: "YL011", recordId: "HS007", orderType: "Chăm sóc điều dưỡng", content: "Theo dõi cân nặng và cho bú", createdAt: at(-2, "08:30"), creatorId: "NHN006", signedAt: at(-2, "08:35"), signerId: "NHN006", executedAt: "", executorId: "NHN002" },
];

const logs = [
  { id: "LOG001", time: at(0, "07:52"), account: "BS. Nguyễn Văn An", action: "Tạo", module: "Hồ sơ KCB", target: "HSBA-260002 - Trần Văn Bình", detail: "Tạo mới hồ sơ khám ngoại trú" },
  { id: "LOG002", time: at(0, "08:05"), account: "BS. Nguyễn Văn An", action: "Ký", module: "Y lệnh", target: "YL004 - Xét nghiệm", detail: "Ký y lệnh" },
  { id: "LOG003", time: at(0, "08:45"), account: "ĐD. Trần Thị Lan", action: "Thực hiện", module: "Y lệnh", target: "YL001 - Xét nghiệm", detail: "Thực hiện y lệnh" },
  { id: "LOG004", time: at(-1, "08:40"), account: "BS. Nguyễn Văn An", action: "Sửa", module: "Người hành nghề", target: "MDD-0001 - Nguyễn Văn An", detail: "Cập nhật: Chuyên môn" },
  { id: "LOG005", time: at(-1, "16:10"), account: "Quản trị HIS", action: "Duyệt", module: "Nghỉ phép/Vắng mặt", target: "NP008 - Nguyễn Văn An", detail: "Cập nhật: Trạng thái" },
  { id: "LOG006", time: at(-1, "16:30"), account: "Quản trị HIS", action: "Từ chối", module: "Nghỉ phép/Vắng mặt", target: "NP007 - Bùi Thị Hương", detail: "Cập nhật: Trạng thái" },
  { id: "LOG007", time: at(-2, "09:12"), account: "Lê Hoàng Minh", action: "Sửa", module: "Người hành nghề", target: "MDD-0006 - Đặng Ngọc Mai", detail: "Cập nhật: Trạng thái" },
  { id: "LOG008", time: at(-3, "18:00"), account: "ĐD. Trần Thị Lan", action: "Thực hiện", module: "Y lệnh", target: "YL006 - Chăm sóc điều dưỡng", detail: "Thực hiện y lệnh" },
  { id: "LOG009", time: at(-5, "16:55"), account: "Quản trị HIS", action: "Tạo", module: "Lịch làm việc/trực", target: "Lịch trực - Trần Thị Lan", detail: "Tạo mới lịch trực" },
  { id: "LOG010", time: at(-7, "09:00"), account: "Quản trị HIS", action: "Sửa", module: "Nghỉ phép/Vắng mặt", target: "NP005 - Võ Minh Tuấn", detail: "Cập nhật: Trạng thái, Đơn vị quản lý" },
];

// Bản ghi demo đi qua cùng hàm chuẩn hóa như khi người dùng nhập liệu
export function createSeed() {
  return {
    practitioners,
    leaves,
    schedules,
    records,
    orders: orders.map((o) => MODULES.orders.normalize(o)),
    logs: [...logs].sort((a, b) => b.time.localeCompare(a.time)),
  };
}
