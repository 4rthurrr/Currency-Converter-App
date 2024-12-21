import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface ConversionResult {
  amount: string;
  from: string;
  to: string;
  result: string;
}

const ConverterScreen = () => {
  const [amount, setAmount] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ConversionResult | null>(null);

  const validateInput = (): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number');
      return false;
    }
    if (!baseCurrency || !targetCurrency) {
      Alert.alert('Missing Selection', 'Please select both currencies');
      return false;
    }
    return true;
  };

  const handleConvert = async () => {
    if (!validateInput()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
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
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to convert currency'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currencyOptions = [
    { label: 'US Dollar', value: 'USD' },
    { label: 'Euro', value: 'EUR' },
    { label: 'British Pound', value: 'GBP' },
    { label: 'Japanese Yen', value: 'JPY' },
    { label: 'Australian Dollar', value: 'AUD' }
  ];

  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{ label: 'Select base currency', value: null }}
            onValueChange={setBaseCurrency}
            value={baseCurrency}
            items={currencyOptions}
          />
        </View>

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{ label: 'Select target currency', value: null }}
            onValueChange={setTargetCurrency}
            value={targetCurrency}
            items={currencyOptions}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleConvert}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Convert</Text>
          )}
        </TouchableOpacity>

        {lastResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Result:</Text>
            <Text style={styles.resultValue}>
              {lastResult.amount} {lastResult.from} = {lastResult.result} {lastResult.to}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
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
    color: '#333',
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: 'black',
  },
});

export default ConverterScreen;
