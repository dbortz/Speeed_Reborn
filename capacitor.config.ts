import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bafangandroid.app',
  appName: 'BafangAndroid',
  webDir: 'dist',
  plugins: {
    SplashScreen: { launchShowDuration: 0 },
  },
};

export default config;
