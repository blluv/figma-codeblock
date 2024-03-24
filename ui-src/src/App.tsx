import React, { useEffect, useState } from "react";
import { codeToTokens } from "shiki";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useInitialWidgetState } from "./hooks/useWidgetState";
import { WidgetState } from "./typing";

import styles from "./App.module.css";

const languages = ["html", "javascript", "typescript"];

function App() {
  const { state: widgetState, isLoaded: isWidgetStateLoaded } = useInitialWidgetState()
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null)
  const [language, setLanguage] = useState("html");
  const [fontFamily, setFontFamily] = useState("IBM Plex Mono");
  const [fontSize, setFontSize] = useState("32")

  useEffect(() => {
    if (isWidgetStateLoaded && editor) {
      editor.setValue(widgetState?.code ?? "")
      setLanguage(widgetState?.language ?? languages[0])
      setFontSize(String(widgetState?.fontSize))
    }
  }, [isWidgetStateLoaded, editor])

  const changeState = (state: WidgetState) => {
    parent?.postMessage?.(
      {
        pluginMessage: {
          name: "changeState",
          state: state,
        },
      },
      "*"
    );
  }

  const onOKClick = () => {
    if (editor) {
      const code = editor.getValue();
      (async () => {
        const res = await codeToTokens(code, { lang: language as any, theme: "material-theme" })
        changeState({
          code,
          language,
          fontFamily,
          fontSize: parseInt(fontSize) || 32,
          highlightData: {
            bg: res.bg ?? "#000000", // black
            fg: res.fg ?? "#FFFFFF", // white
            shikiTokens: res.tokens
          },
        });
      })();
    }
  }

  return (
    <>
      <div className={styles.container}>
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          onMount={(e) => {
            setEditor(e)
          }}
        />
        <div className={styles.sidebar}>
          <select
            onChange={(e) => {
              setLanguage(e.currentTarget.value);
            }}
            value={language}
          >
            {languages.map((e) => (
              <option key={`LANG_OPT_${e}`} value={e}>
                {e}
              </option>
            ))}
          </select>

          <input type="number" value={fontSize} onChange={(e) => {
            setFontSize(e.currentTarget.value)
          }} />

          <input type="text" value={fontFamily} onChange={(e) => {
            setFontFamily(e.currentTarget.value)
          }} />

          <button
            onClick={onOKClick}
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
