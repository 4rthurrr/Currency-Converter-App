import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { ThemeContext } from '../../context/ThemeContext';


interface ConversionResult {
  amount: string;
  from: string;
  to: string;
  result: string;
}

const currencyOptions = [
  { label: 'US Dollar', value: 'USD' },
  { label: 'Sri Lanka Rupee', value: 'LKR' },
  { label: 'Euro', value: 'EUR' },
  { label: 'British Pound', value: 'GBP' },
  { label: 'Japanese Yen', value: 'JPY' },
  { label: 'Indian Rupee', value: 'INR' },
  { label: 'Australian Dollar', value: 'AUD' },
  { label: 'Canadian Dollar', value: 'CAD' },
  { label: 'Swiss Franc', value: 'CHF' },
  { label: 'Chinese Yuan', value: 'CNY' },

  // Add more currencies as needed
];

const ConverterScreen = () => {
  const [amount, setAmount] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const validateInput = (): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !/^\d+(\.\d+)?$/.test(amount)) {
      setError('Please enter a valid positive number');
      return false;
    }
    if (!baseCurrency || !targetCurrency) {
      setError('Please select both currencies');
      return false;
    }
    return true;
  };

  const handleConvert = async () => {
    if (!validateInput()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4//latest/${baseCurrency}`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const rate = data.rates[targetCurrency];
      
      if (!rate) {
        throw new Error('Invalid currency rate');
      }

      const converted = (parseFloat(amount) * rate).toFixed(2);
      setLastResult({
        amount,
        from: baseCurrency,
        to: targetCurrency,
        result: converted
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.card}>
        <Text style={styles.title}>Currency Converter</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          maxLength={10}
        />

        <Text style={styles.label}>Select base currency</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{ label: 'Select base currency', value: '' }}
            onValueChange={setBaseCurrency}
            value={baseCurrency || ''}
            items={currencyOptions}
          />
        </View>

        <Text style={styles.label}>Select target currency</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{ label: 'Select target currency', value: '' }}
            onValueChange={setTargetCurrency}
            value={targetCurrency || ''}
            items={currencyOptions}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleConvert}>
          <Text style={styles.buttonText}>Convert</Text>
        </TouchableOpacity>

        {isLoading && <ActivityIndicator size="large" color="#007AFF" />}

        {lastResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Converted Amount:</Text>
            <Text style={styles.resultValue}>{lastResult.result}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Text style={styles.themeButtonText}>
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  themeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'black',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: 'black',
    backgroundColor: 'white',
    elevation: 3,
  }
});

export default ConverterScreen;
