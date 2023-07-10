import { TextEncoder, TextDecoder } from 'text-encoding';
import BigInt from 'big-integer';
Object.assign(global, {
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
  BigInt: BigInt
});

import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import { Provider } from 'react-redux';
import { store } from './stores/store';
import AppNavigator from './navigation/AppNavigator';
import { registerGlobals } from 'react-native-webrtc';

registerGlobals();

// AsyncStorage.clear();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (
      async () => {
        try {
          await Font.loadAsync({
            "black": require("./assets/fonts/Roboto-Black.ttf"),
            "blackItalic": require("./assets/fonts/Roboto-BlackItalic.ttf"),
            "bold": require("./assets/fonts/Roboto-Bold.ttf"),
            "boldItalic": require("./assets/fonts/Roboto-BoldItalic.ttf"),
            "italic": require("./assets/fonts/Roboto-Italic.ttf"),
            "light": require("./assets/fonts/Roboto-Light.ttf"),
            "lightItalic": require("./assets/fonts/Roboto-LightItalic.ttf"),
            "medium": require("./assets/fonts/Roboto-Medium.ttf"),
            "mediumItalic": require("./assets/fonts/Roboto-MediumItalic.ttf"),
            "regular": require("./assets/fonts/Roboto-Regular.ttf"),
            "thin": require("./assets/fonts/Roboto-Thin.ttf"),
            "thinItalic": require("./assets/fonts/Roboto-ThinItalic.ttf"),
          });
        } catch (error) {
          console.log(error);
        } finally {
          setFontsLoaded(true);
        }
      }
    )();
  }, []);

  const onLayout = useCallback(async () => {
    if (fontsLoaded)
      await SplashScreen.hideAsync();
    
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider onLayout={onLayout}>
        <StatusBar 
          style='light' 
          backgroundColor='transparent'
        />
        <MenuProvider>
          <AppNavigator />
        </MenuProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
