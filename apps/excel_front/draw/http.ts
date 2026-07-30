import axios from "axios";
import Cookies from "js-cookie";
import { HTTP_BACKEND } from "@/config";

/**
 * Loads the persisted message stream for a room. Each stored chat row holds a
 * JSON-encoded wire message — a shape (create) or a delete/update marker. We
 * return them in order so the Game engine can fold them into final state.
 */
export const getExistingShape = async (roomId: string) => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const messages = response.data.messages ?? [];
    // The backend returns newest-first; fold them oldest-first so that
    // delete/update markers are applied after the shapes they reference.
    return messages
      .slice()
      .reverse()
      .map((x: { message: string }) => {
        try {
          return JSON.parse(x.message);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    console.error("getExistingShape failed", e);
    return [];
  }
};
