"use strict";


const {Pool} = require("pg");
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'details',
  password: '12345',
  port: 5432,
});
var play = document.querySelector("#play");
var betButtons = document.querySelectorAll(".betButtons");
var ready = document.querySelector(".ready");
var standBtn = document.querySelector("#stand");
var hitBtn = document.querySelector("#hit");
var doubleDownBtn = document.querySelector("#doubleDown");
var userAction = document.querySelectorAll(".user-action");
var countAce = document.querySelectorAll(".countAce");
playerSlot = document.querySelectorAll(".players");
dealerSlot = document.querySelector("#dealer");
playerCards = document.querySelectorAll(".player-cards");
dealerCards = document.querySelectorAll(".dealer-cards"); 

var startedGame = false;
var currentPlayer = 0;
var playersReady = 0;
var sum = null;
var dealersTurn = false;
var gameOn = false;
var showSum = false;
var chipIndex = null;
var playersCanPlay = false;
var clientDeal = {}; 

var suit = ["Heart", "Diamond", "Spade", "Club"];

var values = [{
  card: "A",
  value: [1, 11],
  hasAce: true
}, {
  card: "2",
  value: 2
}, {
  card: "3",
  value: 3
}, {
  card: "4",
  value: 4
}, {
  card: "5",
  value: 5
}, {
  card: "6",
  value: 6
}, {
  card: "7",
  value: 7
}, {
  card: "8",
  value: 8
}, {
  card: "9",
  value: 9
}, {
  card: "10",
  value: 10
}, {
  card: "J",
  value: 10
}, {
  card: "Q",
  value: 10
}, {
  card: "K",
  value: 10
}];
var deckImg = ["Heart2", "Heart3", "Heart4", "Heart5", "Heart6", "Heart7", "Heart8", "Heart9", "Heart10", "HeartJ", "HeartQ", "HeartK", "HeartA", "Diamond2", "Diamond3", "Diamond4", "Diamond5", "Diamond6", "Diamond7", "Diamond8", "Diamond9", "Diamond10", "DiamondJ", "DiamondQ", "DiamondK", "DiamondA", "Spade2", "Spade3", "Spade4", "Spade5", "Spade6", "Spade7", "Spade8", "Spade9", "Spade10", "SpadeJ", "SpadeQ", "SpadeK", "SpadeA", "Club2", "Club3", "Club4", "Club5", "Club6", "Club7", "Club8", "Club9", "Club10", "ClubJ", "ClubQ", "ClubK", "ClubA"];
var chipImg = ["White", "Red", "Blue", "Green", "Gray", "Orange", "Purple", "Brown", "Black"]; 

var deck = []; 

var theDeal = false; 

var ThePlay = false; 

var dealer = {
  cards: [],
  hiddenCard: [],
  sum: null,
  hasAce: false,
  hasLeft: null
}; 

var players = [];
var spectators = []; 

var player = players[currentPlayer]; 

function mapOrder(array, order, key) {
  array.sort(function (a, b) {
    var A = a[key],
        B = b[key];

    if (order.indexOf(A) > order.indexOf(B)) {
      return 1;
    } else {
      return -1;
    }
  });
  return array.reverse();
} 

Init();

function Init() {
  playerBets(); 
} 


function getDeck() {
  for (var s = 0; s < suit.length; s++) {
    for (var v = 0; v < values.length; v++) {
      var _card = {
        suit: suit[s],
        value: values[v]
      };
      deck.push(_card);
    }
  }

  shuffle(deck);
} 


function shuffle(deck) {

  for (var i = 0; i < 1000; i++) {
    var location1 = Math.floor(Math.random() * deck.length);
    var location2 = Math.floor(Math.random() * deck.length);
    var tmp = deck[location1];
    deck[location1] = deck[location2];
    deck[location2] = tmp;
  }
}

var card = deck.map(function (obj) {
  return obj.value.card;
});
var value = deck.map(function (obj) {
  return obj.value.value;
}); 

