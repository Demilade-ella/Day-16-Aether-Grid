import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Layout, X, Zap } from 'lucide-react';
import MusicWidget from './MusicWidget';
import '../styles/BentoGrid.css';

const initialCards = [
  { id: 1, title: 'Pulse Player', icon: <Music />, size: 'large', color: '#1db954' },
  { id: 2, title: 'Status', size: 'small'},
  { id: 3, title: 'Schedule', size: 'medium'},
  { id: 4, title: 'Weather', size: 'small'},
];

function BentoGrid() {
  const [cards, setCards] = useState(initialCards);
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState();
  const [song, setSong] = useState(null);
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'Loading...',
    location: 'Lagos, NG'
  });

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handlePlay = async () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      
      analyserRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const removeCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const searchMusic = async () => {
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&entity=song`
      );
      const data = await response.json();
      if (data.results?.length > 0) {
        setSong(data.results[0]);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Lagos&units=metric&appid=YOUR_API_KEY`);
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          location: 'Lagos, NG'
        });
      } catch (err) {
        setWeather({ temp: 28, condition: 'Sunny', location: 'Lagos, NG' });
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="bento-wrapper">
      <div className="bg-glow" />
      
      <header className="bento-header">
        <div className="logo-group">
          <Layout className="logo-icon" />
          <h1>Aether<span>Grid</span></h1>
        </div>
        <div className="header-actions">
          <button onClick={shuffleCards} className="shuffle-btn">
            <Zap size={16} /> Shuffle Layout
          </button>
        </div>
      </header>

      <motion.div layout className="grid-container">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`bento-card ${card.size}`}
            >

              <button className="close-btn" onClick={() => removeCard(card.id)}>
                <X size={14} />
              </button>
              
              <div className="card-content">
                <h3>{card.title}</h3>
                {card.title === 'Status' ? ( 
                  <div className="search-tile">
                    <input 
                      type="text" 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Artist..."
                      className="bento-input"
                    />
                    <button onClick={searchMusic} className="bento-search-btn">
                      Find
                    </button>
                  </div>
                ) : card.title === 'Pulse Player' ? (
                  <div className="music-card-content">
                    <Music className='music-icon' />
                    <h4>{song?.trackName || 'Select Song'}</h4>
                    <p>{song?.artistName}</p>

                    <MusicWidget
                      analyser={analyserRef.current} 
                      isPlaying={isPlaying} 
                    />

                    <audio 
                      ref={audioRef} 
                      src={song?.previewUrl || ""}
                      crossOrigin="anonymous"
                      onEnded={() => setIsPlaying(false)} 
                    />

                    <button onClick={handlePlay} className="play-btn">
                      {isPlaying ? 'PAUSE' : 'PLAY'}
                    </button>
                  </div>
                ) : card.title === 'Schedule' ? (
                  <div className='clock-content'>
                    <h2 className='live-time'>
                      {time.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </h2>
                    <p className='live-date'>
                      {time.toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="schedule-bar">
                        <div className="progress" style={{ width: '65%' }} />
                      </div>
                      <span className="next-event">Next: Day 16 Post</span>
                    </div>
                ) : card.title === 'Weather' ? (
                      <div className="weather-content">
                        <div className="weather-top">
                          <span className="temp">{weather.temp}&deg;C</span>
                        </div>
                        <p className="condition">{weather.condition}</p>
                        <p className="location">{weather.location}</p>
                      </div>
                ) : card.size === 'large' && (
                  <div className="preview-content">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default BentoGrid;