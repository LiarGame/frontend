const worker = new SharedWorker("../html/worker.js");
worker.port.start();

window.isHost = false; // 방장 여부
sessionStorage.getItem("isHost") === "true" ? (isHost = true) : (isHost = false);
let roomCode = 12345; // 임시 방 코드
window.isFinal = false; // 최종 답 제출 여부

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  // 특정 페이지에서만 renderList 호출
  if (currentPath.includes("html/invite.html") && isHost) {
    renderPlayerList(JSON.parse(sessionStorage.getItem("playerList")));
  }

  if (currentPath.includes("html/invite.html") && !isHost) {
    renderPlayerList(JSON.parse(sessionStorage.getItem("playerList")));
  }

  


  if(isFinal == true){
    console.log("안녕하세요?")
    const citizenData = sessionStorage.getItem("citizen"); // 시민팀
    const liarName = sessionStorage.getItem("liarName"); // 라이어
    const keyword = sessionStorage.getItem("keyWord"); // 제시어

    const citizenList = JSON.parse(citizenData); // 저장된 시민 데이터가 JSON 배열이라고 가정
    const citizenContainer = document.getElementById("citizen-list");

    citizenList.forEach((name) => {
      const citizenDiv = document.createElement("div");
      citizenDiv.classList.add("player");
      citizenDiv.textContent = name;
      citizenContainer.appendChild(citizenDiv);
    });

    const liarContainer = document.getElementById("liar-name");
    const liarDiv = document.createElement("div");
    liarDiv.classList.add("player-liar");
    liarDiv.textContent = liarName;
    liarContainer.appendChild(liarDiv);

    const keywordElement = document.getElementById("keyword");
    keywordElement.textContent = `제시어: ${keyword}`;
  }
});
let lastMessage = null; //같은 SPEAK_RESPONSE가 중복 출력되지 않게 하기 위함
let lastSpeakingPlayer = null;
worker.port.onmessage = (event) => {
  const message = event.data;
  console.log(message);

  // Worker가 리로드되었을 때
  if (message === "Worker Reloaded") {
    const playerName = sessionStorage.getItem("myPlayer");
    const roomCode = sessionStorage.getItem("roomCode");

    if (playerName && roomCode) {
      console.log("재연결 요청");
      const request = JSON.stringify({
        type: "RECONNECT_REQUEST",
        playerName: playerName,
        roomCode: roomCode
      });

      worker.port.postMessage(request);
      return;
    }
  }

  switch (message.type) {
    case "CREATE_ROOM_RESPONSE":
      sessionStorage.setItem("myPlayer", message.playerName);
      sessionStorage.setItem("roomCode", message.roomCode);
      sessionStorage.setItem("playerList", JSON.stringify(message.playerList));
      break;

    case "JOIN_RESPONSE":
      if (window.location.pathname.includes("html/invite.html")) {
        renderPlayerList(message.playerList);
      } else{
        sessionStorage.setItem("playerList", JSON.stringify(message.playerList));
        console.log(message.playerList);
      }
      // if (window.location.pathname.includes("html/room-guest.html")) {
      //   const playerList = message.playerList; // 배열이어야 함
      //   console.log(message.playerList);
      //   const playerListString = JSON.stringify(playerList); // 배열을 JSON 문자열로 변환
      //   sessionStorage.setItem("playerList", playerListString); // 변환된 문자열 저장
      // }
      break;

    case "ROLE_ASSIGN_RESPONSE":
      sessionStorage.setItem("liar", message.liar);
      sessionStorage.setItem("topic", message.topic);
      sessionStorage.setItem("word", message.word);
      if (window.location.pathname.includes("html/invite.html")){
        if(isHost == false)
        {window.startGame();}
        else{
          releaseRoleAndKeyword();
        }
      }
      break;
    case "SPEAK_RESPONSE":
      // 발언 순서 관리
      sessionStorage.setItem("nextPlayer", message.nextPlayer);
      const nextPlayer = sessionStorage.getItem("nextPlayer");
      const voteBtns = document.querySelectorAll(".voteBtn");

      voteBtns.forEach((voteBtn) => {
        voteBtn.classList.remove("currentSpeakingPlayer");
        if(nextPlayer === voteBtn.textContent) {
          voteBtn.classList.add("currentSpeakingPlayer");
        }
      });
      if (lastMessage === message.message) {
        //아무것도 안함
      }
      else {
        if(message.startDiscussFlag === true) {
          setTimeout(() => {
            voteBtns.forEach((voteBtn) => {
              voteBtn.classList.remove("currentSpeakingPlayer");
            });
            Discuss();
          },10);
        }
        lastMessage = message.message;
        sessionStorage.setItem("speakingPlayer", message.speakingPlayer);
        sessionStorage.setItem("message", message.message);
        sessionStorage.setItem("nextPlayer", message.nextPlayer);
        receiveMessage();
      }
      break;

      // 게임 결과화면
    case "GAME_RESULT":
      console.log("게임 종료 요청이 왔어요");
      sessionStorage.setItem("citizen", JSON.stringify(message.winner));
      sessionStorage.setItem("keyWord", message.word);
      sessionStorage.setItem("liarName", message.liarName[0]);
      isFinal = true;

      const liarName = message.liarName[0];
      const isLiarWinner = message.winner.includes(liarName); // 라이어가 승자 목록에 포함되는지 확인

      if (isLiarWinner) {
        // 라이어가 이긴 경우
        location.href = "../html/liar-win.html";
      } else {
        // 시민이 이긴 경우
        location.href = "../html/citizen-win.html";
      }
      break;

    case "DISCUSS_MESSAGE_RESPONSE":
      if (lastMessage === message.message) {
        //아무것도 안함
      }
      else {
        lastMessage = message.message;
        sessionStorage.setItem("speakingPlayer", message.playerName);
        sessionStorage.setItem("message", message.message);
        receiveMessage();
      }
      break;

    case "VOTE_START_RESPONSE":
      voteLiar();
      break;

    case "VOTE_RESPONSE":
      console.log(message);
      break;

    case "VOTE_RESULT":
      if(message.liarCaught) {
        if(message.liarName === sessionStorage.getItem("myPlayer")) {
          location.href = "../html/guess.html";
        }
        else {
          const contentDiv = document.getElementById("contentInvite");
          contentDiv.replaceChildren();

          const voteDiv = document.createElement("div");
          voteDiv.id = "voteDiv";
          voteDiv.classList.add("voteDivStyle");
          voteDiv.innerHTML = "라이어가 제시어를 맞추는 중입니다..";

          contentDiv.appendChild(voteDiv);
        }
        //fall-through
        break;
      }
      else {
        //결과 화면 처리
        break;
      }

    case "ERROR":
      console.log(message.message);

    default:
      console.log("Unhandled message type:");
  }
};