function playerBets() {
  var _loop = function _loop(b) {
    var betAmount = parseInt(betButtons[b].value);
    betButtons[b].addEventListener("click", function () {

      defaultClick.play();

      if (betAmount <= theClient.balance) {

        theClient.bet = theClient.bet + betAmount;
        theClient.balance = theClient.balance - betAmount;

      } else {
        alert("Need more balance");
      }
    });
  };

  // pool.query("UPDATE cas_users set balance = $1", [theClient.balance])

  for (var b = 0; b < betButtons.length; b++) {
    _loop(b);
  }
}

$(document).on("click", ".ready", function () {
  chipPlace.play();
  sendPlayerBets();
  $("#leave-table").addClass("noclick");
  $(".ready").addClass("hide-element");
  player = players[currentPlayer];
  updateCurrentPlayer();
  theClient.isReady = true;
  clientIsReady(); 

  if (players.every(function (player) {
    return player.isReady === true;
  }) && gameOn === false) {
    startDeal();
  }
});

function startDeal() {
  gameOn = true;
  clientDeal = clientId;
  getDeck();
  sendPlayerDeck();
  setTimeout(dealCards, 1000);
} 


function dealCards() {

  player = players[currentPlayer];
  updateCurrentPlayer(); 

  var _loop2 = function _loop2(i) {
    setTimeout(function () {
      player.cards.push(deck[0]);
      deck.shift();
      updatePlayerCards();
      nextPlayerInitial(); 

      if (i + 1 === players.length) dealDealerCards();
    }, i * 500);
  };

  for (var i = 0; i < players.length; i++) {
    _loop2(i);
  }
}

function dealDealerCards() {
  setTimeout(function () {
    if (dealer.cards.length === 1) {

      dealer.hiddenCard.push(deck[0]);
      deck.shift();
      updateDealerCards();
      updatePlayers(); 

      setTimeout(function () {
        naturals();
        hasPlayers0Left(); 

        sendPlayerThePlay();
        sendShowSum();
      }, 500);
    } else {
     
      dealer.cards.push(deck[0]);
      deck.shift();
      updateDealerCards();
      updatePlayers(); 
      setTimeout(function () {
        dealCards();
      }, 500);
    }
  }, 500);
} 


function naturals() {
  for (var i = 0; i < players.length; i++) {
   
    if (Array.isArray(players[i].cards[0].value.value) || Array.isArray(players[i].cards[1].value.value)) {
  
      if (players[i].cards[0].value.value === 10 || players[i].cards[1].value.value === 10) {
        
        naturalBlackjack(i);
        players[i].hasAce = true;

        for (var x = 0; x < playerSlotHTML.length; x++) {
          if (players[i].clientId === playerSlotHTML[x]) {
            playerNaturalIndex = x;
            playerResultNatural();
          }
        }
      } else {
     
        naturalPlayerAceSum(i);
        players[i].hasAce = true;
      }
    } else {
     
      players[i].sum = players[i].cards[0].value.value + players[i].cards[1].value.value;
    }
  } 


  dealer.sum = dealer.cards[0].value.value;
  if (dealer.cards[0].value.card === "A") dealer.hasAce = true;
  updatePlayers();
  showSum = true;
}

function naturalBlackjack(i) {
  players[i].blackjack = true;
  players[i].sum = 21; 

  players[i].balance = players[i].balance + (1.5 * players[i].bet + players[i].bet); 
}

function naturalPlayerAceSum(i) {
    if (players[i].cards[0].value.card === "A") {
    players[i].sum = [players[i].cards[1].value.value + 1, players[i].cards[1].value.value + 11];
  } else {
    players[i].sum = [players[i].cards[0].value.value + 1, players[i].cards[0].value.value + 11];
  }
} 

