const {
  Client,
  GatewayIntentBits,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// تخزين مؤقت (بدون ملفات)
const welcomeData = {};

// READY
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "Welcome system", type: ActivityType.Playing }],
    status: "dnd"
  });
});

// COMMAND
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!ترحيب") return;

  if (
    message.guild.ownerId !== message.author.id &&
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    return message.reply("❌ هذا الأمر فقط للأدمن أو صاحب السيرفر");
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("text")
      .setLabel("📝 نص الترحيب")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("channel")
      .setLabel("📢 روم الترحيب")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("image")
      .setLabel("🖼️ صورة الترحيب")
      .setStyle(ButtonStyle.Success)
  );

  message.reply({ content: "اختر إعداد الترحيب:", components: [row] });
});

// BUTTONS
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  const gid = i.guild.id;
  if (!welcomeData[gid]) welcomeData[gid] = {};

  if (i.customId === "text") {
    welcomeData[gid].text = "أهلاً {user} في {server} 🌸";
    return i.reply({ content: "✅ تم تعيين النص", ephemeral: true });
  }

  if (i.customId === "channel") {
    welcomeData[gid].channel = i.channel.id;
    return i.reply({ content: "✅ تم تعيين الروم", ephemeral: true });
  }

  if (i.customId === "image") {
    welcomeData[gid].image = null;
    return i.reply({ content: "✅ بدون صورة (حاليًا)", ephemeral: true });
  }
});

// MEMBER JOIN
client.on("guildMemberAdd", (member) => {
  const data = welcomeData[member.guild.id];
  if (!data || !data.channel) return;

  const ch = member.guild.channels.cache.get(data.channel);
  if (!ch) return;

  let msg = (data.text || "أهلاً {user}")
    .replace("{user}", `<@${member.id}>`)
    .replace("{server}", member.guild.name);

  ch.send(msg);
});

// LOGIN
client.login(process.env.BOT_TOKEN);
