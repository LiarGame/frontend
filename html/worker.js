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
            console.log('WebSocket connected');
            // WebSocket이 연결되면 SharedWorker에 연결 상태를 전달
            connections.forEach(conn => conn.postMessage("Worker connected"));
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
            socket = null;
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

        if (type === "START_GAME_REQUEST") {
            const { playerName, roomCode } = JSON.parse(event.data);
            if (socket && socket.readyState === WebSocket.OPEN) {
                const request = JSON.stringify({
                    type: "START_GAME_REQUEST",
                    playerName: playerName,
                    roomCode : roomCode
                });
                socket.send(request);
                console.log("CREATE_ROOM_REQUEST sent to WebSocket server:", request);
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
