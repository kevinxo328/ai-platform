import AppLayout from "@/components/App/AppLayout";
import App from "../App";
import NewsEditor from "@/pages/NewsEditor";
import ChatPlayground from "@/pages/ChatPlayground";
import Home from "@/pages/Home";
import { Navigate } from "react-router-dom";

export const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { path: "/", index: true, element: <Home /> },
          {
            path: "llm/playground",
            element: <ChatPlayground />,
            name: "大型語言模型 Playground",
          },
          {
            path: "editor/news",
            element: <NewsEditor />,
            name: "新聞稿編輯器",
          },
          {
            path: "*",
            element: <Navigate to={"/"} replace />,
          },
        ],
      },
    ],
  },
];
