"use strict";

const {Pool} = require("pg");
if (window.location.href.length === window.origin.length + 1) {
  $("#btnJoin").removeClass("noclick-nohide");
  $("#btnCreate").removeClass("noclick-nohide");
  $("#btnOffline").removeClass("noclick-nohide");
}

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'details',
  password: '12345',
  port: 5432,
});

var clientId = null;
var gameId = null;
var roomId = null;
var theClient = null;
var storedPlayers = [];
var fixCurrentPlayerLength = 0;
players = [];
spectators = []; 
playerSlotHTML = [];
var clicked = null;
var doubleDown = null;
var reload = null;
var cardIndex = null;
var cardIndexJoin = 0;
var playerNaturalIndex = null;
var dealersHiddenCard = "";
var timerStarted = false;
var newPlayer = null;
var offline = null;
var HOST = location.origin.replace(/^http/, "ws");
var ws = new WebSocket(HOST);
var btnCreate = document.getElementById("btnCreate");
var btnOffline = document.getElementById("btnOffline");
var btnJoin = document.getElementById("btnJoin");
var txtGameId = document.getElementById("txtGameId");
var divPlayers = document.getElementById("divPlayers");
var divBoard = document.getElementById("divBoard"); 
var nickname = theClient.nickname
var avatar = document.querySelectorAll(".slideAvatars");
var playersLength = null;
var theSlot = null;
var z = null; 
var aPlayer = null;
var joined = false;
var playerSlot = document.querySelectorAll(".players");
var playerCards = document.querySelectorAll(".player-cards");
var dealerCards = document.querySelectorAll(".dealer-cards");
var dealerSlot = document.querySelector("#dealer");
var playerName = document.querySelectorAll(".player-name"); 
var resetCards = false;
var leaveTable = document.querySelector("#leave-table"); 
ws.addEventListener("open", function () {
  console.log("We are connected!");
}); 
window.addEventListener("load", function () {
  setTimeout(function () {
        $("#btnJoin").removeClass("noclick-nohide");
    $("#btnCreate").removeClass("noclick-nohide");
    $("#btnOffline").removeClass("noclick-nohide"); 
    btnJoin.addEventListener("click", function (e) {
      $("#loading-screen").removeClass("hide-element");
      var payLoadLength = {
        method: "playersLength",
        gameId: gameId
      };
      ws.send(JSON.stringify(payLoadLength)); 
      setTimeout(function () {
        if (playersLength >= 7) {
          $("#loading-screen").addClass("hide-element");
          alert("Game Is full!");
          return;
        } else {
          playerJoin();
          setTimeout(function () {
            $("#loading-screen").addClass("hide-element");
            $("#main-menu").addClass("hide-element");
            $("#game-room").removeClass("hide-element");
          }, 250);
        }
      }, 50);
    });
    btnCreate.addEventListener("click", function (e) {
      $("#loading-screen").removeClass("hide-element");
      var payLoad = {
        method: "create",
        clientId: clientId,
        theClient: theClient,
        playerSlot: playerSlot,
        playerSlotHTML: playerSlotHTML,
        roomId: roomId
      };
      ws.send(JSON.stringify(payLoad)); 
      setTimeout(function () {
        playerJoin();
        $("#loading-screen").addClass("hide-element");
        $("#main-menu").addClass("hide-element");
        $("#game-room").removeClass("hide-element");
      }, 300);
    });
    btnOffline.addEventListener("click", function (e) {
      var offline = true;
      $("#loading-screen").removeClass("hide-element");
      var payLoad = {
        method: "create",
        clientId: clientId,
        theClient: theClient,
        playerSlot: playerSlot,
        playerSlotHTML: playerSlotHTML,
        roomId: roomId,
        offline: offline
      };
      ws.send(JSON.stringify(payLoad)); 
      setTimeout(function () {
        playerJoin();
        $("#loading-screen").addClass("hide-element");
        $("#main-menu").addClass("hide-element");
        $("#game-room").removeClass("hide-element");
      }, 300);
    });   }, 200);
});
leaveTable.addEventListener("click", function (e) {
  joined = false;
  theClient.balance = theClient.balance + theClient.bet;
  pool.query("UPDATE cas_users set balance = $1", [theClient.balance])
  theClient.bet = 0;
  $("#total-bet").text(theClient.bet);
  $("#balance").text(theClient.balance);
  $("#bets-container").addClass("noclick");
  $("#leave-table").addClass("noclick");
  $(".empty-slot").removeClass("noclick"); 
  if (players.length > 1) {
    var playersMinusOne = players; 
    playersMinusOne.splice(players.findIndex(function (players) {
      return players.clientId === clientId;
    }), 1);

    for (var i = 0; i < playersMinusOne.length; i++) {
      if (playersMinusOne.every(function (playersMinuesOne) {
        return playersMinuesOne.isReady === true;
      })) {
        $(".empty-slot").addClass("noclick");
      } else {
        $(".empty-slot").removeClass("noclick");
      }
    }
  }

  terminatePlayer();
});

