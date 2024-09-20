import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";
import { ReactNode } from "react";

export interface FriendListCardProps {
    user: {
        userID: string,
        username: string,
        displayName: string,
        profilePictureURL: string
    }
    status?: string | null
    optionControlls?: ReactNode
}

export function UserListCard({ user, status = null, optionControlls }: FriendListCardProps) {
    return (
        <div className="flex gap-3 justify-between items-center w-full p-2 border-b my-1 cursor-pointer">
            <div className="flex gap-2">
                <div>
                    <Avatar>
                        <AvatarImage src={user.profilePictureURL} />
                        <AvatarFallback>{user.displayName.substring(0, 1) || user.username.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium">{user.displayName || user.username || "Unknown"}</p>
                    {status ? <p className="text-xs text-muted-foreground">{status}</p> : <></>}
                </div>
            </div>
            <div>
                { optionControlls ? optionControlls : <EllipsisVertical /> }
            </div>
        </div>
    );
}