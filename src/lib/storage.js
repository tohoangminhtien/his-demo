const STORAGE_KEY = "his-demo:state:v1";

// Mọi thao tác localStorage đều bọc try/catch: chế độ riêng tư hoặc bị chặn vẫn chạy được
export function loadState() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    return parsed && Array.isArray(parsed.practitioners) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Bỏ qua: dữ liệu vẫn còn trong bộ nhớ của phiên hiện tại
  }
}