function playerJoin() {
  nickname = theClient.nickname;
  theClient.nickname = theClient.nickname;
  avatar = avatar[slideIndex - 1].dataset.value;
  theClient.avatar = avatar;     
  var payLoad = {
    method: "join",
    clientId: clientId,
    gameId: gameId,
    roomId: roomId,
    theClient: theClient,
    playerSlot: playerSlot,
    playerSlotHTML: playerSlotHTML,
    players: players,
    spectators: spectators,
    nickname: theClient.nickname,
    avatar: avatar
  };
  ws.send(JSON.stringify(payLoad));
}

function sendPlayerBets() {
  var payLoad = {
    method: "bet",
    players: players,
    spectators: spectators
  };
  ws.send(JSON.stringify(payLoad));
}

function updatePlayerCards() {
  var payLoad = {
    method: "updatePlayerCards",
    players: players,
    spectators: spectators,
    player: player,
    resetCards: resetCards
  };
  ws.send(JSON.stringify(payLoad));
}

function updateDealerCards() {
  var payLoad = {
    method: "updateDealerCards",
    players: players,
    spectators: spectators,
    player: player,
    dealer: dealer,
    dealersTurn: dealersTurn 
  };
  ws.send(JSON.stringify(payLoad));
}

function sendPlayerDeck() {
  var payLoad = {
    method: "deck",
    players: players,
    spectators: spectators,
    deck: deck,
    clientDeal: clientDeal,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(payLoad));
}

function clientIsReady() {
  var payLoad = {
    method: "isReady",
    players: players,
    spectators: spectators,
    theClient: theClient
  };
  ws.send(JSON.stringify(payLoad));
}

function clientHasLeft() {
  var payLoad = {
    method: "hasLeft",
    players: players,
    spectators: spectators,
    theClient: theClient
  };
  ws.send(JSON.stringify(payLoad));
}

function updatePlayers() {
  var payLoad = {
    method: "update",
    players: players,
    spectators: spectators,
    dealer: dealer,
    deck: deck,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(payLoad));
}

function updateCurrentPlayer() {
  var payLoad = {
    method: "currentPlayer",
    players: players,
    spectators: spectators,
    player: player,
    dealersTurn: dealersTurn
  };
  ws.send(JSON.stringify(payLoad));
}

function sendPlayerThePlay() {
  var payLoad = {
    method: "thePlay",
    players: players,
    spectators: spectators,
    player: player,
    currentPlayer: currentPlayer,
    theClient: theClient,
    dealersTurn: dealersTurn,
    gameId: gameId
  };
  ws.send(JSON.stringify(payLoad));
}

function sendShowSum() {
  var payLoad = {
    method: "showSum",
    players: players,
    spectators: spectators
  };
  ws.send(JSON.stringify(payLoad));
}

function joinTable() {
  var payLoad = {
    method: "joinTable",
    players: players,
    spectators: spectators,
    theClient: theClient,
    theSlot: theSlot,
    playerSlotHTML: playerSlotHTML,
    gameId: gameId
  };
  ws.send(JSON.stringify(payLoad));
}

function updateTable() {
  var payLoad = {
    method: "updateTable",
    players: players,
    spectators: spectators,
    theClient: theClient,
    theSlot: theSlot,
    playerSlot: playerSlot
  };
  ws.send(JSON.stringify(payLoad));
}

function sendDealersTurn() {
  var payLoad = {
    method: "dealersTurn",
    players: players,
    spectators: spectators,
    dealersTurn: dealersTurn
  };
  ws.send(JSON.stringify(payLoad));
}

function terminatePlayer() {
  var payLoad = {
    method: "terminate",
    spectators: spectators,
        theClient: theClient,
    gameId: gameId,
    playerSlotHTML: playerSlotHTML,
    players: players,
    reload: reload,
    clientDeal: clientDeal,
    playersCanPlay: playersCanPlay,
    player: player,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(payLoad));
}

function resetRound() {
  var payLoad = {
    method: "resetRound",
    spectators: spectators,
    theClient: theClient
  };
  ws.send(JSON.stringify(payLoad));
}

function playerResult() {
  var payLoad = {
    method: "playerResult",
    spectators: spectators,
    players: players
  };
  ws.send(JSON.stringify(payLoad));
}

function playerResultNatural() {
  var payLoad = {
    method: "playerResultNatural",
    spectators: spectators,
    players: players,
    playerNaturalIndex: playerNaturalIndex
  };
  ws.send(JSON.stringify(payLoad));
}

