import { Bot } from "npm:grammy";

const monthStrings = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

export const checkMailBox = async () => {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!botToken) {
    throw new Error("Missing env variable TELEGRAM_BOT_TOKEN");
  }

  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!chatId) {
    throw new Error("Missing env variable TELEGRAM_CHAT_ID");
  }

  const postalCode = Deno.env.get("POSTNORD_POSTALCODE");
  if (!postalCode?.match(/^[0-9]{5}$/)) {
    throw new Error(
      `Expected postal code to be 5 digits, but got: ${postalCode}`
    );
  }

  const response = await fetch(
    `https://portal.postnord.com/api/sendoutarrival/closest?postalCode=${encodeURIComponent(
      postalCode
    )}`
  );

  if (!response.ok) {
    throw new Error(`Unexpected response: ${await response.text()}`);
  }

  const responseJson = (await response.json()) as {
    postalCode: number;
    city: string;
    delivery: string; // e.g. "22 april, 2025"
    upcoming: string; // e.g. "24 april, 2025"
  };

  if (responseJson.postalCode.toString() !== postalCode) {
    throw new Error(
      `Unexpected response postal code: ${responseJson.postalCode} !== env ${postalCode}`
    );
  }

  const [, dayOfMonth, monthStringSv, year] = responseJson.delivery.match(
    new RegExp(`^([0-9]{1,2}) (${monthStrings.join("|")}), ([0-9]{4})$`)
  )!;

  const nextDeliveryDate = Temporal.PlainDate.from(
    `${year}-${(monthStrings.indexOf(monthStringSv) + 1)
      .toString()
      .padStart(2, "0")}-${dayOfMonth.padStart(2, "0")}`
  );
  const today = Temporal.Now.zonedDateTimeISO("Europe/Stockholm").toPlainDate();

  if (Temporal.PlainDate.compare(nextDeliveryDate, today) !== 0) {
    console.log(
      `Next delivery date is ${nextDeliveryDate}, which is not today ${today}, exiting.`
    );
    return;
  }

  console.log("It's the day!");

  const bot = new Bot(botToken);
  await bot.api.sendMessage(chatId, "PostNord kommer idag, kolla brevlåda!!");
};

if (import.meta.main) {
  await checkMailBox();
}
