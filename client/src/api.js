export async function getConfig() {
  const res = await fetch("/api/config");
  return res.json();
}

export async function createSession(payload) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal memulai sesi.");
  return data;
}

export async function addModel(payload) {
  const res = await fetch("/api/models", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal menambah agent.");
  return data;
}

export async function patchModel(id, payload) {
  const res = await fetch(`/api/models/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");
  return data;
}

export async function deleteModel(id) {
  await fetch(`/api/models/${id}`, { method: "DELETE" });
}

export function subscribeToSession(sessionId, handlers) {
  const es = new EventSource(`/api/session/${sessionId}/stream`);
  Object.entries(handlers).forEach(([type, handler]) => {
    es.addEventListener(type, (e) => handler(e.data ? JSON.parse(e.data) : {}));
  });
  es.addEventListener("stream-end", () => es.close());
  return () => es.close();
}
