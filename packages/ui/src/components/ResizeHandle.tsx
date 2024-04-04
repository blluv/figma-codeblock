import styles from "./ResizeHandle.module.css"
import resizeHandleIcon from "../assets/resize-handle.svg"
import { useEffect, useRef, useState } from "react"

export function ResizeHandle() {
    const [state, setState] = useState<{ down: boolean, pointerId?: number }>({ down: false });
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const callback = (e: PointerEvent) => {
            if (!ref.current) return;

            console.log("[ResizeHandle] PointerUp", e.pointerId)
            ref.current.releasePointerCapture(e.pointerId)
            setState({ down: false })
        }
        window.addEventListener("pointerup", callback);
        return () => window.removeEventListener("pointerup", callback)
    }, [state])

    const onDown = (e: React.PointerEvent) => {
        if (!ref.current) return

        console.log("[ResizeHandle] PointerDown", e.pointerId)
        e.currentTarget.setPointerCapture(e.pointerId)
        setState({ down: true, pointerId: e.pointerId })
    }

    const onMove = (e: React.PointerEvent) => {
        if (state.down && e.pointerId === state.pointerId) {
            const width = Math.max(100, Math.floor(e.clientX) + 10)
            const height = Math.max(100, Math.floor(e.clientY) + 10)

            parent.postMessage({ pluginMessage: { type: "resize", size: { width, height } } }, "*")
        }
    }

    return <div ref={ref} className={styles.wrap} onPointerDown={onDown} onPointerMove={onMove}>
        <img className={styles.icon} src={resizeHandleIcon} alt="resize-handle" draggable={false} />
    </div>
}