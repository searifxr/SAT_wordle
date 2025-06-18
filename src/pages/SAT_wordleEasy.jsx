import React, { useState, useEffect } from 'react';
import './css/SAT_wordle.css'
import wordList from '../Dictionary/words.json'
import { ref, set, push } from 'firebase/database';
import { auth, database } from '../Backend/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, } from 'firebase/auth'
import { getWordOfTheDay } from './Utility/getWordOfTheDay'

function SATWordleEasy({
  setDifficulty,
  board, setBoard,
  currentAttempt, setCurrentAttempt,
  wordOftheDay, setWordOftheDay,
  boardColors, setBoardColors,
  guessedWord, setGuessedWord,
  isFlipping, setIsFlipping,
  invalidWord, setInvalidWord,
  KeyboardColors, setKeyboardColors,
  showModal, setShowModal,
  tempGameResult, setTempGameResult,
  showSignUp, setShowSignUp,
  CompletedGame, setCompletedGame
}) {
  
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
          Array(6).fill().map(() => Array(4).fill(""))
        );
        setBoard(Array(6).fill().map(() => Array(4).fill("")))
      }, msUntilMidnight);
  
      
      return () => clearTimeout(timer);
    }, [wordOftheDay,board,boardColors, setWordOftheDay,setBoard, setBoardColors]);

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
          const userGameRef = ref(database, `easy_Difficulty/user/${userCredential.user.uid}/gameResults/${tempGameResult.timestamp}`)
          await set(userGameRef, tempGameResult);
          const leaderboardRef = ref(database, `leaderboard/easy`);
          await push(leaderboardRef, {
            ...tempGameResult,
            username: userCredential.user.email || "Anonymous"
          });
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
          const userGameRef = ref(database, `easy_Difficulty/user/${userCredential.user.uid}/gameResults/${gameResult.timestamp}`);
          await set(userGameRef, gameResult);
  
          const leaderboardRef = ref(database, `leaderboard/easy`);
          await push(leaderboardRef, {
            ...gameResult,
            username: userCredential.user.email || "Anonymous"
          });
        }
        alert("Signed in with google!");
        setShowSignUp(false);
        setShowModal(false);
      } catch(error) {
        alert(error.message)
      }
    }
  const isWordInDictionary = (word) => {
    return wordList.easy.includes(word)
  }

  const checkWord = (attempt) => {
    let tempColors = [...boardColors]
    let tempWord = [...wordOftheDay]
    let tempKeyboardColors = {...KeyboardColors}
    let currentRow = attempt;

    //Check green
    for(let i = 0; i < 4; i++)
    {
      if(board[currentRow][i] === wordOftheDay[i]){
        tempColors[currentRow][i] = "green";
        tempKeyboardColors[board[currentRow][i]]="green"
        tempWord[i] = "#" //<-- used
      }
    }

    for(let i = 0; i<4; i++)
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
    for(let i = 0; i < 4; i++)
    {
      if(boardColors[currentRow][i] !== "green")
      {
        break;
      }
      count++;
    }
    if(count !== 4) correct=false
    
    if(correct) {
      setTimeout(()=> {
        setGuessedWord(true)
        setShowModal(true);
        setCompletedGame(true);
      }, 1500)
      
    } 
    else if(currentRow===5){
      setTimeout(()=>{
        setShowModal(true);
        setCompletedGame(true);
      },1500)
    }
    
  }

  const SelectLetter = (keyVal) => {
    if(currentAttempt.letterPos > 3) return;
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
    if(currentAttempt.letterPos !== 4) return;
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


  return (
    <div>
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
                        <button key={letter} className='key' style={getKeyboardButtonStyle(letter)} onClick={CompletedGame ? ()=>setShowModal(true) :() => Keyboard(letter)}>
                          {letter}
                        </button>
                    ))
                }
            </div>
              
            <div className="Keyboard-row">
                {
                    'ASDFGHJKL'.split('').map((letter) => (
                        <button key={letter} className='key' style={getKeyboardButtonStyle(letter)} onClick={CompletedGame ? ()=>setShowModal(true):() => Keyboard(letter)}>
                          {letter}
                        </button>
                    ))
                }
            </div>
              
            <div className="Keyboard-row">
                <button className='keySepical' onClick={CompletedGame ? ()=>setShowModal(true):() => Keyboard("Enter")}>
                  Enter
                </button>
                {
                    'ZXCVBNM'.split('').map((letter) => (
                        <button key={letter} className='key' style={getKeyboardButtonStyle(letter)} onClick={CompletedGame ? () => setShowModal(true):() => Keyboard(letter)}>
                          {letter}
                        </button>
                    ))
                }
                <button className='keySepical' onClick={CompletedGame ? () => setShowModal(true):() => Keyboard("Del")}>
                  Del
                </button>
            </div>
              
          </div>
        </>
        ) 

      
    </div>
  );
}

export default SATWordleEasy;