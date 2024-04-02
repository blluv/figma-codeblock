import styles from "./ResizeHandle.module.css"
import resizeHandleIcon from "../assets/resize-handle.svg"
import { useState } from "react"

export function ResizeHandle() {
    const [state, setState] = useState<{ down: boolean }>({ down: false })

    const onDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setState({ down: true })
    }
    const onUp = (e: React.PointerEvent) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        setState({ down: false })
    }
    const onMove = (e: React.PointerEvent) => {
        if (state.down) {
            const width = Math.max(100, Math.floor(e.clientX))
            const height = Math.max(100, Math.floor(e.clientY))

            parent.postMessage({ pluginMessage: { type: "resize", size: { width, height } } }, "*")
        }
    }

    return <div className={styles.wrap} onPointerDown={onDown} onPointerUp={onUp} onPointerMove={onMove}>
        <img className={styles.icon} src={resizeHandleIcon} alt="resize-handle" draggable={false} />
    </div>
}