function thePlay() {
    $(".user-action-container").removeClass("hide-element");
  $("#dark-overlay").css("opacity", "1"); 
  startPlayTimer();

  for (var i = 0; i < userAction.length; i++) {
    userAction[i].addEventListener("click", function () {
      actionClick.play();
      timerRunningOut.stop();

      if (this === userAction[0] && clicked === false) {
        clicked = true;
        doubleDown = false;
        $(".user-action-container").addClass("hide-element");
        clearInterval(thePlayTime);
        $(".user-action-box").last().addClass("noclick");
        sendPlayerNext();
      } else if (this === userAction[1] && clicked === false) {
        clicked = true;
        doubleDown = false;
        $(".user-action-container").addClass("hide-element");
        clearInterval(thePlayTime);
        $(".user-action-box").last().addClass("noclick");
        playerHit();       } else if (this === userAction[2] && theClient.balance >= theClient.bet && clicked === false) {
        clicked = true;
        doubleDown = true;
        $(".user-action-container").addClass("hide-element");
        clearInterval(thePlayTime);
        playerDoubleDown();       }
    }, {
      once: true
    });
  }
} 

function playerHit() {
  if (player.hasAce === true || deck[0].value.hasAce === true) {
    compareSumAce();   }

  if (player.hasAce === false && deck[0].value.hasAce === undefined) {
    compareSum();   }
}

function sendPlayerNext() {
  $(".user-action-box").removeClass("noclick");
  $("#dark-overlay").css("opacity", "");
  timerRunningOut.stop(); 
  if (player.sum.length === 2 && player.sum[1] <= 21) {
    player.sum.shift();
    player.sum = player.sum[0];
  } else if (player.sum.length === 2 && player.sum[1] > 21) {
    player.sum.pop();
    player.sum = player.sum[0];
  }

  if (dealersTurn === false) nextPlayer();

  if (currentPlayer + 1 > players.length) {
            dealersTurn = true;
    sendDealersTurn();
    setTimeout(dealerPlay, 500);
  } else {
    sendPlayerThePlay();
  }

  updatePlayers();
}

function playerDoubleDown() {
  player.balance = player.balance - player.bet;
  player.bet = player.bet * 2;
  $("#total-bet").text(theClient.bet);
  playerHit();
} 

function dealerPlay() {
    players.push(dealer); 
  deck.unshift(dealer.hiddenCard[0]);
  dealer.hiddenCard = [];
  player = players[currentPlayer];
  updateCurrentPlayer();

  if (player.hasAce === true || deck[0].value.hasAce === true) {
    compareSumAce();
  } else {
    compareSum();
  }
} 

function finalCompareGo() {
      if (dealer.sum.length === 2 && dealer.sum[1] <= 21) {
    dealer.sum.shift();
    dealer.sum = dealer.sum[0];
  } else if (dealer.sum.length === 2 && dealer.sum[1] > 21) {
    dealer.sum.pop();
    dealer.sum = dealer.sum[0];
  }

  if (players.some(function (e) {
    return e.clientId === clientId;
  })) $("#player-result-big").removeClass("hide-element");

  if (theClient.sum > 21) {
        $("#player-result-big-answer").text("Перебор");
    $("#player-result-big-sum").text(theClient.bet);
    $("#player-result-big-plus-minus").text("-");
    $("#player-result-sum-box").addClass("color-red");
  } else if (theClient.blackjack === true) {
        $("#player-result-big-answer").text("Блэкджек");
    $("#player-result-big-sum").text(1.5 * theClient.bet + theClient.bet);
    $("#player-result-big-plus-minus").text("+");
    $("#player-result-sum-box").addClass("color-green");
  } else if (dealer.sum > 21) {
        $("#player-result-big-answer").text("Ты выиграл");
    $("#player-result-big-sum").text(theClient.bet * 2);
    $("#player-result-big-plus-minus").text("+");
    $("#player-result-sum-box").addClass("color-green");
  } else if (dealer.sum < theClient.sum) {
        $("#player-result-big-answer").text("Ты выиграл");
    $("#player-result-big-sum").text(theClient.bet * 2);
    $("#player-result-big-plus-minus").text("+");
    $("#player-result-sum-box").addClass("color-green");
  } else if (dealer.sum === theClient.sum) {
    $("#player-result-big-answer").text("Ничья");       } else {
        $("#player-result-big-answer").text("Дилер выиграл");
    $("#player-result-big-sum").text(theClient.bet);
    $("#player-result-big-plus-minus").text("-");
    $("#player-result-sum-box").addClass("color-red");
  } 

  winLoseComponents();
}

