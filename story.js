/* global displayStory setOptions gameProgress optionFlags clearOptionFlags */
// rpg-tollbooth.js
window.onload = start;

// Replace with your own AirTable API key.
// Normally, you will want to keep this private.
var pw = prompt("Enter password to play");
localStorage.clear();
localStorage.setItem("pw", pw);
const key = "keyJLBdH3kt" + pw;
const app_id = "appUOVbjlWQtGuhQ2";
const base_url = `https://api.airtable.com/v0/${app_id}`;

// Change this to match ID in your AirTable.
const STORY_INTRO_ID = "recj6DMombutWdiAq";
const CHARACTER_SELECT_ID = "recclANwLP6dJZ0zV";
const OPENING_SCENE_ID = "recnU9pSm7CZdfQ1L";
const FINISH_CHAR_CREATION_ID = "recniwZTG3UnV97Hr";
const FINISH_COMBAT_ID = "recN05d6oBJHcbSmy";
const OPENING_BATMAN_SCENE = "recIjdKteWhFUXz96";

// Start story and make initial DB requests for opening scene, saved games,
// and available characters.
function start() {
  setup();
  // Create array of requests and use Promise.all to await both responses before proceeding.
  const requests = [
    $.ajax({
      url: `${base_url}/scenes/${STORY_INTRO_ID}?api_key=${key}`,
      type: "GET",
    }),
    $.ajax({
      url: `${base_url}/gameProgress?api_key=${key}`,
      type: "GET",
    }),
    $.ajax({
      url: `${base_url}/characters?api_key=${key}`,
    }),
  ];
  Promise.all(requests)
    .then(function (data) {
      const choices = [
        {
          choice: "* New Game",
          target: config.OPTION_NEW_GAME,
        },
      ];
      const story = data[0].fields.story;
      data[1].records.forEach(function (record) {
        let choice = `${record.fields.character} - Turn ${record.fields.turnNumber}`;
        choices.push({ choice, target: record.id });
        gameData.savedGames[record.id] = record.fields;
      });
      data[2].records.forEach(function (record) {
        gameData.characters.push(record);
      });
      displayStory(story);
      setOptions(choices);
    })
    .catch(function (err) {
      console.log(err);
    });
}

// Save a game. Makes a POST request to the base on the first save for
// a character, and PATCH requests on follow-up saves.
function saveGame() {
  console.log("saveGame:", gameProgress);
  const progressData = {
    fields: {
      character: gameProgress.character,
      currentScene: gameProgress.currentScene,
      Au: gameProgress.gold,
      HP: gameProgress.hitPoints,
      AC: gameProgress.AC,
      flags: gameProgress.flags,
      turnNumber: gameProgress.turnNumber,
      Class: gameProgress.Class,
      Strength: gameProgress.Strength,
      Intelligence: gameProgress.Intelligence,
      Wisdom: gameProgress.Wisdom,
      Constitution: gameProgress.Constitution,
      Dexterity: gameProgress.Dexterity,
      Charisma: gameProgress.Charisma,
    },
  };
  let url = `${base_url}/gameProgress?api_key=${key}`;
  let type = "POST";

  if (gameProgress.id) {
    url = `${base_url}/gameProgress/${gameProgress.id}?api_key=${key}`;
    type = "PATCH";
  }
  buttonElement.innerHTML = "Saving game...";
  $.ajax({ url, type, data: progressData })
    .done(function (data) {
      buttonElement.innerHTML = "What will you do?";
      gameProgress.id = data.id;
      localStorage.setItem("game_id", data.id);
      gameProgress.saveNumber += 1;
      gameData.savedGames[data.id] = data.fields;
      gameData.touchedSinceSave = false;
      getScene(gameProgress.currentScene, true);
    })
    .fail(function (err) {
      console.log(err);
    });
}

// Get the scene and option info. Advance the game turn number.
function getScene(record_id, resume = false) {
  gameProgress.currentScene = record_id;
  if (!resume) {
    gameProgress.turnNumber += 1;
    gameData.touchedSinceSave = true;
  }
  if (optionFlags[record_id]) {
    gameProgress.flags.push(optionFlags[record_id]);
  }
  clearOptionFlags();

  $.ajax({
    url: `${base_url}/scenes/${record_id}?api_key=${key}`,
    type: "GET",
  })
    .done(function (data) {
      // Once AJAX request returns data, we destructure
      // it and store it in variables.
      let choices = [];
      let { story, special } = data.fields;
      console.log("getScene():", data.fields);
      if (data.fields.special) {
        switch (special) {
          case "MM":
            window.open(
              "http://mastermind-averages.bmoreinis.repl.co/",
              "_blank"
            );
            break;
          case "Roll":
            localStorage.setItem("rollingChar", "true");
            getInterstitialScene(special);
            window.open("./characters/index.html", "_blank");
            break;
          case "Melee1":
            localStorage.setItem("inMelee", record_id);
            localStorage.setItem("melee_id", data.fields.melee_id);
            getInterstitialScene(special);
            window.open("./melee/index.html", "_blank");
            break;
          default:
            console.log("special:", data.fields.special);
        }
      }
      // Don't bother if the scene doesn't have any choices.
      else if (data.fields.choices) {
        // Collect AirTable queries for every choice into an array.
        for (let idx = 0; idx < data.fields.choices.length; idx++) {
          choices.push(
            $.ajax({
              url: `${base_url}/choices/${data.fields.choices[idx]}?api_key=${key}`,
              type: "GET",
            })
          );
        }
        // Use Promise.all() to wait until every query in the array
        // has been returned before proceeding.
        Promise.all(choices)
          .then(function (data) {
            let targetArray = [];
            for (let idx = 0; idx < data.length; idx++) {
              // Destructure the necessary fields.
              // targets is an array
              console.log(data[idx]);
              let { choice, targets, flag, requiredFlags, blockingFlags } =
                data[idx].fields;
              if (optionIsVisible(requiredFlags, blockingFlags)) {
                targetArray.push({
                  choice: choice,
                  target: targets[0],
                  flag: flag ? flag[0] : null,
                });
              }
            }
            displayStory(story);
            setOptions(targetArray);
          })
          .catch(function (err) {
            console.log(err);
          });
      } else {
        displayStory(story);
        // No options available.
        setOptions(null);
      }
    })
    .fail(function (err) {
      console.log(err);
    });
}