function finalCompare() {
  var payLoad = {
    method: "finalCompare",
    gameId: gameId,
    spectators: spectators,
    players: players
  };
  ws.send(JSON.stringify(payLoad));
}

function resetGameState() {
  var payLoad = {
    method: "resetGameState",
    gameId: gameId,
    spectators: spectators,
    players: players
  };
  ws.send(JSON.stringify(payLoad));
}

window.addEventListener("load", function (event) {
  if (window.location.href.length - 1 > window.origin.length) {
    var str2 = window.location.href;
    getRouteId = str2.substring(str2.length - 6);
    var payLoadRoute = {
      method: "getRoute",
      getRouteId: getRouteId
    };
    ws.send(JSON.stringify(payLoadRoute));
  }
});

ws.onmessage = function (message) {
    var response = JSON.parse(message.data); 
  if (response.method === "connect") {
    clientId = response.clientId;
    theClient = response.theClient;
  }

  if (response.method === "leave") {
    game = response.game;
    players = response.players;
    spectators = response.spectators;
    playerSlotHTML = response.playerSlotHTML;
    playerSlotIndex = response.playerSlotIndex;
    reload = false;
    oldPlayerIndex = response.oldPlayerIndex;
    gameOn = response.gameOn; 
    if (spectators[oldPlayerIndex] === undefined) {
      $(".users-list-box:eq(" + oldPlayerIndex + ")").remove();
    }

    for (var i = 0; i < players.length; i++) {
      if (players[i].hasLeft === true) {
        if (playersCanPlay === false && players[i].clientId === clientDeal) {
          resetGameState();
        }
      }
    }

    if (gameOn === false) {
      if (playerSlotIndex === undefined || playerSlotIndex === null) {
        return;
      } else {
        playerSlot[playerSlotIndex].innerHTML = "\n        <div><button class=\"ready hide-element\">PLACE BET</button></div>\n        <div class=\"empty-slot\"><i class=\"fas fa-user-plus\"></i></div>\n        <div class=\"player-name hide-element\"><span class=\"hide-element\"><img class=\"player-avatar\" src=\"\" alt=\"avatar\"></span></div>\n        <div class=\"player-sum\"></div>\n        <div class=\"player-coin hide-element\"><div class=\"player-bet hide-element\"></div></div>\n        <div class=\"player-result hide-element\"></div>\n        <div class=\"player-cards\">\n\n        </div>\n        ";
      }
    } 

    if (players.some(function (e) {
      return e.clientId === clientId;
    })) {
      if (!$(".empty-slot").is("noclick")) {
        $(".empty-slot").addClass("noclick");
      }
    } 

    if (gameOn === true) {
      $(".empty-slot").addClass("noclick");

      if (playerSlotIndex === undefined || playerSlotIndex === null) {
        return;
      } else {
        playerSlot[playerSlotIndex].classList.add("player-left", "plug");
      }
    }

    if (game.players.length === 0 && $("#dealerSum").text().length > 0) {
      dealersTurn = true;
      sendDealersTurn();
      dealerPlay();
    }         

    if (gameOn === false && players.length > 0 && players.every(function (player) {
      return player.isReady;
    })) {
      if (players[0].clientId === clientId && gameOn === false) startDeal();
    }
  } 

  if (response.method === "create") {
    gameId = response.game.id;
    roomId = response.roomId;
    offline = response.offline;

    if (offline === true) {
      window.history.pushState("offline_page", "Offline Mode", "/");
      $("#invite-link-box").remove();
      $("#users-online-label").text("Одиночная игра");
    }
  } 

  if (response.method === "join") {
    game = response.game;
    player = game.player;
    spectators = game.spectators;
    playerSlotHTML = response.playerSlotHTML;
    roomId = response.roomId;
    roomId = gameId.substring(gameId.length - 6);

    if (offline !== true) {
      window.history.pushState("game", "Title", "/" + roomId);
    }
  } 

  if (response.method === "joinClient") {
    theClient = response.theClient;
    game = response.game;
    players = response.players;
    spectators = game.spectators;
    playerSlotHTML = response.playerSlotHTML;
    $("#invite-link").val(gameId); 
    setTimeout(function () {
      for (var _i = 0; _i < playerSlotHTML.length; _i++) {
        for (var x = 0; x < spectators.length; x++) {
          if (spectators[x].clientId === playerSlotHTML[_i]) {
            z = playerSlotHTML.indexOf(playerSlotHTML[_i]);
            if (spectators[x].nickname === "") spectators[x].nickname = "Игрок";
            playerSlot[z].firstElementChild.nextElementSibling.innerText = spectators[x].nickname;
            playerSlot[z].firstElementChild.nextElementSibling.innerHTML += "<span><img class=\"player-avatar\" src=\"/imgs/avatars/" + spectators[x].avatar + ".svg\" alt=\"avatar\"></span>";
          }
        }
      }
    }, 50); 
    for (var _i2 = 0; _i2 < spectators.length; _i2++) {
      if (spectators[_i2].nickname === "") spectators[_i2].nickname = "Игрок";
      $("#users-online-container").append("\n      <li class=\"users-list-box\">\n        <div class=\"users-list-info\">\n          <div class=\"user-list-name\">" + spectators[_i2].nickname + "</div>\n          <div>Баланс: <span class=\"users-list-balance\">" + spectators[_i2].balance + "</span></div>\n        </div>\n        <div class=\"users-list-img\">\n          <img src=\"/imgs/avatars/" + spectators[_i2].avatar + ".svg\" alt=\"avatar\">\n        </div>\n      </li>\n      ");

      if (spectators[_i2].clientId === clientId) {
        $(".user-list-name:eq(" + _i2 + ")").addClass("highlight");
      }
    }
  } 

  if (response.method === "updateClientArray") {
    players = response.players;
    newPlayer = response.newPlayer;
    playerSlotHTML = response.playerSlotHTML; 
    if (spectators.length > $("#users-online-container").children().length) {
      if (newPlayer.nickname === "") newPlayer.nickname = "Игрок";
      $("#users-online-container").append("\n      <li class=\"users-list-box\">\n        <div class=\"users-list-info\">\n          <div class=\"user-list-name\">" + newPlayer.nickname + "</div>\n          <div>Баланс: <span class=\"users-list-balance\">" + newPlayer.balance + "</span></div>\n        </div>\n        <div class=\"users-list-img\">\n          <img src=\"/imgs/avatars/" + newPlayer.avatar + ".svg\" alt=\"avatar\">\n        </div>\n      </li>\n      ");
    }
  } 

  if (response.method === "joinMidGame") {
    theClient = response.theClient;
    game = response.game; 
    players = game.players;
    playerSlotHTML = game.playerSlotHTML;
    player = game.player;
    dealer = game.dealer;
    gameOn = game.gameOn;                                         
    $("#invite-link").val(gameId); 
    $("#join-mid-game-label").removeClass("hide-element"); 
    setTimeout(function () {
      for (var _i3 = 0; _i3 < spectators.length; _i3++) {
        if (spectators[_i3].nickname === "") spectators[_i3].nickname = "Игрок";
        $("#users-online-container").append("\n        <li class=\"users-list-box\">\n          <div class=\"users-list-info\">\n            <div class=\"user-list-name\">" + spectators[_i3].nickname + "</div>\n            <div>Баланс: <span class=\"users-list-balance\">" + spectators[_i3].balance + "</span></div>\n          </div>\n          <div class=\"users-list-img\">\n            <img src=\"/imgs/avatars/" + spectators[_i3].avatar + ".svg\" alt=\"avatar\">\n          </div>\n        </li>\n        ");

        if (spectators[_i3].clientId === clientId) {
          $(".user-list-name:eq(" + _i3 + ")").addClass("highlight");
        }
      }
    }, 200); 
    for (var x = 0; x < players.length; x++) {
      for (var _i4 = 0; _i4 < playerSlotHTML.length; _i4++) {
        if (players[x].clientId === playerSlotHTML[_i4]) {
          z = playerSlotHTML.indexOf(playerSlotHTML[_i4]);
          if (playerSlot[z].firstElementChild.nextElementSibling.classList.contains("empty-slot")) playerSlot[z].firstElementChild.nextElementSibling.remove();
        }
      }
    } 

    for (var _i5 = 0; _i5 < playerSlotHTML.length; _i5++) {
      for (var _x = 0; _x < players.length; _x++) {
        if (players[_x].clientId === playerSlotHTML[_i5]) {
          z = playerSlotHTML.indexOf(playerSlotHTML[_i5]);
          if (players[_x].nickname === "") players[_x].nickname = "Игрок";
          playerSlot[z].firstElementChild.nextElementSibling.innerText = players[_x].nickname;
          playerSlot[z].firstElementChild.nextElementSibling.innerHTML += "<span><img class=\"player-avatar\" src=\"/imgs/avatars/" + players[_x].avatar + ".svg\" alt=\"avatar\"></span>";
        }
      }
    } 

    for (var _i6 = 0; _i6 < players.length; _i6++) {
      for (var d = 0; d < deckImg.length; d++) {
        for (var c = 0; c < players[_i6].cards.length; c++) {
          if (players[_i6].cards[c].suit + players[_i6].cards[c].value.card === deckImg[d]) {
                        for (var s = 0; s < playerSlotHTML.length; s++) {
              if (players[_i6].clientId === playerSlotHTML[s]) {
                cardIndexJoin++;
                playerSlot[s].lastElementChild.innerHTML += "<img class=\"cardImg" + " card" + cardIndexJoin + "\" src=\"/imgs/" + deckImg[d] + ".svg\">";
              }
            }
          }
        }
      }
    } 

    if (game.spectators.slice(-1)[0].clientId === clientId) {
      for (var _d = 0; _d < deckImg.length; _d++) {
        for (var _c = 0; _c < dealer.cards.length; _c++) {
          if (dealer.cards[_c].suit + dealer.cards[_c].value.card === deckImg[_d]) {
            dealerSlot.lastElementChild.firstElementChild.innerHTML += "<img class=\"dealerCardImg\" src=\"/imgs/" + deckImg[_d] + ".svg\">";
          }
        }
      }
    } 

    if (dealer.hiddenCard.length === 0 || dealer.hiddenCard.length === undefined) {
      return;
    } else {
      dealerSlot.lastElementChild.firstElementChild.innerHTML += "\n      <div class=\"flip-card\">\n        <div class=\"flip-card-inner\">\n          <div class=\"flip-card-front\">\n\n          </div>\n          <div class=\"flip-card-back\">\n\n          </div>\n        </div>\n      </div>\n      ";
      $(".flip-card-front").html("<img class=\"dealerCardImg\" src=\"/imgs/Card_back.svg\">");
      setTimeout(function () {
        $(".flip-card-back").html("<img class=\"dealerCardImg\" src=\"/imgs/" + dealersHiddenCard + ".svg\">");
      }, 50); 
      $(".dealer-cards").css("margin-left", "-=90px");
    } 

    if (dealer.sum > 0) {
      for (var _i7 = 0; _i7 < players.length; _i7++) {
        for (var _s = 0; _s < playerSlotHTML.length; _s++) {
          if (players[_i7].clientId === playerSlotHTML[_s]) {
                        playerSlot[_s].firstElementChild.nextElementSibling.nextElementSibling.style.opacity = "1";
            playerSlot[_s].firstElementChild.nextElementSibling.nextElementSibling.style.transform = "scale(1)";
          }
        }
      }       

      dealerSlot.firstElementChild.nextElementSibling.style.opacity = "1";
      dealerSlot.firstElementChild.nextElementSibling.style.transform = "scale(1)";
    } 

    setPlayersBet();

    if (game.players.length === 0) {
      resetGame();
    }
  }

  if (response.method === "joinMidGameUpdate") {
    spectators = response.spectators;
    newPlayer = response.newPlayer;

    if (players.length > 0) {
            var payLoad = {
        method: "dealersHiddenCard",
        spectators: spectators,
        dealersHiddenCard: dealersHiddenCard
      };

      if (players[players.findIndex(function (players) {
        return players.hasLeft === false;
      })].clientId === clientId) {
        ws.send(JSON.stringify(payLoad));
      } 

      if (players.length === 1 && players[0].hasLeft === true) {
                for (var _i8 = 0; _i8 < players.length; _i8++) {
          for (var _s2 = 0; _s2 < spectators.length; _s2++) {
            if (players[_i8].hasLeft === true) {
              if (spectators[_s2].clientId === players[_i8].clientId) {
                spectators[_s2].hasLeft = true;
              }
            }
          }
        }

        resetGame();
      }
    } else {
      resetGame();
    } 

    if (newPlayer.clientId === clientId) {    } else {
      if (spectators.length > $("#users-online-container").children().length) {
        if (newPlayer.nickname === "") newPlayer.nickname = "Игрок";
        $("#users-online-container").append("\n        <li class=\"users-list-box\">\n          <div class=\"users-list-info\">\n            <div class=\"user-list-name\">" + newPlayer.nickname + "</div>\n            <div>Баланс: <span class=\"users-list-balance\">" + newPlayer.balance + "</span></div>\n          </div>\n          <div class=\"users-list-img\">\n            <img src=\"/imgs/avatars/" + newPlayer.avatar + ".svg\" alt=\"avatar\">\n          </div>\n        </li>\n        ");
      }
    }
  }

  if (response.method === "dealersHiddenCard") {
    dealersHiddenCard = response.dealersHiddenCard;
  } 

  if (response.method === "bet") {
    players = response.players; 
    for (var _i9 = 0; _i9 < spectators.length; _i9++) {
      for (var _x2 = 0; _x2 < players.length; _x2++) {
        if (spectators[_i9].clientId === players[_x2].clientId) {
          spectators[_i9].balance = players[_x2].balance;
        }
      }

      $(".users-list-balance:eq(" + _i9 + ")").text(spectators[_i9].balance);
      if (spectators[_i9].balance === 0) $(".users-list-balance:eq(" + _i9 + ")").addClass("color-red");
    }
  } 

  if (response.method === "deck") {
    players = mapOrder(players, playerSlotHTML, "clientId");
    deck = response.deck;
    clientDeal = response.clientDeal;
    gameOn = response.gameOn; 
    if (gameOn) {
      for (var _i10 = 0; _i10 < players.length; _i10++) {
        if (players[_i10].clientId === clientId) {
          $("#bets-container").addClass("noclick");
        }
      }

      $(".empty-slot").addClass("noclick");
      $("#leave-table").addClass("noclick");
      $("#deal-start-label").addClass("hide-element");
    }
  }

  if (response.method === "isReady") {
    players = response.players;
    setPlayersBet();

    if (players.length > 1 && players.every(function (player) {
      return player.isReady;
    }) === false && timerStarted === false) {
      timerStarted = true;
      startTimer();
    }
  }

  if (response.method === "hasLeft") {
    players = response.players;
    spectators = response.spectators;
  } 

  if (response.method === "currentPlayer") {
    player = response.player;
  }

  if (response.method === "updatePlayerCards") {
    dealingSound.play();
    resetCards = response.resetCards;
    players = response.players;
    player = response.player;
    if (player !== undefined) cardIndex = player.cards.length;

    var _loop = function _loop(_i11) {
      if (player.clientId === playerSlotHTML[_i11]) {
        z = playerSlotHTML.indexOf(playerSlotHTML[_i11]);

        for (var _c2 = 0; _c2 < deckImg.length; _c2++) {
          if (player.cards.slice(-1)[0].suit + player.cards.slice(-1)[0].value.card === deckImg[_c2]) {
            playerSlot[z].lastElementChild.innerHTML += "<img class=\"cardImg" + " card" + cardIndex + " cardAnimation\" src=\"/imgs/" + deckImg[_c2] + ".svg\">";
          }
        } 

        setTimeout(function () {
          $(".players:eq(" + playerSlotHTML.indexOf(playerSlotHTML[_i11]) + ") .player-cards").children().removeClass("cardAnimation");
        }, 50);
      }
    };

    for (var _i11 = 0; _i11 < playerSlotHTML.length; _i11++) {
      _loop(_i11);
    }
  }

  if (response.method === "updateDealerCards") {
    dealingSound.play(); 
    dealersTurn = response.dealersTurn;

    if (dealersTurn === false) {
      dealer = response.dealer;
    } else {
      player = response.player;
      dealer = player;
    }                 

    if (dealer.hiddenCard.length === 0 || dealer.hiddenCard.length === undefined) {
      if ($(".flip-card-inner").css("transform") !== "none" || dealer.cards.length === 1) {
        for (var _c3 = 0; _c3 < deckImg.length; _c3++) {
          if (dealer.cards.slice(-1)[0].suit + dealer.cards.slice(-1)[0].value.card === deckImg[_c3]) {
            dealerSlot.lastElementChild.firstElementChild.innerHTML += "<img class=\"dealerCardImg cardAnimationDealer\" src=\"/imgs/" + deckImg[_c3] + ".svg\">";
          }
        }
      } 

      setTimeout(function () {
        $(".visibleCards").children().removeClass("cardAnimationDealer");
      }, 50);

      if (dealer.hiddenCard.length === 0 && dealer.cards.length === 2) {
        $(".flip-card-inner").css("transform", "rotateY(-180deg)");
      } else {
        $(".dealer-cards").css("margin-left", "-=45px");
      }
    } else {
            dealerSlot.lastElementChild.firstElementChild.innerHTML += "\n      <div class=\"flip-card cardAnimationDealer\">\n        <div class=\"flip-card-inner\">\n          <div class=\"flip-card-front\">\n\n          </div>\n          <div class=\"flip-card-back\">\n\n          </div>\n        </div>\n      </div>\n      "; 
      $(".flip-card-front").html("<img class=\"dealerCardImg\" src=\"/imgs/Card_back.svg\">");
      $(".flip-card-back").html("<img class=\"dealerCardImg\" src=\"/imgs/" + dealer.hiddenCard[0].suit + dealer.hiddenCard[0].value.card + ".svg\">");
      dealersHiddenCard = dealer.hiddenCard[0].suit + dealer.hiddenCard[0].value.card; 
      setTimeout(function () {
        $(".flip-card").removeClass("cardAnimationDealer");
      }, 50);                                           
      $(".dealer-cards").css("margin-left", "-=45px"); 
      setTimeout(function () {
        $(".hiddenCard").removeClass("cardAnimationDealer");
      }, 50);           }
  } 

  if (response.method === "update") {
    players = response.players;
    dealer = response.dealer;
    deck = response.deck;
    gameOn = response.gameOn; 
    setTimeout(function () {
      if (players.every(function (player) {
        return player.hasLeft;
      })) {
        resetGame();
      }
    }, 50);
  } 

  if (response.method === "thePlay") {
    player = response.player;
    currentPlayer = response.currentPlayer;
    playersCanPlay = true; 
    $(".player-sum").removeClass("current-player-highlight");
    $(".players-timer circle").removeClass("circle-animation");

    var _loop2 = function _loop2(_i12) {
      if (playerSlotHTML[_i12] === player.clientId) {
        $(".player-sum:eq(" + _i12 + ")").addClass("current-player-highlight");
        setTimeout(function () {
          $(".players-timer:eq(" + _i12 + ") circle").addClass("circle-animation");
        }, 50);
      }
    };

    for (var _i12 = 0; _i12 < playerSlotHTML.length; _i12++) {
      _loop2(_i12);
    }

    if (dealersTurn) {
      return;
    } else {
      if (player.clientId === clientId && player.sum < 21 || player.clientId === clientId && theClient.sum.length > 1) {
        clicked = false;
        thePlay();
      } else if (player.clientId === clientId && player.sum >= 21) {
        sendPlayerNext();
      } else {
        clicked = true;
      }
    }

    for (var _i13 = 0; _i13 < players.length; _i13++) {
      if (players[currentPlayer] !== undefined && players[currentPlayer].hasLeft === true) {
        currentPlayer = currentPlayer + 1;
        player = players[currentPlayer];
      } else {
        break;
      }
    }
  }

  if (response.method === "sendPlayerNextWs") {}

  if (response.method === "showSum") {
    players = response.players; 
    for (var _i14 = 0; _i14 < playerSlotHTML.length; _i14++) {
      playerSlot[_i14].firstElementChild.nextElementSibling.nextElementSibling.style.opacity = "1";
      playerSlot[_i14].firstElementChild.nextElementSibling.nextElementSibling.style.transform = "scale(1)";
    } 

    dealerSlot.firstElementChild.nextElementSibling.style.opacity = "1";
    dealerSlot.firstElementChild.nextElementSibling.style.transform = "scale(1)";
  } 

  if (response.method === "joinTable") {
    game = response.game;
    spectators = response.spectators;
    players = response.players;
    theSlot = response.theSlot;
    user = response.user; 
    playerSlotHTML = response.playerSlotHTML; 
    for (var _i15 = 0; _i15 < playerSlotHTML.length; _i15++) {
      for (var _x3 = 0; _x3 < players.length; _x3++) {
        if (players[_x3].clientId === playerSlotHTML[_i15]) {
          z = playerSlotHTML.indexOf(playerSlotHTML[_i15]);
          if (players[_x3].nickname === "") players[_x3].nickname = "Игрок";
          playerSlot[z].firstElementChild.nextElementSibling.nextElementSibling.innerText = players[_x3].nickname;
          playerSlot[z].firstElementChild.nextElementSibling.nextElementSibling.innerHTML += "<span><img class=\"player-avatar\" src=\"/imgs/avatars/" + players[_x3].avatar + ".svg\" alt=\"avatar\"></span>";
        }
      }
    }
  }

  if (response.method === "dealersTurn") {
    dealersTurn = response.dealersTurn;
    playersCanPlay = false;

    if (dealersTurn === true) {
      $(".players-timer circle").removeClass("circle-animation");
      $(".player-sum").removeClass("current-player-highlight");
      $("#dealerSum").addClass("current-player-highlight");
    }
  } 

  if (response.method === "playersLength") {
    playersLength = response.playersLength;
  }

  if (response.method === "playerResultNatural") {
    players = response.players;
    playerNaturalIndex = response.playerNaturalIndex;
    $(".player-result:eq(" + playerNaturalIndex + ")").removeClass("hide-element");
    $(".player-result:eq(" + playerNaturalIndex + ")").addClass("result-blackjack");
    $(".player-result:eq(" + playerNaturalIndex + ")").text("BJ");
  }

  if (response.method === "finalCompare") {
    finalCompareGo();
  }

  if (response.method === "resetGameState") {
    game = response.game;
    resetGame();
  }

  if (response.method === "redirect") {
    window.location.href = "/";
  }

  if (response.method === "startTimer") {
    startTimer();
  } 

  if (response.method === "connect" || response.method === "create" || response.method === "joinClient" || response.method === "join" || response.method === "playersLength" || response.method === "playerResult" || response.method === "playerResultNatural" || response.method === "getRoute") {
    return;
  } else {
    updateAllPlayers();
    syncTheGame();
  }
}; 

