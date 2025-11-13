import { Member } from './db';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const showNotification = (title: string, body: string, tag?: string): void => {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title,
        body,
        tag: tag || `notification-${Date.now()}`,
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: tag || `notification-${Date.now()}`,
        vibrate: [200, 100, 200],
      });
    }
  }
};

export const testNotification = (): void => {
  showNotification(
    'Test Notification',
    'Birthday reminders are working! You will receive notifications for upcoming birthdays.',
    'test-notification'
  );
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDaysUntilBirthday = (birthday: string): number => {
  const today = new Date();
  const birthDate = new Date(birthday);

  const thisYearBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  let nextBirthday = thisYearBirthday;
  if (thisYearBirthday < today) {
    nextBirthday = new Date(
      today.getFullYear() + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const checkAndSendBirthdayNotifications = (members: Member[]): void => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  members.forEach((member) => {
    const birthDate = new Date(member.birthday);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (isSameDay(thisYearBirthday, today)) {
      const currentHour = today.getHours();
      if (currentHour >= 9 && currentHour < 10) {
        showNotification(
          `🎉 Happy Birthday ${member.name}!`,
          `Today is ${member.name}'s birthday! Don't forget to wish them well!`,
          `birthday-${member.id}`
        );
      }
    }

    if (isSameDay(thisYearBirthday, tomorrow)) {
      showNotification(
        `🎂 Birthday Reminder`,
        `Tomorrow is ${member.name}'s birthday! Get ready to celebrate!`,
        `reminder-${member.id}`
      );
    }
  });
};

export const scheduleNotificationCheck = (members: Member[]): void => {
  checkAndSendBirthdayNotifications(members);

  setInterval(() => {
    checkAndSendBirthdayNotifications(members);
  }, 60 * 60 * 1000);
};
