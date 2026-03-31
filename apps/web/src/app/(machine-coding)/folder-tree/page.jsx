'use client'
import Folder from "@/_components/folder/Folder";
import { useState } from "react";
import explorer from "@/utils/filesystem";

export default function Home() {

  const [explorerData,setExplorerData] = useState(explorer)
  return (
    <>
      <div>hello files</div>
      <Folder data={explorerData}/>
    </>
  );
}
