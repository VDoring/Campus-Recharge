import * as Amplitude from 'expo-analytics-amplitude';

const apiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;

export const init = () => {
  if (apiKey) {
    Amplitude.initialize(apiKey);
  }
};

export const trackEvent = (eventName: string, properties?: object) => {
  if (apiKey) {
    if (properties) {
      Amplitude.logEventWithProperties(eventName, properties);
    } else {
      Amplitude.logEvent(eventName);
    }
  }
};
