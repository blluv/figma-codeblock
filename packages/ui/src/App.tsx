import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-one_dark";

import styles from "./App.module.css"
import { useWidgetState } from "./hooks/useWidgetState";
import { useEffect, useState } from "react";
import { WidgetState } from "@figma-codeblock/shared";
import { codeToTokens, bundledLanguages, bundledThemes } from "shiki";
import Select from 'react-select';
import { ResizeHandle } from "./components/ResizeHandle";

const languageOptions = [{ value: "", label: "none", }, ...Object.keys(bundledLanguages).map(e => ({ value: e, label: e }))]
const themeOptions = Object.keys(bundledThemes).map(e => ({ value: e, label: e }))

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
        <div className={styles.inputGroup}>
          <label htmlFor="fontSizeInput">FontSize</label>
          <input id="fontSizeInput" type="text" disabled={isLoading} value={editorState.fontSize} onChange={(e => {
            const val = e.currentTarget.value;
            setEditorState((prev) => ({ ...prev, fontSize: val }))
          })} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="fontFamilyInput">FontFamily</label>
          <input id="fontFamilyInput" type="text" disabled={isLoading} value={editorState.fontFamily} onChange={(e => {
            const val = e.currentTarget.value;
            setEditorState((prev) => ({ ...prev, fontFamily: val }))
          })} />
        </div>
        <div className={styles.inputGroup}>
          <label>Language</label>
          <Select<{ value: string, label: string }> options={languageOptions} isLoading={isLoading} value={languageOptions.find(e => e.value === editorState.language)} onChange={(e => {
            if (e)
              setEditorState((prev) => ({ ...prev, language: e.value }))
          })} />
        </div>
        <div className={styles.inputGroup}>
          <label>Theme</label>
          <Select<{ value: string, label: string }> options={themeOptions} isLoading={isLoading} value={themeOptions.find(e => e.value === editorState.theme)} onChange={(e => {
            if (e)
              setEditorState((prev) => ({ ...prev, theme: e.value }))
          })} />
        </div>

        <button disabled={isLoading} onClick={onClickChange}>change</button>
      </div>
    </div>
    <ResizeHandle />
  </>
}

export default App;
