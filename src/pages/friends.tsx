
import { UserListCard } from "@/components/custom/userListCard";
import { Input } from "@/components/ui/input";
import { TabsTrigger, Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { useAPI } from "@/contexts/apiContext";
import { useRelationships } from "@/contexts/chatContext";
import { PublicUser, Relationship } from "@/models/interfaces";
import { Send, UserRound, UserRoundPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function FriendsPage() {
    const { getFriends, getBlocked, getFriendRequests, setRelationship, relationships } = useRelationships();
    const { irisAPI } = useAPI();

    const [friends, setFriends] = useState<Relationship[]>([]);
    const [requests, setRequests] = useState<Relationship[]>([]);
    const [blocked, setBlocked] = useState<Relationship[]>([]);

    const [foundUsers, setFoundUsers] = useState<PublicUser[]>([]);
    const [loadingReq, setLoadingReq] = useState<boolean>(false);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const onTabChange = async (value: string) => {
        setFoundUsers([]);
        switch (value) {
            case 'all':
                // Fetch user's friends
                getFriends();
                break;
            case 'friendRequests':
                getFriendRequests();
                break;
            case 'blocked':
                // Fetch user's blocked friends
                getBlocked();
                break;
        }
    }

    useEffect(() => {
        const relationshipArr = Array.from(relationships, ([_, value]) => (value));

        setFriends(relationshipArr.filter((r) => r.status === 'accepted'));
        setRequests(relationshipArr.filter((r) => r.status === 'incoming' ||  r.status === 'ongoing'));
        setBlocked(relationshipArr.filter((r) => r.status === 'blocked'));
    }, [relationships]);

    const findUserByUsername = (username: string) => {
        if (username.length < 1) {
            return;
        }

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            irisAPI.get(`users/username/${username}`).then((res) => {
                setFoundUsers(res.data);
            });
        }, 200);
    }

    const sendFriendRequest = (user: PublicUser) => {
        setLoadingReq(true);

        irisAPI.post(`relationships/${user.userID}`).then(() => {
            toast.success("Friend request sent")

            setRelationship({
                userID: user.userID,
                username: user.username,
                displayName: user.displayName,
                profilePictureURL: user.profilePictureURL,
                status: "outgoing"
            });
        }).catch((err) => {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data.errors) {
                if (err.response?.data.errors[0].code === "SAME_USER") {
                    toast.error("You can't send a friend request to yourself")
                }
                return;
            }
            toast.error("Failed to send friend request")
        }).finally(() => {
            setLoadingReq(false);
        })
    }

    const acceptFriendRequest = (r: Relationship) => {
        irisAPI.post(`relationships/${r.userID}`).then(() => {
            r.status = "accepted";
            setRelationship(r);
        }).catch((err) => {
            console.error(err);
            toast.error("Failed to accept friend request")
        }).finally(() => {
            setLoadingReq(false);
        })
    }

    const deleteFriend = (userID: string) => {
        setLoadingReq(true);

        irisAPI.delete(`relationships/${userID}`).catch((err) => {
            console.error(err);
            toast.error("Failed to remove friend");
        }).finally(() => {
            setLoadingReq(false);
        });
    }

    return (
        <Tabs defaultValue="online" onValueChange={onTabChange}>
            <div className="py-4 px-3 border-b h-[65px]">
                <TabsList className="h-8">
                    <UserRound className="text-muted-foreground mx-3" />
                    <TabsTrigger className="px-5 mx-1 h-6" value="online">Online</TabsTrigger>
                    <TabsTrigger className="px-5 mx-1 h-6" value="all">All</TabsTrigger>
                    <TabsTrigger className="px-5 mx-1 h-6" value="friendRequests">Friend Requests</TabsTrigger>
                    <TabsTrigger className="px-5 mx-1 h-6" value="blocked">Blocked</TabsTrigger>
                    <TabsTrigger className="px-5 mx-1 h-6 bg-green-500 text-white data-[state=active]:bg-green-900" value="add"><UserRoundPlus size={15} /><span className="ml-2">Add Friend</span></TabsTrigger>
                </TabsList>
            </div>
            <div className="px-6 pt-5">
                <TabsContent value="online">
                    <p className="text-muted-foreground font-medium">Online - {friends.length}</p>
                </TabsContent>

                <TabsContent value="all">
                    <p className="text-muted-foreground font-medium">All friends - {friends.length}</p>
                    {friends.map((friend) => (
                        <UserListCard key={friend.userID} user={friend} status="Friend" />
                    ))}
                </TabsContent>

                <TabsContent value="friendRequests">
                    <p className="text-muted-foreground font-medium">Friend Requests - {requests.length}</p>
                    {requests.map((friend) => (
                        <UserListCard key={friend.userID} user={friend} status={friend.status === "incoming" ? "Incoming friend request" : "Outgoing friend request"} optionControlls={
                            friend.status === "incoming" ? 
                            <>
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger className="mr-3">
                                            <Button asChild disabled={loadingReq} variant="secondary" className="rounded-full p-1 w-10 h-10" onClick={() => acceptFriendRequest(friend)}>
                                                <Check className="text-muted-foreground" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Accept friend request</p>    
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger>
                                            <Button asChild disabled={loadingReq} variant="secondary" className="rounded-full p-1 w-10 h-10" onClick={() => deleteFriend(friend.userID)}>
                                                <X className="duration-200 text-muted-foreground" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Deny friend request</p>    
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                            :
                            <>
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger>
                                            <Button asChild disabled={loadingReq} variant="secondary" className="rounded-full p-1 w-10 h-10" onClick={() => deleteFriend(friend.userID)}>
                                                <X className="text-muted-foreground" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cancel friend request</p>    
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        }/>
                    ))}
                </TabsContent>

                <TabsContent value="blocked">
                    <p className="text-muted-foreground font-medium">Blocked - {blocked.length}</p>
                    {blocked.map((blocked) => (
                        <UserListCard key={blocked.userID} user={blocked} status="Blocked"/>
                    ))}
                </TabsContent>

                <TabsContent value="add" className="p-6">
                    <div className="mb-3">
                        <h3 className="font-bold text-lg">Add Friend</h3>
                        <p className="text-muted-foreground">You can add friends by searching their username</p>
                    </div>
                    <div>
                        <Input onChange={(e) => findUserByUsername(e.target.value)} placeholder="The username of the user you want to befriend"></Input>
                    </div>
                    <div className="mt-3">
                        {foundUsers.map((user) => (
                            <UserListCard key={user.userID} user={user} optionControlls={
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <Button disabled={loadingReq} variant="secondary" className="rounded-full p-1 w-10 h-10" onClick={() => sendFriendRequest(user)}>
                                                <Send size={20} className="text-muted-foreground" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Send friend request</p>    
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            }/>
                        ))}
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    );
}