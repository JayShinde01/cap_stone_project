// src/services/uploadService.js
import axios from "axios";

const UPLOAD_URL = "http://localhost:3000/api/upload";

export const uploadImage = async (file, itemNumber) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("itemNumber", itemNumber);

  return await axios.post(UPLOAD_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
