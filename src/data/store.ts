/*
 ^ In-memory store for user preferences
 */
import type { Preferences } from "../domain/types.js";

const store = new Map<string, Preferences>();
export default store;