function winLoseComponents() {
  dealerSlot.firstElementChild.nextElementSibling.innerHTML = dealer.sum; 
  for (var i = 0; i < players.length; i++) {
        if (players[i].blackjack === false) {
      if (players[i].cards.length > 0) {
                if (dealer.sum > 21) {
          playerWin(i);

          for (var x = 0; x < playerSlotHTML.length; x++) {
            if (players[i].clientId === playerSlotHTML[x]) {
              $(".player-result:eq(" + x + ")").removeClass("hide-element");
              $(".player-result:eq(" + x + ")").addClass("result-win");
              $(".player-result:eq(" + x + ")").text("WIN");
            }
          }
        } else if (dealer.sum < players[i].sum) {
          playerWin(i);

          for (var _x = 0; _x < playerSlotHTML.length; _x++) {
            if (players[i].clientId === playerSlotHTML[_x]) {
              $(".player-result:eq(" + _x + ")").removeClass("hide-element");
              $(".player-result:eq(" + _x + ")").addClass("result-win");
              $(".player-result:eq(" + _x + ")").text("WIN");
            }
          }
        } else if (dealer.sum === players[i].sum) {
          playerDraw(i);

          for (var _x2 = 0; _x2 < playerSlotHTML.length; _x2++) {
            if (players[i].clientId === playerSlotHTML[_x2]) {
              $(".player-result:eq(" + _x2 + ")").removeClass("hide-element");
              $(".player-result:eq(" + _x2 + ")").addClass("result-draw");
              $(".player-result:eq(" + _x2 + ")").text("Ничья");
            }
          }
        } else {
          dealerWin(i);

          for (var _x3 = 0; _x3 < playerSlotHTML.length; _x3++) {
            if (players[i].clientId === playerSlotHTML[_x3]) {
              $(".player-result:eq(" + _x3 + ")").removeClass("hide-element");
              $(".player-result:eq(" + _x3 + ")").addClass("result-lose");
              $(".player-result:eq(" + _x3 + ")").text("LOSE");
            }
          }
        } 
      } else {
        dealerWin(i);
      } 
    } else {
      playerWin(i);
    }
  }
}

function playerWin(i) {
    if (players[i].blackjack === false) players[i].balance = players[i].balance + players[i].bet * 2;
  players[i].bet = 0;
}

function playerDraw(i) {
  if (players[i].blackjack === false) players[i].balance = players[i].balance + players[i].bet;
  players[i].bet = 0;
}

function dealerWin(i) {
  players[i].bet = 0;
}

