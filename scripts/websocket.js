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

        // 이벤트 핸들러 등록
        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'ROOM_CREATED') {
                const roomCode = message.roomCode;
                localStorage.setItem('roomCode', roomCode);
                console.log('방 코드가 저장되었습니다:', roomCode);
            } else if (message.type === 'JOIN') {
                // JOIN 요청에 대한 응답 처리
                const playerList = message.playerList.join(", "); // 플레이어 리스트 문자열로 변환
                localStorage.setItem('playerList', playerList); // 플레이어 리스트 저장
                const roomCode = message.roomCode;

                console.log(`방 코드: ${roomCode}, 플레이어 리스트: ${playerList}`);
                // 추가적인 UI 업데이트 또는 로직을 여기에 추가할 수 있습니다.
            }
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
