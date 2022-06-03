/* Global Variables */
var choices = [];
var modalText = "Houston, we have a problem defining modalText";
// user attack, damage done, amount you can use, description
// second punch is for move & attack - so lower damage
var inventory = [["Punch", 5, null, "You punch "],["Punch", 3, null, "You punch "],["Batarang", 7, 3, "You throw a batarang at "],["First-Aid Kit", 4, 5],["Smoke Pellets", null, 2],["Impact Mines", 7, 3],["Sticky Glue Balls", null, 2]];
var gold =  ["Gold", null, 50];
// attack type, bonus damage, times used (null = infinite), story text, miss response (hit responses are standard). 
var jokerInv = [["Punch", 1, null, "Joker throws a punch", ". You see it coming and dodge."],["Gun",3,6,"Joker fires his gun",". You block the bullet with your wrist."],["Taser",4,null,"Joker uses his taser",". You duck under your insulated cape."]];
// displayed during punches or kicks (kicks not implemented)
var actionImages=["crack.jpg","kapow.jpg","oof.jpg","pow.jpg","smash.jpg","wham.jpg","zwap.jpg"];
// Airtable
const pw = localStorage.getItem("pw");
const key = "keyJLBdH3kt" + pw;
const app_id = "appUOVbjlWQtGuhQ2";
const base_url = `https://api.airtable.com/v0/${app_id}`;

// TO DO: Attributes -- need populated from Airtable for this character
// Need a way of getting bonuses for attacks, defense, etc.
var attributes = [
  ["Strength", 0],
  ["Intelligence", 0],
  ["Wisdom", 0],
  ["Constitution", 0],
  ["Dexterity", 0],
  ["Charisma", 0]
];

// TO DO: Look up which class is active, pull a custom attack or defense from the array below
// and push that to the attack or defense array used.  Integrate that in melee messaging.
var classAttacks= [
  ["Christian Bale","The Dark Night", "One Punch Knockout"],
  ["Robert Pattinson","Knows All The Answers"],
  ["Michael Keaton","Predicts Villain Behaviors"],
  ["Will Arnett", "No Fall Damage"],
  ["Ben Affleck", "Can Escape Any Room"],
  ["Kevin Conroy", "Soul Catching Voice"]
];

/* Bonus only applies on move or attack, not move+attack */
var moves = ["Move", "Move + Attack", "Attack", "Special"];

/* TO DO: Attribute, Threshold, Bonus, Move Applied */
var classBonus = [
  [0, 14, +2, 2],
  [4, 12, +2, 0]
];
// Non Player Characters: Name, HP, Attack, Armor Class, Hit Dice (2 = max 8 points)
var npcs = [["Joker", 20, "punch", 6, 2],["Riddler",]];
// Not implemented
var initiative = ["player", "opponent", "critical"];
// This variable determines who attacks
var turn = 0;
/* stats[char][0] = attack bonus; stats[char][1] = armour class */
var stats = [
  [4, 15],
  [3, 13],
];
/* hp[0] is batman; hp[1] = joker */
var hp = [30, 25];
// roll (dice) sided dice (numDice) times
function roller(dice, numDice) {
  let sum = 0;
  for (let roll = 1; roll <= numDice; roll++) {
    let rolled = Math.floor(Math.random() * dice) + 1;
    sum += rolled;
  }
  return sum;
}
// Story starts here
function setup() {
  story("<i>For best Story results, play audio, top left.</i><br><br>You are on the top of Gotham Funland and you see the Joker planning something.");
  options=["Confront Him!", "~Wait and then Attack", "~Ask Robin"];
  setOptions(options); 
  buttonElement.innerHTML = "What will you do?"; 
  buttonElement.setAttribute("onclick", "checkAnswers(dropdown.value)");
}

/* This function determines initiative at the start of melee */
function determineInitiative() {
  let roll = roller(6, 1);
  modalText = "You rolled a " + roll + ".<br>";
  let turn = "player";
  switch (true) {
    case roll < 4:
      turn = 0;
      modalText += "You have the initiative!";
      showModal(modalText);
      pcTurn();
      break;
    case roll > 3 && roll < 7:
      turn = 1;
      modalText += "Your opponent has the initiative!";
      showModal(modalText);
      enemyTurn();
      //playerTurn();
      break;
    default:
      // Not implemented
      turn = 2;
      modalText += "Whoa! Critical incident.";
      critical();
      showModal(modalText);
      //nim();
      break;
  }
  //Go to Notes for description
  //alert(npcs[0][0] + " attacks with a " + npcs[0][2] + " and does "+ roller(npcs[0][3],1) + " damage");
}

