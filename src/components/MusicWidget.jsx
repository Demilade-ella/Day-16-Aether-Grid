// MusicWidget.jsx
import React, { useEffect, useRef } from 'react';

export default function MusicWidget({ analyser, isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const renderFrame = () => {
      if (!analyser || !isPlaying) return;

      if (!canvasRef.current || !analyser) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        dataArray.forEach(item => {
          const barHeight = (item / 255) * canvas.height;
          // Matching the Aether Green aesthetic
          ctx.fillStyle = `rgba(29, 185, 84, ${item / 255 + 0.2})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        });
      };
      draw();
    };

    if (isPlaying) renderFrame();
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      width="300" 
      height="120" 
      style={{ width: '100%', marginTop: 'auto', borderRadius: '8px' }} 
    />
  );
}