function updateAllPlayers() {
    for (var i = 0; i < spectators.length; i++) {
    if (spectators[i].clientId === clientId) {
      spectators[i].bet = theClient.bet;
      theClient = spectators[i];
    }
  } 

  for (var _i16 = 0; _i16 < players.length; _i16++) {
    if (players[_i16].clientId === clientId) {
      players[_i16].bet = theClient.bet;
      theClient = players[_i16];
    }             
  } 

  for (var _i17 = 0; _i17 < playerSlotHTML.length; _i17++) {
    if (playerSlotHTML[_i17] === clientId) clientId = playerSlotHTML[_i17];

    for (var x = 0; x < players.length; x++) {
      if (players[x].clientId === playerSlotHTML[_i17]) {
        z = playerSlotHTML.indexOf(playerSlotHTML[_i17]);
        if (playerSlot[z].firstElementChild.nextElementSibling.classList.contains("empty-slot")) playerSlot[z].firstElementChild.nextElementSibling.remove();
        playerSlot[z].firstElementChild.nextElementSibling.classList.remove("hide-element");
        playerSlot[z].firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.classList.remove("hide-element");
        playerSlot[z].firstElementChild.nextElementSibling.nextElementSibling.innerHTML = players[x].sum;

        if (players[x].sum > 21) {
          $(".player-result:eq(" + z + ")").removeClass("hide-element");
          $(".player-result:eq(" + z + ")").addClass("result-lose");
          $(".player-result:eq(" + z + ")").text("BUST");
        }
      }
    }
  } 

  dealerSlot.firstElementChild.nextElementSibling.innerHTML = dealer.sum; 
  player = players[currentPlayer]; 
  if (theClient.blackjack === false) $("#balance").text(theClient.balance);
} 

