import { Relationship } from "@/models/interfaces"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useAPI } from "./apiContext";

interface ChatContextType {
    getFriends(): Promise<void>,
    getBlocked(): Promise<void>,
    getFriendRequests(): Promise<void>,
    setRelationship(r: Relationship): void,
    relationships: Map<string, Relationship>
}

const ChatContext = createContext<ChatContextType>({
    getFriends: async () => { },
    getBlocked: async () => { },
    getFriendRequests: async () => { },
    setRelationship: () => { },
    relationships: new Map()
});

export function ChatProvider({ children }: { children: ReactNode }) {
    const { irisAPI } = useAPI();

    const [relationships, setRelationships] = useState<Map<string, Relationship>>(new Map());

    const [lastFetchTimestamps, setLastFetchTimestamps] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        getFriends();
    }, []);

    const getFriends = async () => {
        if (lastFetchTimestamps.has("friends")) return;

        try {
            const friends = await irisAPI.get("relationships/friends");
            
            setRelationships((prev) => {
                const newMap = new Map(prev);
                friends.data.forEach((friend: Relationship) => newMap.set(friend.userID, friend));
                return newMap;
            });
            setLastFetchTimestamps((prev) => prev.set("friends", Date.now()));
        } catch (err) {
            console.error(err);
        }
    }

    const getFriendRequests = async () => {
        if (lastFetchTimestamps.has("requests")) return;

        try {
            const friendRequests = await irisAPI.get("relationships/requests");

            setRelationships((prev) => {
                const newMap = new Map(prev);
                friendRequests.data.forEach((friend: Relationship) => newMap.set(friend.userID, friend));
                return newMap;
            });
            setLastFetchTimestamps((prev) => prev.set("requests", Date.now()));
        } catch (err) {
            console.error(err);
        }
    }

    const getBlocked = async () => {
        if (lastFetchTimestamps.has("blocked")) return;

        try {
            const blocked = await irisAPI.get("relationships/blocked");

            blocked.data.forEach((blocked: any) => blocked.status = "blocked");

            setRelationships((prev) => {
                const newMap = new Map(prev);
                blocked.data.forEach((blockedUser: Relationship) => newMap.set(blockedUser.userID, blockedUser));
                return newMap;
            });
            setLastFetchTimestamps((prev) => prev.set("blocked", Date.now()));
        } catch (err) {
            console.error(err);
        }
    }

    const setRelationship = (r: Relationship) => {
        setRelationships((prev) => {
            const newMap = new Map(prev);
            newMap.set(r.userID, r);
            return newMap;
        });
    }
    
    return (
        <ChatContext.Provider value={{
            getFriends,
            getBlocked,
            getFriendRequests,
            setRelationship,
            relationships
        }}>
            { children }
        </ChatContext.Provider>
    );
}

export const useRelationships = () => {
    const { getFriends, getBlocked, getFriendRequests, setRelationship, relationships } = useContext(ChatContext);

    return { getFriends, getBlocked, getFriendRequests, setRelationship, relationships };
}