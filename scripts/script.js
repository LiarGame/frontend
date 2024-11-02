import { getSocket } from '../scripts/websocket.js';

window.onload = function () {
  input();
}

window. isHost = false; // 방장 여부
localStorage.getItem('isHost') === 'true' ? isHost = true : isHost = false; 
let roomCode = 12345; // 임시 방 코드

//const storedPlayerList = localStorage.getItem('playerList');
window.storedPlayerList = ['User1', 'User2', 'User3', 'User4', 'User5'];

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
  location.href = "../html/room-host.html"; // 방 만들기 후 페이지 이동
};

window.sendHost = function(name){
  if(isHost){
    console.log(name);
    // socket.send(JSON.stringify({ type: 'create', name: name }));
    location.href = "../html/invite.html";
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
  closeModal();
  // location.href = '../html/keyword.html';
  const contentDiv = document.querySelector('.content');
  contentDiv.innerHTML = '';

  //제시어 공개
  const pTag = document.createElement('p');
  pTag.classList.add("pTag");
  pTag.textContent = "주제는 \"동물\"이고 제시어는 \"하마\" 입니다";
  contentDiv.appendChild(pTag);
  console.log("게임이 시작됩니다.");

  const timeText = document.createElement('p');
  timeText.classList.add("timeText");
  contentDiv.appendChild(timeText);
  timeText.textContent = "10";
  startCountdown(timeText,10);

  //5초 후에 사라지고 제시어 설명 시작
  setTimeout(() => {
    contentDiv.removeChild(pTag);
  }, 5000);
}

function startCountdown(timeDiv, time) {
  let timeText = time;
  const countdown = setInterval(() => {
    timeText -= 1; // 1초씩 감소
    timeDiv.textContent = timeText; // timeText 요소에 새로운 값 업데이트

    // 시간이 0이 되면 타이머 중지
    if (timeText <= 0) {
      clearInterval(countdown); // setInterval 중지
    }
  }, 1000); // 1000 밀리초 = 1초
}

function setTimeout(parent, child) {
  parent.removeChild(child);
}

window.input = function () {
  const nameInput = document.getElementById('name-input');
  const text = document.querySelector('.text-wrapper-4');
  const enterButton = document.querySelector('.overlap-group-wrapper button');

  enterButton.disabled = true;

  nameInput.addEventListener('input', () => {
    if (nameInput.value.length > 0) {
      text.style.color = "black"; // 입력이 있으면 색상을 검정으로
      enterButton.disabled = false;
    } else {
      text.style.color = "gray"; // 입력이 없으면 회색으로 (기본 색상)
      text.style.cursor = "default";
      enterButton.disabled = true;
    }
  });
}



