import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

// O arquivo de áudio precisa estar em assets/
const audioSource = require('../assets/sample.mp3');

export default function AudioPlayerScreen() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [usingRecordedAudio, setUsingRecordedAudio] = useState(false);
  
  // Efeito para carregar o áudio
  useEffect(() => {
    loadAudio();
    
    // Configura a permissão de áudio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });
    
    // Cleanup
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [usingRecordedAudio]);
  
  // Efeito para atualizar o progresso da reprodução
  useEffect(() => {
    if (sound) {
      const interval = setInterval(async () => {
        if (isPlaying) {
          const status = await sound.getStatusAsync();
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [sound, isPlaying]);
  
  const loadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      setIsBuffering(true);
      const source = usingRecordedAudio ? { uri: recordedUri } : audioSource;
      const { sound: newSound } = await Audio.Sound.createAsync(source);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis);
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
          setIsBuffering(false);
        }
      });
      
      setSound(newSound);
    } catch (error) {
      console.error("Erro ao carregar áudio:", error);
      setIsBuffering(false);
    }
  };
  
  const handlePlayPause = async () => {
    try {
      if (!sound) return;
      
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Erro ao reproduzir/pausar:", error);
    }
  };
  
  const handleSeek = async (direction) => {
    try {
      if (!sound) return;
      
      const newPosition = direction === 'backward' 
        ? Math.max(0, position - 10000) 
        : Math.min(duration, position + 10000);
        
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }
  };
  
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        alert("Permissão para gravar áudio negada!");
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
    }
  };
  
  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setIsRecording(false);
      setRecording(null);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error("Erro ao parar gravação:", error);
    }
  };
  
  const handleRecordStop = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };
  
  const toggleAudioSource = () => {
    if (isPlaying && sound) {
      sound.pauseAsync();
    }
    setUsingRecordedAudio(!usingRecordedAudio);
  };
  
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reprodutor de Áudio</Text>
      
      <View style={styles.playerInfo}>
        <Text style={styles.sourceText}>
          Fonte: {usingRecordedAudio ? 'Áudio Gravado' : 'Áudio de Amostra'}
        </Text>

        {recordedUri && (
          <TouchableOpacity style={styles.toggleButton} onPress={toggleAudioSource}>
            <Text style={styles.toggleButtonText}>
              Trocar para {usingRecordedAudio ? 'Amostra' : 'Gravado'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              {
                width: `${
                  duration ? (position / duration) * 100 : 0
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleSeek('backward')}
        >
          <Ionicons name="play-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playButton]}
          onPress={handlePlayPause}
          disabled={isBuffering}
        >
          {isBuffering ? (
            <ActivityIndicator color="white" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="white"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleSeek('forward')}
        >
          <Ionicons name="play-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.recorderContainer}>
        <Text style={styles.recorderTitle}>Gravador</Text>
        
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording ? styles.stopButton : styles.startButton,
          ]}
          onPress={handleRecordStop}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={32}
            color="white"
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Parar Gravação' : 'Começar a Gravar'}
          </Text>
        </TouchableOpacity>

        {isRecording && (
          <Text style={styles.recordingTime}>
            Gravando...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  toggleButton: {
    backgroundColor: '#3498db',
    padding: 5,
    borderRadius: 5,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 3,
  },
  timeText: {
    fontSize: 12,
    color: '#555',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    backgroundColor: '#3498db',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2ecc71',
  },
  recorderContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
    alignItems: 'center',
  },
  recorderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 25,
    width: '80%',
  },
  startButton: {
    backgroundColor: '#e74c3c',
  },
  stopButton: {
    backgroundColor: '#c0392b',
  },
  recordButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  recordingTime: {
    marginTop: 10,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
}); 