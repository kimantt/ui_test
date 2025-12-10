import React, { createContext, useEffect, useState } from "react";
import SockJS from "sockjs-client"; // SockJS 클라이언트
import { Client } from "@stomp/stompjs"; // STOMP 클라이언트
import { useSelector } from "react-redux";

import { ChatroomGlobalSubscribe } from "./ChatroomGlobalSubscribe";

const API_BASE = "http://localhost:8080";

// Context 생성
export const StompContext = createContext(null);

// Provider 컴포넌트
export const StompProvider = ({ children }) => {
    // STOMP 클라이언트
    const [stompClient, setStompClient] = useState(null);
    // STOMP 연결 상태
    const [stompReady, setStompReady] = useState(false);

    const accessToken = useSelector((state) => state.auth.accessToken);

    // 로그인 시 STOMP 연결
    useEffect(() => {
        if (!accessToken) {
            // 토큰 없으면 연결 끊기 (로그아웃 포함)
            if (stompClient) {
                console.log("stomp 연결 해제");
                stompClient.deactivate();
                setStompClient(null);
                setStompReady(false);
            }
            return;
        }

        // 이미 연결된 경우 다시 연결할 필요 없음
        if (stompReady) return;

        const socket = new SockJS(`${API_BASE}/ws`); // SockJS 소켓 생성

        const client = new Client({
            webSocketFactory: () => socket, // SockJS 사용
            reconnectDelay: 5000, // 연결 끊김 시 5초 후 재연결
            onConnect: () => {
                console.log("STOMP 연결 성공");
                setStompReady(true); 
            },
            onStompError: (frame) => console.error("STOMP 오류:", frame),
        });

        client.activate(); // 클라이언트 활성화
        setStompClient(client); // 상태에 저장

        // 클린업 함수
        return () => {
            console.log("STOMP 클린업(deactivate)");
            client.deactivate();
            setStompReady(false);
        };
    }, [accessToken]);

    ChatroomGlobalSubscribe(stompClient, stompReady);

    return (
        <StompContext.Provider value={{ stompClient, stompReady }}>
            {children}
        </StompContext.Provider>
    );
};