window.sendHost = function (name) {
  if (isHost) {
    console.log(name);
    worker.port.postMessage(
        JSON.stringify({ type: "CREATE_ROOM_REQUEST", playerName: name })
    );
    // 영상 녹화용 시간지연
    setTimeout(() => {
      location.href = "../html/invite.html"; // 방 만들기 후 페이지 이동
    }, 500); // 500ms = 0.5초
  }
};

window.sendGuest = function (name, roomCode) {
  if (!isHost) {
    sessionStorage.setItem("myPlayer", name); // 플레이어 이름을 로컬 저장소에 저장
    sessionStorage.setItem("roomCode", roomCode); // 방 코드를 로컬 저장소에 저장
    const request = JSON.stringify({
      type: "JOIN_REQUEST", // 요청 타입
      playerName: name, // 플레이어 이름
      roomCode: roomCode, // 방 코드
    });
    worker.port.postMessage(request);
    setTimeout(() => {
      location.href = "../html/invite.html"; // 방 만들기 후 페이지 이동
    }, 500); // 500ms = 0.5초
  }
};

window.cancelRoom = function () {
  if (isHost) {
    location.href = "../html/room-host.html"; // isHost가 true일 때
  } else {
    location.href = "../html/room-guest.html"; // isHost가 false일 때
  }
};

