// 페이지 로드 시 isHost 값 가져오기
let isHost = localStorage.getItem('isHost') === 'true';

function createRoom() {
  isHost = true;
  localStorage.setItem('isHost', isHost); // isHost 값을 로컬 저장소에 저장
  location.href = "../html/room-host.html"; // 방 만들기 후 페이지 이동
}

function joinRoom() {
  isHost = false; // 참가하기 클릭 시 isHost는 false
  localStorage.setItem('isHost', isHost); // isHost 값을 로컬 저장소에 저장
  location.href = '../html/room-entry.html'; // 참가하기 후 페이지 이동
}
