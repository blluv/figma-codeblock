import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-one_dark";

import styles from "./App.module.css"
import { useWidgetState } from "./hooks/useWidgetState";
import { useEffect, useState } from "react";
import { WidgetState } from "@figma-codeblock/shared";
import { codeToTokens } from "shiki";

function App() {
  const { state, isLoading, mutate } = useWidgetState();

  const [editorState, setEditorState] = useState({
    code: "Loading...",
    fontSize: "",
    fontFamily: "",
    language: "",
    theme: ""
  });

  useEffect(() => {
    if (!isLoading) {
      console.log("[UI] Loaded", state)
      setEditorState({
        code: state?.code ?? "",
        fontSize: state?.fontSize ? String(state.fontSize) : "42",
        fontFamily: state?.fontFamily ?? "IBM Plex Mono",
        language: state?.language ?? "javascript",
        theme: state?.highlightData.theme ?? "github-light"
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const convertState = async (): Promise<WidgetState> => {
    const { code, language, theme } = editorState

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shikiData = await codeToTokens(code, { lang: language as any, theme })

    return {
      code,
      language,
      fontFamily: editorState.fontFamily,
      fontSize: parseInt(editorState.fontSize) || 42,
      highlightData: {
        theme,
        bg: shikiData.bg ?? "#000000",
        fg: shikiData.fg ?? "#FFFFFF",
        shikiTokens: shikiData.tokens
      }
    }
  }

  const onClickChange = () => {
    convertState().then(mutate)
  }

  return <>
    <div className={styles.container}>
      <AceEditor
        readOnly={isLoading}
        value={isLoading ? "Loading..." : editorState.code}
        onChange={(val => {
          setEditorState((prev) => ({ ...prev, code: val }))
        })}
        mode="text"
        theme="one_dark"
        editorProps={{ $blockScrolling: true }}
        style={{
          width: "100%",
          height: "100vh"
        }}
        showPrintMargin={false}
      />
      <div className={styles.sidebar}>
        <input type="text" disabled={isLoading} value={editorState.fontSize} onChange={(e => {
          const val = e.currentTarget.value;
          setEditorState((prev) => ({ ...prev, fontSize: val }))
        })} />
        <input type="text" disabled={isLoading} value={editorState.fontFamily} onChange={(e => {
          const val = e.currentTarget.value;
          setEditorState((prev) => ({ ...prev, fontFamily: val }))
        })} />
        <select disabled={isLoading} value={editorState.language} onChange={(e => {
          const val = e.currentTarget.value;
          setEditorState((prev) => ({ ...prev, language: val }))
        })}>
          <option disabled value="">none</option>
          <option value="html">html</option>
          <option value="css">css</option>
          <option value="javascript">javascript</option>
          <option value="typescript">typescript</option>
        </select>
        <select disabled={isLoading} value={editorState.theme} onChange={(e => {
          const val = e.currentTarget.value;
          setEditorState((prev) => ({ ...prev, theme: val }))
        })}>
          <option disabled value="">none</option>
          <option value="github-light">github-light</option>
          <option value="github-dark">github-dark</option>
        </select>

        <button onClick={onClickChange}>change</button>
      </div>
    </div>
  </>
}

export default App;
