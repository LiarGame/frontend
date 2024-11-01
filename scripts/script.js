import { getSocket } from '../scripts/websocket.js';
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

function setupMessageHandler() {
  if (socket) {
      socket.onmessage = function(event) {
          const message = JSON.parse(event.data);
          if (message.type === 'ROOM_CREATED') {
              roomCode = message.roomCode;
              localStorage.setItem('roomCode', roomCode);
              console.log('방 코드가 저장되었습니다:', roomCode);
          }
      };
  }
}


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

document.addEventListener("DOMContentLoaded", function() {
  // invite.html에서만 실행되도록 페이지 확인
  if (window.location.pathname.endsWith('invite.html')) {
      // localStorage에서 플레이어 리스트 가져오기
      // const storedPlayerList = localStorage.getItem('playerList');
      console.log(123)
      // userListContainer 요소 선택
      const userListContainer = document.getElementById('userList');

      // 플레이어 리스트가 존재할 경우 렌더링
      if (storedPlayerList) {
          try {
              // const players = JSON.parse(storedPlayerList); // JSON 파싱
              storedPlayerList.forEach(player => {
                  const playerElement = document.createElement('button');
                  playerElement.className = 'overlap-group111 btn-16'; // 여러 클래스 이름 추가
                  playerElement.textContent = player;
                  userListContainer.appendChild(playerElement);
              });
          } catch (error) {
              console.error("플레이어 리스트 파싱 실패:", error);
          }
      } else {
          console.log('저장된 플레이어 리스트가 없습니다.');
      }
  }
});


