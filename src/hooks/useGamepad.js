import { useState, useEffect, useRef } from 'react';
import { AXIS_DEADZONE, AXIS_DELAY } from '../utils/constants';

export const useGamepad = () => {
  const [gamepadIndex, setGamepadIndex] = useState(null);
  const lastAxisXRef = useRef(0);
  const lastAxisYRef = useRef(0);
  const lastAxisTimeXRef = useRef(0);
  const lastAxisTimeYRef = useRef(0);
  const lastButtonsRef = useRef({ lb: false, rb: false, a: false });
  const lastDpadRef = useRef({ up: false, down: false, left: false, right: false });
  const animationRef = useRef(null);

  useEffect(() => {
    const handleGamepadConnected = (e) => {
      if (gamepadIndex === null) {
        setGamepadIndex(e.gamepad.index);
        startPolling();
      }
    };

    const handleGamepadDisconnected = (e) => {
      if (e.gamepad.index === gamepadIndex) {
        setGamepadIndex(null);
        stopPolling();
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      stopPolling();
    };
  }, [gamepadIndex]);

  const startPolling = () => {
    if (animationRef.current) return;
    
    const pollGamepad = () => {
      if (gamepadIndex !== null) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[gamepadIndex];
        
        if (gp) {
          // Обработка осей и кнопок
          processGamepadInput(gp);
        }
      }
      animationRef.current = requestAnimationFrame(pollGamepad);
    };
    
    animationRef.current = requestAnimationFrame(pollGamepad);
  };

  const stopPolling = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const processGamepadInput = (gp) => {
    const now = performance.now();
    const axX = gp.axes[0] || 0;
    const axY = gp.axes[1] || 0;

    // Логика обработки осей и кнопок...
    // (скопируй сюда логику из оригинального скрипта)
  };

  return {
    isConnected: gamepadIndex !== null,
    gamepadIndex
  };
};