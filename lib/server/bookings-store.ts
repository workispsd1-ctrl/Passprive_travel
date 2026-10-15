import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Booking } from "@/lib/bookings";

const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "bookings.json");

let queue: Promise<unknown> = Promise.resolve();

/**
 * Serializes read-modify-write cycles on the JSON file (the PHP version used
 * flock() for the same purpose).
 */
export function withBookingsLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function ensureStorage(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(STORAGE_FILE);
  } catch {
    await writeFile(STORAGE_FILE, JSON.stringify([], null, 4));
  }
}

export async function readBookings(): Promise<Booking[]> {
  await ensureStorage();
  try {
    const data: unknown = JSON.parse(await readFile(STORAGE_FILE, "utf8"));
    return Array.isArray(data) ? (data as Booking[]) : [];
  } catch {
    return [];
  }
}

/** Writes atomically (temp file + rename). Returns false on failure, like the PHP writer. */
export async function writeBookings(bookings: Booking[]): Promise<boolean> {
  const tmp = `${STORAGE_FILE}.${process.pid}.tmp`;
  try {
    await ensureStorage();
    await writeFile(tmp, JSON.stringify(bookings, null, 4));
    await rename(tmp, STORAGE_FILE);
    return true;
  } catch {
    return false;
  }
}
