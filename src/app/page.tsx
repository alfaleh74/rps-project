'use client';

import { useState, useEffect, useCallback } from 'react';
import MainMenu from '@/components/ui/8bit/blocks/main-menu';
import { Button } from '@/components/ui/8bit/button';
import { Card, CardContent } from '@/components/ui/8bit/card';
import Dialogue from '@/components/ui/8bit/blocks/dialogue';
import { Progress } from '@/components/ui/8bit/progress';
import { Badge } from '@/components/ui/8bit/badge';
import '@/components/ui/8bit/styles/retro.css';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameState = 'menu' | 'waiting' | 'playing' | 'roundResult' | 'gameOver' | 'victory';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [countdown, setCountdown] = useState(10);
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [roundWinner, setRoundWinner] = useState<'player' | 'computer' | 'tie' | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [trashTalk, setTrashTalk] = useState("Let's begin your journey!");
  
  // Game progression state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [playerHearts, setPlayerHearts] = useState(3);
  const [bossHealth, setBossHealth] = useState(2);
  const [consecutiveBossWins, setConsecutiveBossWins] = useState(0);

  const isBossLevel = currentLevel === 5;
  const maxLevel = 5;

  // Get random computer choice
  const getRandomChoice = (): Choice => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
  };

  // Get NPC name based on level
  const getNPCName = () => {
    if (isBossLevel) return "💀 BOSS CPU";
    return `🤖 CPU LV.${currentLevel}`;
  };

  // Get NPC trash talk based on game state and level
  const getTrashTalk = useCallback(() => {
    const levelTrashTalk = {
      1: {
        intro: ["Welcome, newbie!", "Let's see what you got!", "Easy pickings!"],
        playing: ["Come on, faster!", "What's taking so long?", "Pick already!"],
        win: ["Beginner's luck!", "You got lucky!", "Next time!"],
        lose: ["Too easy!", "As expected!", "Git gud!"]
      },
      2: {
        intro: ["You made it to level 2? Impressive...", "Things get harder now!", "Ready for more?"],
        playing: ["Think carefully!", "Time's ticking!", "Choose wisely!"],
        win: ["Lucky again?!", "This is annoying!", "Grr!"],
        lose: ["Level 2 is mine!", "Haha! Easy!", "Too strong for you!"]
      },
      3: {
        intro: ["Halfway there... but can you continue?", "I'm at 50% power now!", "Getting serious!"],
        playing: ["Feel the pressure!", "I'm watching you!", "Nervous yet?"],
        win: ["How?!", "This can't be!", "Pure luck!"],
        lose: ["CRUSHED!", "Too weak!", "Pathetic!"]
      },
      4: {
        intro: ["One level before the boss...", "Turn back now while you can!", "This is your last warning!"],
        playing: ["The boss is watching!", "You won't make it!", "Give up!"],
        win: ["NO! This isn't happening!", "You're cheating!", "Impossible!"],
        lose: ["REKT!", "Get wrecked!", "You're done!"]
      },
      5: {
        intro: ["I AM THE FINAL BOSS!", "YOU DARE CHALLENGE ME?!", "PREPARE TO BE DESTROYED!"],
        playing: ["FEEL MY POWER!", "YOU'RE NOTHING!", "TREMBLE BEFORE ME!"],
        win: ["WHAT?! IMPOSSIBLE!", "THIS... CAN'T... BE!", "NOOO!"],
        lose: ["AHAHAHA! PATHETIC!", "BOW BEFORE YOUR MASTER!", "YOU NEVER HAD A CHANCE!"]
      }
    };

    const level = currentLevel as keyof typeof levelTrashTalk;
    const messages = levelTrashTalk[level];

    if (gameState === 'waiting') {
      return messages.intro[Math.floor(Math.random() * messages.intro.length)];
    } else if (gameState === 'playing') {
      return messages.playing[Math.floor(Math.random() * messages.playing.length)];
    } else if (gameState === 'roundResult') {
      if (roundWinner === 'player') {
        return messages.win[Math.floor(Math.random() * messages.win.length)];
      } else if (roundWinner === 'computer') {
        return messages.lose[Math.floor(Math.random() * messages.lose.length)];
      } else {
        return "A tie?! Again!";
      }
    }
    return "Let's play!";
  }, [gameState, roundWinner, currentLevel]);

  // Start new round
  const startRound = () => {
    setGameState('playing');
    setCountdown(10);
    setPlayerChoice(null);
    setComputerChoice(null);
    setRoundWinner(null);
    setIsTimeout(false);
  };

  // Start game from menu
  const startGame = () => {
    setCurrentLevel(1);
    setPlayerHearts(3);
    setBossHealth(2);
    setConsecutiveBossWins(0);
    setGameState('waiting');
  };

  // Countdown timer
  useEffect(() => {
    if (gameState === 'playing' && countdown > 0 && !playerChoice) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && countdown === 0 && !playerChoice) {
      // User lost - didn't pick in time
      const compChoice = getRandomChoice();
      setComputerChoice(compChoice);
      setRoundWinner('computer');
      setIsTimeout(true);
      setGameState('roundResult');
    }
  }, [countdown, gameState, playerChoice]);

  // Update trash talk when game state changes
  useEffect(() => {
    setTrashTalk(getTrashTalk());
  }, [gameState, roundWinner, currentLevel, getTrashTalk]);

  // Change trash talk every 3 seconds during playing state
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTrashTalk(getTrashTalk());
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameState, getTrashTalk]);

  // Handle player choice
  const handleChoice = (choice: Choice) => {
    if (gameState !== 'playing' || playerChoice) return;
    
    const compChoice = getRandomChoice();
    setPlayerChoice(choice);
    setComputerChoice(compChoice);
    
    // Determine winner
    const result = determineWinner(choice, compChoice);
    setRoundWinner(result);
    setGameState('roundResult');
  };

  // Determine winner
  const determineWinner = (player: Choice, computer: Choice): 'player' | 'computer' | 'tie' => {
    if (player === computer) return 'tie';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'player';
    }
    return 'computer';
  };

  // Handle round end - update hearts, level, boss health
  const handleRoundEnd = () => {
    if (roundWinner === 'computer') {
      // Player lost
      const newHearts = playerHearts - 1;
      setPlayerHearts(newHearts);
      
      if (newHearts <= 0) {
        setGameState('gameOver');
        return;
      }
      
      // Reset boss wins streak if on boss level
      if (isBossLevel) {
        setConsecutiveBossWins(0);
        setBossHealth(2);
      }
      
      startRound();
    } else if (roundWinner === 'player') {
      // Player won
      if (isBossLevel) {
        // Boss battle
        const newBossHealth = bossHealth - 1;
        setBossHealth(newBossHealth);
        
        const newConsecutiveWins = consecutiveBossWins + 1;
        setConsecutiveBossWins(newConsecutiveWins);
        
        if (newConsecutiveWins >= 2) {
          // Victory!
          setGameState('victory');
          return;
        }
        
        startRound();
      } else {
        // Regular level - advance to next level
        if (currentLevel < maxLevel) {
          setCurrentLevel(currentLevel + 1);
          setGameState('waiting');
        }
      }
    } else {
      // Tie - just restart round
      startRound();
    }
  };

  // Get emoji for choice
  const getEmoji = (choice: Choice) => {
    if (!choice) return '👾';
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    return emojis[choice];
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative" 
      style={{
        backgroundImage: 'url(/dungeon-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black opacity-70 pointer-events-none" />
      
      {/* Main Menu */}
      {gameState === 'menu' && (
        <MainMenu 
          className="w-full max-w-md relative z-10"
          title="Rock Paper Scissors"
          description="8-bit RPG Edition"
          menuItems={[
            {
              label: "START ADVENTURE",
              action: startGame,
            },
          ]}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <Card className="w-full max-w-2xl relative z-10">
          <CardContent className="space-y-8 text-center py-12">
            <div className="text-8xl mb-4">💀</div>
            <div className="retro text-white text-5xl font-bold mb-4">GAME OVER</div>
            <div className="retro text-gray-300 text-xl">
              You reached Level {currentLevel}
            </div>
            <Button
              onClick={() => setGameState('menu')}
              size="lg"
              className="retro text-xl"
            >
              MAIN MENU
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <Card className="w-full max-w-2xl relative z-10">
          <CardContent className="space-y-8 text-center py-12">
            <div className="text-8xl mb-4">👑</div>
            <div className="retro text-white text-5xl font-bold mb-4">VICTORY!</div>
            <div className="retro text-gray-300 text-xl">
              You defeated the Boss and conquered all {maxLevel} levels!
            </div>
            <div className="retro text-white text-3xl">
              ⭐ LEGENDARY CHAMPION ⭐
            </div>
            <Button
              onClick={() => setGameState('menu')}
              size="lg"
              className="retro text-xl"
            >
              MAIN MENU
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Game Container with NPC Dialogue */}
      {(gameState === 'waiting' || gameState === 'playing' || gameState === 'roundResult') && (
      <div className="flex gap-6 items-start justify-center w-full max-w-6xl flex-wrap lg:flex-nowrap relative z-10">
        {/* Game Card */}
        <div className="w-full lg:w-auto lg:flex-1">
      <Card className="w-full max-w-2xl mx-auto h-[600px]">
        <CardContent className="space-y-2 h-full flex flex-col justify-between py-3 overflow-y-auto">
          {/* Status Bar - Hearts and Level */}
          <div className="flex justify-between items-center gap-2 flex-wrap shrink-0">
            <div className="flex gap-1.5 items-center">
              <span className="retro text-white text-xs">HEARTS:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className="text-xl">
                    {i < playerHearts ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>
            </div>
            <Badge variant="default" className="retro text-sm px-3 py-1">
              LEVEL {currentLevel}/{maxLevel}
            </Badge>
          </div>

          {/* Boss Health Bar */}
          {isBossLevel && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="retro text-white text-xs">BOSS HP:</span>
                <span className="retro text-white text-xs">{bossHealth}/2</span>
              </div>
              <Progress 
                value={(bossHealth / 2) * 100}
                variant="retro"
                progressBg="bg-red-500"
                className="h-5"
              />
              {consecutiveBossWins > 0 && (
                <div className="retro text-center text-xs text-yellow-500">
                  🔥 {consecutiveBossWins}/2 WINS 🔥
                </div>
              )}
            </div>
          )}

          {/* Computer Section - Top */}
          <div className="shrink-0">
            <h2 className="retro text-white text-base font-bold text-center mb-1">
              {getNPCName()}
            </h2>
            <div className="flex justify-center">
              <div className="w-20 h-20 flex items-center justify-center text-4xl">
                {gameState === 'roundResult' && computerChoice ? getEmoji(computerChoice) : '👾'}
              </div>
            </div>
          </div>

        {/* Middle Section - Results & Countdown */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          {gameState === 'waiting' && (
            <div className="flex justify-center">
              <Button
                onClick={startRound}
                size="lg"
                className="retro text-lg px-8 py-4"
              >
                {isBossLevel ? 'FIGHT BOSS' : 'START ROUND'}
              </Button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="retro text-white text-center">
              <div className="text-6xl font-bold mb-2 animate-pulse">{countdown}</div>
              <div className="text-lg">CHOOSE YOUR MOVE!</div>
            </div>
          )}

          {gameState === 'roundResult' && (
            <div className="text-center space-y-2">
              {/* Show both choices */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center text-3xl mb-1">
                    {getEmoji(playerChoice)}
                  </div>
                  <div className="retro text-white text-[10px]">YOU</div>
                </div>
                <div className="retro text-white text-2xl font-bold">VS</div>
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center text-3xl mb-1">
                    {getEmoji(computerChoice)}
                  </div>
                  <div className="retro text-white text-[10px]">CPU</div>
                </div>
              </div>

              {/* Winner display */}
              <div className="p-3">
                {roundWinner === 'player' && (
                  <div className="text-center">
                    <div className="text-4xl mb-1">⚔️</div>
                    <div className="retro text-white text-2xl font-bold">YOU WIN!</div>
                    {isBossLevel && <div className="retro text-yellow-500 text-[10px] mt-1">BOSS DAMAGED!</div>}
                  </div>
                )}
              {roundWinner === 'computer' && (
                <div className="text-center">
                  {isTimeout ? (
                    <>
                      <div className="text-4xl mb-1">⏰</div>
                      <div className="retro text-white text-2xl font-bold">TIME OUT!</div>
                      <div className="retro text-red-500 text-[10px] mt-1">-1 HEART</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-1">💔</div>
                      <div className="retro text-white text-2xl font-bold">YOU LOSE!</div>
                      <div className="retro text-red-500 text-[10px] mt-1">-1 HEART</div>
                    </>
                  )}
                </div>
              )}
                {roundWinner === 'tie' && (
                  <div className="text-center">
                    <div className="text-4xl mb-1">🤝</div>
                    <div className="retro text-white text-2xl font-bold">DRAW!</div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleRoundEnd}
                className="retro"
              >
                {roundWinner === 'tie' ? 'TRY AGAIN' : 'CONTINUE'}
              </Button>
            </div>
          )}
        </div>

        {/* Player Section - Bottom */}
        <div className="shrink-0">
          <h2 className="retro text-white text-base font-bold text-center mb-1">👤 YOU</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {/* Rock */}
            <Button
              onClick={() => handleChoice('rock')}
              disabled={gameState !== 'playing' || playerChoice !== null}
              size="icon"
              className={`w-20 h-20 flex-col gap-0 text-3xl ${
                gameState === 'playing' && !playerChoice
                  ? 'cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              🪨
              <span className="retro text-[7px] mt-0.5">ROCK</span>
            </Button>

            {/* Paper */}
            <Button
              onClick={() => handleChoice('paper')}
              disabled={gameState !== 'playing' || playerChoice !== null}
              size="icon"
              className={`w-20 h-20 flex-col gap-0 text-3xl ${
                gameState === 'playing' && !playerChoice
                  ? 'cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              📄
              <span className="retro text-[7px] mt-0.5">PAPER</span>
            </Button>

            {/* Scissors */}
            <Button
              onClick={() => handleChoice('scissors')}
              disabled={gameState !== 'playing' || playerChoice !== null}
              size="icon"
              className={`w-20 h-20 flex-col gap-0 text-3xl ${
                gameState === 'playing' && !playerChoice
                  ? 'cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              ✂️
              <span className="retro text-[7px] mt-0.5">SCISSORS</span>
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
        </div>

        {/* NPC Dialogue - Right Side */}
        <div className="w-full lg:w-80 flex items-start justify-center lg:justify-start">
          <Dialogue
            player={false}
            avatarFallback={isBossLevel ? "💀" : "🤖"}
            title={getNPCName()}
            description={trashTalk}
            className="w-full"
          />
        </div>
      </div>
      )}
    </div>
  );
}
