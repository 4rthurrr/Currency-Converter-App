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

  /**
   * Validates the user input
   * - Checks if the amount is a valid positive number
   * - Ensures both base and target currencies are selected
   * @returns {boolean} True if input is valid, false otherwise
   */
  const validateInput = (): boolean => {
    const numAmount = parseFloat(amount);
    
    // Check if the amount is a valid positive number
    if (isNaN(numAmount) || numAmount <= 0 || !/^\d+(\.\d+)?$/.test(amount)) {
      setError('Please enter a valid positive number');
      return false;
    }
    
    // Ensure both base and target currencies are selected
    if (!baseCurrency || !targetCurrency) {
      setError('Please select both currencies');
      return false;
    }
    
    return true;
  };

  /**
   * Handles the currency conversion process
   * - Validates input
   * - Fetches current exchange rates from the API
   * - Calculates conversion
   * - Updates result state
   */
  const handleConvert = async () => {
    if (!validateInput()) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch the latest exchange rates for the base currency
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      
      // Check if the response is not OK
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON response
      const data = await response.json();
      // Get the exchange rate for the target currency
      const rate = data.rates[targetCurrency];
      
      // Check if the rate is valid
      if (!rate) {
        throw new Error('Invalid currency rate');
      }

      // Calculate the converted amount
      const converted = (parseFloat(amount) * rate).toFixed(2);
      // Update the last result state with the conversion details
      setLastResult({
        amount,
        from: baseCurrency,
        to: targetCurrency,
        result: converted
      });
    } catch (error) {
      // Set the error message if an error occurs
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      // Set the loading state to false
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.card}>
        <Text style={styles.title}>Currency Converter</Text>
        
        {/* Input field for the amount to convert */}
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          maxLength={10}
        />

        {/* Picker for selecting the base currency */}
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

        {/* Picker for selecting the target currency */}
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

        {/* Display error message if any */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Button to trigger the conversion */}
        <TouchableOpacity style={styles.button} onPress={handleConvert}>
          <Text style={styles.buttonText}>Convert</Text>
        </TouchableOpacity>

        {/* Show loading indicator while fetching data */}
        {isLoading && <ActivityIndicator size="large" color="#007AFF" />}

        {/* Display the conversion result */}
        {lastResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Converted Amount:</Text>
            <Text style={styles.resultValue}>{lastResult.result}</Text>
          </View>
        )}

        {/* Button to toggle between light and dark mode */}
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
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
