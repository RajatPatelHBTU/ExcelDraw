"use client"


import { useState, useEffect} from "react"
import { useRouter } from "next/navigation";
import { WS_URL } from "@/config";
import {Canvas} from "./Canvas";
import Cookies from "js-cookie";
export function RoomCanvas({roomId} : {roomId: string}){
    const token = Cookies.get("token");
    const router = useRouter();
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() =>{
        // Without a token the WS handshake is rejected and we'd hang on
        // "Connecting…" forever — send the user to sign in instead.
        if (!token) {
            router.push('/auth');
            return;
        }
        const ws = new WebSocket(`${WS_URL}?token=${token}`)
        ws.onopen = () =>{
            setSocket(ws);
            ws.send(JSON.stringify({
                type : "join_room",
                roomId
            }))
        }
        return () => {
            ws.close();
        };
    },[roomId, token, router]);

    
    if(!socket){
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[hsl(var(--canvas-bg))] text-muted-foreground">
                <div className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Connecting to server…
                </div>
            </div>
        )
    }
    return <Canvas roomId={roomId} socket={socket} />
}