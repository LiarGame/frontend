let socket = null; // WebSocket 인스턴스
let connections = []; // 연결된 포트(페이지) 리스트
let playerList = []; // 플레이어 리스트
// SharedWorker에서 연결 관리
onconnect = (e) => {
    const port = e.ports[0];
    console.log("New connection established with a page.");
    connections.push(port);

    // WebSocket 연결
    if (!socket) {
        socket = new WebSocket('ws://localhost:8080'); // WebSocket 서버 주소
        socket.onopen = () => {
            
            // WebSocket이 연결되면 SharedWorker에 연결 상태를 전달
            connections.forEach(conn => conn.postMessage("Worker Reloaded"));
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            const playerName = sessionStorage.getItem("playerName");
            const roomCode = sessionStorage.getItem("roomCode");
            // 일정 시간 후 재연결
            setTimeout(() => {
                socket = new WebSocket(`ws://localhost:8080?playerName=${playerName}&roomCode=${roomCode}`);
            }, 2000); // 2초 후 재연결 시도
        };

        // WebSocket 메시지 수신 핸들러 설정
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            // WebSocket으로부터 받은 메시지를 모든 연결된 포트로 전송
            connections.forEach((conn) => {
                conn.postMessage(message);
            });
        };
    }

    port.onmessage = (event) => {
        const { type, playerName } = JSON.parse(event.data);

        // CREATE_ROOM_REQUEST 처리
        if (type === "CREATE_ROOM_REQUEST") {
            console.log("Processing CREATE_ROOM_REQUEST:", playerName);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "CREATE_ROOM_REQUEST",
                    playerName: playerName,
                });
                socket.send(request);
                console.log("CREATE_ROOM_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        // JOIN_REQUEST 처리
        if (type === "JOIN_REQUEST") {
            const { roomCode } = JSON.parse(event.data);
            console.log("Processing JOIN_REQUEST:", playerName, roomCode);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "JOIN_REQUEST",
                    playerName: playerName,
                    roomCode: roomCode,
                });
                socket.send(request);
                console.log("JOIN_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        // 재연결 요청
        if (type === "RECONNECT_REQUEST") {
            const {playerName, roomCode} = JSON.parse(event.data);
            if(sokcet){
                const request = JSON.stringify({
                    type: "RECONNECT_REQUEST",
                    playerName: playerName,
                    roomCode: roomCode,
                });
                socket.send(request);
            }
        }

        if (type === "START_GAME_REQUEST") {
            const { playerName, roomCode } = JSON.parse(event.data);
            console.log("Processing START_GAME_REQUEST:", playerName, roomCode);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "START_GAME_REQUEST",
                    playerName: playerName,
                    roomCode: roomCode,
                });
                socket.send(request);
                console.log("START_GAME_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        if (type === "SPEAK_REQUEST") {
            const { playerName, message, roomCode } = JSON.parse(event.data);
            console.log("Processing SPEAK_REQUEST:", playerName, message, roomCode);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "SPEAK_REQUEST",
                    playerName: playerName,
                    message: message,
                    roomCode: roomCode,
                });
                socket.send(request);
                console.log("SPEAK_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        if (type === "DISCUSS_MESSAGE_REQUEST") {
            const { playerName, message, roomCode } = JSON.parse(event.data);
            console.log("Processing DISCUSS_MESSAGE_REQUEST:", playerName, message, roomCode);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "DISCUSS_MESSAGE_REQUEST",
                    playerName: playerName,
                    message: message,
                    roomCode: roomCode,
                });
                socket.send(request);
                console.log("DISCUSS_MESSAGE_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        if (type === "VOTE_START_REQUEST") {
            const { playerName, roomCode } = JSON.parse(event.data);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "VOTE_START_REQUEST",
                    playerName: playerName,
                    roomCode: roomCode,
                });
                socket.send(request);
                console.log("VOTE_START_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        if (type === "VOTE_REQUEST") {
            const { voter, suspect, roomCode } = JSON.parse(event.data);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "VOTE_REQUEST",
                    voter: voter,
                    suspect: suspect,
                    roomCode: roomCode,
                });
                socket.send(request);
                console.log("VOTE_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

        if (type === "GUESS_WORD_REQUEST") {
            const { playerName, message, roomCode, guessWord } = JSON.parse(event.data);

            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "GUESS_WORD_REQUEST",
                    playerName: playerName,
                    message: message,
                    roomCode: roomCode,
                    guessWord: guessWord,
                });
                socket.send(request);
                console.log("GUESS_WORD_REQUEST sent to WebSocket server:", request);
            } else {
                console.error("WebSocket is not connected.");
                port.postMessage({ error: "WebSocket not connected" });
            }
        }

    };

    port.onclose = () => {
        connections = connections.filter((conn) => conn !== port);
    };
};