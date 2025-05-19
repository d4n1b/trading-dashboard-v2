import { createLogger } from "@/lib/logger";

const logger = createLogger({
  name: "cron-test",
});

async function main(): Promise<void> {
  logger.info("Hello from cron test");
}

main();
