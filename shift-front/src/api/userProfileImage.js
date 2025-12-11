import httpClient from "./httpClient";

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await httpClient.post("/chat/users/uploadProfileImage", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
