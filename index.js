const { 
  Client, 
  GatewayIntentBits, 
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "!";

// تحميل بيانات الترحيب
let welcomeData = {};
if (fs.existsSync("./welcome.json")) {
  welcomeData = JSON.parse(fs.readFileSync("./welcome.json"));
}

// عند تشغيل البوت
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: "dnd",
    activities: [{
      name: "Managing Welcome System",
      type: ActivityType.Playing
    }]
  });
});

// أمر !ترحيب
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ترحيب") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ هذا الأمر للإدمن فقط");
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("set_channel")
        .setLabel("📢 تحديد روم الترحيب")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("set_message")
        .setLabel("✉️ تحديد رسالة الترحيب")
        .setStyle(ButtonStyle.Secondary)
    );

    message.reply({
      content: "⚙️ إعدادات الترحيب:",
      components: [row]
    });
  }
});

// الأزرار
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "❌ إدمن فقط", ephemeral: true });
  }

  const guildId = interaction.guild.id;
  if (!welcomeData[guildId]) welcomeData[guildId] = {};

  // اختيار الروم
  if (interaction.customId === "set_channel") {
    const channel = interaction.channel;

    welcomeData[guildId].channel = channel.id;
    fs.writeFileSync("./welcome.json", JSON.stringify(welcomeData, null, 2));

    interaction.reply({
      content: `✅ تم تعيين روم الترحيب: ${channel}`,
      ephemeral: true
    });
  }

  // اختيار الرسالة
  if (interaction.customId === "set_message") {
    interaction.reply({
      content: "✍️ اكتب رسالة الترحيب الآن (استخدم {user} لاسم العضو)",
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessages({
      filter,
      max: 1,
      time: 60000
    });

    if (!collected.size) return;

    welcomeData[guildId].message = collected.first().content;
    fs.writeFileSync("./welcome.json", JSON.stringify(welcomeData, null, 2));

    interaction.followUp({
      content: "✅ تم حفظ رسالة الترحيب",
      ephemeral: true
    });
  }
});

// عند دخول عضو جديد
client.on("guildMemberAdd", member => {
  const data = welcomeData[member.guild.id];
  if (!data) return;
  if (!data.channel || !data.message) return;

  const channel = member.guild.channels.cache.get(data.channel);
  if (!channel) return;

  const msg = data.message.replace("{user}", `<@${member.id}>`);
  channel.send(msg);
});

// تشغيل البوت
client.login(process.env.TOKEN);
