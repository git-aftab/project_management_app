import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/api.js";
import axios from "axios";

const generateUploadURL = async (avatarFile) => {
  const res = await api.post(`/api/v1/auth/presign`, {
    fileName: avatarFile.name,
    contentType: avatarFile.type,
  });
  console.log("presigned URL:", res.data.data);
  return res.data.data;
};

export const useGenerateUrl = () => {
  return useMutation({
    mutationFn: generateUploadURL,
  });
};

const uploadImg = async ({ url, file }) => {
  const res = await axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
  console.log("Upload res:", res.status);
  if (res.status === 200) console.log("Img Uploaded");
};
export const useUploadImg = () => {
  return useMutation({
    mutationFn: uploadImg,
  });
};
