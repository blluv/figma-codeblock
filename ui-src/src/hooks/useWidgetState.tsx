import { useEffect, useState } from "react"
import { FigmaEventMessage, WidgetState } from "../typing"

function useInitialWidgetState() {
    const [state, setState] = useState<WidgetState | null>(null);

    useEffect(() => {
        const callback = ({ data }: MessageEvent<FigmaEventMessage>) => {
            const { pluginMessage } = data;
            if (!pluginMessage) return;
            
            if (pluginMessage.name === "initalState") {
                setState(pluginMessage.data)
            }
        }
        window.addEventListener("message", callback)
        parent?.postMessage({ pluginMessage: { name: "hello" } }, "*")

        return () => {
            window.removeEventListener("message", callback)
        }
    }, [])

    return { state, isLoaded: state !== null }
}

export { useInitialWidgetState }