function resetGame() {
    for (var i = 0; i < spectators.length; i++) {
    for (var x = 0; x < players.length; x++) {
      if (spectators[i].clientId === players[x].clientId) {
        spectators[i].balance = players[x].balance;
      }
    }

    $(".users-list-balance:eq(" + i + ")").text(spectators[i].balance);

    if (spectators[i].balance === 0) {
      $(".users-list-balance:eq(" + i + ")").addClass("color-red");
    } else {
      $(".users-list-balance:eq(" + i + ")").addClass("color-green");
    }
  }

  terminatePlayerFromSlot(); 
  for (var _i = 0; _i < spectators.length; _i++) {
    if (spectators[_i].hasLeft === true) {
      spectators.splice(_i, 1);
      game.spectators.splice(_i, 1);
    }
  } 

  $(".player-bet").text("");
  $(".player-coin").removeClass("player-coin-animation"); 
  for (var _i2 = 0; _i2 < players.length; _i2++) {
    players[_i2].cards = [];
    players[_i2].hasAce = false;
    players[_i2].sum = null;
    players[_i2].isReady = false;
    players[_i2].blackjack = false;
    players[_i2].bet = 0;
  } 

  dealer.cards = [];
  dealer.hiddenCard = [];
  dealer.hasAce = false;
  dealer.sum = null; 
  deck = []; 
  dealersHiddenCard = "";
  $("#dealerSum").removeClass("current-player-highlight");
  $(".players-timer circle").removeClass("circle-animation");
  $(".dealer-cards").html("<div class=\"visibleCards\"></div>");
  $(".dealer-cards").css("margin-left", "0"); 
  if (players.some(function (e) {
    return e.hiddenCard;
  })) players.splice(players.findIndex(function (e) {
    return e.hiddenCard;
  }), 1); 
  currentPlayer = 0;
  fixCurrentPlayerLength = 0;
  storedPlayers = [];
  playersReady = 0;
  resetCards = true;
  timerStarted = false;
  dealersTurn = false;
  startedGame = false;
  doubleDown = false;
  gameOn = false;
  game.gameOn = false;
  playersCanPlay = false;
  $(".user-action-box").removeClass("noclick");
  $("#total-bet").text("0");
  $("#player-result-big").addClass("hide-element");
  $("#join-mid-game-label").addClass("hide-element");
  $("#player-result-sum-box").removeClass("color-green color-red");
  $("#player-result-big-answer").text("");
  $("#player-result-big-sum").text("");
  $("#player-result-big-plus-minus").text("");
  $(".players .player-coin").css("background", "");
  $(".players .player-coin").css("opacity", "");

  for (var _i3 = 0; _i3 < players.length; _i3++) {
    if (players[_i3].clientId === clientId) {
      $("#bets-container").removeClass("noclick");
    }
  } 

  if (!players.some(function (e) {
    return e.clientId === clientId;
  })) $(".empty-slot").removeClass("noclick"); 
  if (players.some(function (e) {
    return e.clientId === clientId;
  })) $("#leave-table").removeClass("noclick");
  $(".player-result").addClass("hide-element");
  $(".player-result").removeClass("result-lose result-draw result-win result-blackjack");
  $(".player-sum").css({
    opacity: "",
    transform: ""
  });
  $("#dealerSum").css({
    opacity: "",
    transform: ""
  }); 
  if (resetCards === true) {
    for (var s = 0; s < playerSlot.length; s++) {
      playerSlot[s].lastElementChild.innerHTML = "";
    }

    dealerSlot.lastElementChild.lastElementChild.innerHTML = "";
    resetCards = false;
  }
}

function terminatePlayerFromSlot() {
  for (var x = 0; x < playerSlotHTML.length; x++) {
    for (var i = 0; i < players.length; i++) {
      if (players[i].hasLeft === true) {
        if (players[i].clientId === playerSlotHTML[x]) {
          playerSlot[x].innerHTML = "\n          <div><button class=\"ready hide-element\">PLACE BET</button></div>\n          <div class=\"empty-slot noclick\"><i class=\"fas fa-user-plus\"></i></div>\n          <div class=\"player-name hide-element\"><span class=\"hide-element\"><img class=\"player-avatar\" src=\"\" alt=\"avatar\"></span></div>\n          <div class=\"player-sum\"></div>\n          <div class=\"player-coin hide-element\"><div class=\"player-bet hide-element\"></div></div>\n          <div class=\"player-result hide-element\"></div>\n          <div class=\"player-cards\">\n    \n          </div>\n          ";
          playerSlot[x].classList.remove("player-left", "plug"); 
          playerSlotHTML[x] = {};
          game.playerSlotHTML[x] = {};
          players.splice(i, 1);
          game.players.splice(i, 1);
        }
      }
    }
  }
} 

function bust() {
  player.cards = [];
  sendPlayerNext();
} 

function playerAceDeckAce() {
  if (player.hasAce && deck[0].value.hasAce) {
    player.sum[0] = player.sum[0] + 1; 
    player.sum[1] = player.sum[1] + 1; 
    player.hasAce = true;
    givePlayerCard();       } else if (!player.hasAce && deck[0].value.hasAce) {
    player.sum = [player.sum + 1, player.sum + 11]; 
    player.hasAce = true;
    givePlayerCard();       } else if (player.hasAce && !deck[0].value.hasAce) {
    player.sum[0] = player.sum[0] + deck[0].value.value; 
    player.sum[1] = player.sum[1] + deck[0].value.value; 
    player.hasAce = true;
    givePlayerCard();       }
} 

