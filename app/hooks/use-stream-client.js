// import { StreamVideoClient } from "@stream-io/video-react-sdk";
// import { useEffect, useState } from "react";
// import { StreamChat } from "stream-chat";

// export function useStreamClients({ apiKey, user, token }) {
//   let isMounted = true;
//   const [videoClient, setVideoClient] = useState(null);
//   const [chatClient, setchatClient] = useState(null);

//   useEffect(() => {
//     if (!user || !token || !apiKey) return;

//     const initClients = async () => {
//       try {
//         const tokenProvider = () => Promise.resolve(token);
//         const myVideoClient = new StreamVideoClient({
//           apiKey,
//           user,
//           tokenProvider,
//         });

//         const myChatClient = StreamChat.getInstance(apiKey);
//         await myChatClient.connectUser(user, token);

//         if (isMounted) {
//           setVideoClient(myVideoClient);
//           setchatClient(myChatClient);
//         }
//       } catch (error) {
//         console.error("Client initialization error:", error);
//       }
//     };

//     initClients();

//     return () => {
//       isMounted = false;
//       if (videoClient) {
//         videoClient.disconnectUser().catch(console.error);
//       }
//       if (chatClient) {
//         chatClient.disconnectUser().catch(console.error);
//       }
//     };
//   }, [apiKey, user, token]);

//   return { videoClient, chatClient };
// }

import { StreamVideoClient } from "@stream-io/video-react-sdk"; // Use video-react-sdk, not node-sdk
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export function useStreamClients({ apiKey, user, token }) {
  const [clients, setClients] = useState({ videoClient: null, chatClient: null });

  useEffect(() => {
    if (!user || !token || !apiKey) return;

    // Use local variables to track the clients within this specific effect run
    let videoClientInstance;
    let chatClientInstance;
    let isActive = true;

    const initClients = async () => {
      try {
        // 1. Initialize Video Client
        videoClientInstance = new StreamVideoClient({
          apiKey,
          user,
          token,
        });

        // 2. Initialize Chat Client
        chatClientInstance = StreamChat.getInstance(apiKey);
        
        // Only connect if not already connected to prevent the console error
        if (!chatClientInstance.userID) {
          await chatClientInstance.connectUser(user, token);
        }

        if (isActive) {
          setClients({
            videoClient: videoClientInstance,
            chatClient: chatClientInstance,
          });
        }
      } catch (error) {
        console.error("Client initialization error:", error);
      }
    };

    initClients();

    return () => {
      isActive = false;
      // Clean up using the local instances
      if (videoClientInstance) {
        videoClientInstance.disconnectUser().catch(console.error);
      }
      if (chatClientInstance) {
        chatClientInstance.disconnectUser().catch(console.error);
      }
      // Reset state so the loading spinner shows if credentials change
      setClients({ videoClient: null, chatClient: null });
    };
  }, [apiKey, user?.id, token]); // Only re-run if token or user.id changes

  return clients;
}