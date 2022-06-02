var choices = [];

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
    case "Confront Him":
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
    case "Use First-Aid Kit: (" + inventory[0][1][1] + " Remaining)":
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

function roller() {
  roll = random();
  attribute = attributes[whichAttribute][0];
  story("You rolled a " + roll + " for " + attribute + ".");
  choices = ["Keep", "Reroll"];
  answer = setOptions(choices);
}

/* Function Keep
 * Pulls dice roll value from page to save in array.
 * Then rolls next attribute.
 * @param none
 * @return random integer 3 to 18
 */
function random() {
  let sum = 0;
  for (let roll = 1; roll <= 3; roll++) {
    let rolled = Math.floor(Math.random() * 6) + 1;
    sum += rolled;
  }
  return sum;
}


function hideModal() {
  let statsBox = document.getElementById("modalBox");
  statsBox.removeChild(statsBox.lastChild);
  statsBox.style.display = "none";
}

function toMelee() {
  document.location = "melee.html";
  story(
    "<i>For best results, play audio, top left.</i><br><br>You are on the top of Gotham Funland and you see the Joker planning something."
  );
  choices = ["Confront Him", "~Wait then Attack", "~Ask Robin"];
  answer = setOptions(choices);
}

function wait() {
  story(
    "You sat on the rafters with Robin undetected and listened to the Joker's plan."
  );
  choices = ["Chase Him", "Leave him", "Ask Robin"];
  answer = setOptions(choices);
}

function robinJoker() {
  alert(
    "Robin: Hey Batman, I would wait and see what the Joker is up to, then we can fight him."
  );
}

function critical() {
  story(
    "You and " +
      npcs[0][0] +
      " clash as if both of you expected an attack, You have to play a game of nim to settle this."
  );
  choices = ["Lets Settle This"];
  answer = setOptions(choices);
}

function pcTurn() {
  story("It is your turn, what would you like to do?");
  choices = moves;
  answer = setOptions(choices);
}

function move() {
  // find in 5/24[1]
  story("You moved to a new spot");
  choices = ["Ok"];
  answer = setOptions(choices);
}

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

function attack() {
  //Find in 5/24[3]
  story("What would you like to attack with?");
  choices = [
    "Batarang: (" + inventory[0][0][1] + " Remaining)",
    "Smoke Pellets: (" + inventory[0][2][1] + " Remaining)",
    "Impact Mines: (" + inventory[0][3][1] + " Remaining)",
    "Sticky Glue Balls: (" + inventory[0][4][1] + " Remaining)",
    "First-Aid Kit: (" + inventory[0][1][1] + " Remaining)",
  ];
  answer = setOptions(choices);
}

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

function runAway() {
  story(
    "You decided that it you weren't ready to fight " +
      npcs[0][0] +
      " and chickened out"
  );
}

function heal() {
  story(
    "You used a First-Aid Kit and healed " +
      (Math.floor(Math.random() * 6) + 1) +
      " hit points."
  );
  choices = ["Ok"];
  answer = setOptions(choices);
}

function victory() {
  story("The Joker has been defeated. Justice is served.");
}

function defeat() {
  story("Batman fainted. The Joker is free to continue his plan.");
}
