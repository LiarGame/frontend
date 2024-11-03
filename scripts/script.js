import { getSocket } from '../scripts/websocket.js';


window. isHost = false; // 방장 여부
localStorage.getItem('isHost') === 'true' ? isHost = true : isHost = false; 
let roomCode = 12345; // 임시 방 코드

//const storedPlayerList = localStorage.getItem('playerList');
window.storedPlayerList = ['조성현', '황혜령', '전우진', '임재형'];

// 가져온 플레이어 리스트 출력
if (storedPlayerList) {
    console.log('저장된 플레이어 리스트:', storedPlayerList);
} else {
    console.log('저장된 플레이어 리스트가 없습니다.');
}

console.log('isHost 초기값:', isHost); // 출력용 로그

window.createRoom = function() { // 전역 함수로 설정
  isHost = true;
  localStorage.setItem('isHost', isHost); // isHost 값을 로컬 저장소에 저장
  // 영상 녹화용 시간지연
  setTimeout(() => {
    location.href = "../html/room-host.html"; // 방 만들기 후 페이지 이동
  }, 500); // 500ms = 0.5초
};

window.sendHost = function(name){
  if(isHost){
    console.log(name);
    // socket.send(JSON.stringify({ type: 'create', name: name }));
    // 영상 녹화용 시간지연
    setTimeout(() => {
      location.href = "../html/invite.html"; // 방 만들기 후 페이지 이동
    }, 500); // 500ms = 0.5초
  }
}

window.sendGuest = function(name, roomCode) {
  if (!isHost) {
    console.log(name, roomCode);
    // 요청을 JSON 형식으로 구성하여 전송
    const request = JSON.stringify({
      type: "JOIN", // 요청 타입
      playerName: name, // 플레이어 이름
      roomCode: roomCode // 방 코드
    });
    // socket.send(request); // 서버로 요청 전송
    location.href = "../html/invite.html";
  }
};


window.joinRoom = function() { // 전역 함수로 설정
  isHost = false; // 참가하기 클릭 시 isHost는 false
  localStorage.setItem('isHost', isHost); // isHost 값을 로컬 저장소에 저장
  location.href = '../html/room-guest.html'; // 참가하기 후 페이지 이동
};

window.cancelRoom = function() {
  if (isHost) {
    location.href = '../html/room-host.html'; // isHost가 true일 때
  } else {
    location.href = '../html/room-guest.html'; // isHost가 false일 때
  }
};

document.addEventListener("DOMContentLoaded", function() {
  // invite.html에서만 실행되도록 페이지 확인
  if (window.location.pathname.endsWith('invite.html')) {
      console.log("등장")
      window.renderPlayerList(); // 페이지 로드 시 플레이어 리스트 렌더링
  }
});

window.renderPlayerList = function() {
  // 연결되면 추가
  //const storedPlayerList = localStorage.getItem('playerList'); 
  const userListContainer = document.getElementById('userList');
  userListContainer.innerHTML = ''; // 기존 내용 초기화

  if (storedPlayerList) {
      // const players = JSON.parse(storedPlayerList);
      storedPlayerList.forEach(player => {
          const playerElement = document.createElement('button');
          playerElement.className = 'overlap-group111 btn-16'; // 여러 클래스 이름 추가
          playerElement.textContent = player;
          
          userListContainer.appendChild(playerElement);
      });
  } else {
      console.log('저장된 플레이어 리스트가 없습니다.');
  }
};

