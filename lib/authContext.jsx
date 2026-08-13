'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({
  hospital: null,
  personnel: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updatePersonnel: () => {},
});

export function AuthProvider({ children }) {
  const [hospital, setHospital] = useState(null);
  const [personnel, setPersonnel] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('swasthya_hospital_token');
      const storedHospital = localStorage.getItem('swasthya_hospital_info');
      const storedPersonnel = localStorage.getItem('swasthya_personnel_info');

      if (storedToken && storedHospital) {
        setToken(storedToken);
        setHospital(JSON.parse(storedHospital));
        if (storedPersonnel) {
          setPersonnel(JSON.parse(storedPersonnel));
        }
      }
    } catch (e) {
      console.error('Error restoring hospital session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (authToken, hospitalData, personnelData) => {
    setToken(authToken);
    setHospital(hospitalData);
    setPersonnel(personnelData);

    localStorage.setItem('swasthya_hospital_token', authToken);
    localStorage.setItem('swasthya_hospital_info', JSON.stringify(hospitalData));
    if (personnelData) {
      localStorage.setItem('swasthya_personnel_info', JSON.stringify(personnelData));
    }
  };

  const updatePersonnel = (newPersonnel) => {
    setPersonnel(newPersonnel);
    localStorage.setItem('swasthya_personnel_info', JSON.stringify(newPersonnel));
  };

  const logout = () => {
    setToken(null);
    setHospital(null);
    setPersonnel(null);

    localStorage.removeItem('swasthya_hospital_token');
    localStorage.removeItem('swasthya_hospital_info');
    localStorage.removeItem('swasthya_personnel_info');

    router.push('/login');
  };

  const isAuthenticated = Boolean(token && hospital);

  return (
    <AuthContext.Provider
      value={{
        hospital,
        personnel,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updatePersonnel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
