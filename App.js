import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AudioPlayerScreen from './components/AudioPlayerScreen';

export default function App() {
  const [statusBarStyle, setStatusBarStyle] = useState('auto');
  const [statusBarHidden, setStatusBarHidden] = useState(false);
  const [statusBarTranslucent, setStatusBarTranslucent] = useState(true);
  const [statusBarBgColor, setStatusBarBgColor] = useState('#000');

  const statusBarStyles = ['auto', 'inverted', 'light', 'dark'];
  const statusBarColors = ['#000', '#333', '#3498db', '#e74c3c', '#2ecc71'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Demonstração Expo StatusBar & Audio</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>StatusBar</Text>
          
          <Text style={styles.label}>Estilo:</Text>
          <View style={styles.row}>
            {statusBarStyles.map(style => (
              <TouchableOpacity
                key={style}
                style={[styles.button, statusBarStyle === style && styles.buttonActive]}
                onPress={() => setStatusBarStyle(style)}
              >
                <Text style={styles.buttonText}>{style}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Cor de fundo:</Text>
          <View style={styles.row}>
            {statusBarColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorButton, { backgroundColor: color }]}
                onPress={() => setStatusBarBgColor(color)}
              />
            ))}
          </View>

          <Text style={styles.label}>Visibilidade:</Text>
          <TouchableOpacity
            style={[styles.button, statusBarHidden && styles.buttonActive]}
            onPress={() => setStatusBarHidden(!statusBarHidden)}
          >
            <Text style={styles.buttonText}>
              {statusBarHidden ? 'Mostrar' : 'Ocultar'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Translúcido (Android):</Text>
          <TouchableOpacity
            style={[styles.button, statusBarTranslucent && styles.buttonActive]}
            onPress={() => setStatusBarTranslucent(!statusBarTranslucent)}
          >
            <Text style={styles.buttonText}>
              {statusBarTranslucent ? 'Sim' : 'Não'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.audioSection}>
          <AudioPlayerScreen />
        </View>
      </ScrollView>

      <StatusBar 
        style={statusBarStyle} 
        hidden={statusBarHidden}
        translucent={statusBarTranslucent}
        backgroundColor={statusBarBgColor}
        animated={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  audioSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonActive: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
});
