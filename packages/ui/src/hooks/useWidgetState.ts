import { useEffect, useState } from "react"
import { WidgetState } from "@figma-codeblock/shared"

function useWidgetState() {
    const [state, setState] = useState<WidgetState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const callback = ({ data }: MessageEvent) => {
            const message = data.pluginMessage;
            if (!message) return;

            switch (message.type) {
                case "state":
                    setState(message.state);
                    setIsLoading(false);
                    break
            }
        }

        window.addEventListener("message", callback);
        parent?.postMessage({ pluginMessage: { type: "hello" } }, "*");

        return () => {
            window.removeEventListener("message", callback)
        }
    }, []);

    const mutate = (state: WidgetState) => {
        parent?.postMessage({ pluginMessage: { type: "changeState", state } }, "*")
    }

    return { state, isLoading, mutate }
}

export { useWidgetState }