'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Emulator } from '@/types/emulator';

interface EmulatorScreenProps {
  emulator: Emulator;
  currentAction: string;
  isRunning: boolean;
}

const EmulatorScreen: React.FC<EmulatorScreenProps> = ({
  emulator,
  currentAction,
  isRunning,
}) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Функция для обновления изображения
  const updateScreenshot = async () => {
    if (!emulator || emulator.status !== 'running') {
      setLoading(false);
      return;
    }

    try {
      // Обновляем параметр timestamp для обхода кэширования
      const timestamp = new Date().getTime();
      const url = `/api/emulators/${emulator.id}/screen?t=${timestamp}`;
      
      if (imgRef.current) {
        // Устанавливаем новый src для изображения
        imgRef.current.src = url;
        setLoading(false);
      }
    } catch (err) {
      console.error('Ошибка при обновлении скриншота:', err);
      setError('Не удалось получить изображение с эмулятора');
      setLoading(false);
    }
  };

  useEffect(() => {
    // При монтировании компонента начинаем обновлять скриншот
    if (emulator && emulator.status === 'running') {
      setLoading(true);
      
      // Сразу загружаем первый скриншот
      updateScreenshot();
      
      // Настраиваем интервал обновления (каждые 1000 мс)
      timerRef.current = setInterval(updateScreenshot, 1000);
    }

    // При размонтировании компонента очищаем интервал
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [emulator]);

  // Обработчик успешной загрузки изображения
  const handleImageLoad = () => {
    setLoading(false);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setError('Не удалось загрузить изображение с эмулятора');
    setLoading(false);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!emulator || emulator.status !== 'running') {
    return (
      <div style={{ 
        border: '8px solid #222', 
        borderRadius: '16px', 
        overflow: 'hidden',
        width: '300px',
        height: '600px',
        position: 'relative',
        backgroundColor: '#000'
      }}>
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20px',
          backgroundColor: '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            width: '60px', 
            height: '10px', 
            backgroundColor: '#222',
            borderRadius: '5px'
          }} />
        </div>
        
        <div style={{ 
          padding: '30px 10px 10px 10px',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            flex: 1,
            backgroundColor: '#222',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Facebook</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Эмулятор не запущен</div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
            gap: '20px'
          }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#333' }} />
            <div style={{ width: '15px', height: '15px', borderRadius: '3px', backgroundColor: '#333' }} />
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#333' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      border: '8px solid #222', 
      borderRadius: '16px', 
      overflow: 'hidden',
      width: '300px',
      height: '600px',
      position: 'relative',
      backgroundColor: '#000'
    }}>
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '20px',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{ 
          width: '60px', 
          height: '10px', 
          backgroundColor: '#222',
          borderRadius: '5px'
        }} />
      </div>
      
      <div style={{ 
        padding: '30px 10px 10px 10px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          flex: 1,
          backgroundColor: '#222',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 5
            }}>
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          )}
          
          <img
            ref={imgRef}
            alt="Экран эмулятора"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {isRunning && (
            <div style={{ 
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 6
            }}>
              {currentAction}
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          gap: '20px'
        }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#333' }} />
          <div style={{ width: '15px', height: '15px', borderRadius: '3px', backgroundColor: '#333' }} />
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#333' }} />
        </div>
      </div>
    </div>
  );
};

export default EmulatorScreen; 