function compareSum() {
  if (!player.hasAce && !deck[0].value.hasAce) {
    player.sum = player.sum + deck[0].value.value; 
    player.hasAce = false;
    givePlayerCard();     
    if (dealersTurn === true) {
      setTimeout(outputCardSumDealer, 1000);     } else {
      setTimeout(outputCardSum, 500);     }
  }
} 

function compareSumAce() {
  playerAceDeckAce();     
  if (dealersTurn === true) {
    setTimeout(outputCardSumAceDealer, 1000);   } else {
    setTimeout(outputCardSumAce, 500);   }
} 

function outputCardSum() {
  player.hasAce = false;

  if (dealersTurn === false) {
    if (player.sum === 21) {
      sendPlayerNext();
    } else if (player.sum < 21 && doubleDown === false) {
      sendPlayerThePlay();
    } else if (player.sum < 21 && doubleDown === true) {
      sendPlayerNext();
    } else if (player.sum > 21) {
      bust();
    }
  }
} 

function outputCardSumAce() {
    if (player.sum[1] > 21) {
        player.sum.pop();
    player.sum = player.sum[0];
    player.hasAce = false; 
    if (dealersTurn === false) {
      if (player.sum === 21) {
        sendPlayerNext();
      } else if (player.sum < 21 && doubleDown === false) {
        sendPlayerThePlay();
      } else {
        sendPlayerNext();
      }
    }
  } else {
    player.hasAce = true; 
    if (dealersTurn === false) {
      if (player.sum[1] === 21) {
        player.sum.shift();
        player.sum = player.sum[0];
        sendPlayerNext();
      }

      if (player.sum[1] < 21 && doubleDown === false) {
        sendPlayerThePlay();
      } else {
        sendPlayerNext();
      }
    }
  }
}

function outputCardSumAceDealer() {
  if (player.sum[1] > 21) {
    player.sum.pop();
    player.sum = player.sum[0];
    player.hasAce = false;

    if (dealersTurn === true) {
      if (player.sum < 17) {
        setTimeout(playerHit, 500);
      } else {
                setTimeout(function () {
          resetGameState();
        }, 4050);
        players.splice(-1)[0];
        finalCompare();
      }
    }
  } else {
    player.hasAce = true;

    if (dealersTurn === true) {
      if (player.sum[1] < 17) {
        setTimeout(playerHit, 500);
      } else {
                setTimeout(function () {
          resetGameState();
        }, 4050);
        players.splice(-1)[0];
        finalCompare();
      }
    }
  }
}

function outputCardSumDealer() {
  player.hasAce = false;

  if (dealersTurn === true) {
    if (player.sum < 17) {
      setTimeout(playerHit, 500);
    } else {
            setTimeout(function () {
        resetGameState();
      }, 4050);
      players.splice(-1)[0];
      finalCompare();
    }
  }
} 

function givePlayerCard() {
  player.cards.push(deck[0]);
  deck.shift();

  if (dealersTurn === true) {
    updateDealerCards();
  }

  if (dealersTurn === false) updatePlayerCards();
}

function nextPlayerInitial() {
  currentPlayer = (currentPlayer + 1) % players.length;
  player = players[currentPlayer];
}

function nextPlayer() {
  currentPlayer = currentPlayer + 1;
  player = players[currentPlayer];

  for (var i = 0; i < players.length; i++) {
    if (players[currentPlayer] !== undefined && players[currentPlayer].hasLeft === true) {
      currentPlayer = currentPlayer + 1;
      player = players[currentPlayer];
    } else {
      break;
    }
  }
} 

function hasPlayers0Left() {
  for (var i = 0; i < players.length; i++) {
    if (players[currentPlayer] !== undefined && players[currentPlayer].hasLeft === true) {
      currentPlayer = currentPlayer + 1;
      player = players[currentPlayer];
    } else {
      break;
    }
  }
} 

if (window.location.href.length - 1 > window.origin.length) {
  $("#btnCreate").addClass("hide-element");
  $("#btnJoin").removeClass("hide-element");
}

