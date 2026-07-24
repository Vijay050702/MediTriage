import { useState, useEffect, useCallback } from 'react';

let toastCallback = null;

export const showToast = (message, type = 'info') => {
  if (toastCallback) {
    toastCallback({ message, type });
  }
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    toastCallback = addToast;
    return () => {
      toastCallback = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1001 }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast"
          style={{
            background: toast.type === 'error' ? '#DC2626' :
                       toast.type === 'success' ? '#10B981' :
                       toast.type === 'warning' ? '#F59E0B' : '#1E293B',
            marginBottom: 8
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
