import { apiDelete, apiGet, apiPost, apiPut } from "../../../helpers/apiHelper.js";

// query: { is_me: 1, is_closed: 0 | 1 }
export const getAucations = (query) => apiGet("/aucations", query);

export const getAucation = (id) => apiGet(`/aucations/${id}`);

// payload: { title, description, start_bid, closed_at }
export const postAucation = (payload) => apiPost("/aucations", payload);

export const putAucation = (id, payload) => apiPut(`/aucations/${id}`, payload);

export function postCover(id, file) {
  const form = new FormData();
  form.append("cover", file);
  return apiPost(`/aucations/${id}/cover`, form);
}

export const deleteAucation = (id) => apiDelete(`/aucations/${id}`);

export const postBid = (id, bid) => apiPost(`/aucations/${id}/bids`, { bid });

export const deleteBid = (id) => apiDelete(`/aucations/${id}/bids`);

export const deleteAllAucations = () => apiDelete("/aucations");
