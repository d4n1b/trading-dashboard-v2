import axios from "axios";
import { formatDate, startOfYear, endOfYear } from "date-fns";
import fs from "fs/promises";
import path from "node:path";
import chalk from "chalk";

const main = async () => {
  try {
    const outputFolder = path.resolve(process.cwd(), "./public/assets/");

    const startDate = formatDate(startOfYear(new Date()), "yyyy-MM-dd");
    const endDate = formatDate(endOfYear(new Date()), "yyyy-MM-dd");
    const url = [
      `https://api.stocktwits.com/api/2/discover/earnings_calendar?`,
      `date_from=${startDate}&`,
      `date_to=${endDate}`,
    ].join("");

    const { data: earnings } = await axios.get(url);
    await fs.mkdir(outputFolder, { recursive: true });
    await fs.writeFile(
      path.resolve(outputFolder, "earnings_calendar.json"),
      JSON.stringify(earnings, null, 2),
      "utf-8"
    );
    console.log(
      chalk.green(
        "✓ Success: Earnings calendar data saved for range",
        `${startDate} / ${endDate}`
      )
    );
  } catch (error) {
    console.error(chalk.red("✗ Error:", error.message));
    process.exit(1);
  }
};

main();
