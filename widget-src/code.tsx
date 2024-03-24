import type { ThemedToken } from "../node_modules/shiki/dist/index.mjs";

const { widget } = figma;
const { AutoLayout, Text, Span, usePropertyMenu, useSyncedState } = widget;

interface HighlightData {
  shikiTokens: ThemedToken[][];
  bg: string;
  fg: string;
}

interface WidgetState {
  code: string;
  language: string;
  highlightData: HighlightData;
  fontSize: number;
  fontFamily: string;
}

function Widget() {
  const [state, setState] = useSyncedState<WidgetState | null>("state", null);

  usePropertyMenu(
    [
      {
        itemType: "action",
        tooltip: "Config",
        propertyName: "Config",
      },
    ],
    async ({ propertyName }) => {
      if (propertyName === "Config") {
        await new Promise<void>((res) => {
          figma.showUI(__html__, { width: 800, height: 500 });
          figma.ui.on("message", (msg) => {
            console.log("widget", msg)
            if (msg.name === "hello") {
              figma.ui.postMessage({ name: "initalState", data: state });
            }
            if (msg.name === "changeState") {
              setState(msg.state);
              figma.ui.close();
              res()
            }
          });
          figma.on("close", () => res())
        });
      }
    }
  );

  const renderCode = (tokens: ThemedToken[][] | null) => {
    if (tokens === null) {
      return <Span>CodeBlock</Span>;
    }

    const res: Span[] = [];

    tokens.forEach((line) => {
      res.push(...line.map((e) => <Span fill={e.color}>{e.content}</Span>));
      res.push(<Span>{"\n"}</Span>);
    });

    return res.slice(0, -1);
  };

  return state === null ? (
    <Text fill="#FFFFFF">CodeBlock</Text>
  ) : (
    <AutoLayout direction="horizontal" width="hug-contents" height="hug-contents" padding={8} fill={state.highlightData.bg}>
      <Text fontFamily={state.fontFamily} fontSize={state.fontSize} fill={state.highlightData.fg}>
        {renderCode(state.highlightData.shikiTokens)}
      </Text>
    </AutoLayout>
  );
}
widget.register(Widget);
