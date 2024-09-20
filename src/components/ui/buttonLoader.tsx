import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";

export interface ButtonLoaderProps extends ButtonProps {
    loadingMsg: string;
    loading: boolean;
}

export function ButtonLoader({ loadingMsg, loading, children, ...props }: ButtonLoaderProps) {
    return(
        <Button {...props} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? loadingMsg : children}
        </Button>
    );
}