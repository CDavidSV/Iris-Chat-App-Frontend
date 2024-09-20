import { useEffect, useState } from "react"

export default function PageLoader() {
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true);
        }, 200);

        return () => clearTimeout(timer);
    }, []);
    
    return (
        <div className="w-full">
            {visible ? <div className="loader"></div> : null}
        </div>
    );
}