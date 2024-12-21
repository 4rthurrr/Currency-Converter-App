import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ConverterScreen from './app/(tabs)/index';

function App() {
  return (
    <ThemeProvider>
      <ConverterScreen />
    </ThemeProvider>
  );
}

export default App;