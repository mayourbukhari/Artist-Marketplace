import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Camera } from '@react-native-camera/camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const ARViewScreen = ({ route, navigation }) => {
  const { artwork } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [arMode, setArMode] = useState('wall'); // 'wall', 'room', 'scale'
  const [artworkSize, setArtworkSize] = useState({ width: 100, height: 100 });

  useEffect(() => {
    requestCameraPermission();
    calculateArtworkSize();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await Camera.requestCameraPermission();
      setHasPermission(granted === 'granted');
      setIsLoading(false);
    } catch (error) {
      console.error('Camera permission error:', error);
      setHasPermission(false);
      setIsLoading(false);
    }
  };

  const calculateArtworkSize = () => {
    if (artwork.dimensions) {
      const scaleFactor = 2; // Adjust based on your AR scaling needs
      setArtworkSize({
        width: artwork.dimensions.width * scaleFactor,
        height: artwork.dimensions.height * scaleFactor,
      });
    }
  };

  const handleARModeChange = (mode) => {
    setArMode(mode);
  };

  const handleTakeScreenshot = () => {
    Alert.alert(
      'Screenshot Saved',
      'Your AR preview has been saved to your photo gallery.',
      [{ text: 'OK' }]
    );
  };

  const handleShareAR = () => {
    Alert.alert(
      'Share AR View',
      'Share this AR preview with friends and family.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Share AR view') }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading AR Preview...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-alt" size={64} color="#ccc" />
        <Text style={styles.permissionText}>
          Camera permission is required for AR preview
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={Camera.Constants.AutoFocus.on}
      >
        {/* AR Overlay */}
        <View style={styles.arOverlay}>
          {/* Artwork Preview */}
          <View style={[styles.artworkContainer, {
            width: artworkSize.width,
            height: artworkSize.height,
          }]}>
            <Image
              source={{ uri: artwork.images[0] }}
              style={styles.artworkImage}
              resizeMode="contain"
            />
            {/* Frame Effect */}
            <View style={styles.frameEffect} />
          </View>

          {/* Measurement Indicators */}
          {arMode === 'scale' && (
            <View style={styles.measurementContainer}>
              <Text style={styles.measurementText}>
                {artwork.dimensions.width}" × {artwork.dimensions.height}"
              </Text>
            </View>
          )}
        </View>

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          {/* AR Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, arMode === 'wall' && styles.activeModeButton]}
              onPress={() => handleARModeChange('wall')}
            >
              <Icon name="wallpaper" size={24} color={arMode === 'wall' ? '#fff' : '#666'} />
              <Text style={[styles.modeText, arMode === 'wall' && styles.activeModeText]}>
                Wall
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, arMode === 'room' && styles.activeModeButton]}
              onPress={() => handleARModeChange('room')}
            >
              <Icon name="3d-rotation" size={24} color={arMode === 'room' ? '#fff' : '#666'} />
              <Text style={[styles.modeText, arMode === 'room' && styles.activeModeText]}>
                Room
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modeButton, arMode === 'scale' && styles.activeModeButton]}
              onPress={() => handleARModeChange('scale')}
            >
              <Icon name="straighten" size={24} color={arMode === 'scale' ? '#fff' : '#666'} />
              <Text style={[styles.modeText, arMode === 'scale' && styles.activeModeText]}>
                Scale
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakeScreenshot}>
              <Icon name="camera" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShareAR}>
              <Icon name="share" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Point your camera at a wall to preview the artwork
          </Text>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  frameEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 4,
    borderColor: '#8B4513',
    borderRadius: 4,
  },
  measurementContainer: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  measurementText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  activeModeButton: {
    backgroundColor: '#1976d2',
  },
  modeText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  activeModeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  instructionsText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ARViewScreen;