var bool1;
$("#about").click(function () {
  bool1 = !bool1;

  if (bool1 === true) {
    $("#about-box").css("top", "0");
  } else {
    $("#about-box").css("top", "");
  }
});
var bool2;
$("#how-to-play").click(function () {
  bool2 = !bool2;

  if (bool2 === true) {
    $("#info-rules").css("right", "0");
  } else {
    $("#info-rules").css("right", "");
  }
});
var bool3;
$("#users-online-button").click(function () {
  bool3 = !bool3;

  if (bool3 === true) {
    $("#users-online-box").css("left", "0");
    $("#users-online-button i").css("transform", "rotate(180deg)");
  } else {
    $("#users-online-box").css("left", "");
    $("#users-online-button i").css("transform", "");
  }
});
var bool4;
$("#volume-button").click(function () {
  bool4 = !bool4;

  if (bool4 === true) {
    $("#volume-button").html("<i class=\"fas fa-volume-mute\"></i>");
    Howler.volume(0);
  } else {
    $("#volume-button").html("<i class=\"fas fa-volume-up\"></i>");
    Howler.volume(1);
  }
}); 
$(".bg-colors").click(function () {
  if ($(this).attr("id") === "bg-green") {
    $("body").css("background", "");
  } else if ($(this).attr("id") === "bg-blue") {
    $("body").css("background", "radial-gradient(#388183, #1e3d42)");
  } else if ($(this).attr("id") === "bg-purple") {
    $("body").css("background", "radial-gradient(#723883, #1e2b42)");
  } else if ($(this).attr("id") === "bg-red") {
    $("body").css("background", "radial-gradient(#833838, #421e1e)");
  } else {
    $("body").css("background", "radial-gradient(#837538, #423e1e)");
  }

  $(".bg-colors").removeClass("bg-selected");
  $(".bg-colors").css("background-color", "");
  $(this).addClass("bg-selected");
  $(this).css("background-color", "rgba(0, 0, 0, 0");
}); 
$(".update-balance-bet").click(function () {
  $("#total-bet").text(theClient.bet);
  $("#balance").text(theClient.balance);
  // pool.query("UPDATE cas_users set balance = $1", [theClient.balance])

  if (theClient.bet > 0) {
    for (var i = 0; i < playerSlotHTML.length; i++) {
      if (playerSlotHTML[i] === clientId) {
        $(".ready:eq(" + i + ")").removeClass("hide-element");
      }
    }
  } else if (theClient.bet === 0) {
    $(".ready").addClass("hide-element");
  }
}); 
$(".max-clear").click(function () {
  defaultClick.play();

  for (var i = 0; i < playerSlotHTML.length; i++) {
    if (playerSlotHTML[i] === clientId) {
      if (this.innerText === "CLEAR") {
        $(".ready").addClass("hide-element");

        if (parseInt($(".players:eq(" + i + ") .player-bet").text()) > 1) {
                    theClient.balance = theClient.balance + theClient.bet - parseInt($(".players:eq(" + i + ") .player-bet").text());
          theClient.bet = parseInt($(".players:eq(" + i + ") .player-bet").text());
          $("#total-bet").text(theClient.bet);
          $("#balance").text(theClient.balance);
          pool.query("UPDATE cas_users set balance = $1", [theClient.balance])
          console.log(theClient.balance, "#1")
        } else {
                    theClient.balance = theClient.balance + theClient.bet;
          theClient.bet = 0;
          $("#total-bet").text(theClient.bet);
          $("#balance").text(theClient.balance);
          pool.query("UPDATE cas_users set balance = $1", [theClient.balance])
          console.log(theClient.balance, "#2")

        }
      } else if (this.innerText === "MAX") {
        theClient.bet = theClient.bet + theClient.balance;
        theClient.balance = 0;
        $("#total-bet").text(theClient.bet);
        $("#balance").text(theClient.balance);
        pool.query("UPDATE cas_users set balance = $1", [theClient.balance])
        console.log(theClient.balance, "#1")

        for (var _i4 = 0; _i4 < playerSlotHTML.length; _i4++) {
          if (playerSlotHTML[_i4] === clientId) {
            if (theClient.balance === 0 && theClient.bet === 0) {
              alert("Need more balance");
            } else {
              $(".ready:eq(" + _i4 + ")").removeClass("hide-element");
            }
          }
        }
      }
    }
  }
}); 
$("#invite-link-box button").click(function () {

  var inviteLink = document.querySelector("#invite-link");
  inviteLink.select();
  inviteLink.setSelectionRange(0, 99999);


  document.execCommand("copy");
});
$("#invite-link").hover(function () {
  $("#invite-label").css("z-index", "-1");
}, function () {
    $("#invite-label").css("z-index", "");
});

