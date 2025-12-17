const {
  Client,
  GatewayIntentBits,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const DATA_FILE = "./welcome.json";
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");

// ====== READY ======
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "Welcome system", type: ActivityType.Playing }],
    status: "dnd" // مشغول
  });
});

// ====== MESSAGE COMMAND ======
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!ترحيب") return;

  // فقط صاحب السيرفر أو ادمن
  if (
    message.guild.ownerId !== message.author.id &&
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    return message.reply("❌ هذا الأمر فقط للأدمن أو صاحب السيرفر");
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("set_text")
      .setLabel("📝 تعيين نص الترحيب")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("set_channel")
      .setLabel("📢 تعيين روم الترحيب")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("set_image")
      .setLabel("🖼️ تعيين صورة")
      .setStyle(ButtonStyle.Success)
  );

  message.reply({
    content: "اختر إعداد الترحيب:",
    components: [row]
  });
});

// ====== BUTTONS ======
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const guildId = interaction.guild.id;
  if (!data[guildId]) data[guildId] = {};

  if (interaction.customId === "set_text") {
    data[guildId].text = "أهلاً بك {user} في سيرفر {server} 🌸";
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return interaction.reply({ content: "✅ تم تعيين نص الترحيب", ephemeral: true });
  }

  if (interaction.customId === "set_channel") {
    data[guildId].channel = interaction.channel.id;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return interaction.reply({ content: "✅ تم تعيين هذا الروم للترحيب", ephemeral: true });
  }

  if (interaction.customId === "set_image") {
    data[guildId].image =
      "https://media.discordapp.net/attachments/123/123/welcome.png";
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return interaction.reply({ content: "✅ تم تعيين صورة الترحيب", ephemeral: true });
  }
});

// ====== MEMBER JOIN ======
client.on("guildMemberAdd", (member) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const guildData = data[member.guild.id];
  if (!guildData || !guildData.channel) return;

  const channel = member.guild.channels.cache.get(guildData.channel);
  if (!channel) return;

  let text = guildData.text || "أهلاً بك {user}";
  text = text
    .replace("{user}", `<@${member.id}>`)
    .replace("{server}", member.guild.name);

  channel.send({
    content: text,
    files: guildData.image ? [guildData.image] : []
  });
});

// ====== LOGIN ======
client.login(process.env.BOT_TOKEN);
