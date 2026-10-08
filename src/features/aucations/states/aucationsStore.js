import { defineStore } from "pinia";
import { ref } from "vue";
import { createRunner } from "../../../helpers/storeHelper.js";
import {
  deleteAllAucations,
  deleteAucation,
  deleteBid,
  getAucation,
  getAucations,
  postAucation,
  postBid,
  postCover,
  putAucation,
} from "../api/aucationApi.js";

export const useAucationsStore = defineStore("aucations", () => {
  const { error, message, run } = createRunner();

  const aucations = ref([]);
  const aucation = ref(null);

  const isAucation = ref(false); // sedang memuat daftar / detail
  const isAucationLoaded = ref(false);
  const isAucationAdd = ref(false);
  const isAucationAdded = ref(false);
  const isAucationChange = ref(false);
  const isAucationChanged = ref(false);
  const isAucationChangeCover = ref(false);
  const isAucationChangedCover = ref(false);
  const isAucationDelete = ref(false);
  const isAucationDeleted = ref(false);
  const isBidAdd = ref(false);
  const isBidAdded = ref(false);
  const isBidDelete = ref(false);
  const isBidDeleted = ref(false);
  const isAucationDeleteAll = ref(false);
  const isAucationDeletedAll = ref(false);

  const fetchAucations = (query) =>
    run(isAucation, isAucationLoaded, async () => {
      const response = await getAucations(query);
      aucations.value = response.data.aucations;
      return response.message;
    });

  const fetchAucation = (id) =>
    run(isAucation, isAucationLoaded, async () => {
      const response = await getAucation(id);
      aucation.value = response.data.aucation;
      return response.message;
    });

  const addAucation = (payload) =>
    run(isAucationAdd, isAucationAdded, async () => (await postAucation(payload)).message);

  const changeAucation = (id, payload) =>
    run(isAucationChange, isAucationChanged, async () => (await putAucation(id, payload)).message);

  const changeCover = (id, file) =>
    run(isAucationChangeCover, isAucationChangedCover, async () => (await postCover(id, file)).message);

  const removeAucation = (id) =>
    run(isAucationDelete, isAucationDeleted, async () => (await deleteAucation(id)).message);

  const addBid = (id, bid) => run(isBidAdd, isBidAdded, async () => (await postBid(id, bid)).message);

  const removeBid = (id) => run(isBidDelete, isBidDeleted, async () => (await deleteBid(id)).message);

  const removeAllAucations = () =>
    run(isAucationDeleteAll, isAucationDeletedAll, async () => (await deleteAllAucations()).message);

  return {
    error,
    message,
    aucations,
    aucation,
    isAucation,
    isAucationLoaded,
    isAucationAdd,
    isAucationAdded,
    isAucationChange,
    isAucationChanged,
    isAucationChangeCover,
    isAucationChangedCover,
    isAucationDelete,
    isAucationDeleted,
    isBidAdd,
    isBidAdded,
    isBidDelete,
    isBidDeleted,
    isAucationDeleteAll,
    isAucationDeletedAll,
    fetchAucations,
    fetchAucation,
    addAucation,
    changeAucation,
    changeCover,
    removeAucation,
    addBid,
    removeBid,
    removeAllAucations,
  };
});
