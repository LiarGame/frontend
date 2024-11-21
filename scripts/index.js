window. isHost = false; // 방장 여부

const worker = new SharedWorker('worker.js');
worker.port.start();

window.createRoom = function () {
  // 전역 함수로 설정
  isHost = true;
  localStorage.setItem("isHost", isHost); // isHost 값을 로컬 저장소에 저장
  // 영상 녹화용 시간지연
  setTimeout(() => {
    location.href = "../html/room-host.html"; // 방 만들기 후 페이지 이동
  }, 500); // 500ms = 0.5초
};


window.joinRoom = function () {
  // 전역 함수로 설정
  isHost = false; // 참가하기 클릭 시 isHost는 false
  localStorage.setItem("isHost", isHost); // isHost 값을 로컬 저장소에 저장
  location.href = "../html/room-guest.html"; // 참가하기 후 페이지 이동
};
