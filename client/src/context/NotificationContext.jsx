import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { appointmentsAPI, emergencyAPI } from '../api';
import { showToast } from '../components/Toast';

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

const NOTIFICATION_CHECK_INTERVAL = 60000;

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const firedNotifications = useRef(new Set());
  const knownEmergencyIds = useRef(new Set());
  const intervalRef = useRef(null);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
      return true;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      setPermissionGranted(granted);
      return granted;
    }
    return false;
  }, []);

  const sendBrowserNotification = useCallback((title, body, tag) => {
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag,
          requireInteraction: true,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (e) {
        console.log('Browser notification failed:', e);
      }
    }
  }, []);

  const addNotification = useCallback((notification) => {
    const id = notification.id || `${notification.appointmentId}-${notification.type}-${notification.scheduledTime}`;
    if (firedNotifications.current.has(id)) return;

    firedNotifications.current.add(id);

    const newNotification = {
      id,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    sendBrowserNotification(notification.title, notification.body, id);
    showToast(notification.title, notification.type === 'emergency' ? 'warning' : 'success');
  }, [sendBrowserNotification]);

  const checkEmergencies = useCallback(async () => {
    if (!user || user.role !== 'doctor') return;

    try {
      const emergencies = await emergencyAPI.getAll();
      const active = emergencies.filter(e => e.status === 'pending' || e.status === 'dispatched');

      active.forEach(emergency => {
        if (knownEmergencyIds.current.has(emergency.id)) return;
        knownEmergencyIds.current.add(emergency.id);

        addNotification({
          id: `emergency-${emergency.id}`,
          type: 'emergency',
          scheduledTime: emergency.created_at,
          title: `🚨 New Emergency: ${emergency.patient_name}`,
          body: `${emergency.description || 'Emergency'}${emergency.location_address ? ` at ${emergency.location_address}` : ''}${emergency.patient_blood_type ? ` • Blood: ${emergency.patient_blood_type}` : ''}`,
        });
      });
    } catch (error) {
      console.error('Failed to check emergencies:', error);
    }
  }, [user, addNotification]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const checkUpcomingAppointments = useCallback(async () => {
    if (!user) return;

    try {
      const appointments = await appointmentsAPI.getAll();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      appointments.forEach(apt => {
        if (apt.status === 'cancelled' || apt.status === 'completed') return;

        const [hours, minutes] = apt.appointment_time.split(':').map(Number);
        const appointmentMinutes = hours * 60 + minutes;
        const minutesUntil = appointmentMinutes - currentMinutes;

        const isToday = apt.appointment_date === todayStr;

        const targetName = user.role === 'doctor' ? apt.patient_name : apt.doctor_name;
        const typeLabel = apt.consultation_type === 'online' ? 'Video Call' : 'In-Clinic';

        if (isToday && minutesUntil > 0 && minutesUntil <= 15) {
          const reminderId = `${apt.id}-15min-${apt.appointment_time}`;
          if (!firedNotifications.current.has(reminderId)) {
            addNotification({
              appointmentId: apt.id,
              type: 'reminder',
              scheduledTime: apt.appointment_time,
              title: `Appointment in ${minutesUntil} minutes`,
              body: `With ${targetName} at ${apt.appointment_time} (${typeLabel})`,
            });
          }
        }

        if (isToday) {
          const dayOfId = `${apt.id}-dayof-${apt.appointment_date}`;
          if (!firedNotifications.current.has(dayOfId)) {
            addNotification({
              appointmentId: apt.id,
              type: 'day-of',
              scheduledTime: apt.appointment_date,
              title: `Appointment today at ${apt.appointment_time}`,
              body: `With ${targetName} - ${typeLabel}${apt.hospital ? ` at ${apt.hospital}` : ''}`,
            });
          }
        }
      });
    } catch (error) {
      console.error('Failed to check upcoming appointments:', error);
    }
  }, [user, addNotification]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      firedNotifications.current.clear();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    requestPermission();
    checkUpcomingAppointments();
    checkEmergencies();

    intervalRef.current = setInterval(() => {
      checkUpcomingAppointments();
      checkEmergencies();
    }, NOTIFICATION_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, requestPermission, checkUpcomingAppointments, checkEmergencies]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      permissionGranted,
      requestPermission,
      markAllRead,
      clearNotifications,
      checkUpcomingAppointments,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
