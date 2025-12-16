const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ----- سلاش كوماند بوت سستم -----
const commands = [
  { name: 'ping', description: 'يرد عليك Pong!' },
  { name: 'say', description: 'البوت يكرر كلامك', options: [{ name: 'message', type: 3, description: 'الرسالة', required: true }] },
  { name: 'userinfo', description: 'عرض معلومات المستخدم', options: [{ name: 'user', type: 6, description: 'المستخدم', required: false }] },
  { name: 'serverinfo', description: 'عرض معلومات السيرفر' },
  { name: 'kick', description: 'طرد عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'ban', description: 'حظر عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'unban', description: 'رفع الحظر عن عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'mute', description: 'كتم عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'unmute', description: 'إزالة الكتم عن عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'warn', description: 'تحذير عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'warnings', description: 'عرض تحذيرات عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'clear', description: 'حذف عدد من الرسائل', options: [{ name: 'amount', type: 4, description: 'عدد الرسائل', required: true }] },
  { name: 'role-add', description: 'إضافة رتبة لعضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }, { name: 'role', type: 8, description: 'الرتبة', required: true }] },
  { name: 'role-remove', description: 'إزالة رتبة من عضو', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }, { name: 'role', type: 8, description: 'الرتبة', required: true }] },
  { name: 'ticket-create', description: 'إنشاء تذكرة' },
  { name: 'ticket-close', description: 'إغلاق التذكرة الحالية' },
  { name: 'ticket-add', description: 'إضافة عضو للتذكرة', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'ticket-remove', description: 'إزالة عضو من التذكرة', options: [{ name: 'user', type: 6, description: 'المستخدم', required: true }] },
  { name: 'avatar', description: 'عرض صورة الملف الشخصي', options: [{ name: 'user', type: 6, description: 'المستخدم', required: false }] },
  { name: 'help', description: 'عرض جميع الأوامر' }
];

// تسجيل السلاش كوماند
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('جاري تسجيل السلاش كوماند...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('تم تسجيل السلاش كوماند!');
  } catch (error) {
    console.error(error);
  }
})();

// ----- تشغيل البوت -----
client.once('ready', () => {
  console.log(`البوت شغال ✅ اسم البوت: ${client.user.tag}`);
  client.user.setActivity('البوت بث تويتش', { type: 1 }); // Streaming
});

// ----- التعامل مع الأوامر -----
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName, options } = interaction;

  // الردود الأساسية
  if (commandName === 'ping') return interaction.reply('Pong!');
  if (commandName === 'say') return interaction.reply(options.getString('message'));
  if (commandName === 'help') return interaction.reply('هذه قائمة الأوامر المتاحة: /ping, /say, /userinfo, /serverinfo, /kick, /ban, /unban, /mute, /unmute, /warn, /warnings, /clear, /role-add, /role-remove, /ticket-create, /ticket-close, /ticket-add, /ticket-remove, /avatar, /help');
  if (commandName === 'ticket-create') return interaction.reply('تم إنشاء تذكرتك!');
  if (commandName === 'ticket-close') return interaction.reply('تم إغلاق التذكرة!');
  if (commandName === 'ticket-add') return interaction.reply(`تم إضافة ${options.getUser('user').tag} للتذكرة`);
  if (commandName === 'ticket-remove') return interaction.reply(`تم إزالة ${options.getUser('user').tag} من التذكرة`);
  
  // باقي الأوامر تقدر تضيفها بنفس الطريقة لاحقًا
  await interaction.reply(`تم تنفيذ الأمر: ${commandName}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
