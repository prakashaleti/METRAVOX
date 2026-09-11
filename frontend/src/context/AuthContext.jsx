import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestoreUsers, DEFAULT_USERS } from '../services/firestoreService';

const AuthContext = createContext();

export const ROLES = {
  CONSUMER: 'consumer',
  OFFICER: 'officer',
  ADMIN: 'admin'
};

export const USER_PROFILES = {
  [ROLES.CONSUMER]: DEFAULT_USERS[0],
  [ROLES.OFFICER]: DEFAULT_USERS[1],
  [ROLES.ADMIN]: DEFAULT_USERS[2]
};

export function AuthProvider({ children }) {
  // Restore active user from localStorage for instant, offline-resilient sessions
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('metravox_active_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return USER_PROFILES[ROLES.CONSUMER];
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return user?.role || ROLES.CONSUMER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('metravox_is_authenticated') === 'true';
  });

  const [authLoading, setAuthLoading] = useState(true);

  // ── Seed default users in Firestore and sync session on mount ────────────
  useEffect(() => {
    async function initFirestoreAuth() {
      try {
        // Ensure default accounts exist in Firestore database
        await firestoreUsers.seedDefaultUsers();
      } catch (err) {
        console.warn('Firestore user init note:', err.message);
      } finally {
        setAuthLoading(false);
      }
    }
    initFirestoreAuth();
  }, []);

  // Sync role whenever user object updates
  useEffect(() => {
    if (user?.role && Object.values(ROLES).includes(user.role)) {
      setCurrentRole(user.role);
    }
  }, [user]);

  // ── Login: Firestore-Native Role-Based Authentication ────────────────────
  const login = async (email, password, requestedRole = ROLES.CONSUMER) => {
    const cleanEmail = email.trim().toLowerCase();

    // Authenticate or auto-provision directly in Firestore Database
    const authenticatedUser = await firestoreUsers.authenticateUser(cleanEmail, password, requestedRole);

    const activeRole = authenticatedUser.role || requestedRole || ROLES.CONSUMER;
    const enrichedUser = {
      ...authenticatedUser,
      role: activeRole,
      roleTitle: authenticatedUser.roleTitle || (activeRole === ROLES.OFFICER ? 'Senior Legal Metrology Officer' : activeRole === ROLES.ADMIN ? 'State Administrator' : 'Registered Trader / Applicant'),
      avatar: authenticatedUser.avatar || cleanEmail.substring(0, 2).toUpperCase()
    };

    // Update state
    setUser(enrichedUser);
    setCurrentRole(activeRole);
    setIsAuthenticated(true);

    // Persist session
    try {
      localStorage.setItem('metravox_active_user', JSON.stringify(enrichedUser));
      localStorage.setItem('metravox_is_authenticated', 'true');
      localStorage.setItem('metravox_active_role', activeRole);
    } catch (e) {}

    return { role: activeRole, uid: enrichedUser.id, user: enrichedUser };
  };

  // ── Register: Directly into Firestore Database ───────────────────────────
  const register = async (userData) => {
    const registeredUser = await firestoreUsers.registerUser(userData);

    const activeRole = registeredUser.role || ROLES.CONSUMER;
    const enrichedUser = {
      ...registeredUser,
      role: activeRole,
      roleTitle: 'Registered Trader / Applicant'
    };

    setUser(enrichedUser);
    setCurrentRole(activeRole);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('metravox_active_user', JSON.stringify(enrichedUser));
      localStorage.setItem('metravox_is_authenticated', 'true');
      localStorage.setItem('metravox_active_role', activeRole);
    } catch (e) {}

    return { role: activeRole, uid: enrichedUser.id, user: enrichedUser };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setIsAuthenticated(false);
    setUser(USER_PROFILES[ROLES.CONSUMER]);
    setCurrentRole(ROLES.CONSUMER);
    try {
      localStorage.removeItem('metravox_active_user');
      localStorage.removeItem('metravox_is_authenticated');
      localStorage.removeItem('metravox_active_role');
    } catch (e) {}
  };

  // ── Role switching is strictly disabled for security ────────────────────
  const switchRole = () => {
    console.warn('Role switching is disabled. Please log in with the authorized account.');
  };

  return (
    <AuthContext.Provider value={{
      currentRole,
      user,
      isAuthenticated,
      authLoading,
      login,
      register,
      logout,
      switchRole,
      ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
