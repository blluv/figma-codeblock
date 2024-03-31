import type { HighlightData, WidgetState } from "@figma-codeblock/shared"

const { widget } = figma;
const { AutoLayout, Text, Span, usePropertyMenu, useSyncedState, useEffect } = widget;

function Widget() {
    const [state, setState] = useSyncedState<WidgetState | null>("state", null);

    usePropertyMenu(
        [
            {
                itemType: "action",
                tooltip: "Config",
                propertyName: "Config"
            }
        ],
        async ({ propertyName }: WidgetPropertyEvent) => {
            if (propertyName === "Config") {
                figma.showUI(__html__, { width: 800, height: 500 });
                figma.ui.on("message", (msg) => {
                    console.log("[widget] Got Message", msg);
                    switch (msg.type) {
                        case "hello":
                            figma.ui.postMessage({ type: "state", state });
                            break;
                        case "changeState":
                            console.log("[widget] Change State", msg.state)
                            setState(msg.state);
                            figma.ui.postMessage({ type: "state", state: msg.state });
                            break;
                    }
                });
                await new Promise<void>((res) => figma.on("close", () => res()));
            }
        }
    );

    const renderCode = (data: HighlightData) => {
        const tokens = data.shikiTokens;
        const res: FigmaVirtualNode<"span">[] = [];

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
                {renderCode(state.highlightData)}
            </Text>
        </AutoLayout>
    );
}
widget.register(Widget);