window.openModal = function() {
  if(!isHost){
    console.log("방장이 아니라 게임을 시작할 수 없습니다.")
    return;
  }
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

window.closeModal = function() {
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

// 초대창 -> 게임 시작 
window.startGame = function() {
  setTimeout(() => {
    
  }, 500); // 500ms = 0.5초
  closeModal();
  // location.href = '../html/keyword.html';
  const contentDiv = document.querySelector('.content');
  contentDiv.innerHTML = '';

  //제시어 공개
  const pTag = document.createElement('p');
  pTag.classList.add("pTag");
  pTag.innerHTML = "당신은 시민입니다<br>주제는 \"컴퓨터공학과\"이고 제시어는 \"네트워크프로그래밍\" 입니다.";


  contentDiv.appendChild(pTag);
  console.log("게임이 시작됩니다.");

  //3초 후에 위치 이동
  setTimeout(() => {
    pTag.style.transition = "transform 1s ease"; // 이동 시 부드러운 효과
    pTag.style.transform = "translate(-50%, -270%)";
  }, 3000);
  //5초 후에 제시어 설명 시작
  setTimeout(() => {
    explainKeyword();
  }, 5000);
}

//입력값 유무에 따라 버튼 활성화(수정해야댐)
window.checkInput = function () {
  const nameInput = document.getElementById('name-input');
  const roomInput = document.getElementById('room-input');
  const enterButtonHost = document.querySelector('.overlap-group-wrapper button');
  const textHost = document.querySelector('.overlap-group-wrapper .text-wrapper-4');
  const enterButton = document.querySelector('#enterButton');

  enterButtonHost.disabled = true;
  enterButton.disabled = true;
  enterButton.style.color = "gray";
  enterButton.style.cursor = "default";

  function checkInput() {
    if(nameInput.value.length > 0) {
      nameInput.style.color = "black";
      enterButtonHost.disabled = false;
      textHost.style.color = "black";
    }
    if (roomInput.value.length > 0) {
      roomInput.style.color = "black";
    }
    if(nameInput.value.length > 0 && roomInput.value.length > 0) {
      enterButton.style.color = "black";
      enterButton.style.cursor = "cursor";
      enterButton.disabled = false;
    } else {
      enterButton.style.color = "gray";
      enterButton.style.cursor = "default";
      enterButton.disabled = true;
    }
  }
  nameInput.addEventListener('input', checkInput);
  roomInput.addEventListener('input', checkInput);
}

window.checkChatInput = function () {
  const chatInput = document.getElementById('chatInput');

  function checkChatInput() {
    const chatSender = document.querySelector(".chat-input-area img");

    if(chatInput.value.length > 0) {
      chatSender.src = "../img/msg-send-black.png";
    } else {
      chatSender.src = "../img/msg-send.png";
    }
  }
  chatInput.addEventListener('input', checkChatInput);
}

window.explainKeyword = function () {
  const contentDiv = document.querySelector('.content');
  const chatDiv = document.querySelector('#chatDiv');
  contentDiv.appendChild(chatDiv);
    if (chatDiv) {
      chatDiv.style.display = "block";
    }
}

window.sendMessage = function (){
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  if (chatInput.value.trim() !== "") {
    // 새 메시지 추가
    const message = document.createElement("p");
    message.classList.add('myMsg');
    message.innerHTML = `${chatInput.value}`;
    // <span className="chat-sender">나</span>

    chatMessages.appendChild(message); // 메시지 영역에 추가

    chatInput.value = ""; // 입력 필드 초기화

    // 라이어 지목창으로 이동
    setTimeout(() => {
      if (chatDiv) {
        const findpTag = document.querySelector('.pTag');
        findpTag.innerHTML = '<b style="color: red;">라이어로 의심되는 사람을 지목해 주세요!</b>';
        chatDiv.style.display = "none"; 
      }
    }, 4000);

    // 버튼 클릭시 페이지 전환 추가
    const buttonElements = document.querySelectorAll('.overlap-group111.btn-16');
    buttonElements.forEach((buttonElement) => {
        buttonElement.addEventListener('click', () => {
            // 화면 전환: 원하는 URL로 변경하세요
            window.location.href = '../html/guess.html'; // 예: 'page2.html'
        });
    });

  }
}


// 최종 답 보내기
window.sendFinalAnswer = function() {
  const inputValue = document.querySelector('input[type="text"]').value; // 입력 필드의 값을 가져옴
  console.log(inputValue); // 콘솔에 출력
  location.href = "../html/liar-win.html"; // 방 만들기 후 페이지 이동
};
