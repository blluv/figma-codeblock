import { ThemedToken } from "shiki";

export interface HighlightData {
    shikiTokens: ThemedToken[][];
    bg: string;
    fg: string;
}

export interface WidgetState {
    code: string;
    language: string;
    highlightData: HighlightData;
    fontSize: number;
    fontFamily: string;
}

export interface FigmaEventMessage<T = any> {
    pluginMessage?: {
        name: string,
        data: T
    }
}
