import React, { useState } from 'react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onText, buttonText = "🎤" }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onresult = (event) => {
      const text = event.results[0][0].transcript;
      onText(text);
      setIsListening(false);
    };

    recognitionInstance.onerror = () => {
      toast.error('Failed to recognize speech');
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      className={`voice-input-btn ${isListening ? 'listening' : ''}`}
      onClick={isListening ? stopListening : startListening}
      title={isListening ? 'Stop listening' : 'Voice input'}
    >
      {isListening ? '🔴' : buttonText}
    </button>
  );
};

export default VoiceInput;