import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Anniversary from "./pages/Anniversary";
import Wishes from "./pages/Wishes";
import Memories from "./pages/Memories";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "daily", Component: Daily },
      { path: "anniversary", Component: Anniversary },
      { path: "wishes", Component: Wishes },
      { path: "memories", Component: Memories },
    ],
  },
]);
