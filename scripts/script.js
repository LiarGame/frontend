const worker = new SharedWorker("worker.js");
worker.port.start();

window.isHost = false; // 방장 여부
sessionStorage.getItem("isHost") === "true" ? (isHost = true) : (isHost = false);
let roomCode = 12345; // 임시 방 코드

document.addEventListener("DOMContentLoaded", () => {
  // 페이지 경로 확인
  const currentPath = window.location.pathname;

  // 특정 페이지에서만 renderList 호출
  if (currentPath.includes("html/invite.html")) {
    let player = [];
    player = JSON.parse(sessionStorage.getItem("playerList"));
    renderPlayerList(player);
  }
});
let lastMessage = null; //같은 SPEAK_RESPONSE가 중복 출력되지 않게 하기 위함
worker.port.onmessage = (event) => {
  // event.data를 JSON으로 파싱
  const message = event.data;
  if(message === "Worker connected"){
    console.log("Storage 초기화")
    sessionStorage.clear();
  }
  
  

  switch (message.type) {
    case "CREATE_ROOM_RESPONSE":
      sessionStorage.setItem("myPlayer", message.playerName);
      sessionStorage.setItem("roomCode", message.roomCode);
      
      break;

    case "JOIN_RESPONSE":
      if (window.location.pathname.includes("html/invite.html")) {
        const playerList = message.playerList;
        console.log(message.playerList);
        renderPlayerList(playerList);
        console.log("Updated player list:", playerList.join(", "));
      }
      if (window.location.pathname.includes("html/room-guest.html")) {
        const playerList = message.playerList; // 배열이어야 함
        console.log(message.playerList);
        const playerListString = JSON.stringify(playerList); // 배열을 JSON 문자열로 변환
        sessionStorage.setItem("playerList", playerListString); // 변환된 문자열 저장
      }
      break;

    case "ROLE_ASSIGN_RESPONSE":
      sessionStorage.setItem("liar", message.liar);
      sessionStorage.setItem("topic", message.topic);
      sessionStorage.setItem("word", message.word);
      if (window.location.pathname.includes("html/invite.html")){
        window.startGame();
      }
      break;

    case "SPEAK_RESPONSE":
      if (lastMessage === message.message) {
        //아무것도 안함
      }
      else {
        lastMessage = message.message;
        sessionStorage.setItem("speakingPlayerName", message.playerName);
        sessionStorage.setItem("message", message.message);
        sessionStorage.setItem("nextPlayer", message.nextPlayer);
        receiveMessage();
      }
      break;
    
    // 게임 결과화면
    case "GAME_RESULT":
      sessionStorage.setItem("citizen", message.citizen);
      sessionStoragesetItem("liarName", message.liarName);
      if(message.winner == "Citizen"){
        if(window.location.pathname.includes("html/invite.html")){
          location.href = "html/citizen-win.html";
        } else{
          location.href = "html/liar-win.html";
        }
      }
    case "ERROR":
      console.log(message.message);

    default:
      console.log("Unhandled message type:");
  }
};

