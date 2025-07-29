export function getUserFromLocalStorage() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token || token.split(".").length !== 3) {
    console.error("Invalid token format");
    return null;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );

    console.log("Token from localStorage:", token);
    console.log("Decoded base64:", base64);
    console.log("Decoded payload:", jsonPayload);

    const parsed = JSON.parse(jsonPayload);
    return parsed;
  } catch (err) {
    console.error("Error decoding token", err);
    return null;
  }
}
