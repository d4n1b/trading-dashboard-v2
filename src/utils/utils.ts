import { config } from "../config";

export const delay = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const flushAllCache = (prefix: string) => {
  const allKeys: string[] = [
    ...Object.keys(window.localStorage).filter((key) => key.startsWith(prefix)),
    ...Object.values(config.cacheKey),
  ];

  for (const key of allKeys) {
    window.localStorage.removeItem(key);
  }
};

export const flushAccountCache = (prefix: string) => {
  const cacheKeys = [
    `${prefix}${config.cacheKey.SYNCED_AT}`,
    `${prefix}${config.cacheKey.ACCOUNT_BALANCE}`,
    `${prefix}${config.cacheKey.ACCOUNT_METADATA}`,
  ];

  const allKeys: string[] = Object.keys(window.localStorage).filter(
    (storedKey) =>
      cacheKeys.some((targetKey) => storedKey.startsWith(targetKey))
  );

  for (const key of allKeys) {
    window.localStorage.removeItem(key);
  }
};

export const flushPositionsCache = (prefix: string) => {
  const cacheKeys = [
    `${prefix}${config.cacheKey.POSITIONS}`,
    `${prefix}${config.cacheKey.INSTRUMENTS}`,
    `${prefix}${config.cacheKey.TRANSACTIONS}`,
    `${prefix}${config.cacheKey.EARNINGS_CALENDAR}`,
  ];

  const allKeys: string[] = Object.keys(window.localStorage).filter(
    (storedKey) =>
      cacheKeys.some((targetKey) => storedKey.startsWith(targetKey))
  );

  for (const key of allKeys) {
    window.localStorage.removeItem(key);
  }
};

export const flushDividendsCache = (prefix: string) => {
  const cacheKeys = [`${prefix}${config.cacheKey.DIVIDENDS}`];

  const allKeys: string[] = Object.keys(window.localStorage).filter(
    (storedKey) =>
      cacheKeys.some((targetKey) => storedKey.startsWith(targetKey))
  );

  for (const key of allKeys) {
    window.localStorage.removeItem(key);
  }
};

export const getAccountSyncedAt = (prefix: string) => {
  const key = `${prefix}${config.cacheKey.SYNCED_AT}`;

  return window.localStorage.getItem(key);
};

export const setAccountSyncedAtIfNeeded = (prefix: string) => {
  const key = `${prefix}${config.cacheKey.SYNCED_AT}`;

  if (!window.localStorage.getItem(key)) {
    window.localStorage.setItem(key, new Date().toISOString());
  }
};

export function jsonToCsv<T extends object>(
  data: T[],
  keys: (keyof T)[] = [],
  headerMap: Partial<Record<keyof T, string>> = {}
): string {
  const replacer = (key: string, value: unknown) =>
    value === null ? "" : value;
  const header = keys.length > 0 ? keys : (Object.keys(data[0]) as (keyof T)[]);
  const csvHeader = header.map((field) => headerMap[field] || field).join(",");

  const csvBody = data.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(",")
  );

  const csv = [csvHeader, ...csvBody].join("\r\n");

  return csv;
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download === undefined) {
    alert("Download featured not enabled");
    return;
  }

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
