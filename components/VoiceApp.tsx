import {VapiProvider, useVapi} from '@vapi-ai/react-native';
import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Button } from 'react-native';

const VoiceApp = forwardRef((props, ref) => {
  const { start, stop, sendText, isConnected } = useVapi(); // ✅ this is correct

  useImperativeHandle(ref, () => ({
    speak: (text: string) => {
      if (isConnected) sendText(text);
    },
    startCall: () => start('YOUR_ASSISTANT_ID'),
    stopCall: () => stop(),
    isConnected,
  }));

  return (
    <View>
      <Button
        title={isConnected ? 'End Call' : 'Start Call'}
        onPress={() => (isConnected ? stop() : start('YOUR_ASSISTANT_ID'))}
      />
    </View>
  );
});

export default VoiceApp;