/* function userCalculation
@params none
@return damage
This function takes stats into consideration and calculates damage and applies it to the NPC opponent*/
// This function is not called or implemented
function userCalculation() {
  if (strength >= 14) {
    fistDamage = fistDamage + 2;
  }
  if (constitution >= 4) {
    punches = punches + 2;
  } else if (constitution >= 8) {
    punches = punches + 3;
  } else {
    punches = punches + 4;
  }
}
// Player choses action
function pcTurn() {
  console.log("pcTurn() called");
  story("It is your turn, what would you like to do?");
  choices = moves;
  answer = setOptions(choices);
}
// Working, but no effect implemented
function move() {
  // find in 5/24[1]
  story("You moved to a new spot");
  choices = ["Ok"];
  answer = setOptions(choices);
}
// This function is not called
function moveAttack() {
  //Find in 5/24[2]
  let damage = roller(npcs[0][3], 1);
  story(
    "You punched " +
      npcs[0][0] +
      " and did " +
      damage +
      " damage. Then you moved out of the way"
  );
  hp[1] -= damage;
  choices = ["Ok"];
  answer = setOptions(choices);
}
// Displays batman's attack options
function attack() {
  //Find in 5/24[3]
  story("What would you like to attack with?");
  choices = [
    "Punch",
    "Batarang: (" + inventory[2][2] + " Remaining)",
    "~Smoke Pellets: (" + inventory[4][2] + " Remaining)",
    "~Impact Mines: (" + inventory[5][2] + " Remaining)",
    "~Sticky Glue Balls: (" + inventory[6][2] + " Remaining)",
    "First-Aid Kit: (" + inventory[3][2] + " Remaining)",
  ];
  answer = setOptions(choices);
}
// Not implemented
function special() {
  //Find in 5/24[4]
  story(
    "You rammed the batmobile through " +
      npcs[0][0] +
      " and did CRITICAL damage."
  );
  choices = ["Ok"];
  answer = setOptions(choices);
}
// Not called
function runAway() {
  story(
    "You decided that it you weren't ready to fight " +
      npcs[0][0] +
      " and chickened out"
  );
  choices = ["Done"];
  answer = setOptions(choices);
}
// Not called
function heal() {
  story(
    "You used a First-Aid Kit and healed " +
      (Math.floor(Math.random() * 6) + 1) +
      " hit points."
  );
  choices = ["Ok"];
  answer = setOptions(choices);
}
// Picks random enemy attack
function enemyTurn() {
  if (turn < 1) {
    turn = 1;
  }
  let attackType = Math.floor(Math.random() * 10 + 1);
  if (attackType < 6) {
    enemyAttack(0);
  } else if (attackType > 5 && attackType < 9) {
    if (jokerInv[1][2] > 0) enemyAttack(1);
    else enemyTurn();
  } else enemyAttack(2);
}
// Turn change, combat ends if eiither hp is below 0.
function turnChange() {
  turn++;
  if (hp[1] < 1) {
    victory();
  } else if (hp[0] < 1) {
    defeat();
  } else {
    if (turn % 2 == 0) {
      pcTurn();
    } else {
      enemyTurn();
    }
  }
}
// Not working, localStorage breaks the code
function victory() {
  localStorage.setItem("meleeTarget", resultTargets.victorious);
  story("The Joker has been defeated. Justice is served.");
  choices = ["Done"];
  answer = setOptions(choices);
}
// Not working, localStorage breaks the code
function defeat() {
  localStorage.setItem("meleeTarget", resultTargets.defeated);
  story("Batman fainted. The Joker is free to continue his plan.");
  choices = ["Done"];
  answer = setOptions(choices);
}

// Acknowledge end of melee and close window.
function endMeleeAndSave() {
  const game_id = localStorage.getItem("game_id");
  const url = `${base_url}/gameProgress/${game_id}?api_key=${key}`;
  const type = "PATCH";
  // Provide other fields that would need to be updated in Airtable at this point.
  console.log("endMeleeAndSave():", hp[0]);
  const progressData = {
    fields: {
      HP: 11,
    },
  };
 console.log("endMeleeAndSave:", progressData);

  buttonElement.innerHTML = "Saving game...";
  $.ajax({ url, type, data: progressData })
    .done(function (data) {
      window.close();
    })
    .fail(function (err) {
      console.log("saveGameCharacter(): ", err);
    });
}

