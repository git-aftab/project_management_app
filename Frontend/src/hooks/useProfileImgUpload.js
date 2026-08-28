import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/api.js";

const generateUploadURL = async (avatarFile) => {
  const res = await api.post(`/api/v1/auth/presign`, {
    fileName: avatarFile.file,
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

const uploadImg = async () => {};
const useUploadImg = () => {};
