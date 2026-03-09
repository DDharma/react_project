"use client";
import { useState } from "react";

export const data = [
  {
    id: "1",
    name: "public",
    ifFolder: true,
    children: [
      {
        id: "1-1",
        name: "index.html",
        ifFolder: false,
        children: [],
      },
      {
        id: "1-2",
        name: "favicon.ico",
        ifFolder: false,
        children: [],
      },
      {
        id: "1-3",
        name: "assets",
        ifFolder: true,
        children: [
          {
            id: "1-3-1",
            name: "logo.png",
            ifFolder: false,
            children: [],
          },
          {
            id: "1-3-2",
            name: "images",
            ifFolder: true,
            children: [
              {
                id: "1-3-2-1",
                name: "banner.jpg",
                ifFolder: false,
                children: [],
              },
              {
                id: "1-3-2-2",
                name: "profile.png",
                ifFolder: false,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "2",
    name: "src",
    ifFolder: true,
    children: [
      {
        id: "2-1",
        name: "components",
        ifFolder: true,
        children: [
          {
            id: "2-1-1",
            name: "Navbar",
            ifFolder: true,
            children: [
              {
                id: "2-1-1-1",
                name: "Navbar.js",
                ifFolder: false,
                children: [],
              },
              {
                id: "2-1-1-2",
                name: "Navbar.css",
                ifFolder: false,
                children: [],
              },
            ],
          },
          {
            id: "2-1-2",
            name: "Footer",
            ifFolder: true,
            children: [
              {
                id: "2-1-2-1",
                name: "Footer.js",
                ifFolder: false,
                children: [],
              },
              {
                id: "2-1-2-2",
                name: "Footer.css",
                ifFolder: false,
                children: [],
              },
            ],
          },
        ],
      },

      {
        id: "2-2",
        name: "pages",
        ifFolder: true,
        children: [
          {
            id: "2-2-1",
            name: "Home",
            ifFolder: true,
            children: [
              { id: "2-2-1-1", name: "Home.js", ifFolder: false, children: [] },
              {
                id: "2-2-1-2",
                name: "Home.css",
                ifFolder: false,
                children: [],
              },
            ],
          },
          {
            id: "2-2-2",
            name: "Dashboard",
            ifFolder: true,
            children: [
              {
                id: "2-2-2-1",
                name: "Dashboard.js",
                ifFolder: false,
                children: [],
              },
              {
                id: "2-2-2-2",
                name: "Dashboard.css",
                ifFolder: false,
                children: [],
              },
            ],
          },
        ],
      },

      {
        id: "2-3",
        name: "utils",
        ifFolder: true,
        children: [
          { id: "2-3-1", name: "helpers.js", ifFolder: false, children: [] },
          { id: "2-3-2", name: "constants.js", ifFolder: false, children: [] },
        ],
      },

      { id: "2-4", name: "App.js", ifFolder: false, children: [] },
      { id: "2-5", name: "index.js", ifFolder: false, children: [] },
    ],
  },

  {
    id: "3",
    name: "config",
    ifFolder: true,
    children: [
      { id: "3-1", name: "webpack.config.js", ifFolder: false, children: [] },
      { id: "3-2", name: "dev.config.json", ifFolder: false, children: [] },
    ],
  },

  { id: "4", name: ".gitignore", ifFolder: false, children: [] },
  { id: "5", name: "package.json", ifFolder: false, children: [] },
  { id: "6", name: "README.md", ifFolder: false, children: [] },
];

const List = ({ list }) => {
  const [isExpended, setIsExpended] = useState({});
  return (
    <div className="flex flex-col justify-start items-start">
      {list.map((node, idx) => {
        return (
          <div className="text-white" key={node.id}>
            <div key={idx}>
              <span
                onClick={() => {
                  setIsExpended((prev) => ({
                    ...prev,
                    [node.name]: !prev?.[node.name],
                  }));
                }}
                style={{
                  marginRight: "2px",
                  cursor: "pointer",
                }}
              >
                {node?.ifFolder ? (isExpended?.[node.name] ? "-" : "+") : ""}
              </span>
              {node.name}
            </div>
            {isExpended?.[node.name] &&
              node?.children &&
              node?.children?.length > 0 && (
                <div
                  style={{
                    paddingLeft: "10px",
                  }}
                >
                  <List list={node.children} />
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center bg-[#0b1221] min-h-screen w-full p-8 gap-10">
      <div className="text-center space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          File System Tree
        </p>
      </div>
      <div className="flex justify-start w-full">
        <List list={data} />
      </div>
    </div>
  );
}