window.renderPlayerList = function (playerList) {
  const userListContainer = document.getElementById("userList");
  if (userListContainer) {
    userListContainer.innerHTML = ""; // 기존 내용 초기화
  }

  const roomCodeElement = document.getElementById("roomCode");
  const roomCode = sessionStorage.getItem("roomCode");
  if (roomCodeElement) {
    roomCodeElement.innerHTML = roomCode;
  }
  if (playerList) {
    playerList.forEach((player) => {
      const playerElement = document.createElement("button");
      playerElement.className = "overlap-group111 voteBtn not-selected"; // 여러 클래스 이름 추가
      playerElement.textContent = player;

      userListContainer.appendChild(playerElement);
    });
  } else {
    console.log("저장된 플레이어 리스트가 없습니다.");
  }
};

window.openModal = function () {
  if(!isHost) return;
  document.getElementById("modalOverlay").style.display = "flex";

  // bottom-btn과 bottom-btn2 클래스를 가진 요소를 숨기기
  const btn1Element = document.querySelector(".bottom-btn");
  const btn2Element = document.querySelector(".bottom-btn2");

  // bottom-btn 요소 숨기기
  if (btn1Element) {
    btn1Element.style.display = "none";
  }

  // bottom-btn2 요소 숨기기
  if (btn2Element) {
    btn2Element.style.display = "none";
  }
};

window.closeModal = function () {
  document.getElementById("modalOverlay").style.display = "none";

  // bottom-btn과 bottom-btn2 요소 다시 보이기
  const btn1Element = document.querySelector(".bottom-btn");
  const btn2Element = document.querySelector(".bottom-btn2");

  // bottom-btn 요소 보이기
  if (btn1Element) {
    btn1Element.style.display = ""; // display를 초기화하여 보이게 함
  }

  // bottom-btn2 요소 보이기
  if (btn2Element) {
    btn2Element.style.display = ""; // display를 초기화하여 보이게 함
  }
};

window.sendStartGameRequest = function () {
  const myPlayer = sessionStorage.getItem("myPlayer");
  console.log("player name from sendStartGameRequest: " + myPlayer);
  const roomCode = sessionStorage.getItem("roomCode");

  const request = JSON.stringify({
    type: "START_GAME_REQUEST", // 요청 타입
    playerName: myPlayer, // 플레이어 이름
    roomCode: roomCode, // 방 코드
  });
  worker.port.postMessage(request);
};

window.releaseRoleAndKeyword = function () {
  const contentDiv = document.querySelector(".content");
  contentDiv.innerHTML = "";

  const pTag = document.createElement("p");
  pTag.classList.add("pTag");
  setTimeout(() => {
    const myPlayer = sessionStorage.getItem("myPlayer");
    console.log("my name: " + myPlayer);
    const role_liar = sessionStorage.getItem("liar")
    console.log("who is liar: " + role_liar);
    const topic = sessionStorage.getItem("topic");
    console.log(topic);
    const keyword = sessionStorage.getItem("word");
    console.log(keyword);

    let topic_kor
    switch (topic) {
      case "BUILDING":
        topic_kor = "건국대학교 건물";
        break;
      case "LANDMARK":
        topic_kor = "건국대학교 명소";
        break;
      case "ANIMAL":
        topic_kor = "건국대학교 동물";
        break;
      default:
        console.log("ROLE_ASSIGN_RESPONSE error");
    }

    if(role_liar === myPlayer) {
      pTag.innerHTML =
          '당신은 라이어입니다<br>';
    } else {
      pTag.innerHTML =
          '당신은 시민입니다<br>' +
          '주제는 ' + topic_kor + '이고, ' +
          '제시어는 ' + keyword + '입니다.';
    }
    contentDiv.appendChild(pTag);
  }, 300);

  //3초 후에 위치 이동
  setTimeout(() => {
    pTag.style.transition = "transform 1s ease"; // 이동 시 부드러운 효과
    pTag.style.transform = "translate(-50%, -270%)";
  }, 3000);
  //5초 후에 제시어 설명 시작
  setTimeout(() => {
    showChatDisplay();
  }, 6000);
};

