// websocket.js
let socket;

function createSocket() {
    if (!socket) {
        // 웹 소켓 url
        socket = new WebSocket('ws://your-websocket-server-url');

        socket.onopen = function() {
            console.log('웹 소켓 연결이 열렸습니다.');
            // 소켓 상태를 localStorage에 저장
            localStorage.setItem('socketState', 'open');
        };

        socket.onerror = function(error) {
            console.error('웹 소켓 오류:', error);
            localStorage.setItem('socketState', 'error');
        };

        socket.onclose = function() {
            console.log('웹 소켓 연결이 닫혔습니다.');
            localStorage.setItem('socketState', 'closed');
            socket = null; // 소켓이 닫히면 null로 설정
        };
    }
    return socket;
}

function getSocket() {
    if (localStorage.getItem('socketState') === 'open') {
        return socket; // 이미 열린 소켓 반환
    } else {
        return createSocket(); // 새 소켓 생성
    }
}

export { getSocket };
