import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { supabase } from "../utils/supabaseClient";

interface UseProjectSocketOptions {
  project: { id: string; owner_id: string } | null;
  user: any | null;
  hasActiveWindow: boolean;
  profileUsername: string;
  profileAvatarUrl: string;
  onRoomHistory?: (history: any[]) => void;
  onReceiveMessage?: (msg: any) => void;
  onFileUpdated?: (data: { filepath: string; content: string; senderUsername: string }) => void;
  onStudioCastUpdated?: (data: { isCasting: boolean }) => void;
  onReactionReceived?: (data: { emoji: string; username: string; id: string }) => void;
  onConsoleErrorShared?: (data: { errorText: string; filepath?: string; lineNumber?: number; senderUsername: string; timestamp: string }) => void;
  onBranchSubmitted?: (data: { username: string; branchName: string; timestamp: string }) => void;
}

export function useProjectSocket({
  project,
  user,
  hasActiveWindow,
  profileUsername,
  profileAvatarUrl,
  onRoomHistory,
  onReceiveMessage,
  onFileUpdated,
  onStudioCastUpdated,
  onReactionReceived,
  onConsoleErrorShared,
  onBranchSubmitted
}: UseProjectSocketOptions): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Store latest callbacks in refs to prevent unnecessary socket reconnects when handlers change
  const callbacksRef = useRef({
    onRoomHistory,
    onReceiveMessage,
    onFileUpdated,
    onStudioCastUpdated,
    onReactionReceived,
    onConsoleErrorShared,
    onBranchSubmitted
  });

  useEffect(() => {
    callbacksRef.current = {
      onRoomHistory,
      onReceiveMessage,
      onFileUpdated,
      onStudioCastUpdated,
      onReactionReceived,
      onConsoleErrorShared,
      onBranchSubmitted
    };
  });

  useEffect(() => {
    if (!project || !user) {
      setSocket(null);
      return;
    }

    let socketClient: Socket | null = null;

    const connectSocket = async () => {
      const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      socketClient = io(socketUrl, {
        auth: { token },
        withCredentials: true,
        transports: ["websocket", "polling"]
      });

      setSocket(socketClient);

      const userRole = project.owner_id === user.id 
        ? "owner" 
        : hasActiveWindow 
          ? "contributor" 
          : "guest";

      const joinRoom = () => {
        socketClient?.emit("join_project_room", {
          projectId: project.id,
          userId: user.id,
          username: profileUsername || user.email?.split("@")[0] || "Developer",
          avatarUrl: profileAvatarUrl || "",
          role: userRole
        });
      };

      socketClient.on("connect", () => {
        console.log("[SOCKET CLIENT] Connected to realtime server. Joining room:", project.id);
        joinRoom();
      });

      if (socketClient.connected) {
        joinRoom();
      }

      socketClient.on("room_history", (history: any[]) => {
        callbacksRef.current.onRoomHistory?.(history);
      });

      socketClient.on("receive_message", (msg: any) => {
        callbacksRef.current.onReceiveMessage?.(msg);
      });

      socketClient.on("file_updated", (data: { filepath: string; content: string; senderUsername: string }) => {
        callbacksRef.current.onFileUpdated?.(data);
      });

      socketClient.on("studio_cast_updated", (data: { isCasting: boolean }) => {
        callbacksRef.current.onStudioCastUpdated?.(data);
      });

      socketClient.on("reaction_received", (data: { emoji: string; username: string; id: string }) => {
        callbacksRef.current.onReactionReceived?.(data);
      });

      socketClient.on("console_error_shared", (data: { errorText: string; filepath?: string; lineNumber?: number; senderUsername: string; timestamp: string }) => {
        callbacksRef.current.onConsoleErrorShared?.(data);
      });

      socketClient.on("branch_submitted", (data: { username: string; branchName: string; timestamp: string }) => {
        callbacksRef.current.onBranchSubmitted?.(data);
      });
    };

    connectSocket();

    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
      setSocket(null);
    };
  }, [project?.id, project?.owner_id, user?.id, hasActiveWindow, profileUsername, profileAvatarUrl]);

  return socket;
}
