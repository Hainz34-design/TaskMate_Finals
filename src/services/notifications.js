import { Platform } from 'react-native';

const CHANNEL_ID = 'tasks';

// expo-notifications only works on phones (not on web), so load it only there
function getNotifications() {
  if (Platform.OS === 'web') return null;
  // eslint-disable-next-line global-require
  return require('expo-notifications');
}

// Ask for permission, create the Android channel, and show notifications while the app is open
export async function setupNotifications() {
  const N = getNotifications();
  if (!N) return false;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Task reminders',
        importance: N.AndroidImportance.HIGH,
      });
    }

    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await N.requestPermissionsAsync();
    return asked.granted;
  } catch (e) {
    console.warn('Could not set up notifications:', e.message);
    return false;
  }
}

// Show a notification right now (used as a test when the switch is turned on)
export async function notifyNow(title, body) {
  const N = getNotifications();
  if (!N) return;
  try {
    await N.scheduleNotificationAsync({
      content: { title, body },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
  } catch (e) {
    console.warn('Could not show notification:', e.message);
  }
}

// dueDate is MM/DD/YYYY and time is "HH:MM AM/PM". No time means 9:00 AM.
function dueDateTime(task) {
  const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(task.dueDate || '');
  if (!d) return null;
  let hour = 9;
  let minute = 0;
  let hasTime = false;
  const t = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(task.time || '');
  if (t) {
    hour = Number(t[1]) % 12;
    if (t[3].toUpperCase() === 'PM') hour += 12;
    minute = Number(t[2]);
    hasTime = true;
  }
  return { date: new Date(Number(d[3]), Number(d[1]) - 1, Number(d[2]), hour, minute), hasTime };
}

async function runSync(tasks, enabled) {
  const N = getNotifications();
  if (!N) return;
  try {
    // Start fresh every time so changed or finished tasks never leave old reminders behind
    await N.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    const permission = await N.getPermissionsAsync();
    if (!permission.granted) return;

    const items = [];
    for (const task of tasks) {
      if (task.completed) continue;
      const due = dueDateTime(task);
      if (!due) continue;

      items.push({
        at: due.date,
        title: due.hasTime ? 'Task due now' : 'Due today',
        body: task.title,
      });

      // "Remind me" in More Options adds an early heads-up
      if (task.reminder) {
        const early = due.hasTime
          ? new Date(due.date.getTime() - 60 * 60 * 1000)
          : new Date(due.date.getFullYear(), due.date.getMonth(), due.date.getDate() - 1, 20, 0);
        items.push({
          at: early,
          title: due.hasTime ? 'Due in 1 hour' : 'Due tomorrow',
          body: task.title,
        });
      }
    }

    const now = Date.now();
    // iPhones allow about 64 scheduled notifications, so keep the 60 soonest
    const upcoming = items
      .filter((i) => i.at.getTime() > now)
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .slice(0, 60);

    for (const item of upcoming) {
      await N.scheduleNotificationAsync({
        content: { title: item.title, body: item.body },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: item.at, channelId: CHANNEL_ID },
      });
    }
  } catch (e) {
    console.warn('Could not schedule reminders:', e.message);
  }
}

// Runs one sync at a time so two quick task changes can't overlap
let chain = Promise.resolve();
export function syncTaskReminders(tasks, enabled) {
  chain = chain.then(() => runSync(tasks, enabled));
  return chain;
}
