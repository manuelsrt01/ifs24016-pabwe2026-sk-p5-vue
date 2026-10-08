const TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options) {
  const { method, query, body } = options;
  const url = new URL(`${DELCOM_BASEURL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }

  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), { method, headers, body: payload });

  let json;
  try {
    json = await response.json();
  } catch {
    json = { status: "fail", message: "Respons server tidak valid" };
  }

  if (json.status !== "success") {
    const error = new Error(json.message);
    error.data = json.data;
    throw error;
  }

  return json;
}

export const apiGet = (path, query) => apiFetch(path, { method: "GET", query });
export const apiPost = (path, body) => apiFetch(path, { method: "POST", body });
export const apiPut = (path, body) => apiFetch(path, { method: "PUT", body });
export const apiDelete = (path) => apiFetch(path, { method: "DELETE" });
