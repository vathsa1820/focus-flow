import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'focus-flow-reminder-time';
const LAST_FIRED_KEY = 'focus-flow-reminder-last-fired';

export function useNotificationReminder() {
  const [reminderTime, setReminderTimeState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || ''
  );
  const [permission, setPermission] = useState<NotificationPermission>(
    () => ('Notification' in window ? Notification.permission : 'denied')
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const setReminderTime = (time: string) => {
    setReminderTimeState(time);
    if (time) {
      localStorage.setItem(STORAGE_KEY, time);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_FIRED_KEY);
    }
  };

  const clearReminder = () => setReminderTime('');

  const fireNotification = () => {
    if (Notification.permission !== 'granted') return;
    new Notification('Focus Flow 🌿', {
      body: "Time to check your habits! Let's keep the streak going 💪",
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  };

  // Check every minute if the reminder should fire
  useEffect(() => {
    if (!reminderTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const check = () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const [hh, mm] = reminderTime.split(':').map(Number);
      const todayKey = now.toISOString().split('T')[0];
      const lastFired = localStorage.getItem(LAST_FIRED_KEY);

      if (
        now.getHours() === hh &&
        now.getMinutes() === mm &&
        lastFired !== todayKey
      ) {
        fireNotification();
        localStorage.setItem(LAST_FIRED_KEY, todayKey);
      }
    };

    check(); // run immediately on mount
    intervalRef.current = setInterval(check, 30_000); // check every 30s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminderTime]);

  return { reminderTime, setReminderTime, clearReminder, permission, requestPermission };
}
