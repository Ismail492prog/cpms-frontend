import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useWebSocket = () => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('WebSocket Connected');
        setConnected(true);
        
        client.subscribe('/topic/payments', (message) => {
          const payment = JSON.parse(message.body);
          setMessages(prev => [...prev, payment]);
        });
        
        client.subscribe('/topic/projects', (message) => {
          console.log('Project update:', message.body);
        });
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      }
    });
    
    client.activate();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStompClient(client);
    
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const sendPaymentUpdate = (payment) => {
    if (stompClient && connected) {
      stompClient.publish({
        destination: '/app/payment',
        body: JSON.stringify(payment)
      });
    }
  };

  return { messages, connected, sendPaymentUpdate };
};

export default useWebSocket;