// Function not called
function random() {
  let sum = 0;
  for (let roll = 1; roll <= 3; roll++) {
    let rolled = Math.floor(Math.random() * 6) + 1;
    sum += rolled;
  }
  return sum;
}
// (att) is what attack was picked, landing a punch displays an action word
function pcAttack(att) {
  if (inventory[att][2] > 0 || inventory[att][2] == null) {
    if (inventory[att][2] != null) {
      inventory[att][2] = inventory[att][2] - 1;
    }
    let damage = 0;
    let storyText = inventory[att][3]+"Joker";
    let attRoll = customRoll(20,1);
// Critical if true
    if (attRoll > 17){
      if (att == 0 || att == 1){
        actionWord();
      }
      damage = customRoll(4,1)+customRoll(4,1)+inventory[att][1];
      storyText+= ". Critical hit! You deal "+damage+" damage.";
    }
// Miss if true
    else if (attRoll < 3){
      storyText+=". You slip up and miss.";
    }
// Hit if true
    else if (attRoll + stats[0][0] >= stats[1][1]){
      if (att == 0 || att == 1){
        actionWord();
      }
      damage = customRoll(4,1)+inventory[att][1];
      storyText+=", dealing "+damage+" damage.";
    }
// else means target is safe
    else{
      storyText+= ". Joker seems unphased.";
    }
    if (att == 1){
      storyText+=" You then move out of the way.";
    } 
    hp[1] = hp[1]-damage;
    story(storyText);
    choices = ["Ok"];
    setOptions(choices);
  }
}
// Not called or implemented
function critical() {
  story(
    "You and " +
      npcs[0][0] +
      " clash as if both of you expected an attack, You have to play a game of nim to settle this."
  );
  choices = ["Lets Settle This"];
  answer = setOptions(choices);
}
// Testing function for unique dice
function customRoll(range, min) {
  return Math.floor(Math.random() * range + min);
}
// Identifies chosen attack
function attackId(answer) {
  if (answer.includes("Batarang") && inventory[2][2] > 0) {
    pcAttack(2);
  }
  if (answer.includes("First-Aid") && inventory[3][2] > 0) {
    pcHeal();
  }
}
// same as pcAttack but for joker
function enemyAttack(att){
  if (jokerInv[att][2] != null){
      jokerInv[att][2] = jokerInv[att][2] - 1;
    }
    let damage = 0;
    let storyText = jokerInv[att][3];
    let attRoll = customRoll(20,1);
    if (attRoll > 18){
      if (att == 0){
        actionWord();
      }
      damage = customRoll(4,1)+customRoll(4,1)+jokerInv[att][1];
      storyText+= ". Critical hit! You take "+damage+" damage.";
    }
    else if (attRoll < 3){
      storyText+=". He misses, destracted from laughing about something.";
    }
    else if (attRoll + stats[1][0] >= stats[0][1]){
      if (att == 0){
        actionWord();
      }
      damage = customRoll(4,1)+jokerInv[att][1];
      storyText+=", dealing "+damage+" damage.";
    }
    else{
      storyText+= jokerInv[att][4];
    }
    hp[0] = hp[0]-damage;
    story(storyText);
    choices = ["Ok"];
    setOptions(choices);
}
// Recover health if First-Aid kit is chosen
function pcHeal() {
  inventory[3][2] = inventory[3][2] - 1;
  let heal = customRoll(3, 0) + inventory[3][1];
  story("You use a First-Aid kit and recover " + heal + " health.");
  hp[0] = hp[0] + heal;
  if (hp[0] > 30) hp[0] = 30;
  choices = ["Ok"];
  setOptions(choices);
}
// Not called
function wait() {
  story(
    "You sat on the rafters with Robin undetected and listened to the Joker's plan."
  );
  choices = ["Chase Him", "Leave him", "Ask Robin"];
  answer = setOptions(choices);
}
// Not called
function robinJoker() {
  alert(
    "Robin: Hey Batman, I would wait and see what the Joker is up to, then we can fight him."
  );
}
// Shows action word
function actionWord(){
  let imageId = customRoll(7,0);
  //let batmanAudio = document.getElementById("batAudio");
  //batAudio.style.display = "none";
  actionMod = document.getElementById("actionModal");
  actionMod.innerHTML = "<img id='word' src=fightwords/"+actionImages[imageId]+">";
  actionMod.style.display = "block";
  let hide = setTimeout(hideWord,600);
}
// Removes action word after 0.6 seconds
function hideWord(){
  actionMod.style.display = "none";
}

/* Canonical checkAnswer */
function checkAnswers(answer) {
  switch (answer) {
    case "Reroll":
      reroll();
      break;
    case "See Stats and Pick Character":
      stats();
      break;
    case "Start Over":
      restart();
      break;
    case "Just let me see the stats":
      stats();
      break;
    case "Restart Anyways":
      stats();
      break;
    case "Christian Bale":
      toMelee();
      break;
    case "Ben Affleck":
      toMelee();
      break;
    case "Kevin Conroy":
      toMelee();
      break;
    case "Will Arnett":
      toMelee();
      break;
    case "Robert Pattinson":
      toMelee();
      break;
    case "Michael Keaton":
      toMelee();
      break;
    case "Confront Him!":
      determineInitiative();
      break;
    case "Move":
      move();
      break;
    case "Move + Attack":
      //moveAttack();
      pcAttack(1);
      break;
    case "Attack":
      attack();
      break;
    case "Special":
      special();
      break;
    case "Run Away":
      runAway();
      break;
    case "Wait and then Attack":
      wait();
      break;
    case "Ask Robin":
      robinJoker();
      break;
    case "Use First-Aid Kit: (" + inventory[1][1] + " Remaining)":
      heal();
      break;
    case "Ok":
      turnChange();
      break;
    case "Punch":
      pcAttack(0);
      break;
    case "Done":
      endMeleeAndSave();
      break;
    default:
      attackId(answer);
  }
}
