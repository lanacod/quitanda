import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const show = useCallback((msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    const t = setTimeout(() => {
      setMessage(null);
      setIsError(false);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          className="toast"
          role="alert"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: 'var(--radius)',
            background: isError ? 'var(--error)' : 'var(--primary)',
            color: '#fff',
            fontWeight: 500,
            boxShadow: 'var(--shadow)',
            zIndex: 9999,
            maxWidth: '90vw',
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