// Get pause scene for character creation and melee.
function getInterstitialScene(special) {
  let scene = "";

  switch (special) {
    case "Roll":
      gameData.currentGameState = config.ROLLING_CHARACTER;
      scene = FINISH_CHAR_CREATION_ID;
      break;
    case "Melee1":
      gameData.currentGameState = config.IN_MELEE;
      scene = FINISH_COMBAT_ID;
      target = "MeleeTarget";
      break;
    default:
      console.log("getInterstitialScene(): bad argument:", special);
  }

  // Set target to Batman Begins
  setOptions([
    { choice: "Continue", target: OPENING_BATMAN_SCENE, flag: null },
  ]);
  $.ajax({
    url: `${base_url}/scenes/${scene}?api_key=${key}`,
  })
    .done(function (data) {
      displayStory(data.fields.story);
    })
    .fail(function (err) {
      console.log("getInterstitialScene():", err);
    });
}

// Start a new game or resume a previously saved game.
function getNewOrSavedStory(value) {
  if (value === config.OPTION_NEW_GAME) {
    gameData.currentGameState = config.SELECT_CHARACTER;
    const choices = [];
    $.ajax({
      url: `${base_url}/scenes/${CHARACTER_SELECT_ID}?api_key=${key}`,
      type: "GET",
    })
      .done(function (data) {
        displayStory(data.fields.story);
        gameData.characters.forEach(function (character) {
          let { name, charClass, firstScene, flag } = character.fields;
          let choice = `${name} the ${charClass}`;
          choices.push({ choice, target: firstScene[0], flag: flag[0] });
        });
        setOptions(choices);
      })
      .fail(function (err) {
        console.log(err);
      });
  } else if (gameData.savedGames[value]) {
    gameData.currentGameState = config.PLAY_GAME;
    resumeGame(value, gameData.savedGames[value]);
  } else {
    console.log("ERROR: Saved game could not be found.");
  }
}

function continueGame(melee) {
  const game_id = localStorage.getItem("game_id");
  console.log("continueGame:", game_id);
  $.ajax({ url: `${base_url}/gameProgress/${game_id}?api_key=${key}` })
    .done(function (data) {
      console.log("continueGame", data);
      gameData.currentGameState = config.PLAY_GAME;
      resumeGame(game_id, data.fields, melee);
    })
    .fail(function (err) {
      console.log("continueGame()", err);
    });
}

// Build current game progress data from saved game data.
function resumeGame(record_id, progressData, melee) {
  localStorage.setItem("game_id", record_id);
  gameProgress.id = record_id;
  gameProgress.character = progressData.character;
  gameProgress.gold = parseInt(progressData.Au);
  gameProgress.hitPoints = parseInt(progressData.HP);
  gameProgress.AC = parseInt(progressData.AC);
  gameProgress.flags = [].concat(progressData.flags);
  gameProgress.turnNumber = parseInt(progressData.turnNumber);
  gameProgress.Class = progressData.Class;
  gameProgress.Strength = parseInt(progressData.Strength);
  gameProgress.Intelligence = parseInt(progressData.Intelligence);
  gameProgress.Wisdom = parseInt(progressData.Wisdom);
  gameProgress.Constitution = parseInt(progressData.Constitution);
  gameProgress.Dexterity = parseInt(progressData.Dexterity);
  gameProgress.Charisma = parseInt(progressData.Charisma);

  let currentScene = melee ? getMeleeTargetScene() : progressData.currentScene;
  console.log("resumeGame() currentScene:", currentScene);
  getScene(currentScene, true);
}

function getMeleeTargetScene() {
  let scene = localStorage.getItem("meleeTarget");
  localStorage.removeItem("meleeTarget");
  return scene;
}

// Update game progress with the selected character.
function getCharacterSelection(value) {
  let character = gameData.characters.find(function (element) {
    return element.fields.firstScene[0] === value;
  });
  if (character) {
    gameData.currentGameState = config.PLAY_GAME;
    gameProgress.character = `${character.fields.name} the ${character.fields.charClass}`;
    getScene(value);
  } else {
    console.log("ERROR: Character could not be found.");
  }
}
