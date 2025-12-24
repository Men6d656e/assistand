import { StreamVideoClient } from "@stream-io/node-sdk";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export function useStreamClients({ apiKey, user, token }) {
  let isMounted = true;
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setchatClient] = useState(null);

  useEffect(() => {
    if (!user || !token || !apiKey) return;

    const initClients = async () => {
      try {
        const tokenProvider = () => Promise.resolve(token);
        const myVideoClient = new StreamVideoClient({
          apiKey,
          user,
          tokenProvider,
        });

        const myChatClient = StreamChat.getInstance(apiKey);
        await myChatClient.connectUser(user, token);

        if (isMounted) {
          setVideoClient(myVideoClient);
          setchatClient(myChatClient);
        }
      } catch (error) {
        console.error("Client initialization error:", error);
      }
    };

    initClients();

    return () => {
      isMounted = false;
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [apiKey, user, token]);

  return { videoClient, chatClient };
}
