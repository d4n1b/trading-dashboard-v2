import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const delay = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
