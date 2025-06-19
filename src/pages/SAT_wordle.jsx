import React, { useState, useEffect } from 'react';
import './css/SAT_wordle.css'
import wordList from '../Dictionary/words.json'
import { ref, get, set, push, query, orderByChild, startAt, endAt } from "firebase/database";
import { auth, database } from '../Backend/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, } from 'firebase/auth'
import { getWordOfTheDay } from './Utility/getWordOfTheDay'
import SATWordleEasy from './SAT_wordleEasy'
import SATWordleHard from './SAT_wordleHard';
import Leaderboard from './Utility/Leaderboard';
import { definitions, Dictionary_Medium, Dictionary_Hard } from '../Dictionary/Definitons'; // adjust path if needed

function SATWordle() {
  const [Difficulty, setDifficulty] = useState("medium")
  const [board, setBoard] = useState(Array(6).fill().map(() => Array(5).fill("")))
  const [currentAttempt, setCurrentAttempt] = useState({ attempt: 0, letterPos: 0})
  const [wordOftheDay, setWordOftheDay] = useState(getWordOfTheDay("medium"));
  const [boardColors, setBoardColors] = useState(
    Array(6).fill().map(() => Array(5).fill(""))
  );
  const [guessedWord, setGuessedWord] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false)
  const [invalidWord, setInvalidWord] = useState(false);
  const [KeyboardColors, setKeyboardColors] = useState({});
  const [showModal, setShowModal] = useState(false)

  const [tempGameResult, setTempGameResult] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [completedGame, setCompletedGame] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Easy level
  const [Easyboard, setEasyBoard] = useState(Array(6).fill().map(() => Array(4).fill("")))
  const [EasycurrentAttempt, setEasyCurrentAttempt] = useState({ attempt: 0, letterPos: 0})
  const [EasywordOftheDay, setEasyWordOftheDay] = useState(getWordOfTheDay("easy"));
  const [EasyboardColors, setEasyBoardColors] = useState(
    Array(6).fill().map(() => Array(4).fill(""))
  );
  const [EasyguessedWord, setEasyGuessedWord] = useState(false);
  const [EasyisFlipping, setEasyIsFlipping] = useState(false)
  const [EasyinvalidWord, setEasyInvalidWord] = useState(false);
  const [EasyKeyboardColors, setEasyKeyboardColors] = useState({});
  const [EasyshowModal, setEasyShowModal] = useState(false)

  const [EasytempGameResult, setEasyTempGameResult] = useState(null);
  const [EasyshowSignUp, setEasyShowSignUp] = useState(false);
  const [EasycompletedGame, setEasycompletedGame] = useState(false);

  //Hard level
  const [Hardboard, setHardBoard] = useState(Array(6).fill().map(() => Array(6).fill("")))
  const [HardcurrentAttempt, setHardCurrentAttempt] = useState({ attempt: 0, letterPos: 0})
  const [HardwordOftheDay, setHardWordOftheDay] = useState(getWordOfTheDay("hard"));
  const [HardboardColors, setHardBoardColors] = useState(
    Array(6).fill().map(() => Array(6).fill(""))
  );
  const [HardguessedWord, setHardGuessedWord] = useState(false);
  const [HardisFlipping, setHardIsFlipping] = useState(false)
  const [HardinvalidWord, setHardInvalidWord] = useState(false);
  const [HardKeyboardColors, setHardKeyboardColors] = useState({});
  const [HardshowModal, setHardShowModal] = useState(false)

  const [HardtempGameResult, setHardTempGameResult] = useState(null);
  const [HardshowSignUp, setHardShowSignUp] = useState(false);
  const [HardcompletedGame, setHardcompletedGame] = useState(false);

  // Remove or comment out these effects:
  // useEffect(() => {
  //   const savedBoard = localStorage.getItem('mediumBoard');
  //   if (savedBoard) {
  //     setBoard(JSON.parse(savedBoard));
  //   }
  //   const savedAttempt = localStorage.getItem('mediumCurrentAttempt');
  //   if (savedAttempt) {
  //     setCurrentAttempt(JSON.parse(savedAttempt));
  //   }
  //   const savedBoardColors = localStorage.getItem('mediumBoardColors');
  //   if (savedBoardColors) {
  //     setBoardColors(JSON.parse(savedBoardColors));
  //   }
  // }, []);

  // // Save board to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem('mediumBoard', JSON.stringify(board));
  // }, [board]);

  // useEffect(() => {
  //   localStorage.setItem('mediumCurrentAttempt', JSON.stringify(currentAttempt));
  // }, [currentAttempt]);

  // useEffect(() => {
  //   localStorage.setItem('mediumBoardColors', JSON.stringify(boardColors));
  // }, [boardColors]);

  useEffect(() => {
    
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1
    ));
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    
    const timer = setTimeout(() => {
      setWordOftheDay(getWordOfTheDay("medium"));
      setBoardColors(
        Array(6).fill().map(() => Array(5).fill(""))
      );
      setBoard(Array(6).fill().map(() => Array(5).fill("")))
      setCurrentAttempt({ attempt: 0, letterPos: 0 });
      // Optionally clear localStorage for a fresh start
      localStorage.removeItem('mediumBoard');
      localStorage.removeItem('mediumCurrentAttempt');
      localStorage.removeItem('mediumBoardColors');
    }, msUntilMidnight);

    
    return () => clearTimeout(timer);
  }, [wordOftheDay,board,boardColors, setWordOftheDay, setBoard, setBoardColors]);

  const GameOberModal = ({isOpen, onClose, hasWon, attempt}) => {
    const handleSignup = () => {
      setTempGameResult({
        won: hasWon,
        attempts: attempt,
        word: wordOftheDay,
        timestamp: Date.now()
      })
      setShowSignUp(true);
    };

    if(!isOpen) return null;
    return(
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{hasWon ? "Congratulations!" : "Better luck next time!"}</h2>
          {hasWon && <p>You found the word in {(attempt)} attempt(s)!</p>}
          <p>Word of the Day: "{wordOftheDay}"</p>
          <p>Sign up to track your stats and compare with friends!</p>
          <div className="modal-buttons">
            <button className="modal-button" onClick={handleSignup}>
              Sign Up
            </button>
            <button className="modal-button secondary" onClick={onClose}>
              Maybe Later
            </button>
          </div>
          <button
            className="modal-google"
            onClick={() => {
              const gameResult = {
                won: hasWon,
                attempts: attempt,
                word: wordOftheDay,
                timestamp: Date.now()
              };
              handleGoogleSignIn(gameResult);
            }}
          >
            <img
              src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
              alt="Google"
              className="google-logo"
            />
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  const SignUpModal = ({isOpen, onClose}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signUpError, setSignUpError] = useState("");

    const handleSignUp = async(e) => {
      e.preventDefault();
      setSignUpError("");
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if(tempGameResult) {
          // const userGameRef = ref(database, `Medium_Difficulty/user/${userCredential.user.uid}/gameResults/${tempGameResult.timestamp}`)
          // await set(userGameRef, tempGameResult);

          // Only push to leaderboard:
          const username = userCredential.user.email || "Anonymous";
          const alreadyWon = await alreadyHasWin({
            username,
            word: tempGameResult.word,
            timestamp: tempGameResult.timestamp
          });
          if (!alreadyWon) {
            const leaderboardRef = ref(database, `leaderboard/medium`);
            await push(leaderboardRef, {
              ...tempGameResult,
              username
            });
          }
        }
        setTempGameResult(null);
        onClose();
        alert("Sign up successful! Stats saved.");
        setShowModal(false);
        setShowSignUp(false);
      }
      catch (error) {
        setSignUpError(error.message);
      }
    }

    if(!isOpen) return null;
    return (
      <div className='modal-overlay'>
        <div className='modal-content'>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="email"
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
            <button type="button" onClick={onClose}>Cancel</button>
            {signUpError && <p style={{color: "red"}}>{signUpError}</p>}
          </form>
        </div>
      </div>
    )
  }

  const handleGoogleSignIn = async(gameResult) => {
          const provider = new GoogleAuthProvider();
          try {
            const userCredential = await signInWithPopup(auth, provider);
            if (gameResult) {
              const username = userCredential.user.email || "Anonymous";
              const alreadyWon = await alreadyHasWin({
                username,
                word: gameResult.word,
                timestamp: gameResult.timestamp
              });
              if (!alreadyWon) {
                const leaderboardRef = ref(database, `leaderboard/medium`);
                await push(leaderboardRef, {
                  ...gameResult,
                  username
                });
              }
            }
            alert("Signed in with google!");
            setShowSignUp(false);
            setShowModal(false);
          } catch(error) {
            alert(error.message)
          }
        }
  const isWordInDictionary = (word) => {
    return wordList.medium.includes(word)
  }

  const checkWord = (attempt) => {
    let tempColors = [...boardColors]
    let tempWord = [...wordOftheDay]
    let tempKeyboardColors = {...KeyboardColors}
    let currentRow = attempt;

    //Check green
    for(let i = 0; i < 5; i++)
    {
      if(board[currentRow][i] === wordOftheDay[i]){
        tempColors[currentRow][i] = "green";
        tempKeyboardColors[board[currentRow][i]]="green"
        tempWord[i] = "#" //<-- used
      }
    }

    for(let i = 0; i<5; i++)
    {
      if(tempColors[currentRow][i] === "green") continue;

      if(tempWord.includes(board[currentRow][i]))
      {
        tempColors[currentRow][i] = "yellow";
        if(tempKeyboardColors[board[currentRow][i]] !== "green") {
          tempKeyboardColors[board[currentRow][i]] = "yellow";
        }
        tempWord[tempWord.indexOf(board[currentRow][i])] = "#"
      }
      else{ 
        tempColors[currentRow][i] = "grey";
        if(!tempKeyboardColors[board[currentRow][i]]){
          tempKeyboardColors[board[currentRow][i]] = "grey";
        }
      }
    }

    setBoardColors(tempColors);
    setKeyboardColors(tempKeyboardColors);
    checkIfGuessed();
  }

  const getKeyboardButtonStyle = (letter) => {
    if(!KeyboardColors[letter]) return {};
    return {
      backgroundColor: KeyboardColors[letter] === "green" 
      ? "#538d4e"
      : KeyboardColors[letter] === "yellow" 
      ? "#b59f3b"
      : "#3a3a3c",
    color: "white"
    }
  }


  const checkIfGuessed = () => {
    let currentRow = currentAttempt.attempt;
    let correct = true;
    let count = 0;
    for(let i = 0; i < 5; i++) {
      if(boardColors[currentRow][i] !== "green") break;
      count++;
    }
    if(count !== 5) correct = false;

    if(correct) {
      setTimeout(() => {
        setGuessedWord(true);
        setCompletedGame(true);
        setShowModal(true);

        // Only call handleWin if signed in and not already won today
        if (auth.currentUser) {
          const gameResult = {
            won: true,
            attempts: currentAttempt.attempt,
            word: wordOftheDay,
            timestamp: Date.now()
          };
          handleWin(gameResult);
        } else {
          // Prompt sign up modal if not signed in
          setShowSignUp(true);
        }
      }, 1500);
    } else if(currentRow === 5) {
      setTimeout(() => {
        setShowModal(true);
        setCompletedGame(true);
      }, 1500);
    }
  }

  const SelectLetter = (keyVal) => {
    if(currentAttempt.letterPos > 4) return;
    const newBoard = [...board]
    newBoard[currentAttempt.attempt][currentAttempt.letterPos]= keyVal
    setBoard(newBoard);
    setCurrentAttempt({...currentAttempt, letterPos: currentAttempt.letterPos+1})
  }

  const Delete = () =>{
    if(currentAttempt.letterPos===0) return;
    const newBoard = [...board]
    newBoard[currentAttempt.attempt][currentAttempt.letterPos-1] = "";
    setCurrentAttempt({...currentAttempt, letterPos: currentAttempt.letterPos -1})
  }

  const Enter = () => {
    if(currentAttempt.letterPos !== 5) return;
    setIsFlipping(true);
    
    setTimeout(()=>{
      setIsFlipping(false);
      setInvalidWord(false);
    }, 1500)

    const currentWord = board[currentAttempt.attempt].join('').toUpperCase();
    if(!isWordInDictionary(currentWord)) 
    {
      setInvalidWord(true);
      setTimeout(() => {
        setInvalidWord(false);
      }, 1500)
      return
    }

    checkWord(currentAttempt.attempt);
    setCurrentAttempt({attempt: currentAttempt.attempt+1, letterPos: 0})
   
  }

  const Keyboard = (letter) => {
    if(letter === "Enter") Enter();
    else if(letter === "Del") Delete();
    else SelectLetter(letter);
  }

  // Helper to check if user has already won today and record win if not
  const handleWin = async (gameResult) => {
    if (!auth.currentUser) {
      setShowSignUp(true);
      return;
    }
    const username = (auth.currentUser.email || "Anonymous").toLowerCase();
    const todayString = getDateString(Date.now());
    const word = (gameResult.word || "").toUpperCase();

    // Query leaderboard for this user, word, and day
    const leaderboardRef = ref(database, `leaderboard/medium`);
    const snapshot = await get(leaderboardRef);

    let alreadyWonToday = false;
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const entry = child.val();
        const entryUsername = (entry.username || "").toLowerCase();
        const entryWord = (entry.word || "").toUpperCase();
        const entryDate = getDateString(entry.timestamp);

        // Only allow one win per user, per word, per day
        if (
          entryUsername === username &&
          entryWord === word &&
          entryDate === todayString
        ) {
          alreadyWonToday = true;
        }
      });
    }

    if (!alreadyWonToday) {
      await push(leaderboardRef, {
        ...gameResult,
        username,
        word // always include word!
      });
    }
  };

  // Helper to check if user has already won today and record win if not (Easy)
  const handleWinEasy = async (gameResult) => {
    if (!auth.currentUser) {
      setEasyShowSignUp(true);
      return;
    }
    const userId = auth.currentUser.uid;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() - 1;

    const userGameResultsRef = ref(database, `Easy_Difficulty/user/${userId}/gameResults`);
    const q = query(
      userGameResultsRef,
      orderByChild('timestamp'),
      startAt(startOfDay),
      endAt(endOfDay)
    );
    const snapshot = await get(q);

    if (!snapshot.exists()) {
      const newGameRef = push(userGameResultsRef);
      await set(newGameRef, gameResult);

      const leaderboardRef = ref(database, `leaderboard/medium`);
      await push(leaderboardRef, {
        ...gameResult,
        username: auth.currentUser.email || "Anonymous"
      });
    }
  };

  // Helper to check if user has already won today and record win if not (Hard)
  const handleWinHard = async (gameResult) => {
    if (!auth.currentUser) {
      setHardShowSignUp(true);
      return;
    }
    const userId = auth.currentUser.uid;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime() - 1;

    const userGameResultsRef = ref(database, `Hard_Difficulty/user/${userId}/gameResults`);
    const q = query(
      userGameResultsRef,
      orderByChild('timestamp'),
      startAt(startOfDay),
      endAt(endOfDay)
    );
    const snapshot = await get(q);

    if (!snapshot.exists()) {
      const newGameRef = push(userGameResultsRef);
      await set(newGameRef, gameResult);

      const leaderboardRef = ref(database, `leaderboard/medium`);
      await push(leaderboardRef, {
        ...gameResult,
        username: auth.currentUser.email || "Anonymous"
      });
    }
  };

  async function alreadyHasWin({ username, word, timestamp }) {
    const leaderboardRef = ref(database, `leaderboard/medium`);
    const snapshot = await get(leaderboardRef);
    const todayString = getDateString(timestamp);
    const user = (username || "Anonymous").toLowerCase();
    const w = (word || "").toUpperCase();

    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(child => {
        const entry = child.val();
        const entryUsername = (entry.username || "").toLowerCase();
        const entryWord = (entry.word || "").toUpperCase();
        const entryDate = getDateString(entry.timestamp);
        if (
          entryUsername === user &&
          entryWord === w &&
          entryDate === todayString
        ) {
          found = true;
        }
      });
      return found;
    }
    return false;
  }

  function getDateString(timestamp) {
    const d = new Date(timestamp);
    // Pad month and day with leading zeros if needed
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${d.getUTCFullYear()}-${month}-${day}`;
  }

  return (
    
    <div>
      <div className="leaderboard-sidebar">
      <button className="leaderboard-btn" onClick={() => setShowLeaderboard(true)}>
        Show Leaderboard
      </button>
        {showLeaderboard && (
          <Leaderboard
            difficulty={Difficulty}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
      <GameOberModal
        isOpen={showModal}
        onClose={()=>setShowModal(false)}
        hasWon={guessedWord}
        attempt={currentAttempt.attempt}
      />
      <SignUpModal
        isOpen={showSignUp}
        onClose={()=>setShowSignUp(false)}
      />
      {
        Difficulty === "easy" && 
        <SATWordleEasy 
        setDifficulty={setDifficulty}
        board={Easyboard}
        setBoard={setEasyBoard} 
        currentAttempt={EasycurrentAttempt}
        setCurrentAttempt={setEasyCurrentAttempt}
        wordOftheDay={EasywordOftheDay}
        setWordOftheDay={setEasyWordOftheDay}
        boardColors={EasyboardColors}
        setBoardColors={setEasyBoardColors}
        guessedWord={EasyguessedWord}
        setGuessedWord={setEasyGuessedWord}
        isFlipping={EasyisFlipping}
        setIsFlipping={setEasyIsFlipping}
        invalidWord={EasyinvalidWord}
        setInvalidWord={setEasyInvalidWord}
        KeyboardColors={EasyKeyboardColors}
        setKeyboardColors={setEasyKeyboardColors}
        showModal={EasyshowModal}
        setShowModal={setEasyShowModal}
        tempGameResult={EasytempGameResult}
        setTempGameResult={setEasyTempGameResult}
        showSignUp={EasyshowSignUp}
        setShowSignUp={setEasyShowSignUp}
        CompletedGame={EasycompletedGame}
        setCompletedGame={setEasycompletedGame}
        handleWinEasy={handleWinEasy}
        /> 
        
      }
      {
        Difficulty === "hard" && 
        <SATWordleHard
        setDifficulty={setDifficulty}
        board={Hardboard}
        setBoard={setHardBoard} 
        currentAttempt={HardcurrentAttempt}
        setCurrentAttempt={setHardCurrentAttempt}
        wordOftheDay={HardwordOftheDay}
        setWordOftheDay={setHardWordOftheDay}
        boardColors={HardboardColors}
        setBoardColors={setHardBoardColors}
        guessedWord={HardguessedWord}
        setGuessedWord={setHardGuessedWord}
        isFlipping={HardisFlipping}
        setIsFlipping={setHardIsFlipping}
        invalidWord={HardinvalidWord}
        setInvalidWord={setHardInvalidWord}
        KeyboardColors={HardKeyboardColors}
        setKeyboardColors={setHardKeyboardColors}
        showModal={HardshowModal}
        setShowModal={setHardShowModal}
        tempGameResult={HardtempGameResult}
        setTempGameResult={setHardTempGameResult}
        showSignUp={HardshowSignUp}
        setShowSignUp={setHardShowSignUp}
        CompletedGame={HardcompletedGame}
        setCompletedGame={setHardcompletedGame}
        handleWinHard={handleWinHard}
        /> 
      }
      {
        Difficulty === "medium" &&
        (
        <>
          <div className='HeadingBar'>
          
            <h1 className='HeaderOnPage'>SAT Wordle</h1>

            <div className="Difficulties">
                <button className='Difficulties_hard' onClick={() => setDifficulty("hard")} title='Hard: Expect both 5-letter words and 6-letter SAT vocab words'>Hard</button>
                <button className='Difficulties_medium' onClick={() => setDifficulty("medium")} title='Medium: Expect 5-letter SAT words here'>Medium</button>
                <button className='Difficulties_easy' onClick={() => setDifficulty("easy")} title='Easy: Expect 4-letter SAT words'>Easy</button>
            </div>
          </div>

          <div className={`toast-message ${invalidWord ? 'show': ''}`}>
            Not in the word list!
          </div>

          <div className="game-board">
            {board.map((row, i) => (
              <div key={i} className="board-row">
                {row.map((letter, j) => (
                  <div 
                    key={j} 
                    className={`letter-box ${
                      boardColors[i][j] && isFlipping ? 'flip' :
                      boardColors[i][j] && !isFlipping ? 'flip-back': ''
                    } ${
                      boardColors[i][j] === "green" && guessedWord ? 'correct':''
                    } ${
                      board[i] && invalidWord ? 'invalid':''
                    }`}
                    style={{
                      backgroundColor: boardColors[i][j] === "green" 
                      ? "#538d4e"
                      : boardColors[i][j] === "yellow"
                      ? "#b59f3b"
                      : boardColors[i][j] === "grey"
                      ? "#3a3a3c"
                      : "transparent"
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div className='Keyboard'>
            <div className="Keyboard-row">
                {
                    'QWERTYUIOP'.split('').map((letter) => (
                        <button key={letter} className='key' style={getKeyboardButtonStyle(letter)} onClick={completedGame ? ()=>alert("Already guessed the word!!") :() => Keyboard(letter)}>
                          {letter}
                        </button>
                    ))
                }
            </div>
              
            <div className="Keyboard-row">
                {
                    'ASDFGHJKL'.split('').map((letter) => (
                        <button key={letter} className='key' style={getKeyboardButtonStyle(letter)} onClick={completedGame ? ()=>setShowModal(true):() => Keyboard(letter)}>
                          {letter}
                        </button>
                    ))
                }
            </div>
              
            <div className="Keyboard-row">
                <button className='keySepical' onClick={completedGame ? ()=>setShowModal(true):() => Keyboard("Enter")}>
                  Enter
                </button>
                {
                    'ZXCVBNM'.split('').map((letter) => (
                        <button key={letter} className='key' style={getKeyboardButtonStyle(letter)} onClick={completedGame ? () => setShowModal(true):() => Keyboard(letter)}>
                          {letter}
                        </button>
                    ))
                }
                <button className='keySepical' onClick={completedGame ? () => setShowModal(true):() => Keyboard("Del")}>
                  Del
                </button>
            </div>
              
          </div>
        </>
        )
        
      } 
      {Difficulty === "easy" && EasyshowModal && (
        <div className="sticky-note">
            <strong>Definition for "{EasywordOftheDay?.toUpperCase()}":</strong>
            <div>
              {definitions[EasywordOftheDay?.toUpperCase()]?.definition || "No definition found."}
            </div>
            {definitions[EasywordOftheDay?.toUpperCase()]?.fun && (
              <div>
                <strong></strong> {definitions[EasywordOftheDay?.toUpperCase()].fun}
              </div>
            )}
          </div>
       )}
       {Difficulty === "medium" && showModal && (
        <div className="sticky-note">
            <strong>Definition for "{wordOftheDay?.toUpperCase()}":</strong>
            <div>
              {Dictionary_Medium[wordOftheDay?.toUpperCase()]?.definition || "No definition found."}
            </div>
            {Dictionary_Medium[wordOftheDay?.toUpperCase()]?.fun && (
              <div>
                <strong></strong> {Dictionary_Medium[wordOftheDay?.toUpperCase()].fun}
              </div>
            )}
          </div>
       )}
       {Difficulty === "hard" && HardshowModal && (
        <div className="sticky-note">
            <strong>Definition for "{HardwordOftheDay?.toUpperCase()}":</strong>
            <div>
              {Dictionary_Hard[HardwordOftheDay?.toUpperCase()]?.definition || "No definition found."}
            </div>
            {Dictionary_Hard[HardwordOftheDay?.toUpperCase()]?.fun && (
              <div>
                <strong></strong> {Dictionary_Hard[HardwordOftheDay?.toUpperCase()].fun}
              </div>
            )}
          </div>
       )}
      
    </div>
  );
}

export default SATWordle;