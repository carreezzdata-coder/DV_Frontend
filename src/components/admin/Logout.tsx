'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/includes/Session';

interface LogoutButtonProps {
  onLogout?: () => void;
  variant?: 'icon' | 'button' | 'full';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  onLogout,
  variant = 'button',
  size = 'medium',
  className = '',
  showText = true,
  disabled = false
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { logout: sessionLogout, isAuthenticated, isLoading } = useSession();

  const clearAllStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        const domain = window.location.hostname;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        const parts = domain.split('.');
        if (parts.length > 2) {
          const parentDomain = parts.slice(-2).join('.');
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${parentDomain}`;
        }
      });

      if (window.indexedDB) {
        window.indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              window.indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }

      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => caches.delete(cacheName));
        });
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LogoutButton: Current state -> isLoggingOut:', isLoggingOut, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    if (isLoggingOut || isLoading || !isAuthenticated) {
      console.log('LogoutButton: Logout already in progress or not authenticated, preventing duplicate action.');
      return;
    }
    
    setIsLoggingOut(true);
    
    try {
      console.log('LogoutButton: Starting logout process...');
      
      await sessionLogout();
      
      clearAllStorage();
      
      console.log('LogoutButton: Logout completed successfully.');
      
      onLogout && onLogout();

      const timestamp = new Date().getTime();
      router.push(`/login?t=${timestamp}`);
      router.refresh();
    } catch (error) {
      console.error('LogoutButton: An unexpected error occurred during logout.', error);
      
      clearAllStorage();
      
      const timestamp = new Date().getTime();
      window.location.href = `/login?t=${timestamp}`;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const baseClasses = 'logout-btn focus:outline-none focus:ring transition-all duration-300';
  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3',
  }[size];

  const variantClasses = {
    icon: 'rounded-full w-10 h-10 flex items-center justify-center',
    button: 'rounded-md',
    full: 'w-full rounded-full',
  }[variant];

  return (
    <button
      onClick={handleLogout}
      disabled={disabled || isLoggingOut}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className} ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
     aria-label="Action button">
      {isLoggingOut ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {variant === 'icon' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          )}
          {showText && variant !== 'icon' && (
            <span className="ml-2">Logout</span>
          )}
        </>
      )}
      <style jsx>{`
        .logout-btn {
          background-color: #dc3545;
          color: #fff;
          border: none;
          cursor: pointer;
        }

        .logout-btn:hover:not(:disabled) {
          background-color: #c82333;
        }

        .logout-full-btn {
          border-radius: 9999px;
          padding: 10px 20px;
          font-weight: 600;
          width: 100%;
          justify-content: center;
        }
        
        .logout-full-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c82333, #a71e2a);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
        
        :global(.header-logout-btn) {
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        :global(.mobile-logout-btn) {
          width: 100%;
          margin-top: 20px;
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(0.95);
          }
        }
      `}</style>
    </button>
  );
};

export default LogoutButton;
