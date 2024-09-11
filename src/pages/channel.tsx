import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function ChannelPage() {
    return (
        <div className="flex flex-col justify-evenly h-full">
            <header className="h-14 border-b">

            </header>
            <div className="h-full">

            </div>
            <div className="flex flex-row gap-2 border-t p-3">
                <Button><Plus /></Button>
                <Textarea className="h-[40px] max-h-[200px] resize-none" placeholder="Message" />
                <Button><Send /></Button>
            </div>
        </div>
    );
}