// 초대창 -> 게임 시작
window.startGame = function () {
  if(sessionStorage.getItem("playerList"))
    setTimeout(() => {}, 500); // 500ms = 0.5초
  if(isHost){
    console.log("게임 시작 요청을 보내요")
    sendStartGameRequest();
  }
  closeModal();

  //제시어 공개
  if(!isHost){
    releaseRoleAndKeyword();
  }



  console.log("게임이 시작됩니다.");
};

window.showChatDisplay = function () {
  const contentDiv = document.querySelector(".content");
  const chatDiv = document.querySelector("#chatDiv");
  contentDiv.appendChild(chatDiv);
  if (chatDiv) {
    chatDiv.style.display = "block";
  }

  // 발언 순서 관리
  const HostVoteBtn = document.querySelector(".voteBtn");
  HostVoteBtn.classList.add("currentSpeakingPlayer");
};

window.speakKeyword = function () {
  const myPlayer = sessionStorage.getItem("myPlayer");
  sendMessage(myPlayer);
}

window.Discuss = function () {
  const myPlayer = sessionStorage.getItem("myPlayer");
  const roomCode = sessionStorage.getItem("roomCode");
  //전체 토론 시작
  const chatSender = document.getElementById("chatSender");
  chatSender.onclick = sendDiscussMessage;

  const contentDiv = document.getElementById("contentInvite");
  const secondPTag = document.createElement("p");
  secondPTag.classList.add("secondPTagStyle");
  contentDiv.appendChild(secondPTag);

  // 테스트용 축소
  let second = 5;
  const countdown = setInterval(() => {
    secondPTag.textContent = second; // 남은 시간 표시
    second--; // 1초 감소

    if (second < 0) {
      //투표 시작 요청
      const request = JSON.stringify({
        type: "VOTE_START_REQUEST", // 요청 타입
        playerName: myPlayer, // 플레이어 이름,
        roomCode: roomCode, // 방 코드
      });
      console.log(request);
      worker.port.postMessage(request);

      clearInterval(countdown); // 타이머 종료
    }
  }, 1000);
}

window.sendMessage = function (currentPlayer) {
  const chatInput = document.getElementById("chatInput");

  const roomCode = sessionStorage.getItem("roomCode");
  const message = chatInput.value;

  if (chatInput.value.trim() !== "") {
    //메시지 보내기 요청
    const request = JSON.stringify({
      type: "SPEAK_REQUEST", // 요청 타입
      playerName: currentPlayer, // 플레이어 이름
      message: message,
      roomCode: roomCode, // 방 코드
    });
    console.log(request);
    worker.port.postMessage(request);
    chatInput.value = '';
  } else {
    console.log("메시지를 입력하세요");
  }
};

