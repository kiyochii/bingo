import { useState, useEffect } from 'react';
import './App.css';

interface BallInfo {
  letter: string;
  colorClass: string;
  palavra: string;
}

function App() {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Novo estado para guardar a melhor voz encontrada
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  const TOTAL_NUMBERS = 75;

  // --- CONFIGURAÇÃO DA VOZ ---
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Tenta encontrar a voz da Google (geralmente a melhor no Chrome)
      const googleVoice = availableVoices.find(
        v => v.name.includes("Google") && v.lang.includes("pt-BR")
      );

      // Tenta encontrar vozes Microsoft (boas no Edge/Windows)
      const microsoftVoice = availableVoices.find(
        v => v.name.includes("Microsoft") && v.lang.includes("pt-BR")
      );

      // Tenta qualquer voz PT-BR
      const anyPtVoice = availableVoices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt_BR"));

      // Define a prioridade: Google > Microsoft > Qualquer PT > A primeira que tiver
      setVoice(googleVoice || microsoftVoice || anyPtVoice || null);
    };

    // O navegador carrega as vozes de forma assíncrona, precisamos esperar
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text: string) => {
    if (isMuted) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Se encontrou uma voz boa, usa ela
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = 'pt-BR';
    utterance.rate = 1; // Velocidade normal
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };
  // ---------------------------

  const getBallInfo = (num: number | null): BallInfo => {
    if (num === null) return { letter: '', colorClass: '', palavra: ''};
    
    if (num <= 15) return { letter: 'B', colorClass: 'ball-b' , palavra: 'bola'};
    if (num <= 30) return { letter: 'I', colorClass: 'ball-i' , palavra: 'impressora'};
    if (num <= 45) return { letter: 'N', colorClass: 'ball-n' , palavra: 'navio'};
    if (num <= 60) return { letter: 'G', colorClass: 'ball-g' , palavra: 'gato'};
    return { letter: 'O', colorClass: 'ball-o' , palavra: 'ovo'};
  };

  const drawNumber = (): void => {
    if (drawnNumbers.length >= TOTAL_NUMBERS) {
      setGameFinished(true);
      speak("O jogo acabou! Parabéns ao vencedor.");
      return;
    }

    let newNumber: number;
    do {
      newNumber = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
    } while (drawnNumbers.includes(newNumber));

    const info = getBallInfo(newNumber);

    setCurrentNumber(newNumber);
    setDrawnNumbers([...drawnNumbers, newNumber]);

    // Fala apenas o número e a letra de forma direta
    // Dica: Vozes robóticas soam melhor com frases curtas
    speak(`${info.letter}... ${newNumber}`);
  };

  const restartGame = (): void => {
    if (window.confirm("Reiniciar o Bingo?")) {
      setDrawnNumbers([]);
      setCurrentNumber(null);
      setGameFinished(false);
      speak("Bingo reiniciado.");
    }
  };

  const currentInfo = getBallInfo(currentNumber);

  return (
    <div className="container">
      <header className="header">
      </header>

      <main className="main-content">
        <section className="display-section">
          <div className={`big-ball ${currentInfo.colorClass} ${currentNumber ? 'pop-in' : ''}`}>
            <span className="big-letter">{currentInfo.letter}</span>
            <span className="big-number">{currentNumber || '?'}</span>
          </div>
          
          <div className="controls">
            <button 
              className="btn-draw" 
              onClick={drawNumber} 
              disabled={gameFinished}
            >
              {gameFinished ? "FIM" : "SORTEAR"}
            </button>
            
            <button className="btn-reset" onClick={restartGame}>
              Reiniciar
            </button>

            <button 
              className={`btn-sound ${isMuted ? 'muted' : ''}`} 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
          
          <div className="last-called">
            <p>Sorteados: {drawnNumbers.length} / {TOTAL_NUMBERS}</p>
          </div>
        </section>

        <section className="board-section">
          <div className="board-grid">
            {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((num) => {
              const isDrawn = drawnNumbers.includes(num);
              const info = getBallInfo(num);
              return (
                <div 
                  key={num} 
                  className={`board-number ${info.colorClass} ${isDrawn ? 'active' : 'inactive'}`}
                >
                  {num}
                </div>
              );
            })}
          
          </div>
          github.com/kiyochii
        </section>
        
      </main>
    </div>
  );
}

export default App;