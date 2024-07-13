import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

//Inspritation: https://medium.com/analytics-vidhya/how-to-build-a-real-time-chat-web-app-using-node-reactjs-socket-io-having-e2e-encryption-18fbbde8a190

// Helper functions for key management
const generateAESKey = () => CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);

// Store keys securely in localStorage, same key need to be stored in case we wanna retrieve old messages
const storeKeys = (aesKey) => {
  localStorage.setItem('aesKey', aesKey);
};

// Retrieve the AES key from localStorage
const retrieveKeys = () => {
  return localStorage.getItem('aesKey');
};

const initializeKeys = () => {
  let aesKey = retrieveKeys();
  if (!aesKey) {
    aesKey = generateAESKey();
    storeKeys(aesKey);
  }
  return aesKey;
};

const useEncryption = () => {
  const [aesKey, setAesKey] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const key = initializeKeys();
    setAesKey(key);
  }, []);

  useEffect(() => {
    if (aesKey) {
      setInitialized(true);
    }
  }, [aesKey]);

  const encrypt = (text) => {
    if (aesKey) {
      const encrypted = CryptoJS.AES.encrypt(text, aesKey).toString();
      return encrypted;
    }
    throw new Error('AES key not initialized');
  };

  const decrypt = (cipher) => {
    if (aesKey) {
      const bytes = CryptoJS.AES.decrypt(cipher, aesKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    }
    throw new Error('AES key not initialized');
  };

  return { encrypt, decrypt, initialized };
};

export default useEncryption;
