import axios from "axios";
import { formatDate, startOfYear, endOfYear } from "date-fns";
import fs from "fs/promises";
import path from "node:path";

import { createLogger } from "@/lib/logger";

const OUTPUT_FOLDER = path.resolve(process.cwd(), "./public/assets/");
const OUTPUT_FILE_PATH = path.resolve(OUTPUT_FOLDER, "earnings_calendar.json");

const logger = createLogger({
  name: "fetch-earnings-calendar",
});

interface Stock {
  importance: number;
  symbol: string;
  date: string;
  time: string;
  title: string;
}

interface EarningsDay {
  stocks: Stock[];
  day: string;
  month: string;
  year: string;
  date_number: string;
  selected_copy: string;
  deselected_copy: string;
}

interface EarningsCalendarResponse {
  date_from: string;
  date_to: string;
  earnings: Record<string, EarningsDay>;
}

async function main(): Promise<void> {
  try {
    const startDate = formatDate(startOfYear(new Date()), "yyyy-MM-dd");
    const endDate = formatDate(endOfYear(new Date()), "yyyy-MM-dd");
    const url = [
      `https://api.stocktwits.com/api/2/discover/earnings_calendar?`,
      `date_from=${startDate}&`,
      `date_to=${endDate}`,
    ].join("");

    logger.info({ startDate, endDate }, "Fetching earnings calendar");

    const { data: earnings } = await axios.get<EarningsCalendarResponse>(url);
    await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
    await fs.writeFile(
      OUTPUT_FILE_PATH,
      JSON.stringify(earnings, null, 2),
      "utf-8"
    );

    logger.info(
      { outputPath: OUTPUT_FILE_PATH, dateRange: `${startDate} / ${endDate}` },
      "Earnings calendar data saved successfully"
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ error }, "Failed to fetch earnings calendar");
    } else {
      logger.error({ error }, "An unknown error occurred");
    }
    process.exit(1);
  }
}

main();
