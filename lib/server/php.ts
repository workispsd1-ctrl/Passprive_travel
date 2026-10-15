/**
 * Small equivalents of the PHP built-ins the original API relied on, so the
 * ported route handlers coerce request input exactly like bookings.php / rates.php.
 */

/** PHP `empty()`: missing, null, false, 0, 0.0, "", "0" and [] are empty. */
export function phpEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === false) return true;
  if (value === 0 || value === "" || value === "0") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/** PHP `isset()` on an array key: present and not null. */
export function phpIsset(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/** PHP string conversion as used by `trim()` on decoded JSON values. */
function phpToString(value: unknown): string {
  if (value === true) return "1";
  if (value === false || value === null || value === undefined) return "";
  return String(value);
}

/** PHP `trim()` with its default character list. */
export function phpTrim(value: unknown): string {
  return phpToString(value).replace(/^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g, "");
}

/** PHP `intval()` / `(int)` cast. */
export function phpIntval(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    const s = value.replace(/^[ \t\n\r\v\f]+/, "");
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s.trimEnd())) {
      const n = Number(s.trimEnd());
      return Number.isFinite(n) ? Math.trunc(n) : 0;
    }
    const lead = /^[+-]?\d+/.exec(s);
    return lead ? parseInt(lead[0], 10) : 0;
  }
  if (Array.isArray(value)) return value.length ? 1 : 0;
  if (value && typeof value === "object") return 1;
  return 0;
}

/** PHP `(bool)` cast. */
export function phpBool(value: unknown): boolean {
  return !phpEmpty(value);
}

/** PHP `floatval()`. */
export function phpFloatval(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    const m = /^[ \t\n\r\v\f]*([+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)/.exec(value);
    return m ? Number(m[1]) : 0;
  }
  return 0;
}

/** PHP `round()` (half away from zero) to `precision` decimals. */
export function phpRound(value: number, precision = 0): number {
  const factor = 10 ** precision;
  const scaled = Math.abs(value) * factor;
  const rounded = Math.round(scaled + Number.EPSILON * scaled) / factor;
  return value < 0 ? -rounded : rounded;
}

const pad = (n: number, width = 2) => String(n).padStart(width, "0");
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `date('Y-m-d')` */
export function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** `date('Ymd')` */
export function formatYmdCompact(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** `date('Y-m-d H:i:s')` */
export function formatYmdHis(d: Date): string {
  return `${formatYmd(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** `date('d M Y')` */
export function formatDMY(d: Date): string {
  return `${pad(d.getDate())} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** `strtotime('+N days')` relative to now. */
export function daysFromNow(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/** PHP `number_format($n, 0, '.', ',')`. */
export function numberFormat(n: number): string {
  return phpRound(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}