function syncTheGame() {
  var syncGame = {
    method: "syncGame",
    gameId: gameId,
    player: player,
    players: players,
    spectators: spectators,
    playerSlotHTML: playerSlotHTML,
    dealer: dealer,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(syncGame));
} 

var _loop3 = function _loop3(s) {
  (function (index) {
    playerSlot[s].addEventListener("click", function () {
      if (joined === false && this.firstElementChild.nextElementSibling.classList.value === "empty-slot" && gameOn === false) {
        joined = true;
        theSlot = index;
        joinTable(); 
        $(this).children("div:nth-child(3)").addClass("highlight");
        $("#bets-container").removeClass("noclick");
        $("#leave-table").removeClass("noclick");
        $(".empty-slot").addClass("noclick");
      }
    });
  })(s);
};

for (var s = 0; s < playerSlot.length; s++) {
  _loop3(s);
}

function setPlayersBet() {
  var _loop4 = function _loop4(_s3) {
    for (var i = 0; i < players.length; i++) {
      if (players[i].isReady && players[i].clientId === playerSlotHTML[_s3]) {
                if (players[i].bet >= 10 && players[i].bet < 50) {
          chipIndex = "White";
        } else if (players[i].bet >= 50 && players[i].bet < 100) {
          chipIndex = "Red";
        } else if (players[i].bet >= 100 && players[i].bet < 500) {
          chipIndex = "Blue";
        } else if (players[i].bet >= 500 && players[i].bet < 1000) {
          chipIndex = "Green";
        } else if (players[i].bet >= 1000 && players[i].bet < 5000) {
          chipIndex = "Gray";
        } else if (players[i].bet >= 5000 && players[i].bet < 10000) {
          chipIndex = "Orange";
        } else if (players[i].bet >= 10000 && players[i].bet < 50000) {
          chipIndex = "Purple";
        } else if (players[i].bet >= 50000 && players[i].bet < 100000) {
          chipIndex = "Brown";
        } else if (players[i].bet >= 100000) {
          chipIndex = "Black";
        }

        $(".players:eq(" + _s3 + ") .player-bet").text(players[i].bet);
        $(".players:eq(" + _s3 + ") .player-coin").css("background", "url(/imgs/chips/Casino_Chip_" + chipIndex + ".svg)");

        if (players[i].bet > 999) {
          $(".players:eq(" + _s3 + ") .player-coin").html($(".players:eq(" + _s3 + ") .player-bet").text().slice(0, -3) + "K" + "<div class=\"player-bet hide-element\"></div>");
        } else {
          $(".players:eq(" + _s3 + ") .player-coin").html($(".players:eq(" + _s3 + ") .player-bet").text() + "<div class=\"player-bet hide-element\"></div>");
        }

        $(".players:eq(" + _s3 + ") .player-bet").text(players[i].bet);
        setTimeout(function () {
          $(".players:eq(" + _s3 + ") .player-coin").addClass("player-coin-animation");
        }, 50);
      }
    }
  };

  for (var _s3 = 0; _s3 < playerSlotHTML.length; _s3++) {
    _loop4(_s3);
  }
}

setTimeout(joinByUrl, 200);

function joinByUrl() {
    if (window.location.href.length - 1 > window.origin.length) {
        var str = window.location.href;
    roomId = str.substring(str.length - 6);
    gameId = "".concat(location.origin, "/") + roomId; 
    playerSlotIndex = [];
  }
} 

window.addEventListener("beforeunload", function () {
  reload = true;
  theClient.hasLeft = true;

  if (playersCanPlay === true && player.clientId === clientId && players.length > 1) {
    sendPlayerNext();
  }

  terminatePlayer(); });