window.receiveMessage = function () {
  const myPlayer = sessionStorage.getItem("myPlayer");
  const speakingPlayer = sessionStorage.getItem("speakingPlayer");
  const receivedMessage = sessionStorage.getItem("message");

  const chatMessages = document.getElementById("chatMessages");
  if (myPlayer === speakingPlayer) {
    const myDiv = document.createElement("div");
    myDiv.classList.add("myMsgDiv");
    const myMsgPTag = document.createElement("p");
    const myNamePTag = document.createElement("p");
    myDiv.appendChild(myNamePTag);
    myDiv.appendChild(myMsgPTag);
    myMsgPTag.classList.add("myMsg");
    myMsgPTag.innerHTML = `${receivedMessage}`;
    myNamePTag.classList.add("myName");
    myNamePTag.innerHTML = `${speakingPlayer}`;
    chatMessages.appendChild(myDiv);
  } else {
    const otherDiv = document.createElement("div");
    otherDiv.classList.add("otherMsgDiv");
    const otherMsgPTag = document.createElement("p");
    const otherNamePTag = document.createElement("p");
    otherDiv.appendChild(otherNamePTag);
    otherDiv.appendChild(otherMsgPTag);
    otherMsgPTag.classList.add("otherMsg");
    otherMsgPTag.innerHTML = `${receivedMessage}`;
    otherNamePTag.classList.add("otherName");
    otherNamePTag.innerHTML = `${speakingPlayer}`;
    chatMessages.appendChild(otherDiv);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.sendDiscussMessage = function () {
  const chatInput = document.getElementById("chatInput");

  const myPlayer = sessionStorage.getItem("myPlayer");
  const roomCode = sessionStorage.getItem("roomCode");
  const message = chatInput.value;

  if (chatInput.value.trim() !== "") {
    //메시지 보내기 요청
    const request = JSON.stringify({
      type: "DISCUSS_MESSAGE_REQUEST", // 요청 타입
      playerName: myPlayer, // 플레이어 이름
      message: message,
      roomCode: roomCode, // 방 코드
    });
    console.log(request);
    worker.port.postMessage(request);
    chatInput.value = '';
  } else {
    console.log("메시지를 입력하세요");
  }
}

window.voteLiar = function () {
  const myPlayer = sessionStorage.getItem("myPlayer");
  const roomCode = sessionStorage.getItem("roomCode");
  const contentDiv = document.getElementById("contentInvite");
  contentDiv.replaceChildren();

  const voteDiv = document.createElement("div");
  voteDiv.id = "voteDiv";
  voteDiv.classList.add("voteDivStyle");
  voteDiv.innerHTML = "라이어를 투표해주세요!";

  const secondPTag = document.createElement("p");
  secondPTag.classList.add("secondPTagStyle");

  contentDiv.appendChild(voteDiv);
  contentDiv.appendChild(secondPTag);

  let second = 15;
  const countdown = setInterval(() => {
    secondPTag.textContent = second; // 남은 시간 표시
    second--; // 1초 감소

    if (second < 0) {
      clearInterval(countdown); // 타이머 종료
      //라이어로 지목된 사람은 제시어 맞추기
      // location.href = "../html/guess.html";
    }
  }, 1000);

  const voteBtns = document.querySelectorAll(".voteBtn");
  voteBtns.forEach((voteBtn) => {
    voteBtn.onclick =  function () {
      voteBtns.forEach((voteBtn) => {
        voteBtn.classList.remove("selected");
      });
      voteBtn.classList.remove("not-selected");
      voteBtn.classList.add("selected");
      const votedPlayer = voteBtn.textContent;
      sendVote(myPlayer, votedPlayer, roomCode);
    };
  });
}

window.sendVote = function (myPlayer, votedPlayer, roomCode) {
  console.log(votedPlayer + "을(를) 라이어로 지목했습니다.");
  //투표 요청
  const request = JSON.stringify({
    type: "VOTE_REQUEST", // 요청 타입
    voter: myPlayer, // 플레이어 이름
    suspect: votedPlayer,
    roomCode: roomCode, // 방 코드
  });
  console.log(request);
  worker.port.postMessage(request);
};

// 최종 답 보내기
window.sendFinalAnswer = function () {
  const myPlayer = sessionStorage.getItem("myPlayer");
  const guessKeywordInput = document.getElementById("guessKeywordInput").value;
  const roomCode = sessionStorage.getItem("roomCode");
  const request = JSON.stringify({
    type: "GUESS_WORD_REQUEST",
    playerName: myPlayer,
    roomCode: roomCode,
    guessWord: guessKeywordInput
  });
  console.log(request);
  worker.port.postMessage(request);
};
