import React, { createContext, useContext, useState } from 'react';
import { adultTheme, kidsTheme } from '../themes/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [ageGroup, setAgeGroup] = useState(null); // 'Adult' | 'Kid'

  const theme = ageGroup === 'Kid' ? kidsTheme : adultTheme;

  const value = {
    ageGroup,
    setAgeGroup,
    theme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}