function exitRoom() {
  location.reload();
} 

var slideIndex = 1;
showSlides(slideIndex); 
function plusSlides(n) {
  showSlides(slideIndex += n);
} 

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("slideAvatars");

  if (n > slides.length) {
    slideIndex = 1;
  }

  if (n < 1) {
    slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[slideIndex - 1].style.display = "block";
} 

var spectatorsClone = [];

function setTimer(duration) {
  spectatorsClone = spectators;
  var timer = duration,
      seconds;
  var countdown = 40;
  var timeUntilDeal = setInterval(function () {
        seconds = parseInt(timer % 40, 10);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    document.getElementById("seconds").innerHTML = seconds;

    if (--timer < 0) {
      timer = duration;
    } 

    if (spectators.length > spectatorsClone.length) {
      clearInterval(timeUntilDeal);
      clearInterval(timeUntilDealExtra);
      document.getElementById("milliseconds").innerHTML = 0; 
      $("#deal-start-label").addClass("hide-element"); 
      setTimeout(function () {
        var payLoad = {
          method: "startTimer",
          spectators: spectators
        };
        ws.send(JSON.stringify(payLoad));
      }, 100);                 } 

    countdown--;

    if (countdown === 0 || players.every(function (player) {
      return player.isReady === true;
    })) {
            clearInterval(timeUntilDeal);
      clearInterval(timeUntilDealExtra);
      document.getElementById("milliseconds").innerHTML = 0; 
      $("#deal-start-label").addClass("hide-element"); 
      if (players.some(function (player) {
        return player.isReady === false && gameOn === false;
      })) {
        for (var i = 0; i < players.length; i++) {
          if (players[i].isReady === false) {
            if (players[i].clientId === clientId) {
              $("#bets-container").addClass("noclick");
              $("#leave-table").addClass("noclick");
              joined = false;
              terminatePlayer();
            }
          }
        }
      }
    } 

    if (players.every(function (player) {
      return player.isReady === false;
    })) {
      clearInterval(timeUntilDeal);
      clearInterval(timeUntilDealExtra);
      document.getElementById("milliseconds").innerHTML = 0; 
      $("#deal-start-label").addClass("hide-element");
    }
  }, 1000);
  var decisecond = 9;
  var timeUntilDealExtra = setInterval(function () {
        if (decisecond === 0) {
      decisecond = 9;
    } else {
      decisecond--;
    }

    document.getElementById("milliseconds").innerHTML = decisecond;
  }, 100);
}

function startTimer() {
  var fortySeconds = 38;
  setTimer(fortySeconds);
  $("#deal-start-label").removeClass("hide-element");
}

var thePlayTime;

function startPlayTimer() {
  var thirtySeconds = 30;
  thePlayTime = setInterval(function () {
    thirtySeconds--; 
    if (thirtySeconds === 5) {
      timerRunningOut.play();
    } 

    if (thirtySeconds === 0) {
      sendPlayerNext();
      $(".user-action-container").addClass("hide-element");
    }
  }, 1000);
} 

updateMediaQuery();

function updateMediaQuery() {
  if ($(".players").css("width") === "90px") {
    $("circle").attr({
      r: "40",
      cx: "43.5",
      cy: "43.5"
    });
    $("#invite-label").text("Hover to see invite link");
  } else if ($(".players").css("width") === "80px") {
    $("circle").attr({
      r: "35",
      cx: "38.5",
      cy: "38.5"
    });
    $("#invite-label").text("invite link");
  } else if ($(".players").css("width") === "100px") {
    $("circle").attr({
      r: "45",
      cx: "48.5",
      cy: "48.5"
    });
  }
}

window.onresize = updateMediaQuery;