window.sendHost = function (name) {
  if (isHost) {
    sessionStorage.setItem("playerName", name);
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
    sessionStorage.setItem("playerName", name); // 플레이어 이름을 로컬 저장소에 저장
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
    if(!Array.isArray(playerList)) {
      const playerElement = document.createElement("button");
      playerElement.className = "overlap-group111 voteBtn not-selected"; // 여러 클래스 이름 추가
      playerElement.textContent = playerList;

      userListContainer.appendChild(playerElement);
    }
    else {
      playerList.forEach((player) => {
        const playerElement = document.createElement("button");
        playerElement.className = "overlap-group111 voteBtn not-selected"; // 여러 클래스 이름 추가
        playerElement.textContent = player;

        userListContainer.appendChild(playerElement);
      });
    }
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
  const playername = sessionStorage.getItem("playerName");
  console.log("player name from sendStartGameRequest: " + playername);
  const roomcode = sessionStorage.getItem("roomCode");

  const request = JSON.stringify({
    type: "START_GAME_REQUEST", // 요청 타입
    playerName: playername, // 플레이어 이름
    roomCode: roomcode, // 방 코드
  });
  worker.port.postMessage(request);
};

window.releaseRoleAndKeyword = function () {
  let player = sessionStorage.getItem("playerName")
  let roomNumber = sessionStorage.getItem("roomCode")
  // const request = JSON.stringify({
  //   type: "START_GAME_REQUEST", // 요청 타입
  //   playerName: player, // 플레이어 이름
  //   roomCode: roomNumber, // 방 코드
  // });
  // console.log(request);
  // worker.port.postMessage(request);
  
  const contentDiv = document.querySelector(".content");
  contentDiv.innerHTML = "";

  const pTag = document.createElement("p");
  pTag.classList.add("pTag");

  const playername = sessionStorage.getItem("playerName");
  console.log("player name: " + playername);
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

  if(role_liar === playername) {
    pTag.innerHTML =
        '당신은 라이어입니다<br>';
  } else {
    pTag.innerHTML =
        '당신은 시민입니다<br>' +
        '주제는 ' + topic_kor + '이고, ' +
        '제시어는 ' + keyword + '입니다.';
  }
  contentDiv.appendChild(pTag);

  //3초 후에 위치 이동
  setTimeout(() => {
    pTag.style.transition = "transform 1s ease"; // 이동 시 부드러운 효과
    pTag.style.transform = "translate(-50%, -270%)";
  }, 3000);
  //5초 후에 제시어 설명 시작
  setTimeout(() => {
    showChatDisplay();
  }, 8000);
};

// 초대창 -> 게임 시작
window.startGame = function () {
  if(sessionStorage.getItem("playerList"))
  setTimeout(() => {}, 500); // 500ms = 0.5초
  if(isHost){
    sendStartGameRequest();
  }
  closeModal();
  //제시어 공개
  releaseRoleAndKeyword();

  console.log("게임이 시작됩니다.");
};

window.checkChatInput = function () {
  const chatInput = document.getElementById("chatInput");

  function checkChatInput() {
    const chatSender = document.querySelector(".chat-input-area img");

    if (chatInput.value.length > 0) {
      chatSender.src = "../img/msg-send-black.png";
    } else {
      chatSender.src = "../img/msg-send.png";
    }
  }
  chatInput.addEventListener("input", checkChatInput);
};

window.showChatDisplay = function () {
  const contentDiv = document.querySelector(".content");
  const chatDiv = document.querySelector("#chatDiv");
  contentDiv.appendChild(chatDiv);
  if (chatDiv) {
    chatDiv.style.display = "block";
  }
};

window.speakOrderManage = function () {
  const playerList = sessionStorage.getItem("playerList");
  console.log(playerList);
  const player = sessionStorage.getItem("playerName");
  const nextPlayer = sessionStorage.getItem("nextPlayer");


}

window.sendMessage = function () {
  const chatInput = document.getElementById("chatInput");

  const player = sessionStorage.getItem("playerName");
  const roomCode = sessionStorage.getItem("roomCode");
  const message = chatInput.value;

  if (chatInput.value.trim() !== "") {
    //메시지 보내기 요청
    const request = JSON.stringify({
      type: "SPEAK_REQUEST", // 요청 타입
      playerName: player, // 플레이어 이름
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
  const player = sessionStorage.getItem("playerName");
  const receivedMessage = sessionStorage.getItem("message");

  const chatMessages = document.getElementById("chatMessages");
  if (myPlayer === player) {
    const myPTag = document.createElement("p");
    myPTag.classList.add("myMsg");
    myPTag.innerHTML = `${player} : ${receivedMessage}`;
    chatMessages.appendChild(myPTag);
  }
  else {
    const otherPTag = document.createElement("p");
    otherPTag.classList.add("otherMsg");
    otherPTag.innerHTML = `${player} : ${receivedMessage}`;
    chatMessages.appendChild(otherPTag);
  }
}

    // // 새 메시지 추가
    // const message = document.createElement("p");
    // message.classList.add("myMsg");
    // message.innerHTML = `${chatInput.value}`;
    // // <span className="chat-sender">나</span>
    //
    //
    // chatMessages.appendChild(message); // 메시지 영역에 추가
    //
    // chatInput.value = ""; // 입력 필드 초기화
    //
    // // 라이어 지목창으로 이동
    // setTimeout(() => {
    //   if (chatDiv) {
    //     const findpTag = document.querySelector(".pTag");
    //     findpTag.innerHTML =
    //       '<b style="color: red;">라이어로 의심되는 사람을 지목해 주세요!</b>';
    //     chatDiv.style.display = "none";
    //   }
    // }, 4000);
    //
    // // 버튼 클릭시 페이지 전환 추가
    // const buttonElements = document.querySelectorAll(
    //   ".overlap-group111.btn-16"
    // );
    // buttonElements.forEach((buttonElement) => {
    //   buttonElement.addEventListener("click", () => {
    //     // 화면 전환: 원하는 URL로 변경하세요
    //     window.location.href = "../html/guess.html"; // 예: 'page2.html'
    //   });
    // });

window.DiscussKeyword = function () {
  //발언 순서 관리
  speakOrderManage();
  sendMessage();

  setTimeout(() => {
    voteLiar();
  },2000);
}

window.voteLiar = function () {
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

  // let second = 15;
  // const countdown = setInterval(() => {
  //   secondPTag.textContent = second; // 남은 시간 표시
  //   second--; // 1초 감소
  //
  //   if (second < 0) {
  //     clearInterval(countdown); // 타이머 종료
  //     //라이어로 지목된 사람은 제시어 맞추기
  //     location.href = "../html/guess.html";
  //   }
  // }, 1000);

  const voteBtns = document.querySelectorAll(".voteBtn");
  voteBtns.forEach((voteBtn) => {
    voteBtn.addEventListener("click", () => {
      voteBtns.forEach((voteBtn) => {
        voteBtn.classList.remove("selected");
      });
      voteBtn.classList.remove("not-selected");
      voteBtn.classList.add("selected");
      const votedPlayer = voteBtn.textContent;
      sendVote(votedPlayer);
    });
  });
}

window.sendVote = function (votedPlayer) {
  console.log(votedPlayer + "을(를) 라이어로 지목했습니다.");
  //투표 요청
};


// 최종 답 보내기
window.sendFinalAnswer = function () {
  const inputValue = document.querySelector('input[type="text"]').value; // 입력 필드의 값을 가져옴
  console.log(inputValue); // 콘솔에 출력
  location.href = "../html/liar-win.html"; // 방 만들기 후 페이지 이동
};
