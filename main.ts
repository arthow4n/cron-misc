import { checkMailBox } from "./checkMailbox.ts";

Deno.cron("Ping if need to check mailbox", "30 14 * * *", async () => {
  await checkMailBox();
});
