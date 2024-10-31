import { getSocket } from '..scripts/websocket.js';

// 페이지 로드 시 isHost 값 가져오기
let isHost = localStorage.getItem('isHost') === 'true';

// 웹 소켓 연결용 소켓
let socket 

window.onload = function() {
  // url 
  socket = new WebSocket('ws://your-websocket-server-url');

  // 확인용 콘솔
  socket.onopen = function() {
      console.log('웹 소켓 연결이 열렸습니다.');
  };

  socket.onmessage = function(event) {
      const response = JSON.parse(event.data);
      if (response.type === 'ROOM_CREATED') {
          // 동적으로 방 코드 
          console.log('방이 생성되었습니다. 방 코드:', response.roomCode);
          // 필요한 경우 방 코드 표시 등의 추가 작업을 수행
      }
  };

  socket.onerror = function(error) {
      console.error('웹 소켓 오류:', error);
  };

  socket.onclose = function() {
      console.log('웹 소켓 연결이 닫혔습니다.');
  };
};



function createRoom() {
  isHost = true;
  localStorage.setItem('isHost', isHost); // isHost 값을 로컬 저장소에 저장
  location.href = "../html/room-host.html"; // 방 만들기 후 페이지 이동
}

function joinRoom() {
  isHost = false; // 참가하기 클릭 시 isHost는 false
  localStorage.setItem('isHost', isHost); // isHost 값을 로컬 저장소에 저장
  location.href = '../html/room-guest.html'; // 참가하기 후 페이지 이동
}
